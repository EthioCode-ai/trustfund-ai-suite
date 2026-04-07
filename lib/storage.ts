// Browser-based persistence using localStorage
// Every function is SSR-safe (returns defaults when window/localStorage unavailable)

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

function canUseStorage(): boolean {
  try {
    return typeof window !== "undefined" && typeof localStorage !== "undefined";
  } catch {
    return false;
  }
}

// Conversations
export function loadConversations(): SavedConversation[] {
  if (!canUseStorage()) return [];
  try {
    return JSON.parse(localStorage.getItem(CONVO_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveConversation(convo: Omit<SavedConversation, "createdAt" | "updatedAt"> & { createdAt?: string; updatedAt?: string }): SavedConversation | null {
  if (!canUseStorage()) return null;
  try {
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

    localStorage.setItem(CONVO_KEY, JSON.stringify(all.slice(0, 50)));
    return saved;
  } catch {
    return null;
  }
}

export function getConversation(id: string): SavedConversation | null {
  if (!canUseStorage()) return null;
  try {
    return loadConversations().find((c) => c.id === id) || null;
  } catch {
    return null;
  }
}

export function deleteConversation(id: string) {
  if (!canUseStorage()) return;
  try {
    const all = loadConversations().filter((c) => c.id !== id);
    localStorage.setItem(CONVO_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

// Decks
export function loadDecks(): SavedDeck[] {
  if (!canUseStorage()) return [];
  try {
    return JSON.parse(localStorage.getItem(DECK_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveDeck(deck: { id: string; title: string; theme: string; slides: unknown[] }): SavedDeck | null {
  if (!canUseStorage()) return null;
  try {
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

    localStorage.setItem(DECK_KEY, JSON.stringify(all.slice(0, 20)));
    return saved;
  } catch {
    return null;
  }
}

export function getDeck(id: string): SavedDeck | null {
  if (!canUseStorage()) return null;
  try {
    return loadDecks().find((d) => d.id === id) || null;
  } catch {
    return null;
  }
}

export function deleteDeck(id: string) {
  if (!canUseStorage()) return;
  try {
    const all = loadDecks().filter((d) => d.id !== id);
    localStorage.setItem(DECK_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}
