import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAllAgents } from "@/lib/agents";
import { Agent } from "@/lib/types";

function getAnthropicClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
}
function getOpenAIClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
}
function getGeminiClient() {
  return new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
}

const BOARDROOM_SUFFIX = "\n\nYou are in a boardroom meeting with the other C-suite executives. Keep your response focused and concise (under 500 words). Address the founder's question from your specific area of expertise.";

async function queryAgent(agent: Agent, question: string): Promise<string> {
  if (agent.provider === "anthropic") {
    const response = await getAnthropicClient().messages.create({
      model: agent.model,
      max_tokens: 2048,
      system: agent.systemPrompt + BOARDROOM_SUFFIX,
      messages: [{ role: "user", content: question }],
    });
    const block = response.content[0];
    return block.type === "text" ? block.text : "";
  } else if (agent.provider === "google") {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: agent.model });
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: "System instructions: " + agent.systemPrompt + BOARDROOM_SUFFIX }] },
        { role: "model", parts: [{ text: "Understood. I will follow these instructions precisely." }] },
      ],
    });
    const result = await chat.sendMessage(question);
    return result.response.text();
  } else {
    const response = await getOpenAIClient().chat.completions.create({
      model: agent.model,
      max_tokens: 2048,
      messages: [
        { role: "system", content: agent.systemPrompt + BOARDROOM_SUFFIX },
        { role: "user", content: question },
      ],
    });
    return response.choices[0]?.message?.content || "";
  }
}

export async function POST(req: NextRequest) {
  const { question } = await req.json();
  const agents = getAllAgents();

  const results = await Promise.all(
    agents.map(async (agent) => {
      try {
        const content = await queryAgent(agent, question);
        return { agentId: agent.id, content };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to respond";
        return { agentId: agent.id, content: `Error: ${message}` };
      }
    })
  );

  return NextResponse.json({ responses: results });
}
