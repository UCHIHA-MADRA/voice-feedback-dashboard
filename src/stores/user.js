// src/stores/user.js

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { storageService } from "@/services/storageService";

export const useUserStore = defineStore("user", () => {
  // State
  const preferences = ref({
    language: "en-US",
    autoAnalyze: false,
    saveHistory: true,
    notifications: {
      success: true,
      errors: true,
      progress: true,
    },
    analytics: {
      trackUsage: true,
      shareAnonymousData: false,
    },
    ui: {
      compactMode: false,
      animationsEnabled: true,
      soundEnabled: true,
    },
  });

  const stats = ref({
    totalAnalyses: 0,
    totalUploadTime: 0, // in seconds
    averageScore: 0,
    lastActivity: null,
    streakDays: 0,
    favoriteFileType: null,
  });

  // Getters
  const hasCustomPreferences = computed(() => {
    const defaultPrefs = getDefaultPreferences();
    return JSON.stringify(preferences.value) !== JSON.stringify(defaultPrefs);
  });

  const activityLevel = computed(() => {
    const total = stats.value.totalAnalyses;
    if (total === 0) return "new";
    if (total < 10) return "beginner";
    if (total < 50) return "active";
    return "expert";
  });

  // Actions
  function updatePreference(key, value) {
    const keys = key.split(".");
    let target = preferences.value;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in target)) {
        target[keys[i]] = {};
      }
      target = target[keys[i]];
    }

    target[keys[keys.length - 1]] = value;
    savePreferences();
  }

  function resetPreferences() {
    preferences.value = getDefaultPreferences();
    savePreferences();
  }

  function updateStats(analysisData) {
    stats.value.totalAnalyses++;
    stats.value.lastActivity = new Date();

    if (analysisData.results?.overallScore) {
      const currentAvg = stats.value.averageScore;
      const total = stats.value.totalAnalyses;
      stats.value.averageScore =
        (currentAvg * (total - 1) + analysisData.results.overallScore) / total;
    }

    if (analysisData.metadata?.fileType) {
      // Track favorite file type
      const fileType = analysisData.metadata.fileType;
      stats.value.favoriteFileType = fileType;
    }

    saveStats();
  }

  async function savePreferences() {
    try {
      await storageService.set("user_preferences", preferences.value);
    } catch (error) {
      console.error("Failed to save preferences:", error);
    }
  }

  async function saveStats() {
    try {
      await storageService.set("user_stats", stats.value);
    } catch (error) {
      console.error("Failed to save stats:", error);
    }
  }

  async function loadUserData() {
    try {
      const savedPrefs = await storageService.get("user_preferences");
      if (savedPrefs) {
        preferences.value = { ...getDefaultPreferences(), ...savedPrefs };
      }

      const savedStats = await storageService.get("user_stats");
      if (savedStats) {
        stats.value = { ...stats.value, ...savedStats };
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
  }

  function getDefaultPreferences() {
    return {
      language: "en-US",
      autoAnalyze: false,
      saveHistory: true,
      notifications: {
        success: true,
        errors: true,
        progress: true,
      },
      analytics: {
        trackUsage: true,
        shareAnonymousData: false,
      },
      ui: {
        compactMode: false,
        animationsEnabled: true,
        soundEnabled: true,
      },
    };
  }

  function clearUserData() {
    preferences.value = getDefaultPreferences();
    stats.value = {
      totalAnalyses: 0,
      totalUploadTime: 0,
      averageScore: 0,
      lastActivity: null,
      streakDays: 0,
      favoriteFileType: null,
    };

    storageService.remove("user_preferences");
    storageService.remove("user_stats");
  }

  // Initialize store
  loadUserData();

  return {
    // State
    preferences,
    stats,

    // Getters
    hasCustomPreferences,
    activityLevel,

    // Actions
    updatePreference,
    resetPreferences,
    updateStats,
    clearUserData,
  };
});
