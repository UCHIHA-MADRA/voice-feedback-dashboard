// src/composables/useAnalysis.js

import { ref, computed } from "vue";
import { useAnalysisStore } from "@/stores/analysis";
import { useUserStore } from "@/stores/user";
import { useNotifications } from "./useNotifications";
import analysisService, { mockAnalysisService } from "@/services/analysisService";

export function useAnalysis() {
  const analysisStore = useAnalysisStore();
  const userStore = useUserStore();
  const { showSuccess, showError } = useNotifications();

  // Local state for component-specific analysis handling
  const localLoading = ref(false);

  // Computed
  const isAnalyzing = computed(
    () => analysisStore.isAnalyzing || localLoading.value
  );
  const currentAnalysis = computed(() => analysisStore.currentAnalysis);
  const analysisHistory = computed(() => analysisStore.analysisHistory);
  const hasCurrentAnalysis = computed(() => analysisStore.hasCurrentAnalysis);
  const uploadProgress = computed(() => analysisStore.uploadProgress);

  // Analyze file with user tracking
  async function analyzeFile(file, options = {}) {
    if (!file) {
      showError("No file provided for analysis");
      return null;
    }

    // Reset state before starting new analysis
    localLoading.value = true;
    uploadProgress.value = 0;
    
    try {
      // Validate file size
      const maxSizeMB = 10;
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        throw new Error(`File size exceeds the maximum limit of ${maxSizeMB}MB`);
      }

      // Set up upload progress tracking
      const onUploadProgress = (progressEvent) => {
        try {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            uploadProgress.value = percentCompleted;
          }
        } catch (err) {
          console.warn("Error tracking upload progress:", err);
        }
      };

      const result = await analysisStore.analyzeFile(file, {
        language: userStore.preferences.language,
        onUploadProgress,
        ...options,
      });

      if (!result) {
        throw new Error("Analysis returned no results");
      }

      // Update user stats
      userStore.updateStats(result);

      return result;
    } catch (error) {
      console.error("Analysis failed:", error);
      showError(error.message || "Failed to analyze file. Please try again.");
      return null;
    } finally {
      localLoading.value = false;
    }
  }

  // Get analysis insights
  function getAnalysisInsights(analysis) {
    if (!analysis?.results) return null;

    const { results } = analysis;
    const insights = {
      strengths: [],
      improvements: [],
      highlights: [],
      score: results.overallScore || 0,
    };

    // Identify strengths (scores > 80)
    if (results.clarity?.score > 80) {
      insights.strengths.push("Excellent clarity");
    }
    if (results.engagement?.score > 80) {
      insights.strengths.push("High engagement");
    }
    if (results.sentiment?.score > 80) {
      insights.strengths.push("Positive sentiment");
    }

    // Identify areas for improvement (scores < 60)
    if (results.clarity?.score < 60) {
      insights.improvements.push("Work on clarity and articulation");
    }
    if (results.engagement?.score < 60) {
      insights.improvements.push("Increase engagement and energy");
    }
    if (results.sentiment?.score < 60) {
      insights.improvements.push("Consider more positive language");
    }

    // Add highlights from engagement data
    if (results.engagement?.highlights) {
      insights.highlights.push(...results.engagement.highlights);
    }

    // Add specific recommendations
    if (results.recommendations) {
      insights.improvements.push(...results.recommendations.slice(0, 3));
    }

    return insights;
  }

  // Compare analyses
  function compareAnalyses(analysis1, analysis2) {
    if (!analysis1?.results || !analysis2?.results) return null;

    const comparison = {
      overallScoreDiff:
        analysis2.results.overallScore - analysis1.results.overallScore,
      clarityDiff:
        (analysis2.results.clarity?.score || 0) -
        (analysis1.results.clarity?.score || 0),
      engagementDiff:
        (analysis2.results.engagement?.score || 0) -
        (analysis1.results.engagement?.score || 0),
      sentimentDiff:
        (analysis2.results.sentiment?.score || 0) -
        (analysis1.results.sentiment?.score || 0),
      improvements: [],
      regressions: [],
    };

    // Identify improvements and regressions
    if (comparison.clarityDiff > 5) {
      comparison.improvements.push("Clarity improved significantly");
    } else if (comparison.clarityDiff < -5) {
      comparison.regressions.push("Clarity decreased");
    }

    if (comparison.engagementDiff > 5) {
      comparison.improvements.push("Engagement improved");
    } else if (comparison.engagementDiff < -5) {
      comparison.regressions.push("Engagement decreased");
    }

    if (comparison.sentimentDiff > 5) {
      comparison.improvements.push("Sentiment became more positive");
    } else if (comparison.sentimentDiff < -5) {
      comparison.regressions.push("Sentiment became more negative");
    }

    return comparison;
  }

  // Get score color class
  function getScoreColor(score) {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 55) return "text-yellow-600";
    return "text-red-600";
  }

  // Get score background color class
  function getScoreBgColor(score) {
    if (score >= 85) return "bg-green-100";
    if (score >= 70) return "bg-blue-100";
    if (score >= 55) return "bg-yellow-100";
    return "bg-red-100";
  }

  // Get sentiment emoji
  function getSentimentEmoji(sentiment) {
    const emojiMap = {
      positive: "😊",
      neutral: "😐",
      negative: "😔",
      very_positive: "😄",
      very_negative: "😞",
    };

    return emojiMap[sentiment?.toLowerCase()] || "😐";
  }

  // Format analysis date
  function formatAnalysisDate(date) {
    if (!date) return "";

    const analysisDate = new Date(date);
    const now = new Date();
    const diffMs = now - analysisDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return (
        "Today at " +
        analysisDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    } else if (diffDays === 1) {
      return (
        "Yesterday at " +
        analysisDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    } else if (diffDays < 7) {
      return diffDays + " days ago";
    } else {
      return analysisDate.toLocaleDateString();
    }
  }

  return {
    // State
    isAnalyzing,
    currentAnalysis,
    analysisHistory,
    hasCurrentAnalysis,
    uploadProgress,

    // Methods
    analyzeFile,
    getAnalysisInsights,
    compareAnalyses,
    getScoreColor,
    getScoreBgColor,
    getSentimentEmoji,
    formatAnalysisDate,
  };
}
