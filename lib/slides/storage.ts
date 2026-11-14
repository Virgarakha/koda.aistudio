"use client";

import { PresentationDeck, SlideData, SlideThemeId } from "./types";

const STORAGE_KEY = "koda_saved_slides";

/**
 * Returns a clean, blank starter deck so the user begins with a clean slate
 * instead of a pre-baked rigid template, letting AI design the style and content.
 */
export function getDefaultStarterDeck(): PresentationDeck {
  const now = new Date().toISOString();
  return {
    id: "deck-blank-starter",
    title: "Presentasi Baru",
    description: "Slide presentasi kosong siap didesain oleh AI",
    topic: "",
    theme: "terracotta",
    createdAt: now,
    updatedAt: now,
    slides: [
      {
        id: "slide-1",
        layout: "title",
        title: "Judul Presentasi Anda",
        subtitle: "Klik '✨ AI Generate PPT' di atas atau ketik langsung di sini untuk merancang slide.",
        badge: "DRAFT PRESENTASI",
        footerText: "Koda Slider Studio",
        speakerNotes: "Catatan presenter untuk slide ini.",
      },
    ],
  };
}

export function getSavedDecks(userEmail?: string): PresentationDeck[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [getDefaultStarterDeck()];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return [getDefaultStarterDeck()];
  } catch (err) {
    console.error("Error reading saved decks from localStorage:", err);
    return [getDefaultStarterDeck()];
  }
}

export function getDeckById(deckId: string): PresentationDeck | null {
  const decks = getSavedDecks();
  return decks.find((d) => d.id === deckId) || null;
}

export function saveDeck(deck: PresentationDeck): void {
  if (typeof window === "undefined") return;

  try {
    const decks = getSavedDecks(deck.userEmail);
    const index = decks.findIndex((d) => d.id === deck.id);
    const updatedDeck: PresentationDeck = {
      ...deck,
      updatedAt: new Date().toISOString(),
    };

    let newDecks: PresentationDeck[];
    if (index >= 0) {
      newDecks = [...decks];
      newDecks[index] = updatedDeck;
    } else {
      newDecks = [updatedDeck, ...decks];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newDecks));
    window.dispatchEvent(new Event("koda_slides_updated"));
  } catch (err) {
    console.error("Error saving presentation deck:", err);
  }
}

export function deleteDeck(deckId: string): void {
  if (typeof window === "undefined") return;

  try {
    const decks = getSavedDecks();
    const filtered = decks.filter((d) => d.id !== deckId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new Event("koda_slides_updated"));
  } catch (err) {
    console.error("Error deleting presentation deck:", err);
  }
}

export function createBlankDeck(title = "Presentasi Baru", theme: SlideThemeId = "terracotta"): PresentationDeck {
  const now = new Date().toISOString();
  const newDeck: PresentationDeck = {
    id: `deck-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title,
    description: "Slide presentasi kosong siap didesain",
    topic: "",
    theme,
    createdAt: now,
    updatedAt: now,
    slides: [
      {
        id: `slide-${Date.now()}-1`,
        layout: "title",
        title,
        subtitle: "Tambahkan subtitle atau gunakan AI untuk merancang seluruh alur slide secara otomatis.",
        badge: "DRAFT PRESENTASI",
        footerText: "Koda Slider Studio",
        speakerNotes: "Catatan pengantar presentasi.",
      },
    ],
  };

  saveDeck(newDeck);
  return newDeck;
}
