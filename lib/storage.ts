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
const OWNER_KEY = "neuromart-owner";

// Owner Profile
export interface OwnerProfile {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  companyTagline: string;
  role: string;
  photoUrl: string;
  photoData: string; // base64 local upload
  companyLogoUrl: string;
  companyLogoData: string; // base64 local upload
  industry: string;
  communicationPrefs: {
    digestFrequency: "daily" | "weekly" | "never";
    autoSend: boolean;
  };
}

const DEFAULT_OWNER: OwnerProfile = {
  name: "",
  email: "",
  phone: "",
  companyName: "Neuromart.ai",
  companyTagline: "AI Solutions for Every Business",
  role: "Founder & CEO",
  photoUrl: "",
  photoData: "",
  companyLogoUrl: "",
  companyLogoData: "",
  industry: "AI / Technology",
  communicationPrefs: {
    digestFrequency: "weekly",
    autoSend: false,
  },
};

export function loadOwnerProfile(): OwnerProfile {
  if (!canUseStorage()) return DEFAULT_OWNER;
  try {
    const stored = localStorage.getItem(OWNER_KEY);
    if (!stored) return DEFAULT_OWNER;
    return { ...DEFAULT_OWNER, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_OWNER;
  }
}

export function saveOwnerProfile(profile: Partial<OwnerProfile>): OwnerProfile {
  if (!canUseStorage()) return DEFAULT_OWNER;
  try {
    const current = loadOwnerProfile();
    const updated = { ...current, ...profile };
    localStorage.setItem(OWNER_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_OWNER;
  }
}

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
