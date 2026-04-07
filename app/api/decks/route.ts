import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

const DATA_DIR = join(process.cwd(), ".data");
const DECKS_FILE = join(DATA_DIR, "decks.json");

export interface SavedDeck {
  id: string;
  title: string;
  theme: string;
  slides: unknown[];
  conversationId?: string;
  createdAt: string;
  updatedAt: string;
}

async function loadDecks(): Promise<SavedDeck[]> {
  try {
    const data = await readFile(DECKS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveDecks(decks: SavedDeck[]) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DECKS_FILE, JSON.stringify(decks, null, 2));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  const decks = await loadDecks();

  if (id) {
    const deck = decks.find((d) => d.id === id);
    return deck
      ? NextResponse.json({ deck })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ decks });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;
  const decks = await loadDecks();

  if (action === "save") {
    const existing = decks.findIndex((d) => d.id === body.deck.id);
    const deck: SavedDeck = {
      id: body.deck.id || Date.now().toString(),
      title: body.deck.title || "Untitled Deck",
      theme: body.deck.theme || "investor",
      slides: body.deck.slides || [],
      conversationId: body.conversationId,
      createdAt: existing >= 0 ? decks[existing].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existing >= 0) {
      decks[existing] = deck;
    } else {
      decks.unshift(deck);
    }

    await saveDecks(decks);
    return NextResponse.json({ success: true, deck });
  }

  if (action === "delete") {
    const filtered = decks.filter((d) => d.id !== body.id);
    await saveDecks(filtered);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
