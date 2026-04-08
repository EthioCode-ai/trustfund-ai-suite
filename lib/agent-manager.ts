// Merges built-in agents with custom agents from owner profile
// Injects Rules of Engagement into all agent system prompts

import { agents as builtInAgents, getAllAgents as getBuiltInAgents } from "./agents";
import { loadOwnerProfile, CustomAgent } from "./storage";
import { Agent } from "./types";

const MODEL_MAP: Record<string, string> = {
  anthropic: "claude-sonnet-4-20250514",
  openai: "gpt-4o",
  google: "gemini-2.5-flash",
};

const ICON_OPTIONS = [
  "Crown", "DollarSign", "Settings", "Megaphone", "Compass", "Database",
  "Brain", "Shield", "Target", "Zap", "Globe", "Scale", "Lightbulb", "Rocket",
];

const COLOR_OPTIONS = [
  "#6366f1", "#10b981", "#f59e0b", "#ec4899", "#0ea5e9", "#14b8a6",
  "#8b5cf6", "#ef4444", "#f97316", "#06b6d4", "#84cc16", "#a855f7",
];

export { ICON_OPTIONS, COLOR_OPTIONS };

function customAgentToAgent(custom: CustomAgent, roe: string, ownerContext: string): Agent {
  const roePreamble = roe
    ? `\n\n## RULES OF ENGAGEMENT (Your North Star — follow these above all else)\n${roe}\n`
    : "";

  return {
    id: custom.id as Agent["id"],
    name: custom.name,
    title: custom.title,
    provider: custom.provider,
    model: MODEL_MAP[custom.provider] || "gpt-4o",
    color: custom.color,
    icon: custom.icon,
    description: custom.description,
    capabilities: custom.capabilities,
    systemPrompt: `You are ${custom.name}, ${custom.title}.
${ownerContext}
${roePreamble}
${custom.customInstructions}

Always be direct, data-driven, and actionable. Format your responses with clear headers, bullet points, and structured sections.`,
  };
}

// Client-side: get all agents (built-in + custom) with RoE injected
export function getMergedAgents(): Agent[] {
  const profile = loadOwnerProfile();
  const roe = profile.rulesOfEngagement || "";
  const ownerContext = profile.companyName
    ? `You work for ${profile.companyName}. You report to ${profile.name || "the founder"} (${profile.role || "Founder"}).`
    : "";

  // Built-in agents with RoE prepended
  const builtIn = getBuiltInAgents().map((agent) => {
    if (!roe) return agent;
    return {
      ...agent,
      systemPrompt: agent.systemPrompt.replace(
        "Always be direct, data-driven, and actionable.",
        `## RULES OF ENGAGEMENT (Your North Star — follow these above all else)\n${roe}\n\nAlways be direct, data-driven, and actionable.`
      ),
    };
  });

  // Custom agents
  const custom = (profile.customAgents || [])
    .filter((a) => a.enabled)
    .map((a) => customAgentToAgent(a, roe, ownerContext));

  return [...builtIn, ...custom];
}

export function getMergedAgent(id: string): Agent | undefined {
  return getMergedAgents().find((a) => a.id === id);
}

// Server-side: inject RoE into a specific agent's prompt
export function injectRoE(systemPrompt: string, roe: string): string {
  if (!roe) return systemPrompt;
  return systemPrompt.replace(
    "Always be direct, data-driven, and actionable.",
    `## RULES OF ENGAGEMENT (Your North Star — follow these above all else)\n${roe}\n\nAlways be direct, data-driven, and actionable.`
  );
}

// Get built-in agents (for server-side use where localStorage isn't available)
export { builtInAgents, getBuiltInAgents };
