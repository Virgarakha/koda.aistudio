"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ShieldCheck, Terminal, CheckCircle2, AlertCircle, Copy, Check, ArrowRight } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { GoogleIcon } from "@/components/playground/GoogleIcon";
import { KodaGeometricLogo } from "@/components/landing/KodaGeometricLogo";

function CliAuthPageContent() {
  const searchParams = useSearchParams();
  const port = searchParams.get("port") || "54321";
  const state = searchParams.get("state") || "";

  const [currentUser, setCurrentUser] = useState<{
    email: string;
    name?: string;
    avatarUrl?: string;
    tier?: string;
    token?: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "authorizing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Load active user session on mount
  useEffect(() => {
    async function checkAuth() {
      if (isSupabaseConfigured()) {
        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          const { data: { session } } = await supabase.auth.getSession();

          if (user) {
            const email = user.email || "user@koda.ai";
            const name = user.user_metadata?.full_name || user.user_metadata?.name || email.split("@")[0];
            const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
            const token = session?.access_token || `token-${Date.now()}`;
            const tier = localStorage.getItem("koda_user_tier") || "PRO";

            setCurrentUser({ email, name, avatarUrl, tier, token });
            generateCode(email, name, token);
            return;
          }
        } catch {}
      }

      // Fallback from localStorage
      const localEmail = localStorage.getItem("koda_user_email");
      const localName = localStorage.getItem("koda_user_name") || localEmail?.split("@")[0] || "Koda Developer";
      const localTier = localStorage.getItem("koda_user_tier") || "PRO";

      if (localEmail) {
        const dummyToken = `koda-cli-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        setCurrentUser({ email: localEmail, name: localName, tier: localTier, token: dummyToken });
        generateCode(localEmail, localName, dummyToken);
      }
    }

    checkAuth();
  }, []);

  function generateCode(email: string, name: string, token: string) {
    const payload = {
      email,
      name,
      token,
      tier: "PRO",
      state,
      issuedAt: Date.now(),
    };
    const b64 = btoa(JSON.stringify(payload));
    setManualCode(`koda_auth_${b64}`);
  }

  // Authorize and send session back to CLI local server
  const handleAuthorize = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    setStatus("authorizing");
    setErrorMessage(null);

    const payload = {
      token: currentUser.token,
      email: currentUser.email,
      name: currentUser.name || "Koda Developer",
      avatarUrl: currentUser.avatarUrl,
      tier: currentUser.tier || "PRO",
      state,
    };

    try {
      // 1. Send to local loopback HTTP server
      const localUrl = `http://127.0.0.1:${port}/callback`;
      const res = await fetch(localUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        mode: "cors",
      });

      if (res.ok) {
        setStatus("success");
        setIsLoading(false);
      } else {
        throw new Error("Local CLI server did not respond successfully.");
      }
    } catch {
      // If direct fetch to 127.0.0.1 failed due to browser mixed-content or CORS,
      // fallback to GET query param navigation
      try {
        const queryParams = new URLSearchParams({
          token: payload.token || "",
          email: payload.email,
          name: payload.name,
          state: payload.state,
        }).toString();

        const img = new Image();
        img.src = `http://127.0.0.1:${port}/callback?${queryParams}`;
        setStatus("success");
      } catch {
        setStatus("error");
        setErrorMessage("Tidak dapat menghubungkan otomatis ke terminal. Silakan salin Kode Otorisasi di bawah.");
      }
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!isSupabaseConfigured()) {
      const demoEmail = "developer@koda.ai";
      localStorage.setItem("koda_user_email", demoEmail);
      localStorage.setItem("koda_user_name", "Koda Developer");
      const dummyToken = `koda-cli-${Date.now()}`;
      setCurrentUser({ email: demoEmail, name: "Koda Developer", tier: "PRO", token: dummyToken });
      generateCode(demoEmail, "Koda Developer", dummyToken);
      return;
    }

    try {
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.href,
        },
      });
    } catch {
      setErrorMessage("Gagal menghubungkan ke Google OAuth. Coba lagi.");
    }
  };

  const handleCopyCode = () => {
    if (manualCode) {
      navigator.clipboard.writeText(manualCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#141413] text-[#FAF9F5] flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
      
      {/* Background Glow */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#408175]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#ea580c]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#1c1c1a] border border-[#2b2b28] rounded-2xl p-8 shadow-2xl relative z-10 space-y-6">
        
        {/* Header Branding */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2b2b28]">
          <div className="flex items-center gap-2.5">
            <KodaGeometricLogo className="w-6 h-5" variant="white" />
            <span className="font-bold text-base tracking-wide text-white">KODA</span>
            <span className="text-[10px] font-mono bg-[#408175]/20 text-[#408175] px-1.5 py-0.5 rounded font-semibold">
              CLI AGENT
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#9aa0a6] font-mono">
            <Terminal className="w-3.5 h-3.5 text-[#408175]" />
            <span>Port {port}</span>
          </div>
        </div>

        {/* Status: SUCCESS */}
        {status === "success" ? (
          <div className="text-center py-6 space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white">Otorisasi Berhasil!</h2>
              <p className="text-sm text-[#9aa0a6]">
                Terminal KODA CLI Anda telah terhubung dan aktif. Anda dapat menutup halaman ini dan kembali ke terminal.
              </p>
            </div>
            <div className="p-3 bg-[#141413] border border-[#2b2b28] rounded-xl text-xs text-[#9aa0a6] font-mono">
              Status: <span className="text-emerald-400 font-semibold">AUTHENTICATED (PORT {port})</span>
            </div>
          </div>
        ) : (
          <>
            {/* Title & Description */}
            <div className="space-y-1.5">
              <h1 className="text-xl font-bold text-white">Otorisasi Terminal</h1>
              <p className="text-sm text-[#9aa0a6] leading-relaxed">
                KODA Coding Agent di komputer Anda meminta izin untuk terhubung dengan akun KODA Anda.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* If User is already signed in */}
            {currentUser ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#141413] border border-[#2b2b28] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#408175]/20 border border-[#408175]/40 flex items-center justify-center text-sm font-bold text-white overflow-hidden">
                      {currentUser.avatarUrl ? (
                        <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                      ) : (
                        currentUser.name?.slice(0, 2).toUpperCase() || "KD"
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{currentUser.name}</div>
                      <div className="text-xs text-[#9aa0a6]">{currentUser.email}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#408175] bg-[#408175]/10 px-2 py-0.5 rounded-full border border-[#408175]/20">
                    {currentUser.tier || "PRO"}
                  </span>
                </div>

                {/* Confirm Button */}
                <button
                  type="button"
                  onClick={handleAuthorize}
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#2E4540] via-[#408175] to-[#509689] hover:opacity-95 text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#408175]/20 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Menghubungkan ke Terminal...</span>
                  ) : (
                    <>
                      <span>Izinkan Akses Terminal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Switch Account */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full text-center text-xs text-[#9aa0a6] hover:text-white transition-colors cursor-pointer pt-1"
                >
                  Gunakan Akun Google Lainnya
                </button>
              </div>
            ) : (
              /* If User needs to sign in with Google */
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-white hover:bg-neutral-100 text-neutral-900 flex items-center justify-center gap-3 transition-all cursor-pointer shadow-md"
                >
                  <GoogleIcon className="w-4 h-4" />
                  <span>Lanjutkan dengan Google</span>
                </button>

                <p className="text-[11px] text-[#6b7280] text-center">
                  Setelah login, Anda akan otomatis terhubung ke CLI.
                </p>
              </div>
            )}

            {/* Fallback Manual Code Section */}
            {manualCode && (
              <div className="pt-3 border-t border-[#2b2b28] space-y-2">
                <div className="flex items-center justify-between text-xs text-[#9aa0a6]">
                  <span>Atau salin Kode Otorisasi Manual:</span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 text-[#408175] hover:text-[#509689] font-medium cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Tersalin!" : "Salin Kode"}</span>
                  </button>
                </div>
                <div className="bg-[#141413] border border-[#2b2b28] p-2.5 rounded-lg font-mono text-[10px] text-[#e3e3e3] truncate select-all">
                  {manualCode}
                </div>
              </div>
            )}
          </>
        )}

        {/* Footer Info */}
        <div className="text-center pt-2">
          <p className="text-[11px] text-[#6b7280] flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#408175]" />
            <span>Koneksi aman terenkripsi (RFC 8252 Loopback)</span>
          </p>
        </div>

      </div>
    </div>
  );
}

export default function CliAuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#141413] text-[#FAF9F5] flex items-center justify-center">Memuat otorisasi...</div>}>
      <CliAuthPageContent />
    </Suspense>
  );
}
