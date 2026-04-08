import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { to, subject, body, replyTo, deckHtml } = await req.json();

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Email not configured. Add RESEND_API_KEY to environment variables." },
      { status: 500 }
    );
  }

  const senderEmail = process.env.SENDER_EMAIL || "onboarding@resend.dev";

  try {
    const emailPayload: Record<string, unknown> = {
      from: `Neuromart.ai ExecSuite <${senderEmail}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      html: formatEmailHTML(subject, body, deckHtml),
      reply_to: replyTo || undefined,
    };

    // If deck HTML is provided, also attach as a file
    if (deckHtml) {
      emailPayload.attachments = [
        {
          filename: `${subject.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "-").toLowerCase()}.html`,
          content: Buffer.from(deckHtml).toString("base64"),
          type: "text/html",
        },
      ];
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Failed to send email" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Email sending failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function formatEmailHTML(subject: string, body: string, deckHtml?: string): string {
  const htmlBody = body
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // Remove empty markdown links
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>");

  const deckSection = deckHtml
    ? `<div style="margin-top: 32px; padding-top: 24px; border-top: 2px solid #6366f1;">
        <h3 style="color: #6366f1; margin-bottom: 16px; font-size: 1rem;">📊 Presentation Attached</h3>
        <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 8px;">The full presentation is attached as an HTML file. Open it in any browser to view the interactive slides.</p>
      </div>`
    : "";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; color: #1a1a2e; line-height: 1.6;">
  <div style="border-bottom: 3px solid #6366f1; padding-bottom: 16px; margin-bottom: 24px;">
    <h2 style="margin: 0; color: #0f172a; font-size: 1.3rem;">${subject}</h2>
    <p style="margin: 4px 0 0; font-size: 0.8rem; color: #6366f1;">Neuromart.ai Executive Suite</p>
  </div>
  <div style="font-size: 1rem;">
    <p>${htmlBody}</p>
  </div>
  ${deckSection}
  <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 0.8rem; color: #94a3b8;">
    Sent via Neuromart.ai ExecSuite
  </div>
</body>
</html>`;
}
