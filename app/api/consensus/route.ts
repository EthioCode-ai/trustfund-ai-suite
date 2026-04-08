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

async function queryExec(agentId: string, prompt: string): Promise<string> {
  const agent = agents[agentId];
  if (!agent) return "";

  if (agent.provider === "anthropic") {
    const res = await getAnthropicClient().messages.create({
      model: agent.model, max_tokens: 2000,
      system: agent.systemPrompt + "\n\nBe concise. Under 400 words.",
      messages: [{ role: "user", content: prompt }],
    });
    const block = res.content[0];
    return block.type === "text" ? block.text : "";
  } else if (agent.provider === "google") {
    const model = getGeminiClient().getGenerativeModel({ model: agent.model });
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: "System: " + agent.systemPrompt + "\n\nBe concise. Under 400 words." }] },
        { role: "model", parts: [{ text: "Understood." }] },
      ],
    });
    const result = await chat.sendMessage(prompt);
    return result.response.text();
  } else {
    const res = await getOpenAIClient().chat.completions.create({
      model: agent.model, max_tokens: 2000,
      messages: [
        { role: "system", content: agent.systemPrompt + "\n\nBe concise. Under 400 words." },
        { role: "user", content: prompt },
      ],
    });
    return res.choices[0]?.message?.content || "";
  }
}

export async function POST(req: NextRequest) {
  const { topic, deliverableType } = await req.json();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function send(event: string, data: unknown) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ event, data })}\n\n`));
      }

      try {
        // PHASE 1: Research
        send("phase", { phase: "research", message: "Researching topic across multiple sources..." });

        let researchData = "";
        try {
          const researchRes = await fetch(new URL("/api/research", req.url).toString(), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ queries: [
              `${topic} market size TAM SAM SOM 2024 2025`,
              `${topic} competitive landscape key players`,
              `${topic} industry trends and growth projections`,
            ]}),
          });
          const researchJson = await researchRes.json();
          if (researchJson.results) {
            researchData = researchJson.results
              .map((r: { topic: string; findings: string; confidence: string }) =>
                `### ${r.topic}\n${r.findings}\n(Confidence: ${r.confidence})`)
              .join("\n\n");
          }
        } catch {
          researchData = "Research unavailable — proceeding with internal knowledge.";
        }

        send("phase", { phase: "research_done", message: "Research complete. Gathering executive perspectives..." });

        // PHASE 2: Individual perspectives (parallel)
        send("phase", { phase: "perspectives", message: "Each executive is preparing their input..." });

        const perspectivePrompt = `The founder wants us to produce a ${deliverableType || "comprehensive analysis"} on: "${topic}"

Here is research data to ground your response in facts:
${researchData}

Based on this research and your expertise, provide your specific input for this deliverable. Include:
1. Your key recommendations from your area of expertise
2. Specific data points you'd include (cite the research)
3. Any concerns or risks you see
4. What you'd push back on or challenge

Be specific and data-driven. Reference the research findings.`;

        const [cfoInput, cooInput, cmoInput, csoInput] = await Promise.all([
          queryExec("cfo", perspectivePrompt).then(r => { send("exec_done", { agent: "cfo", message: "CFO input ready" }); return r; }),
          queryExec("coo", perspectivePrompt).then(r => { send("exec_done", { agent: "coo", message: "COO input ready" }); return r; }),
          queryExec("cmo", perspectivePrompt).then(r => { send("exec_done", { agent: "cmo", message: "CMO input ready" }); return r; }),
          queryExec("cso", perspectivePrompt).then(r => { send("exec_done", { agent: "cso", message: "CSO input ready" }); return r; }),
        ]);

        // PHASE 3: Debate & challenge
        send("phase", { phase: "debate", message: "Executives reviewing each other's input..." });

        const debatePrompt = `You are reviewing the other executives' input for a ${deliverableType || "deliverable"} on "${topic}".

Here are all inputs:
## CFO (Marcus Chen):\n${cfoInput}
## COO (Priya Mekuria):\n${cooInput}
## CMO (Avihai Solomon):\n${cmoInput}
## CSO (Lena Mikhailova):\n${csoInput}

Identify:
1. Points of AGREEMENT across the team
2. Points of DISAGREEMENT or tension
3. Claims that need better evidence
4. Your recommended resolution for each disagreement

Be direct. This is an internal review, not a polished output.`;

        const ceoReview = await queryExec("ceo", debatePrompt);
        send("phase", { phase: "debate_done", message: "Review complete. Building consensus..." });

        // PHASE 4: CEO synthesizes with consensus
        send("phase", { phase: "synthesis", message: "CEO assembling final validated deliverable..." });

        const synthesisPrompt = `You have researched data, all executive inputs, and your own review of disagreements. Now produce the FINAL deliverable.

## VALIDATED RESEARCH:
${researchData}

## EXECUTIVE INPUTS:
CFO: ${cfoInput}
COO: ${cooInput}
CMO: ${cmoInput}
CSO: ${csoInput}

## YOUR REVIEW & CONSENSUS NOTES:
${ceoReview}

PRODUCE THE FINAL ${(deliverableType || "deliverable").toUpperCase()} NOW.

Rules:
- Every claim must be grounded in the research or explicitly marked as an assumption
- Where executives disagreed, state the consensus position and note the dissent
- Include a "Sources & Methodology" section at the end
- If this is a deck, produce a \`\`\`deck block with infographic layouts
- If this is analysis, produce structured markdown with charts
- This goes directly to Dr. Abiy Selassie. Make it immaculate.`;

        const anthropic = getAnthropicClient();
        const finalStream = await anthropic.messages.stream({
          model: agents.ceo.model,
          max_tokens: 8192,
          system: agents.ceo.systemPrompt,
          messages: [
            { role: "user", content: `Create a ${deliverableType || "comprehensive analysis"} on: ${topic}` },
            { role: "assistant", content: "I've consulted the full executive team, cross-validated with research, and built consensus. Here's the final deliverable:" },
            { role: "user", content: synthesisPrompt },
          ],
        });

        for await (const event of finalStream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            send("text", event.delta.text);
          }
        }

        send("done", null);
        controller.close();
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Consensus process failed";
        send("error", message);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
  });
}
