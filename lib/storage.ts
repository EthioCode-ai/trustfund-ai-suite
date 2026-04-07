// Browser-based persistence using localStorage
// Works on Vercel (no file system needed)

import { ChatMessage } from "./types";

export interface SavedConversation {
  id: string;
  agentId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface SavedDeck {
  id: string;
  title: string;
  theme: string;
  slides: unknown[];
  createdAt: string;
}

const CONVO_KEY = "neuromart-conversations";
const DECK_KEY = "neuromart-decks";

// Conversations
export function loadConversations(): SavedConversation[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CONVO_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveConversation(convo: Omit<SavedConversation, "createdAt" | "updatedAt"> & { createdAt?: string; updatedAt?: string }): SavedConversation {
  const all = loadConversations();
  const existing = all.findIndex((c) => c.id === convo.id);
  const saved: SavedConversation = {
    ...convo,
    title: convo.title || convo.messages.find((m) => m.role === "user")?.content?.slice(0, 80) || "Untitled",
    createdAt: existing >= 0 ? all[existing].createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (existing >= 0) {
    all[existing] = saved;
  } else {
    all.unshift(saved);
  }

  // Keep max 50 conversations
  const trimmed = all.slice(0, 50);
  localStorage.setItem(CONVO_KEY, JSON.stringify(trimmed));
  return saved;
}

export function getConversation(id: string): SavedConversation | null {
  return loadConversations().find((c) => c.id === id) || null;
}

export function deleteConversation(id: string) {
  const all = loadConversations().filter((c) => c.id !== id);
  localStorage.setItem(CONVO_KEY, JSON.stringify(all));
}

// Decks
export function loadDecks(): SavedDeck[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(DECK_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveDeck(deck: { id: string; title: string; theme: string; slides: unknown[] }): SavedDeck {
  const all = loadDecks();
  const existing = all.findIndex((d) => d.id === deck.id);
  const saved: SavedDeck = {
    ...deck,
    createdAt: existing >= 0 ? all[existing].createdAt : new Date().toISOString(),
  };

  if (existing >= 0) {
    all[existing] = saved;
  } else {
    all.unshift(saved);
  }

  // Keep max 20 decks
  const trimmed = all.slice(0, 20);
  localStorage.setItem(DECK_KEY, JSON.stringify(trimmed));
  return saved;
}

export function getDeck(id: string): SavedDeck | null {
  return loadDecks().find((d) => d.id === id) || null;
}

export function deleteDeck(id: string) {
  const all = loadDecks().filter((d) => d.id !== id);
  localStorage.setItem(DECK_KEY, JSON.stringify(all));
}
