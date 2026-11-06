"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export type SubscriptionTier = "FREE" | "PRO" | "MAX";

export function useUserProfile() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>("virgakumara@gmail.com");
  const [userTier, setUserTier] = useState<SubscriptionTier>("FREE");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user profile on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        if (isSupabaseConfigured()) {
          const supabase = createClient();
          const { data } = await supabase.auth.getUser();

          if (data.user) {
            if (data.user.email) {
              setUserEmail(data.user.email);
            }

            // Extract OAuth avatar (Google uses 'picture' or 'avatar_url', GitHub uses 'avatar_url')
            const avatar =
              data.user.user_metadata?.avatar_url ||
              data.user.user_metadata?.picture ||
              null;
            if (avatar) {
              setAvatarUrl(avatar);
              localStorage.setItem("koda_user_avatar", avatar);
            }

            // Read tier from Supabase user_metadata if present, otherwise fallback to localStorage or FREE
            const metadataTier = data.user.user_metadata?.tier as SubscriptionTier | undefined;
            if (metadataTier && ["FREE", "PRO", "MAX"].includes(metadataTier)) {
              setUserTier(metadataTier);
              localStorage.setItem("koda_user_tier", metadataTier);
            } else {
              const localTier = localStorage.getItem("koda_user_tier") as SubscriptionTier | null;
              if (localTier && ["FREE", "PRO", "MAX"].includes(localTier)) {
                setUserTier(localTier);
              } else {
                setUserTier("FREE");
                localStorage.setItem("koda_user_tier", "FREE");
              }
            }
            setIsLoading(false);
            return;
          }
        }

        // Fallback / Demo mode
        const savedEmail = localStorage.getItem("koda_user_email");
        if (savedEmail) {
          setUserEmail(savedEmail);
        }

        const savedAvatar = localStorage.getItem("koda_user_avatar");
        if (savedAvatar) {
          setAvatarUrl(savedAvatar);
        }

        const savedTier = localStorage.getItem("koda_user_tier") as SubscriptionTier | null;
        if (savedTier && ["FREE", "PRO", "MAX"].includes(savedTier)) {
          setUserTier(savedTier);
        } else {
          setUserTier("FREE");
          localStorage.setItem("koda_user_tier", "FREE");
        }
      } catch (e) {
        console.error("Error loading user profile:", e);
      } finally {
        setIsLoading(false);
      }
    }


    loadProfile();
  }, []);

  // Update tier
  const changeTier = useCallback(async (newTier: SubscriptionTier) => {
    setUserTier(newTier);
    localStorage.setItem("koda_user_tier", newTier);

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.auth.updateUser({
          data: { tier: newTier },
        });
      } catch (err) {
        console.error("Failed to update tier in Supabase:", err);
      }
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        await supabase.auth.signOut();
      }
      localStorage.removeItem("koda_user_email");
      localStorage.removeItem("koda_user_avatar");
    } catch (err) {
      console.error("Error signing out:", err);
    } finally {
      router.push("/login");
      router.refresh();
    }
  }, [router]);

  return {
    userEmail,
    userTier,
    avatarUrl,
    isLoading,
    changeTier,
    signOut,
  };
}

