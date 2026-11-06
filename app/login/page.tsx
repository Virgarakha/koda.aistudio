"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  SlidersHorizontal,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { GoogleIcon } from "@/components/playground/GoogleIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}


export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [supabaseReady, setSupabaseReady] = useState(false);

  useEffect(() => {
    setSupabaseReady(isSupabaseConfigured());
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    const supabase = createClient();

    try {
      const activeEmail = email.trim() || "virgakumara@gmail.com";
      localStorage.setItem("koda_user_email", activeEmail);
      if (!localStorage.getItem("koda_user_tier")) {
        localStorage.setItem("koda_user_tier", "FREE");
      }

      if (!supabaseReady) {
        // If Supabase credentials are still placeholders in .env.local, allow seamless demo entry
        setTimeout(() => {
          setIsLoading(false);
          router.push("/playground/new_chat");
        }, 500);
        return;
      }

      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: activeEmail,
          password,
          options: {
            data: {
              full_name: fullName || activeEmail.split("@")[0],
              tier: "FREE",
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) {
          setErrorMessage(error.message);
          setIsLoading(false);
          return;
        }

        if (data.session) {
          // Immediately signed in
          router.push("/playground/new_chat");
          router.refresh();
        } else {
          setSuccessMessage(
            "Pendaftaran berhasil! Silakan periksa inbox email Anda untuk konfirmasi tautan masuk."
          );
          setIsLoading(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: activeEmail,
          password,
        });

        if (error) {
          setErrorMessage(error.message);
          setIsLoading(false);
          return;
        }

        router.push("/playground/new_chat");
        router.refresh();
      }

    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || "Terjadi kesalahan saat otentikasi");
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    setErrorMessage(null);
    setIsLoading(true);

    if (!supabaseReady) {
      setTimeout(() => {
        router.push("/playground/new_chat");
      }, 500);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = () => {
    setIsLoading(true);
    const activeEmail = email.trim() || "virgakumara@gmail.com";
    localStorage.setItem("koda_user_email", activeEmail);
    if (!localStorage.getItem("koda_user_tier")) {
      localStorage.setItem("koda_user_tier", "FREE");
    }
    setTimeout(() => {
      router.push("/playground/new_chat");
    }, 400);
  };


  return (
    <div className="min-h-screen w-screen flex flex-col justify-center items-center bg-[#131314] text-[#f1f3f4] p-4 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#d97736]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#e58849]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1e1f20] border border-[#282a2c] text-xs text-[#d97736] mb-1 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>KODA &amp; Google AI Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {isSignUp ? "Buat Akun Baru" : "Masuk ke Playground"}
          </h1>
          <p className="text-xs sm:text-sm text-[#9aa0a6] max-w-xs mx-auto">
            Akses workspace AI, eksplorasi model Gemini, dan rancang flow sistem aplikasi Anda.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-[#1e1f20] border border-[#282a2c] p-6 sm:p-8 shadow-2xl backdrop-blur-sm space-y-6">
          {/* Mode Tabs */}
          <div className="grid grid-cols-2 p-1 bg-[#131314] rounded-xl border border-[#282a2c]">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                !isSignUp
                  ? "bg-[#282a2c] text-white shadow-sm"
                  : "text-[#9aa0a6] hover:text-white"
              }`}
            >
              Masuk (Sign In)
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                isSignUp
                  ? "bg-[#282a2c] text-white shadow-sm"
                  : "text-[#9aa0a6] hover:text-white"
              }`}
            >
              Daftar (Sign Up)
            </button>
          </div>

          {/* Alert Error / Success */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 text-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <div className="leading-relaxed">{successMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <div className="space-y-1.5">
                <Label className="text-xs text-[#c4c7c5]">Nama Lengkap</Label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-[#80868b]" />
                  <Input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nama Anda"
                    required={isSignUp}
                    className="pl-9 bg-[#131314] border-[#2e3032] text-xs text-white placeholder:text-[#80868b] rounded-xl h-10 focus-visible:ring-1 focus-visible:ring-[#d97736]"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs text-[#c4c7c5]">Email</Label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-[#80868b]" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="pl-9 bg-[#131314] border-[#2e3032] text-xs text-white placeholder:text-[#80868b] rounded-xl h-10 focus-visible:ring-1 focus-visible:ring-[#d97736]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-[#c4c7c5]">Password</Label>
                {!isSignUp && (
                  <button
                    type="button"
                    className="text-[11px] text-[#d97736] hover:underline"
                  >
                    Lupa password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-[#80868b]" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  required
                  minLength={6}
                  className="pl-9 pr-9 bg-[#131314] border-[#2e3032] text-xs text-white placeholder:text-[#80868b] rounded-xl h-10 focus-visible:ring-1 focus-visible:ring-[#d97736]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#80868b] hover:text-[#c4c7c5]"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-[#d97736] hover:bg-[#e58849] text-white font-semibold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {isSignUp ? "Daftar & Masuk ke Playground" : "Masuk ke Playground"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#282a2c] w-full" />
            <span className="bg-[#1e1f20] px-3 text-[11px] text-[#80868b] uppercase tracking-wider absolute">
              atau
            </span>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleOAuthSignIn("google")}
              className="flex items-center justify-center gap-2 h-10 px-3 rounded-xl bg-[#131314] border border-[#2e3032] hover:bg-[#282a2c] text-xs font-medium text-[#f1f3f4] transition"
            >
              <GoogleIcon className="w-4 h-4" />
              <span>Google</span>
            </button>
            <button
              type="button"
              onClick={() => handleOAuthSignIn("github")}
              className="flex items-center justify-center gap-2 h-10 px-3 rounded-xl bg-[#131314] border border-[#2e3032] hover:bg-[#282a2c] text-xs font-medium text-[#f1f3f4] transition"
            >
              <GithubIcon className="w-4 h-4" />
              <span>GitHub</span>
            </button>
          </div>

          {/* Quick Demo Bypass */}
          <div className="pt-2 border-t border-[#282a2c]/60">
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="w-full py-2.5 px-3 rounded-xl bg-[#282a2c]/80 hover:bg-[#323438] border border-[#3c4043]/60 text-xs font-medium text-[#c4c7c5] hover:text-white transition flex items-center justify-center gap-2 group"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#d97736] group-hover:scale-110 transition" />
              <span>Masuk Cepat (Akses Langsung ke Playground)</span>
            </button>
          </div>
        </div>

        {/* Footer info about Supabase setup */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-1.5 text-[11px] text-[#80868b]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#d97736]" />
            <span>
              {supabaseReady
                ? "Terkoneksi dengan Supabase Auth"
                : "Supabase terintegrasi (Isi .env.local dengan kredensial Supabase Anda)"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
