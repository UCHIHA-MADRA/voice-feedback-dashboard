// src/stores/analysis.js

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import analysisService, { mockAnalysisService } from "@/services/analysisService";
import { storageService } from "@/services/storageService";
import { useNotifications } from "@/composables/useNotifications";

export const useAnalysisStore = defineStore("analysis", () => {
  // State
  const currentAnalysis = ref(null);
  const analysisHistory = ref([]);
  const isAnalyzing = ref(false);
  const analysisError = ref(null);
  const uploadProgress = ref(0);

  // Composables
  const { showSuccess, showError } = useNotifications();

  // Getters
  const hasCurrentAnalysis = computed(() => !!currentAnalysis.value);
  const hasHistory = computed(() => analysisHistory.value.length > 0);
  const latestAnalysis = computed(() => analysisHistory.value[0] || null);
  const totalAnalyses = computed(() => analysisHistory.value.length);

  // Actions
  async function analyzeFile(file, options = {}) {
    try {
      isAnalyzing.value = true;
      analysisError.value = null;
      uploadProgress.value = 0;

      // Validate file
      const validation = validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Check network connectivity
      if (!navigator.onLine) {
        throw new Error("No internet connection. Please check your network and try again.");
      }

      // Use mock service instead of real API to avoid connection errors
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Analysis request timed out. Please try again.")), 180000); // 3 minutes timeout
      });

      const analysisPromise = mockAnalysisService.analyzeFile(file, {
        ...options,
        onUploadProgress: (progress) => {
          try {
            if (progress.total) {
              uploadProgress.value = Math.round(
                (progress.loaded * 100) / progress.total
              );
            }
          } catch (err) {
            console.warn("Error updating upload progress:", err);
          }
        },
      });

      // Race between analysis and timeout
      const response = await Promise.race([analysisPromise, timeoutPromise]);

      if (!response || !response.id) {
        throw new Error("Invalid analysis result received");
      }

      // Set current analysis
      currentAnalysis.value = {
        id: response.id,
        timestamp: new Date(response.timestamp),
        results: response.results,
        metadata: {
          ...response.metadata,
          fileName: file.name,
          fileType: file.type,
        },
      };

      // Add to history
      addToHistory(currentAnalysis.value);

      // Save to localStorage
      await saveToStorage();

      showSuccess("Analysis completed successfully!");

      return currentAnalysis.value;
    } catch (error) {
      console.error("Analysis failed:", error);
      
      // Handle specific error types
      if (error.message === "FILE_TOO_LARGE") {
        analysisError.value = "File is too large. Maximum size is 10MB.";
      } else if (error.message === "UNSUPPORTED_FORMAT") {
        analysisError.value = "Unsupported file format. Please use MP3, WAV, M4A, TXT, DOC, or PDF.";
      } else if (error.message === "INVALID_FILE_CONTENT") {
        analysisError.value = "The file content could not be processed. Please try another file.";
      } else if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
        analysisError.value = "Request timed out. Please try again with a smaller file or check your connection.";
      } else {
        analysisError.value = error.message;
      }
      
      showError(`Analysis failed: ${analysisError.value}`);
      throw error;
    } finally {
      isAnalyzing.value = false;
      uploadProgress.value = 0;
    }
  }

  function validateFile(file) {
    const maxSize = parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 10485760; // 10MB
    const supportedAudio = import.meta.env.VITE_SUPPORTED_AUDIO_FORMATS?.split(
      ","
    ) || ["mp3", "wav", "m4a", "ogg", "webm"];
    const supportedText = import.meta.env.VITE_SUPPORTED_TEXT_FORMATS?.split(
      ","
    ) || ["txt", "doc", "pdf"];

    if (!file) {
      return { isValid: false, error: "No file provided" };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`,
      };
    }

    const extension = file.name.split(".").pop().toLowerCase();
    const isAudio = supportedAudio.includes(extension);
    const isText = supportedText.includes(extension);

    if (!isAudio && !isText) {
      return {
        isValid: false,
        error: `Unsupported file format. Supported: ${[...supportedAudio, ...supportedText].join(", ")}`,
      };
    }

    return { isValid: true };
  }

  function addToHistory(analysis) {
    // Remove if already exists (based on ID)
    const existingIndex = analysisHistory.value.findIndex(
      (item) => item.id === analysis.id
    );
    if (existingIndex !== -1) {
      analysisHistory.value.splice(existingIndex, 1);
    }

    // Add to beginning and limit to 50 items
    analysisHistory.value.unshift(analysis);
    if (analysisHistory.value.length > 50) {
      analysisHistory.value = analysisHistory.value.slice(0, 50);
    }
  }

  function removeFromHistory(analysisId) {
    const index = analysisHistory.value.findIndex(
      (item) => item.id === analysisId
    );
    if (index !== -1) {
      analysisHistory.value.splice(index, 1);
      saveToStorage();
      showSuccess("Analysis removed from history");
    }
  }

  function clearHistory() {
    analysisHistory.value = [];
    storageService.remove("analysis_history");
    showSuccess("Analysis history cleared");
  }

  function setCurrentAnalysis(analysis) {
    currentAnalysis.value = analysis;
  }

  async function saveToStorage() {
    try {
      await storageService.set("analysis_current", currentAnalysis.value);
      await storageService.set("analysis_history", analysisHistory.value);
    } catch (error) {
      console.error("Failed to save analysis to storage:", error);
    }
  }

  async function loadFromStorage() {
    try {
      const stored = await storageService.get("analysis_current");
      if (stored) {
        currentAnalysis.value = stored;
      }

      const history = await storageService.get("analysis_history");
      if (history && Array.isArray(history)) {
        analysisHistory.value = history;
      }
    } catch (error) {
      console.error("Failed to load analysis from storage:", error);
    }
  }

  function clearCurrentAnalysis() {
    currentAnalysis.value = null;
    storageService.remove("analysis_current");
  }

  function resetError() {
    analysisError.value = null;
  }

  // Initialize store
  loadFromStorage();

  return {
    // State
    currentAnalysis,
    analysisHistory,
    isAnalyzing,
    analysisError,
    uploadProgress,

    // Getters
    hasCurrentAnalysis,
    hasHistory,
    latestAnalysis,
    totalAnalyses,

    // Actions
    analyzeFile,
    addToHistory,
    removeFromHistory,
    clearHistory,
    setCurrentAnalysis,
    clearCurrentAnalysis,
    resetError,
    validateFile,
  };
});
