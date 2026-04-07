import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

const DATA_DIR = join(process.cwd(), ".data");
const CONVERSATIONS_FILE = join(DATA_DIR, "conversations.json");

export interface SavedConversation {
  id: string;
  agentId: string;
  title: string;
  messages: { id: string; role: string; content: string; agentId?: string; timestamp: number }[];
  createdAt: string;
  updatedAt: string;
}

async function loadConversations(): Promise<SavedConversation[]> {
  try {
    const data = await readFile(CONVERSATIONS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveConversations(convos: SavedConversation[]) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(CONVERSATIONS_FILE, JSON.stringify(convos, null, 2));
}

// GET - list all or get one by id
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const agentId = searchParams.get("agentId");

  const convos = await loadConversations();

  if (id) {
    const convo = convos.find((c) => c.id === id);
    return convo
      ? NextResponse.json({ conversation: convo })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (agentId) {
    const filtered = convos.filter((c) => c.agentId === agentId);
    return NextResponse.json({ conversations: filtered });
  }

  return NextResponse.json({ conversations: convos });
}

// POST - save or update
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;
  const convos = await loadConversations();

  if (action === "save") {
    // Auto-generate title from first user message
    const firstUserMsg = body.messages?.find((m: { role: string }) => m.role === "user");
    const title = body.title || (firstUserMsg?.content?.slice(0, 80) + (firstUserMsg?.content?.length > 80 ? "..." : "")) || "Untitled";

    const existing = convos.findIndex((c) => c.id === body.id);
    const convo: SavedConversation = {
      id: body.id || Date.now().toString(),
      agentId: body.agentId,
      title,
      messages: body.messages,
      createdAt: existing >= 0 ? convos[existing].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existing >= 0) {
      convos[existing] = convo;
    } else {
      convos.unshift(convo);
    }

    await saveConversations(convos);
    return NextResponse.json({ success: true, conversation: convo });
  }

  if (action === "delete") {
    const filtered = convos.filter((c) => c.id !== body.id);
    await saveConversations(filtered);
    return NextResponse.json({ success: true });
  }

  if (action === "rename") {
    const idx = convos.findIndex((c) => c.id === body.id);
    if (idx >= 0) {
      convos[idx].title = body.title;
      convos[idx].updatedAt = new Date().toISOString();
      await saveConversations(convos);
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
