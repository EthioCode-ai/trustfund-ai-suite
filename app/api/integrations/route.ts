import { NextRequest, NextResponse } from "next/server";

// Slack webhook
async function sendToSlack(webhookUrl: string, message: string, channel?: string) {
  const payload: Record<string, string> = { text: message };
  if (channel) payload.channel = channel;

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`Slack webhook failed: ${res.status}`);
  return { success: true, platform: "slack" };
}

// Notion page creation
async function sendToNotion(apiKey: string, databaseId: string, title: string, content: string) {
  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
    },
    body: JSON.stringify({
      parent: { database_id: databaseId },
      properties: {
        title: { title: [{ text: { content: title } }] },
      },
      children: content.split("\n\n").slice(0, 50).map((block) => ({
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [{ type: "text", text: { content: block.slice(0, 2000) } }],
        },
      })),
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Notion API failed: ${err.message || res.status}`);
  }

  const data = await res.json();
  return { success: true, platform: "notion", pageId: data.id, url: data.url };
}

export async function POST(req: NextRequest) {
  const { platform, content, title, channel } = await req.json();

  try {
    if (platform === "slack") {
      const webhookUrl = process.env.SLACK_WEBHOOK_URL;
      if (!webhookUrl) {
        return NextResponse.json({ error: "SLACK_WEBHOOK_URL not configured" }, { status: 500 });
      }
      const result = await sendToSlack(webhookUrl, content, channel);
      return NextResponse.json(result);
    }

    if (platform === "notion") {
      const apiKey = process.env.NOTION_API_KEY;
      const dbId = process.env.NOTION_DATABASE_ID;
      if (!apiKey || !dbId) {
        return NextResponse.json({ error: "NOTION_API_KEY and NOTION_DATABASE_ID not configured" }, { status: 500 });
      }
      const result = await sendToNotion(apiKey, dbId, title || "ExecSuite Note", content);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Unknown platform. Use 'slack' or 'notion'." }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Integration failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
