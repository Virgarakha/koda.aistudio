"use client";

import { useState, useEffect } from "react";

const SIDEBAR_STORAGE_KEY = "koda_sidebar_collapsed";

export function useSidebarCollapse() {
  const [sidebarCollapsed, setSidebarCollapsedState] = useState<boolean>(false);

  useEffect(() => {
    // Read persisted state on mount
    try {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (stored !== null) {
        setSidebarCollapsedState(stored === "true");
      } else {
        // Default to OPEN (false)
        setSidebarCollapsedState(false);
      }
    } catch {
      setSidebarCollapsedState(false);
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === SIDEBAR_STORAGE_KEY && e.newValue !== null) {
        setSidebarCollapsedState(e.newValue === "true");
      }
    };

    const handleCustom = () => {
      try {
        const current = localStorage.getItem(SIDEBAR_STORAGE_KEY);
        if (current !== null) {
          setSidebarCollapsedState(current === "true");
        }
      } catch {}
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("koda_sidebar_toggle", handleCustom);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("koda_sidebar_toggle", handleCustom);
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsedState((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
        window.dispatchEvent(new Event("koda_sidebar_toggle"));
      } catch {}
      return next;
    });
  };

  const setSidebarCollapsed = (val: boolean) => {
    setSidebarCollapsedState(val);
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(val));
      window.dispatchEvent(new Event("koda_sidebar_toggle"));
    } catch {}
  };

  return {
    sidebarCollapsed,
    setSidebarCollapsed,
    toggleSidebar,
  };
}
