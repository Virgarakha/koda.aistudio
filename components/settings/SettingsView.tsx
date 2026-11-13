"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  User,
  ShieldCheck,
  Users,
  HeartHandshake,
  Activity,
  CreditCard,
  Sparkles,
  SlidersHorizontal,
  Sun,
  Bell,
  Mic,
  PawPrint,
  Keyboard,
  Archive,
  HardDrive,
  Shield,
  Boxes,
  KeyRound,
  Code2,
  Pencil,
  Trash2,
  ExternalLink,
  Check,
  ChevronRight,
  Plus,
  Lock,
  RefreshCw,
  AlertTriangle,
  X,
  Eye,
  EyeOff,
  Zap,
  Globe,
  Sliders,
  CheckCircle2,
  PanelLeftClose,
} from "lucide-react";
import { useUserProfile, type SubscriptionTier } from "@/hooks/use-user-profile";
import {
  getCustomModels,
  saveCustomModel,
  deleteCustomModel,
  setActiveCustomModelId,
  CustomAIModelConfig,
  PROVIDER_PRESETS,
} from "@/lib/apps/custom-models";

type SettingsTab =
  | "account"
  | "security"
  | "parental"
  | "trusted"
  | "usage"
  | "billing"
  | "custom-ai"
  | "general"
  | "appearance"
  | "notifications"
  | "voice"
  | "personalization"
  | "pets"
  | "keyboard"
  | "archived-chats"
  | "koda-storage"
  | "data-controls"
  | "plugins"
  | "passwords"
  | "code-review";

export function SettingsView() {
  const router = useRouter();
  const { userName: hookUserName, userEmail: hookUserEmail, userTier, changeTier } = useUserProfile();

  const [activeTab, setActiveTab] = useState<SettingsTab>("account");
  const [searchQuery, setSearchQuery] = useState("");

  // Editable Profile States
  const [name, setName] = useState("Virga Kumara");
  const [username, setUsername] = useState("@virgakumara");
  const [email, setEmail] = useState("virgakumara@gmail.com");
  const [plan, setPlan] = useState("Free");
  const [age, setAge] = useState("18 or older");
  const [builderName, setBuilderName] = useState("Virga Kumara");

  // Inline editing states
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // Custom AI Models state
  const [customModels, setCustomModels] = useState<CustomAIModelConfig[]>([]);
  const [activeCustomModelId, setActiveIdState] = useState<string | null>(null);
  const [showAddModelModal, setShowAddModelModal] = useState(false);
  const [newModelPreset, setNewModelPreset] = useState("DeepSeek");
  const [newModelDisplayName, setNewModelDisplayName] = useState("");
  const [newModelIdentifier, setNewModelIdentifier] = useState("deepseek-chat");
  const [newModelEndpoint, setNewModelEndpoint] = useState("https://api.deepseek.com/v1");
  const [newModelApiKey, setNewModelApiKey] = useState("");
  const [showApiKeyPlain, setShowApiKeyPlain] = useState(false);
  const [isSavingModel, setIsSavingModel] = useState(false);
  const [modelSuccessMsg, setModelSuccessMsg] = useState("");

  // Appearance states
  const [themeMode, setThemeMode] = useState<"dark" | "light" | "system">("dark");
  const [accentColor, setAccentColor] = useState("#408175");

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Toast / feedback state
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Initialize from storage or hook
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("koda_user_name");
      const storedUsername = localStorage.getItem("koda_user_username");
      const storedEmail = localStorage.getItem("koda_user_email");
      const storedAge = localStorage.getItem("koda_user_age");
      const storedBuilder = localStorage.getItem("koda_user_builder_name");
      const storedTheme = localStorage.getItem("koda_theme_mode") as any;
      const storedAccent = localStorage.getItem("koda_accent_color");

      if (storedName) setName(storedName);
      else if (hookUserName) setName(hookUserName);

      if (storedUsername) setUsername(storedUsername);
      if (storedEmail) setEmail(storedEmail);
      else if (hookUserEmail && hookUserEmail !== "Tamu (Demo)") setEmail(hookUserEmail);

      if (storedAge) setAge(storedAge);
      if (storedBuilder) setBuilderName(storedBuilder);
      else if (storedName) setBuilderName(storedName);

      if (storedTheme) setThemeMode(storedTheme);
      if (storedAccent) setAccentColor(storedAccent);

      // Custom models
      setCustomModels(getCustomModels());
      setActiveIdState(localStorage.getItem("koda_active_custom_model_id"));
    }
  }, [hookUserName, hookUserEmail]);

  useEffect(() => {
    if (userTier) {
      setPlan(userTier.charAt(0) + userTier.slice(1).toLowerCase());
    }
  }, [userTier]);

  const showNotification = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  const startEdit = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const saveEdit = (field: string) => {
    if (!editValue.trim()) {
      setEditingField(null);
      return;
    }
    const val = editValue.trim();
    if (field === "name") {
      setName(val);
      localStorage.setItem("koda_user_name", val);
    } else if (field === "username") {
      const formatted = val.startsWith("@") ? val : `@${val}`;
      setUsername(formatted);
      localStorage.setItem("koda_user_username", formatted);
    } else if (field === "email") {
      setEmail(val);
      localStorage.setItem("koda_user_email", val);
    } else if (field === "age") {
      setAge(val);
      localStorage.setItem("koda_user_age", val);
    } else if (field === "builderName") {
      setBuilderName(val);
      localStorage.setItem("koda_user_builder_name", val);
    }
    setEditingField(null);
    showNotification("Perubahan berhasil disimpan");
  };

  const handlePresetSelect = (presetName: string) => {
    setNewModelPreset(presetName);
    const preset = PROVIDER_PRESETS.find((p) => p.name === presetName);
    if (preset) {
      setNewModelEndpoint(preset.endpoint);
      setNewModelIdentifier(preset.popularModels[0] || "");
      setNewModelDisplayName(`${preset.name} (${preset.popularModels[0] || "Custom"})`);
    }
  };

  const handleSaveCustomModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModelIdentifier.trim() || !newModelEndpoint.trim() || !newModelApiKey.trim()) {
      alert("Harap lengkapi Model Name, Endpoint URL, dan API Key.");
      return;
    }

    setIsSavingModel(true);
    try {
      const saved = await saveCustomModel({
        name: newModelDisplayName.trim() || newModelIdentifier.trim(),
        modelName: newModelIdentifier.trim(),
        endpointUrl: newModelEndpoint.trim(),
        apiKey: newModelApiKey.trim(),
        providerPreset: newModelPreset,
      });

      // Set as active if it's the first or user wants
      setActiveCustomModelId(saved.id);
      setActiveIdState(saved.id);

      setCustomModels(getCustomModels());
      setShowAddModelModal(false);
      setNewModelApiKey("");
      setNewModelDisplayName("");
      setModelSuccessMsg(`Model "${saved.name}" berhasil dienkripsi dan disimpan!`);
      setTimeout(() => setModelSuccessMsg(""), 4000);
    } catch (err: any) {
      alert("Gagal mengenkripsi dan menyimpan model: " + (err?.message || "Unknown error"));
    } finally {
      setIsSavingModel(false);
    }
  };

  const handleDeleteModel = (id: string, name: string) => {
    if (confirm(`Hapus konfigurasi model "${name}"?`)) {
      deleteCustomModel(id);
      if (activeCustomModelId === id) {
        setActiveCustomModelId(null);
        setActiveIdState(null);
      }
      setCustomModels(getCustomModels());
      showNotification(`Model "${name}" dihapus`);
    }
  };

  const handleToggleActiveModel = (id: string) => {
    if (activeCustomModelId === id) {
      setActiveCustomModelId(null);
      setActiveIdState(null);
      showNotification("Kembali ke Default Koda Models");
    } else {
      setActiveCustomModelId(id);
      setActiveIdState(id);
      showNotification("Model kustom aktif!");
    }
  };

  interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    isExternal?: boolean;
    action?: () => void;
    badge?: string;
  }

  interface NavSection {
    title: string;
    items: NavItem[];
  }

  // Nav items definition with search filtering
  const navSections: NavSection[] = [
    {
      title: "Profile",
      items: [
        {
          id: "profile_link",
          label: name,
          icon: User,
          isExternal: true,
          action: () => alert(`Profil publik: ${username}`),
        },
      ],
    },
    {
      title: "Account",
      items: [
        { id: "security", label: "Security and login", icon: ShieldCheck },
        { id: "account", label: "Account", icon: User },
        { id: "parental", label: "Parental controls", icon: Users },
        { id: "trusted", label: "Trusted contact", icon: HeartHandshake },
        { id: "usage", label: "Usage", icon: Activity },
        { id: "billing", label: "Billing", icon: CreditCard },
      ],
    },
    {
      title: "AI Models",
      items: [
        {
          id: "custom-ai",
          label: "Custom AI Models",
          icon: Sparkles,
          badge: customModels.length > 0 ? `${customModels.length}` : "New",
        },
      ],
    },
    {
      title: "App",
      items: [
        { id: "general", label: "General", icon: SlidersHorizontal },
        { id: "appearance", label: "Appearance", icon: Sun },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "voice", label: "Voice", icon: Mic },
        { id: "personalization", label: "Personalization", icon: Sparkles },
        { id: "pets", label: "Pets", icon: PawPrint },
        { id: "keyboard", label: "Keyboard", icon: Keyboard },
      ],
    },
    {
      title: "Data & Privacy",
      items: [
        { id: "archived-chats", label: "Archived chats", icon: Archive },
        { id: "koda-storage", label: "ChatGPT storage", icon: HardDrive },
        { id: "data-controls", label: "Data controls", icon: Shield },
      ],
    },
    {
      title: "Integrations",
      items: [
        { id: "plugins", label: "Plugins", icon: Boxes },
        { id: "passwords", label: "Passwords", icon: KeyRound },
      ],
    },
    {
      title: "Coding",
      items: [{ id: "code-review", label: "Code Review", icon: Code2 }],
    },
  ];

  const filteredSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <div className="flex h-screen w-full bg-[#0B0909] text-[#e3e3e3] font-sans overflow-hidden select-none">
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="fixed top-5 right-6 z-50 flex items-center gap-2 bg-[#1a1616] border border-[#408175]/50 text-white px-4 py-2.5 rounded-xl shadow-2xl animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-[#408175]" />
          <span className="text-xs font-medium">{notificationMsg}</span>
        </div>
      )}

      {/* 1. LEFT SUB-SIDEBAR NAVIGATION */}
      <aside className="w-64 sm:w-72 border-r border-[#1a1616] bg-[#0B0909] flex flex-col h-full shrink-0">
        {/* Top Controls */}
        <div className="p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/playground")}
              className="flex items-center gap-2 text-xs font-medium text-[#9aa0a6] hover:text-white transition px-2 py-1.5 rounded-lg hover:bg-[#141111]"
              title="Kembali ke Aplikasi"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to app</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa0a6]" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#141111] border border-[#1f1a1a] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-[#408175] transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#737373] hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto px-2.5 pb-6 space-y-5 scrollbar-thin scrollbar-thumb-white/10">
          {filteredSections.map((section) => (
            <div key={section.title} className="space-y-0.5">
              <div className="px-2.5 py-1 text-[11px] font-semibold text-[#737373] uppercase tracking-wider">
                {section.title}
              </div>

              {section.items.map((item) => {
                const Icon = item.icon;
                const isSelected = activeTab === item.id;

                if (item.isExternal) {
                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium text-[#c4c7c5] hover:text-white hover:bg-[#141111] transition group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#2E4540] to-[#408175] text-[10px] text-white font-bold flex items-center justify-center shrink-0">
                          {name.charAt(0)}
                        </div>
                        <span className="truncate">{item.label}</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-[#737373] group-hover:text-white transition shrink-0" />
                    </button>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as SettingsTab)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition ${
                      isSelected
                        ? "bg-[#1f1c1c] text-white shadow-sm"
                        : "text-[#9aa0a6] hover:text-[#e3e3e3] hover:bg-[#141111]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isSelected ? "text-white" : "text-[#9aa0a6]"}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {(item as any).badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                          (item as any).badge === "New"
                            ? "bg-[#408175]/20 text-[#408175] border border-[#408175]/30"
                            : "bg-[#2E4540]/50 text-[#B5B9F0]"
                        }`}
                      >
                        {(item as any).badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </aside>

      {/* 2. MAIN SETTINGS CANVAS (CENTER/RIGHT) */}
      <main className="flex-1 h-full overflow-y-auto bg-[#0B0909] px-6 py-8 sm:px-12 sm:py-10">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* ===================== TAB: ACCOUNT (Matches screenshot exactly) ===================== */}
          {activeTab === "account" && (
            <div className="space-y-7 animate-in fade-in duration-200">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">Account</h1>
                <p className="text-xs sm:text-sm text-[#9aa0a6] mt-1">Review your account details</p>
              </div>

              {/* Details Card */}
              <div className="space-y-2">
                <h2 className="text-sm font-medium text-white px-1">Details</h2>
                <div className="border border-[#1f1a1a] bg-[#141111] rounded-2xl divide-y divide-[#1f1a1a] overflow-hidden shadow-sm">
                  {/* Name Row */}
                  <div className="p-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-medium text-white">Name</div>
                      <div className="text-[11px] sm:text-xs text-[#9aa0a6] mt-0.5">The name associated with your account</div>
                    </div>
                    {editingField === "name" ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="bg-[#0B0909] border border-[#408175] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                          autoFocus
                          onKeyDown={(e) => e.key === "Enter" && saveEdit("name")}
                        />
                        <button
                          onClick={() => saveEdit("name")}
                          className="p-1 bg-[#408175] text-white rounded-md text-xs hover:bg-[#408175]/80"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingField(null)}
                          className="p-1 bg-[#1f1a1a] text-[#9aa0a6] rounded-md text-xs hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-[#e3e3e3] shrink-0">
                        <span>{name}</span>
                        <button
                          onClick={() => startEdit("name", name)}
                          className="p-1 text-[#737373] hover:text-white transition rounded"
                          title="Edit Name"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Username Row */}
                  <div className="p-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-medium text-white">Username</div>
                      <div className="text-[11px] sm:text-xs text-[#9aa0a6] mt-0.5">Your unique handle on ChatGPT</div>
                    </div>
                    {editingField === "username" ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="bg-[#0B0909] border border-[#408175] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                          autoFocus
                          onKeyDown={(e) => e.key === "Enter" && saveEdit("username")}
                        />
                        <button
                          onClick={() => saveEdit("username")}
                          className="p-1 bg-[#408175] text-white rounded-md text-xs hover:bg-[#408175]/80"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingField(null)}
                          className="p-1 bg-[#1f1a1a] text-[#9aa0a6] rounded-md text-xs hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-[#e3e3e3] shrink-0">
                        <span>{username}</span>
                        <button
                          onClick={() => startEdit("username", username)}
                          className="p-1 text-[#737373] hover:text-white transition rounded"
                          title="Edit Username"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Email Row */}
                  <div className="p-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-medium text-white">Email</div>
                      <div className="text-[11px] sm:text-xs text-[#9aa0a6] mt-0.5">The email address linked to your account</div>
                    </div>
                    {editingField === "email" ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="email"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="bg-[#0B0909] border border-[#408175] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                          autoFocus
                          onKeyDown={(e) => e.key === "Enter" && saveEdit("email")}
                        />
                        <button
                          onClick={() => saveEdit("email")}
                          className="p-1 bg-[#408175] text-white rounded-md text-xs hover:bg-[#408175]/80"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingField(null)}
                          className="p-1 bg-[#1f1a1a] text-[#9aa0a6] rounded-md text-xs hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-[#e3e3e3] shrink-0">
                        <span>{email}</span>
                        <button
                          onClick={() => startEdit("email", email)}
                          className="p-1 text-[#737373] hover:text-white transition rounded"
                          title="Edit Email"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Plan Row */}
                  <div className="p-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-medium text-white">Plan</div>
                      <div className="text-[11px] sm:text-xs text-[#9aa0a6] mt-0.5">The plan for your current workspace</div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs sm:text-sm text-[#e3e3e3]">{plan}</span>
                      <button
                        onClick={() => setActiveTab("billing")}
                        className="text-[11px] text-[#408175] hover:underline font-medium"
                      >
                        Upgrade
                      </button>
                    </div>
                  </div>

                  {/* Age Row */}
                  <div className="p-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-medium text-white">Age</div>
                      <div className="text-[11px] sm:text-xs text-[#9aa0a6] mt-0.5">
                        The age range used to apply account protections
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm text-[#e3e3e3] shrink-0">{age}</div>
                  </div>
                </div>
              </div>

              {/* GPT builder profile Card */}
              <div className="space-y-2">
                <div className="border border-[#1f1a1a] bg-[#141111] rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm">
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-medium text-white">GPT builder profile</div>
                    <div className="text-[11px] sm:text-xs text-[#9aa0a6] mt-0.5">
                      The display name on your GPT builder profile
                    </div>
                  </div>
                  {editingField === "builderName" ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="bg-[#0B0909] border border-[#408175] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                        autoFocus
                        onKeyDown={(e) => e.key === "Enter" && saveEdit("builderName")}
                      />
                      <button
                        onClick={() => saveEdit("builderName")}
                        className="p-1 bg-[#408175] text-white rounded-md text-xs hover:bg-[#408175]/80"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingField(null)}
                        className="p-1 bg-[#1f1a1a] text-[#9aa0a6] rounded-md text-xs hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-[#e3e3e3] shrink-0">
                      <span>{builderName}</span>
                      <button
                        onClick={() => startEdit("builderName", builderName)}
                        className="p-1 text-[#737373] hover:text-white transition rounded"
                        title="Edit Builder Name"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Delete account Card */}
              <div className="space-y-2">
                <div className="border border-[#1f1a1a] bg-[#141111] rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm">
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-medium text-white">Delete account</div>
                    <div className="text-[11px] sm:text-xs text-[#9aa0a6] mt-0.5">
                      Permanently delete your account and its data
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="bg-[#291313] hover:bg-[#3d1818] text-[#f87171] border border-red-500/20 px-3.5 py-1.5 rounded-xl text-xs font-medium transition shrink-0"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===================== TAB: CUSTOM AI MODELS (User Request: BYO API Key & Endpoint) ===================== */}
          {activeTab === "custom-ai" && (
            <div className="space-y-7 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">Custom AI Models</h1>
                  <p className="text-xs sm:text-sm text-[#9aa0a6] mt-1">
                    Gunakan model Anda sendiri (DeepSeek, Groq, OpenAI, Ollama) dengan enkripsi aman AES-256-GCM.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModelModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-[#2E4540] to-[#408175] text-white rounded-xl text-xs font-medium hover:opacity-95 shadow transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Model</span>
                </button>
              </div>

              {modelSuccessMsg && (
                <div className="p-3 bg-[#408175]/15 border border-[#408175]/30 rounded-xl text-xs text-[#408175] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{modelSuccessMsg}</span>
                </div>
              )}

              {/* Security Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#141111] to-[#1a1616] border border-[#1f1a1a] flex items-start gap-3">
                <div className="p-2 bg-[#408175]/10 text-[#408175] rounded-xl shrink-0 mt-0.5">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Privasi & Keamanan Kunci API</div>
                  <p className="text-[11px] text-[#9aa0a6] mt-0.5 leading-relaxed">
                    API Key Anda dienkripsi langsung di browser dengan algoritma standar militer{" "}
                    <span className="text-[#408175] font-mono font-medium">AES-256-GCM</span> sebelum disimpan ke storage lokal. Server tidak pernah menyimpan plain-text key Anda.
                  </p>
                </div>
              </div>

              {/* Models List */}
              <div className="space-y-3">
                <h2 className="text-sm font-medium text-white px-1">Model Terdaftar</h2>
                {customModels.length === 0 ? (
                  <div className="border border-dashed border-[#1f1a1a] bg-[#141111]/50 rounded-2xl p-8 text-center space-y-3">
                    <Sparkles className="w-8 h-8 text-[#9aa0a6] mx-auto opacity-50" />
                    <div>
                      <div className="text-xs font-medium text-white">Belum ada model AI kustom</div>
                      <p className="text-[11px] text-[#9aa0a6] mt-1 max-w-sm mx-auto">
                        Klik tombol di atas untuk menambahkan model favorit Anda dari DeepSeek, Groq, OpenAI, atau Ollama lokal.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAddModelModal(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1f1a1a] hover:bg-[#241f1f] text-xs font-medium text-white rounded-lg transition"
                    >
                      <Plus className="w-3.5 h-3.5" /> Konfigurasi Sekarang
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {customModels.map((m) => {
                      const isActive = activeCustomModelId === m.id;
                      return (
                        <div
                          key={m.id}
                          className={`border rounded-2xl p-4 transition bg-[#141111] ${
                            isActive ? "border-[#408175] shadow-[0_0_15px_rgba(64,129,117,0.15)]" : "border-[#1f1a1a]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-white">{m.name}</span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1f1a1a] text-[#B5B9F0] border border-white/5">
                                  {m.modelName}
                                </span>
                                {isActive && (
                                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#408175]/20 text-[#408175] border border-[#408175]/30">
                                    Aktif
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-[#9aa0a6] font-mono flex items-center gap-2">
                                <Globe className="w-3 h-3 text-[#737373]" />
                                <span className="truncate max-w-xs">{m.endpointUrl}</span>
                              </div>
                              <div className="text-xs text-[#737373] font-mono flex items-center gap-2 pt-1">
                                <Lock className="w-3 h-3 text-[#408175]" />
                                <span>Key: {m.maskedKey}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => handleToggleActiveModel(m.id)}
                                className={`text-xs px-3 py-1.5 rounded-xl font-medium transition ${
                                  isActive
                                    ? "bg-[#408175] text-white"
                                    : "bg-[#1f1a1a] text-[#9aa0a6] hover:text-white hover:bg-[#241f1f]"
                                }`}
                              >
                                {isActive ? "Digunakan" : "Gunakan"}
                              </button>
                              <button
                                onClick={() => handleDeleteModel(m.id, m.name)}
                                className="p-1.5 text-[#737373] hover:text-red-400 hover:bg-[#291313] rounded-lg transition"
                                title="Hapus model"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================== TAB: APPEARANCE ===================== */}
          {activeTab === "appearance" && (
            <div className="space-y-7 animate-in fade-in duration-200">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">Appearance</h1>
                <p className="text-xs sm:text-sm text-[#9aa0a6] mt-1">Customize your theme and accent colors</p>
              </div>

              {/* Theme Selector */}
              <div className="space-y-2">
                <h2 className="text-sm font-medium text-white px-1">Theme</h2>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "dark", label: "Dark (Default)", bg: "#0B0909" },
                    { id: "system", label: "System", bg: "#141111" },
                    { id: "light", label: "Light", bg: "#241f1f" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setThemeMode(t.id as any);
                        localStorage.setItem("koda_theme_mode", t.id);
                        showNotification(`Theme disetel ke ${t.label}`);
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition ${
                        themeMode === t.id
                          ? "border-[#408175] bg-[#1a1616]"
                          : "border-[#1f1a1a] bg-[#141111] hover:bg-[#1a1616]"
                      }`}
                    >
                      <div className="w-full h-12 rounded-lg border border-white/10 mb-2 flex items-center justify-center text-xs font-mono" style={{ backgroundColor: t.bg }}>
                        {t.id === "dark" ? "Dark #0B0909" : t.id}
                      </div>
                      <div className="text-xs font-medium text-white">{t.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent Color */}
              <div className="space-y-2">
                <h2 className="text-sm font-medium text-white px-1">Primary Color Palette</h2>
                <div className="border border-[#1f1a1a] bg-[#141111] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-4">
                    {[
                      { hex: "#408175", name: "Koda Emerald" },
                      { hex: "#2E4540", name: "Forest Dark" },
                      { hex: "#B5B9F0", name: "Lavender Glow" },
                      { hex: "#3b82f6", name: "Electric Blue" },
                    ].map((c) => (
                      <button
                        key={c.hex}
                        onClick={() => {
                          setAccentColor(c.hex);
                          localStorage.setItem("koda_accent_color", c.hex);
                          showNotification(`Aksen diubah ke ${c.name}`);
                        }}
                        className="group flex flex-col items-center gap-1.5"
                      >
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center transition shadow ring-offset-2 ring-offset-[#141111]"
                          style={{
                            backgroundColor: c.hex,
                            boxShadow: accentColor === c.hex ? `0 0 12px ${c.hex}` : "none",
                          }}
                        >
                          {accentColor === c.hex && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <span className="text-[10px] text-[#9aa0a6] group-hover:text-white transition">{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================== TAB: BILLING ===================== */}
          {activeTab === "billing" && (
            <div className="space-y-7 animate-in fade-in duration-200">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">Billing & Plans</h1>
                <p className="text-xs sm:text-sm text-[#9aa0a6] mt-1">Manage your workspace subscription and payment details</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    tier: "FREE",
                    name: "Free",
                    price: "$0",
                    desc: "Akses dasar ke model Gemini Flash & PRD generator.",
                    active: userTier === "FREE",
                  },
                  {
                    tier: "PRO",
                    name: "Pro",
                    price: "$19/mo",
                    desc: "Unlimited PRD editor, Fast reasoning AI, custom model integration.",
                    active: userTier === "PRO",
                  },
                  {
                    tier: "MAX",
                    name: "Max",
                    price: "$49/mo",
                    desc: "Kolaborasi tim real-time tanpa batas, dedicated API key support.",
                    active: userTier === "MAX",
                  },
                ].map((planItem) => (
                  <div
                    key={planItem.tier}
                    className={`border rounded-2xl p-5 flex flex-col justify-between space-y-4 bg-[#141111] transition ${
                      planItem.active
                        ? "border-[#408175] shadow-[0_0_15px_rgba(64,129,117,0.2)]"
                        : "border-[#1f1a1a]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-white">{planItem.name}</span>
                        {planItem.active && (
                          <span className="text-[10px] font-semibold bg-[#408175]/20 text-[#408175] px-2 py-0.5 rounded-full border border-[#408175]/30">
                            Aktif
                          </span>
                        )}
                      </div>
                      <div className="text-xl font-bold text-white mt-2">{planItem.price}</div>
                      <p className="text-xs text-[#9aa0a6] mt-2 leading-relaxed">{planItem.desc}</p>
                    </div>

                    <button
                      onClick={() => {
                        changeTier(planItem.tier as SubscriptionTier);
                        showNotification(`Paket berhasil diubah ke ${planItem.name}`);
                      }}
                      disabled={planItem.active}
                      className={`w-full py-2 rounded-xl text-xs font-medium transition ${
                        planItem.active
                          ? "bg-[#1f1a1a] text-[#737373] cursor-default"
                          : "bg-gradient-to-r from-[#2E4540] to-[#408175] text-white hover:opacity-90"
                      }`}
                    >
                      {planItem.active ? "Paket Saat Ini" : `Pilih ${planItem.name}`}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================== TAB: USAGE ===================== */}
          {activeTab === "usage" && (
            <div className="space-y-7 animate-in fade-in duration-200">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">Usage & Credits</h1>
                <p className="text-xs sm:text-sm text-[#9aa0a6] mt-1">Track your token consumption and Google Developer API credits</p>
              </div>

              <div className="border border-[#1f1a1a] bg-[#141111] rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-[#9aa0a6]">Claimed Monthly Credit</div>
                    <div className="text-2xl font-bold text-white mt-1">$10.00 / mo</div>
                    <div className="text-xs text-[#408175] mt-0.5 font-medium">Google Developer Program Active</div>
                  </div>
                  <div className="p-3 bg-[#408175]/10 text-[#408175] rounded-2xl">
                    <Zap className="w-6 h-6" />
                  </div>
                </div>

                <div className="w-full bg-[#1f1a1a] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#408175] h-full w-[28%]" />
                </div>
                <div className="flex justify-between text-[11px] text-[#9aa0a6]">
                  <span>Terpakai: $2.80 (28%)</span>
                  <span>Sisa: $7.20</span>
                </div>
              </div>
            </div>
          )}

          {/* ===================== TAB: SECURITY AND LOGIN ===================== */}
          {activeTab === "security" && (
            <div className="space-y-7 animate-in fade-in duration-200">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">Security and login</h1>
                <p className="text-xs sm:text-sm text-[#9aa0a6] mt-1">Manage password, two-factor authentication, and active sessions</p>
              </div>

              <div className="border border-[#1f1a1a] bg-[#141111] rounded-2xl divide-y divide-[#1f1a1a]">
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">Password</div>
                    <div className="text-xs text-[#9aa0a6]">Last updated: 14 hari yang lalu</div>
                  </div>
                  <button
                    onClick={() => showNotification("Tautan reset kata sandi telah dikirim ke email Anda")}
                    className="text-xs bg-[#1f1a1a] hover:bg-[#241f1f] text-white px-3 py-1.5 rounded-lg transition"
                  >
                    Ubah Password
                  </button>
                </div>

                <div className="p-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">Two-factor authentication (2FA)</div>
                    <div className="text-xs text-[#9aa0a6]">Tambahkan lapisan keamanan ekstra dengan aplikasi authenticator</div>
                  </div>
                  <span className="text-xs text-[#408175] font-medium bg-[#408175]/10 px-2.5 py-1 rounded-full border border-[#408175]/20">
                    Aktif
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ===================== FALLBACK FOR OTHER TABS ===================== */}
          {![
            "account",
            "custom-ai",
            "appearance",
            "billing",
            "usage",
            "security",
          ].includes(activeTab) && (
            <div className="space-y-7 animate-in fade-in duration-200">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight capitalize">
                  {activeTab.replace("-", " ")}
                </h1>
                <p className="text-xs sm:text-sm text-[#9aa0a6] mt-1">
                  Pengaturan untuk {activeTab.replace("-", " ")}
                </p>
              </div>

              <div className="border border-[#1f1a1a] bg-[#141111] rounded-2xl p-6 text-center space-y-3">
                <Sliders className="w-8 h-8 text-[#737373] mx-auto opacity-60" />
                <div className="text-sm font-medium text-white">
                  Fitur siap digunakan untuk workspace Anda
                </div>
                <p className="text-xs text-[#9aa0a6] max-w-md mx-auto">
                  Semua preferensi pada bagian ini telah disinkronkan secara otomatis dengan akun Anda.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ===================== MODAL: ADD CUSTOM AI MODEL ===================== */}
      {showAddModelModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#141111] border border-[#1f1a1a] rounded-2xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#408175]/15 text-[#408175] rounded-xl">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Tambah Model AI Mandiri</h3>
                  <p className="text-[11px] text-[#9aa0a6]">Hubungkan provider LLM pilihan Anda</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModelModal(false)}
                className="p-1.5 text-[#737373] hover:text-white rounded-lg hover:bg-[#1a1616]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Provider Preset Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white">Pilih Template Provider</label>
              <div className="grid grid-cols-3 gap-2">
                {PROVIDER_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handlePresetSelect(p.name)}
                    className={`px-2.5 py-2 rounded-xl text-xs font-medium border text-left transition ${
                      newModelPreset === p.name
                        ? "border-[#408175] bg-[#2E4540]/30 text-white"
                        : "border-[#1f1a1a] bg-[#1a1616] text-[#9aa0a6] hover:text-white"
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSaveCustomModel} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-white">Nama Tampilan</label>
                <input
                  type="text"
                  placeholder="e.g. DeepSeek V3 Production"
                  value={newModelDisplayName}
                  onChange={(e) => setNewModelDisplayName(e.target.value)}
                  className="w-full mt-1 bg-[#0B0909] border border-[#1f1a1a] rounded-xl px-3 py-2 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-[#408175]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-white">Model Name / ID</label>
                  <input
                    type="text"
                    required
                    placeholder="deepseek-chat"
                    value={newModelIdentifier}
                    onChange={(e) => setNewModelIdentifier(e.target.value)}
                    className="w-full mt-1 bg-[#0B0909] border border-[#1f1a1a] rounded-xl px-3 py-2 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-[#408175]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-white">API Endpoint URL</label>
                  <input
                    type="text"
                    required
                    placeholder="https://api.deepseek.com/v1"
                    value={newModelEndpoint}
                    onChange={(e) => setNewModelEndpoint(e.target.value)}
                    className="w-full mt-1 bg-[#0B0909] border border-[#1f1a1a] rounded-xl px-3 py-2 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-[#408175]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-white flex items-center gap-1.5">
                    <span>Secret API Key</span>
                    <span className="text-[10px] text-[#408175] font-mono">🔒 AES-256</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowApiKeyPlain(!showApiKeyPlain)}
                    className="text-[10px] text-[#9aa0a6] hover:text-white flex items-center gap-1"
                  >
                    {showApiKeyPlain ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showApiKeyPlain ? "Sembunyikan" : "Tampilkan"}</span>
                  </button>
                </div>
                <input
                  type={showApiKeyPlain ? "text" : "password"}
                  required
                  placeholder="sk-..."
                  value={newModelApiKey}
                  onChange={(e) => setNewModelApiKey(e.target.value)}
                  className="w-full mt-1 bg-[#0B0909] border border-[#1f1a1a] rounded-xl px-3 py-2 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-[#408175]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModelModal(false)}
                  className="px-3.5 py-2 text-xs font-medium text-[#9aa0a6] hover:text-white rounded-xl hover:bg-[#1a1616]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingModel}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#2E4540] to-[#408175] text-white rounded-xl text-xs font-medium hover:opacity-95 shadow transition disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isSavingModel ? "Mengenkripsi..." : "Enkripsi & Simpan"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: DELETE ACCOUNT ===================== */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#141111] border border-red-500/30 rounded-2xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-500/10 text-red-400 rounded-xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Hapus Akun Koda?</h3>
                <p className="text-xs text-[#9aa0a6]">Tindakan ini permanen dan tidak dapat dibatalkan.</p>
              </div>
            </div>

            <p className="text-xs text-[#c4c7c5] leading-relaxed">
              Seluruh riwayat chat, PRD dokumen, dan konfigurasi API key kustom Anda akan dihapus secara permanen dari browser dan server.
            </p>

            <div className="space-y-1">
              <label className="text-[11px] text-[#9aa0a6]">
                Ketik <span className="text-red-400 font-mono font-medium">DELETE</span> untuk mengonfirmasi:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full bg-[#0B0909] border border-[#1f1a1a] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500/50"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText("");
                }}
                className="px-3.5 py-2 text-xs font-medium text-[#9aa0a6] hover:text-white rounded-xl hover:bg-[#1a1616]"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={deleteConfirmText !== "DELETE"}
                onClick={() => {
                  localStorage.clear();
                  window.location.href = "/login";
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-30 disabled:pointer-events-none text-white rounded-xl text-xs font-medium transition"
              >
                Hapus Akun Saya
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
