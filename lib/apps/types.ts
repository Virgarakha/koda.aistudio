import { SubscriptionTier } from "@/hooks/use-user-profile";

export interface FileAttachment {
  name: string;
  type: string; // mime type e.g. "image/png", "application/pdf", "text/plain"
  size: number;
  data: string; // base64 encoded data url
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  attachments?: FileAttachment[];
  thought?: string;
  sources?: string[];
  tokens?: number;
  time?: string;
  createdAt?: string;
}

export type AppStatus = "draft" | "interviewing" | "spec_ready";

export interface ToolThread {
  toolId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface KodaApp {
  id: string;
  title: string;
  description: string;
  model: string;
  tier: SubscriptionTier;
  status: AppStatus;
  messages: ChatMessage[]; // Obrolan Utama (Parent Conversation)
  toolThreads?: Record<string, ToolThread>; // Obrolan Anak per Tool (Child Threads)
  createdAt: string;
  updatedAt: string;
  userEmail?: string;
}

