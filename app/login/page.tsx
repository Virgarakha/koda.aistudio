"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { AlertCircle, CheckCircle2, Download } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { GoogleIcon } from "@/components/playground/GoogleIcon";
import { ClaudeSunburst } from "@/components/landing/ClaudeSunburst";
import { KodaGeometricLogo } from "@/components/landing/KodaGeometricLogo";

function AppleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.64-.78 1.08-1.86.96-2.95-1 .04-2.17.65-2.83 1.43-.58.67-1.09 1.77-.96 2.83 1.12.09 2.19-.53 2.83-1.31z" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [supabaseReady, setSupabaseReady] = useState(false);

  useEffect(() => {
    setSupabaseReady(isSupabaseConfigured());
  }, []);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    const activeEmail = email.trim() || "guest@koda.ai";
    localStorage.setItem("koda_user_email", activeEmail);
    if (!localStorage.getItem("koda_user_tier")) {
      localStorage.setItem("koda_user_tier", "FREE");
    }

    if (!supabaseReady) {
      setTimeout(() => {
        setIsLoading(false);
        router.push("/playground/new_chat");
      }, 500);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithOtp({
        email: activeEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        // Fallback to seamless entry if OTP provider isn't activated yet
        setTimeout(() => {
          setIsLoading(false);
          router.push("/playground/new_chat");
        }, 400);
        return;
      }

      setSuccessMessage(
        "Tautan masuk telah dikirim ke email Anda! Silakan periksa kotak masuk."
      );
      setIsLoading(false);
    } catch {
      setTimeout(() => {
        setIsLoading(false);
        router.push("/playground/new_chat");
      }, 400);
    }
  };

  const handleOAuthSignIn = async (provider: "google" | "apple") => {
    setErrorMessage(null);
    setIsLoading(true);

    const activeEmail = `user.${provider}@koda.ai`;
    localStorage.setItem("koda_user_email", activeEmail);
    if (!localStorage.getItem("koda_user_tier")) {
      localStorage.setItem("koda_user_tier", "FREE");
    }

    if (!supabaseReady) {
      setTimeout(() => {
        setIsLoading(false);
        router.push("/playground/new_chat");
      }, 500);
      return;
    }

    const supabase = createClient();
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider === "google" ? "google" : "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        // Allow seamless demo exploration if OAuth provider keys are not yet configured
        setTimeout(() => {
          setIsLoading(false);
          router.push("/playground/new_chat");
        }, 400);
      }
    } catch {
      setTimeout(() => {
        setIsLoading(false);
        router.push("/playground/new_chat");
      }, 400);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#141413] text-[#FAF9F5] flex flex-col justify-between p-6 sm:p-10 relative overflow-hidden select-none">
      
      {/* ================= TOP LEFT BRAND LOGO ================= */}
      <div className="w-full max-w-[1360px] mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2.5 group cursor-pointer"
          title="Kembali ke Beranda Koda"
        >
          <KodaGeometricLogo className="w-6 h-5" variant="terracotta" />
          <span className="font-serif text-[22px] font-normal tracking-tight text-[#FAF9F5]">
            Koda
          </span>
        </Link>
      </div>

      {/* ================= MAIN SPLIT CONTENT ================= */}
      <div className="w-full max-w-[1360px] mx-auto my-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* ================= LEFT SIDE: AUTH FORM ================= */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center text-center">
            
            {/* Serif Headline */}
            <h1 className="font-serif text-3xl sm:text-4xl md:text-[44px] font-normal tracking-tight text-[#FAF9F5] leading-tight">
              Pertanyakan langkah berikutnya
            </h1>

            {/* Subtitle */}
            <p className="mt-3 text-[14.5px] sm:text-[15px] text-[#A8A59D] font-sans font-normal">
              Mitra berpikir Anda untuk ambisi besar
            </p>

            {/* Notification Alerts */}
            {errorMessage && (
              <div className="mt-5 w-full max-w-[360px] p-3 rounded-xl bg-red-950/40 border border-red-500/20 text-red-200 text-xs flex items-start gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mt-5 w-full max-w-[360px] p-3 rounded-xl bg-green-950/40 border border-green-500/20 text-green-200 text-xs flex items-start gap-2 text-left">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-green-400 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Form Container Card */}
            <div className="mt-8 w-full max-w-[360px] p-5 sm:p-6 rounded-2xl bg-[#1C1B19]/90 border border-white/[0.08] shadow-2xl flex flex-col gap-3">
              
              {/* Google Button */}
              <button
                type="button"
                onClick={() => handleOAuthSignIn("google")}
                disabled={isLoading}
                className="w-full bg-[#343330] hover:bg-[#3E3C38] text-white rounded-xl py-2.5 px-4 flex items-center justify-center gap-2.5 text-[13px] font-medium transition-all border border-white/[0.05] cursor-pointer active:scale-[0.98]"
              >
                <GoogleIcon className="w-4 h-4 shrink-0" />
                <span>Lanjutkan dengan Google</span>
              </button>

              {/* Apple Button */}
              <button
                type="button"
                onClick={() => handleOAuthSignIn("apple")}
                disabled={isLoading}
                className="w-full bg-[#343330] hover:bg-[#3E3C38] text-white rounded-xl py-2.5 px-4 flex items-center justify-center gap-2.5 text-[13px] font-medium transition-all border border-white/[0.05] cursor-pointer active:scale-[0.98]"
              >
                <AppleIcon className="w-4 h-4 shrink-0 text-white" />
                <span>Lanjutkan dengan Apple</span>
              </button>

              {/* Divider (OR) */}
              <div className="flex items-center my-1">
                <div className="flex-1 border-t border-white/[0.06]" />
                <span className="px-3 text-[10.5px] font-sans font-medium text-[#73706A] tracking-wider uppercase">
                  ATAU
                </span>
                <div className="flex-1 border-t border-white/[0.06]" />
              </div>

              {/* Email Form */}
              <form onSubmit={handleEmailAuth} className="flex flex-col gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email Anda"
                  className="w-full bg-[#272623] border border-white/[0.08] hover:border-white/[0.14] focus:border-white/[0.25] rounded-xl px-3.5 py-2.5 text-[13px] text-[#FAF9F5] placeholder-[#78756E] outline-none transition-all font-sans"
                  required
                />

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#FAF9F5] hover:bg-white text-[#141413] rounded-xl py-2.5 text-[13px] font-medium transition-all shadow-sm active:scale-[0.98] cursor-pointer"
                >
                  {isLoading ? "Memproses..." : "Lanjutkan dengan email"}
                </button>
              </form>

              {/* Disclaimer */}
              <p className="mt-2 text-center text-[11px] text-[#78756E] leading-relaxed font-sans">
                Dengan melanjutkan, Anda menyetujui{" "}
                <Link
                  href="/terms"
                  className="underline underline-offset-2 decoration-white/30 hover:decoration-white text-[#9E9B93] hover:text-[#FAF9F5] transition-colors"
                >
                  Kebijakan Privasi
                </Link>{" "}
                Koda.
              </p>
            </div>

            {/* Desktop App Download Button */}
            <div className="mt-6">
              <Link
                href="/playground/new_chat"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#232220] hover:bg-[#2C2B29] border border-white/[0.08] text-[12px] text-[#8E8C85] hover:text-[#FAF9F5] transition-all"
              >
                <Download className="w-3.5 h-3.5 opacity-70" />
                <span>Unduh aplikasi desktop</span>
              </Link>
            </div>

          </div>

          {/* ================= RIGHT SIDE: HERO PHOTO ================= */}
          <div className="hidden lg:flex lg:col-span-6 justify-center items-center">
            <div className="relative w-full max-w-[480px] aspect-[342/429] rounded-[28px] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.6)] border border-white/10 bg-[#1C1B19]">
              <Image
                src="/images/login-hero.png"
                alt="Workspace arsitektur sistem Koda"
                fill
                className="object-cover object-center filter brightness-[0.96] contrast-[1.02]"
                priority
              />
            </div>
          </div>

        </div>
      </div>

      {/* ================= BOTTOM EMPTY SPACER ================= */}
      <div className="w-full max-w-[1360px] mx-auto h-6" />

    </div>
  );
}
