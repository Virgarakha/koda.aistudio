"use client";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export interface PrdCommentReply {
  id: string;
  author: string;
  authorRole?: string;
  avatarUrl?: string;
  initial: string;
  authorColor: string;
  text: string;
  createdAt: string;
  isAi?: boolean;
}

export interface PrdComment {
  id: string;
  author: string;
  authorRole?: string;
  avatarUrl?: string;
  initial: string;
  authorColor: string;
  text: string;
  tag?: string;
  sectionName?: string;
  createdAt: string;
  resolved?: boolean;
  replies?: PrdCommentReply[];
}

export interface PrdDocumentRecord {
  id: string;
  title: string;
  appName?: string;
  html: string;
  markdown: string;
  updatedAt: string;
  sourceAppId?: string;
  sourceSessionId?: string;
  sourceUrl?: string;
  version?: number;
  collaborators?: Array<{ name: string; role: string; avatarColor: string; initial: string }>;
  comments?: PrdComment[];
}

const STORAGE_PREFIX = "koda_prd_doc_";
const ACTIVE_DOC_ID_KEY = "koda_last_active_prd_id";

// Helper to generate a clean, readable unique Document ID
export function generateUniqueDocId(titleOrAppName?: string): string {
  const base = (titleOrAppName || "prd")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 20);
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const timestamp = Date.now().toString().slice(-4);
  return `doc-${base || "project"}-${timestamp}${randomSuffix}`;
}

// Save PRD Document to both local cache and Supabase Database
export async function savePrdDocument(doc: PrdDocumentRecord): Promise<PrdDocumentRecord> {
  const updatedDoc: PrdDocumentRecord = {
    ...doc,
    updatedAt: new Date().toISOString(),
    version: (doc.version || 1) + 1,
  };

  if (typeof window !== "undefined") {
    try {
      // 1. Save specific doc locally
      localStorage.setItem(`${STORAGE_PREFIX}${updatedDoc.id}`, JSON.stringify(updatedDoc));
      localStorage.setItem("koda_active_prd_doc", JSON.stringify(updatedDoc));
      localStorage.setItem(ACTIVE_DOC_ID_KEY, updatedDoc.id);

      // 2. Dispatch custom event for cross-component and cross-tab sync
      window.dispatchEvent(
        new CustomEvent("koda_prd_doc_updated", { detail: { id: updatedDoc.id, doc: updatedDoc } })
      );
    } catch (e) {
      console.warn("Failed to save PRD doc locally:", e);
    }
  }

  // 3. Persist to Supabase Database (apps table)
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const payload = {
        id: updatedDoc.id,
        title: updatedDoc.title,
        description: updatedDoc.appName || "Product Requirements Document (PRD)",
        model: "gemini-3.8-flash",
        tier: "FREE",
        status: "prd_document",
        messages: [
          {
            role: "document",
            content: updatedDoc.markdown,
            html: updatedDoc.html,
            appName: updatedDoc.appName,
            version: updatedDoc.version,
            sourceAppId: updatedDoc.sourceAppId,
            sourceSessionId: updatedDoc.sourceSessionId,
            sourceUrl: updatedDoc.sourceUrl,
            collaborators: updatedDoc.collaborators,
            comments: updatedDoc.comments || [],
          },
        ],
        updated_at: updatedDoc.updatedAt,
      };

      const { error } = await supabase.from("apps").upsert(payload);
      if (error) {
        console.warn("Supabase upsert PRD document warning:", error.message);
      }
    } catch (err) {
      console.warn("Could not save PRD to Supabase:", err);
    }
  }

  return updatedDoc;
}

// Fetch PRD Document by ID (Checks Database first, then falls back to local cache)
export async function getPrdDocumentById(id: string): Promise<PrdDocumentRecord | null> {
  if (!id) return null;

  // 1. Try fetching from Supabase Database for live team collaborative data
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("apps")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!error && data) {
        const docMsg = Array.isArray(data.messages) && data.messages.length > 0 ? data.messages[0] : null;
        if (docMsg) {
          const docRecord: PrdDocumentRecord = {
            id: data.id,
            title: data.title || "Product Requirements Document (PRD)",
            appName: docMsg.appName || data.description || "Platform Aplikasi",
            html: docMsg.html || "",
            markdown: docMsg.content || "",
            updatedAt: data.updated_at || new Date().toISOString(),
            sourceAppId: docMsg.sourceAppId,
            sourceSessionId: docMsg.sourceSessionId,
            sourceUrl: docMsg.sourceUrl,
            version: docMsg.version || 1,
            collaborators: docMsg.collaborators,
            comments: Array.isArray(docMsg.comments) ? docMsg.comments : [],
          };

          // Cache locally
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(`${STORAGE_PREFIX}${id}`, JSON.stringify(docRecord));
            } catch {}
          }

          return docRecord;
        }
      }
    } catch (err) {
      console.warn("Error fetching PRD from Supabase:", err);
    }
  }

  // 2. Fallback to LocalStorage cache
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(`${STORAGE_PREFIX}${id}`);
      if (cached) {
        return JSON.parse(cached);
      }

      // Check fallback active doc
      const active = localStorage.getItem("koda_active_prd_doc");
      if (active) {
        const parsed = JSON.parse(active);
        if (parsed.id === id) return parsed;
      }
    } catch (e) {
      console.warn("Error reading local PRD cache:", e);
    }
  }

  return null;
}

// Get the last active Document ID or null
export function getLastActiveDocId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_DOC_ID_KEY);
}
