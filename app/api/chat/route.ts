import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAgent } from "@/lib/agents";

function getAnthropicClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
}
function getOpenAIClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
}
function getGeminiClient() {
  return new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
}

export async function POST(req: NextRequest) {
  const { agentId, messages } = await req.json();
  const agent = getAgent(agentId);

  if (!agent) {
    return new Response(JSON.stringify({ error: "Agent not found" }), {
      status: 404,
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        if (agent.provider === "anthropic") {
          const response = await getAnthropicClient().messages.stream({
            model: agent.model,
            max_tokens: 4096,
            system: agent.systemPrompt,
            messages: messages.map(
              (m: { role: string; content: string }) => ({
                role: m.role as "user" | "assistant",
                content: m.content,
              })
            ),
          });

          for await (const event of response) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
              );
            }
          }
        } else if (agent.provider === "google") {
          const genAI = getGeminiClient();
          const model = genAI.getGenerativeModel({ model: agent.model });

          const geminiHistory = messages.slice(0, -1).map(
            (m: { role: string; content: string }) => ({
              role: m.role === "assistant" ? "model" : "user",
              parts: [{ text: m.content }],
            })
          );

          const chat = model.startChat({
            history: [
              { role: "user", parts: [{ text: "System instructions: " + agent.systemPrompt }] },
              { role: "model", parts: [{ text: "Understood. I will follow these instructions precisely." }] },
              ...geminiHistory,
            ],
          });

          const lastMessage = messages[messages.length - 1]?.content || "";
          const result = await chat.sendMessageStream(lastMessage);

          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
              );
            }
          }
        } else {
          const response = await getOpenAIClient().chat.completions.create({
            model: agent.model,
            max_tokens: 4096,
            stream: true,
            messages: [
              { role: "system", content: agent.systemPrompt },
              ...messages.map(
                (m: { role: string; content: string }) => ({
                  role: m.role as "user" | "assistant",
                  content: m.content,
                })
              ),
            ],
          });

          for await (const chunk of response) {
            const text = chunk.choices[0]?.delta?.content;
            if (text) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
              );
            }
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: message })}\n\n`
          )
        );
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
