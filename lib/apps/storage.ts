"use client";

import { KodaApp, ChatMessage, AppStatus } from "./types";
import { SubscriptionTier } from "@/hooks/use-user-profile";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const STORAGE_KEY = "koda_saved_apps";

export function generateTitleFromPrompt(prompt: string): string {
  const clean = prompt.trim().replace(/^([Aa]i|[Tt]olong|buatkan|bikin|buat|create|build)\s+/i, "");
  const firstSentence = clean.split(/[.\n?!]/)[0].trim();
  if (firstSentence.length > 45) {
    return firstSentence.substring(0, 42) + "...";
  }
  return firstSentence.charAt(0).toUpperCase() + firstSentence.slice(1) || "Aplikasi Baru";
}

export function getSavedApps(userEmail?: string): KodaApp[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const apps: KodaApp[] = JSON.parse(raw);
    if (userEmail) {
      return apps.filter(
        (a) => !a.userEmail || a.userEmail === userEmail
      ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
    return apps.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch (e) {
    console.error("Failed to parse saved apps:", e);
    return [];
  }
}

export function getAppById(id: string): KodaApp | null {
  if (typeof window === "undefined") return null;

  try {
    const apps = getSavedApps();
    return apps.find((a) => a.id === id) || null;
  } catch (e) {
    console.error("Failed to get app by id:", e);
    return null;
  }
}

let isAppsTableAvailable = true;

export async function saveApp(app: KodaApp): Promise<KodaApp> {
  if (typeof window === "undefined") return app;

  try {
    const apps = getSavedApps();
    const existingIndex = apps.findIndex((a) => a.id === app.id);
    const updatedApp: KodaApp = {
      ...app,
      updatedAt: new Date().toISOString(),
    };

    let newApps: KodaApp[];
    if (existingIndex >= 0) {
      newApps = [...apps];
      newApps[existingIndex] = updatedApp;
    } else {
      newApps = [updatedApp, ...apps];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newApps));

    // Async sync with Supabase if table exists
    if (isSupabaseConfigured() && isAppsTableAvailable) {
      try {
        const supabase = createClient();
        const { error } = await supabase.from("apps").upsert({
          id: updatedApp.id,
          title: updatedApp.title,
          description: updatedApp.description,
          model: updatedApp.model,
          tier: updatedApp.tier,
          status: updatedApp.status,
          messages: updatedApp.messages,
          user_email: updatedApp.userEmail,
          created_at: updatedApp.createdAt,
          updated_at: updatedApp.updatedAt,
        });

        if (error) {
          // If table doesn't exist yet (404 / 42P01), disable future calls this session
          isAppsTableAvailable = false;
        }
      } catch {
        isAppsTableAvailable = false;
      }
    }

    return updatedApp;
  } catch (e) {
    console.error("Failed to save app:", e);
    return app;
  }
}


export async function deleteApp(id: string): Promise<boolean> {
  if (typeof window === "undefined") return false;

  try {
    const apps = getSavedApps();
    const filtered = apps.filter((a) => a.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.from("apps").delete().eq("id", id);
      } catch (err) {
        console.warn("Supabase delete failed:", err);
      }
    }

    return true;
  } catch (e) {
    console.error("Failed to delete app:", e);
    return false;
  }
}
