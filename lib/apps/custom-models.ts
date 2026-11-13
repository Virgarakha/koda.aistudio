"use client";

import { encryptApiKey, decryptApiKey, maskApiKey, EncryptedPayload } from "@/lib/security/crypto";

export interface CustomAIModelConfig {
  id: string;
  name: string;             // Display name (e.g. "DeepSeek V3 (Production)")
  modelName: string;        // Model identifier (e.g. "deepseek-chat", "gpt-4o", "llama-3.3-70b-versatile")
  endpointUrl: string;      // API base URL (e.g. "https://api.deepseek.com/v1")
  encryptedKey: EncryptedPayload;
  maskedKey: string;        // e.g. "sk-••••••••4a8f"
  providerPreset?: string;  // "OpenAI" | "DeepSeek" | "Groq" | "OpenRouter" | "Ollama" | "Custom"
  createdAt: string;
  updatedAt: string;
}

export const PROVIDER_PRESETS = [
  {
    name: "OpenAI",
    endpoint: "https://api.openai.com/v1",
    popularModels: ["gpt-4o", "gpt-4o-mini", "o1-mini"],
    keyHint: "sk-...",
  },
  {
    name: "DeepSeek",
    endpoint: "https://api.deepseek.com/v1",
    popularModels: ["deepseek-chat", "deepseek-reasoner"],
    keyHint: "sk-...",
  },
  {
    name: "Groq (Ultra-Fast)",
    endpoint: "https://api.groq.com/openai/v1",
    popularModels: ["llama-3.3-70b-versatile", "mixtral-8x7b-32768"],
    keyHint: "gsk_...",
  },
  {
    name: "OpenRouter",
    endpoint: "https://openrouter.ai/api/v1",
    popularModels: ["anthropic/claude-3.5-sonnet", "meta-llama/llama-3.3-70b-instruct", "google/gemini-2.0-flash-exp:free"],
    keyHint: "sk-or-...",
  },
  {
    name: "Ollama (Local / Self-Hosted)",
    endpoint: "http://localhost:11434/v1",
    popularModels: ["llama3.2", "deepseek-r1", "mistral"],
    keyHint: "ollama (or leave blank)",
  },
  {
    name: "Custom OpenAI-Compatible",
    endpoint: "https://your-custom-llm-host.com/v1",
    popularModels: ["custom-model"],
    keyHint: "Your secret API key",
  },
];

const STORAGE_KEY = "koda_custom_ai_models";
const ACTIVE_CUSTOM_MODEL_ID = "koda_active_custom_model_id";

// Get all custom models from localStorage
export function getCustomModels(): CustomAIModelConfig[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Failed to load custom models:", e);
    return [];
  }
}

// Save or Update a Custom Model (Encrypts API key before saving)
export async function saveCustomModel(input: {
  id?: string;
  name: string;
  modelName: string;
  endpointUrl: string;
  apiKey: string;
  providerPreset?: string;
}): Promise<CustomAIModelConfig> {
  const models = getCustomModels();
  const existingId = input.id;
  const isEditing = !!existingId;

  // Encrypt the API key with AES-GCM
  const encryptedKey = await encryptApiKey(input.apiKey);
  const maskedKey = maskApiKey(input.apiKey);

  const modelRecord: CustomAIModelConfig = {
    id: existingId || `custom-model-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: input.name.trim() || input.modelName.trim(),
    modelName: input.modelName.trim(),
    endpointUrl: input.endpointUrl.trim().replace(/\/+$/, ""),
    encryptedKey,
    maskedKey,
    providerPreset: input.providerPreset || "Custom",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  let nextModels: CustomAIModelConfig[];
  if (isEditing) {
    nextModels = models.map((m) => (m.id === existingId ? { ...modelRecord, createdAt: m.createdAt } : m));
  } else {
    nextModels = [modelRecord, ...models];
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextModels));
    window.dispatchEvent(new Event("koda_custom_models_updated"));
  }

  return modelRecord;
}

// Delete a custom model
export function deleteCustomModel(id: string): void {
  if (typeof window === "undefined") return;
  const models = getCustomModels();
  const nextModels = models.filter((m) => m.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextModels));
  window.dispatchEvent(new Event("koda_custom_models_updated"));
}

// Decrypt API key on demand for API requests
export async function getDecryptedModelKey(model: CustomAIModelConfig): Promise<string> {
  if (!model || !model.encryptedKey) return "";
  return decryptApiKey(model.encryptedKey);
}

// Set active custom model ID
export function setActiveCustomModelId(id: string | null): void {
  if (typeof window === "undefined") return;
  if (!id) {
    localStorage.removeItem(ACTIVE_CUSTOM_MODEL_ID);
  } else {
    localStorage.setItem(ACTIVE_CUSTOM_MODEL_ID, id);
  }
  window.dispatchEvent(new Event("koda_active_model_changed"));
}

// Get active custom model
export function getActiveCustomModel(): CustomAIModelConfig | null {
  if (typeof window === "undefined") return null;
  const id = localStorage.getItem(ACTIVE_CUSTOM_MODEL_ID);
  if (!id) return null;
  const models = getCustomModels();
  return models.find((m) => m.id === id) || null;
}
