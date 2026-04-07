export type AgentRole = "ceo" | "cfo" | "coo" | "cmo" | "cso";
export type ModelProvider = "anthropic" | "openai" | "google";

export interface Agent {
  id: AgentRole;
  name: string;
  title: string;
  provider: ModelProvider;
  model: string;
  color: string;
  icon: string;
  description: string;
  capabilities: string[];
  systemPrompt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  agentId?: AgentRole;
  timestamp: number;
}

export interface BoardroomResponse {
  agentId: AgentRole;
  content: string;
}
