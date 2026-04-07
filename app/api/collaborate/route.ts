import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { agents } from "@/lib/agents";

function getAnthropicClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
}
function getOpenAIClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
}
function getGeminiClient() {
  return new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
}

const CONSULT_SUFFIX = "\n\nYou are being consulted by the CEO (Alexandria Vale) for a specific deliverable. Provide your expert input concisely and with concrete data, numbers, and specifics. Do NOT include chart or deck blocks — just raw content the CEO will incorporate. Stay under 600 words. Be specific, not generic.";

async function queryExecutive(
  agentId: string,
  question: string
): Promise<string> {
  const agent = agents[agentId];
  if (!agent) return "Agent not found.";

  if (agent.provider === "anthropic") {
    const response = await getAnthropicClient().messages.create({
      model: agent.model,
      max_tokens: 3000,
      system: agent.systemPrompt + CONSULT_SUFFIX,
      messages: [{ role: "user", content: question }],
    });
    const block = response.content[0];
    return block.type === "text" ? block.text : "";
  } else if (agent.provider === "google") {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: agent.model });
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: "System instructions: " + agent.systemPrompt + CONSULT_SUFFIX }] },
        { role: "model", parts: [{ text: "Understood. I will follow these instructions precisely." }] },
      ],
    });
    const result = await chat.sendMessage(question);
    return result.response.text();
  } else {
    const response = await getOpenAIClient().chat.completions.create({
      model: agent.model,
      max_tokens: 3000,
      messages: [
        { role: "system", content: agent.systemPrompt + CONSULT_SUFFIX },
        { role: "user", content: question },
      ],
    });
    return response.choices[0]?.message?.content || "";
  }
}

const DELEGATION_PROMPT = `You are Alexandria Vale, CEO of Neuromart.ai. You have the ability to delegate tasks to your C-suite team before producing your final deliverable.

Given the founder's request, decide what specific questions to ask each executive. Output a JSON block in \`\`\`delegate markers:

\`\`\`delegate
{
  "cfo": "Specific question for Marcus Chen (CFO) — ask for financial data, projections, pricing, unit economics, etc.",
  "coo": "Specific question for Priya Nakamura (COO) — ask for ops plans, hiring, timelines, process, etc.",
  "cmo": "Specific question for Jordan Okafor (CMO) — ask for market analysis, GTM, positioning, competitive data, etc.",
  "cso": "Specific question for Lena Mikhailova (CSO) — ask for market intelligence, competitive landscape, TAM/SAM/SOM, strategic positioning, industry trends, etc."
}
\`\`\`

Rules:
- Ask SPECIFIC questions tailored to this exact request — not generic ones
- Each question should request concrete data/numbers/specifics that you'll incorporate
- You may set any field to null if that executive isn't needed for this particular request
- Always include the delegate block FIRST, before any other text
- After the delegate block, briefly explain your synthesis plan (2-3 sentences max)`;

export async function POST(req: NextRequest) {
  const { messages, conversationHistory } = await req.json();
  const userMessage = messages[messages.length - 1]?.content || "";

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function send(event: string, data: unknown) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ event, data })}\n\n`)
        );
      }

      try {
        send("status", { phase: "planning", message: "CEO is analyzing your request..." });

        const anthropic = getAnthropicClient();
        const planResponse = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          system: DELEGATION_PROMPT,
          messages: [
            ...(conversationHistory || []).map((m: { role: string; content: string }) => ({
              role: m.role as "user" | "assistant",
              content: m.content,
            })),
            { role: "user", content: userMessage },
          ],
        });

        const planBlock = planResponse.content[0];
        const planText = planBlock.type === "text" ? planBlock.text : "";
        const delegateMatch = planText.match(/```delegate\n([\s\S]*?)```/);

        let cfoInput = "";
        let cooInput = "";
        let cmoInput = "";
        let csoInput = "";

        if (delegateMatch) {
          try {
            const delegation = JSON.parse(delegateMatch[1]);
            const queries: Promise<void>[] = [];

            if (delegation.cfo) {
              send("status", { phase: "consulting", agent: "cfo", message: "Consulting CFO Marcus Chen..." });
              queries.push(
                queryExecutive("cfo", delegation.cfo).then((r) => {
                  cfoInput = r;
                  send("status", { phase: "received", agent: "cfo", message: "CFO input received" });
                })
              );
            }

            if (delegation.coo) {
              send("status", { phase: "consulting", agent: "coo", message: "Consulting COO Priya Nakamura..." });
              queries.push(
                queryExecutive("coo", delegation.coo).then((r) => {
                  cooInput = r;
                  send("status", { phase: "received", agent: "coo", message: "COO input received" });
                })
              );
            }

            if (delegation.cmo) {
              send("status", { phase: "consulting", agent: "cmo", message: "Consulting CMO Jordan Okafor..." });
              queries.push(
                queryExecutive("cmo", delegation.cmo).then((r) => {
                  cmoInput = r;
                  send("status", { phase: "received", agent: "cmo", message: "CMO input received" });
                })
              );
            }

            if (delegation.cso) {
              send("status", { phase: "consulting", agent: "cso", message: "Consulting CSO Lena Mikhailova..." });
              queries.push(
                queryExecutive("cso", delegation.cso).then((r) => {
                  csoInput = r;
                  send("status", { phase: "received", agent: "cso", message: "CSO input received" });
                })
              );
            }

            await Promise.all(queries);
          } catch {
            // proceed without
          }
        }

        send("status", { phase: "synthesizing", message: "CEO is assembling the final deliverable..." });

        const executiveInputs = [
          cfoInput && `## CFO (Marcus Chen) Input:\n${cfoInput}`,
          cooInput && `## COO (Priya Nakamura) Input:\n${cooInput}`,
          cmoInput && `## CMO (Jordan Okafor) Input:\n${cmoInput}`,
          csoInput && `## CSO (Lena Mikhailova) Input:\n${csoInput}`,
        ]
          .filter(Boolean)
          .join("\n\n");

        const synthesisPrompt = `You asked your C-suite team for input. Here are their responses:

${executiveInputs || "No executive input was gathered — produce your best deliverable independently."}

Now synthesize ALL of this into a single, comprehensive, polished deliverable that directly answers the founder's original request. Incorporate the specific data, numbers, and insights from each executive — don't just summarize them, WEAVE them into a cohesive response.

If the founder asked for a pitch deck, create a full \`\`\`deck block with the executives' data integrated into the slides (financial projections from CFO in chart slides, GTM from CMO in content slides, ops timeline from COO, competitive landscape from CSO, etc.).

If they asked for analysis or strategy, produce a unified document with data from all executives.

IMPORTANT: This is a FINAL deliverable for the founder. Make it comprehensive, polished, and actionable.`;

        const ceoAgent = agents.ceo;
        const synthesisStream = await anthropic.messages.stream({
          model: ceoAgent.model,
          max_tokens: 8192,
          system: ceoAgent.systemPrompt,
          messages: [
            ...(conversationHistory || []).map((m: { role: string; content: string }) => ({
              role: m.role as "user" | "assistant",
              content: m.content,
            })),
            { role: "user", content: userMessage },
            { role: "assistant", content: "Let me consult my executive team and put this together for you." },
            { role: "user", content: synthesisPrompt },
          ],
        });

        send("status", { phase: "streaming", message: "Delivering final response..." });

        for await (const event of synthesisStream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            send("text", event.delta.text);
          }
        }

        send("done", null);
        controller.close();
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Collaboration failed";
        send("error", message);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
