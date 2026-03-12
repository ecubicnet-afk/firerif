"use client";

import { useState, useCallback } from "react";
import type { CourseId, ViewMode, Preferences } from "@/types/dream";

const STORAGE_KEY = "dream-unlocker-prefs";

function loadPrefs(): Preferences {
  if (typeof window === "undefined") {
    return { courseId: "standard", viewMode: "monthly" };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { courseId: "standard", viewMode: "monthly" };
}

function savePrefs(prefs: Preferences) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }
}

export function usePreferences() {
  const [prefs, setPrefs] = useState<Preferences>(loadPrefs);

  const setCourse = useCallback((courseId: CourseId) => {
    setPrefs((prev) => {
      const next = { ...prev, courseId };
      savePrefs(next);
      return next;
    });
  }, []);

  const setViewMode = useCallback((viewMode: ViewMode) => {
    setPrefs((prev) => {
      const next = { ...prev, viewMode };
      savePrefs(next);
      return next;
    });
  }, []);

  return { ...prefs, setCourse, setViewMode };
}
