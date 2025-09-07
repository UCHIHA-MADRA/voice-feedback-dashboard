<!-- src/views/Analysis.vue -->
<template>
  <AppLayout>
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Analysis Dashboard</h1>
            <p class="text-gray-600 mt-1">
              Detailed insights from your latest analysis
            </p>
          </div>

          <div class="flex space-x-3">
            <button @click="downloadReport" class="btn-secondary">
              <svg
                class="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Export Report
            </button>

            <router-link to="/" class="btn-primary">
              <svg
                class="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Analysis
            </router-link>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isAnalyzing" class="text-center py-12">
        <LoadingOverlay :progress="analysisStore.uploadProgress" />
      </div>

      <!-- Error State -->
      <div v-else-if="analysisError" class="text-center py-12">
        <div class="bg-red-50 dark:bg-red-900/20 rounded-xl p-8 max-w-md mx-auto">
          <svg
            class="mx-auto h-12 w-12 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 class="mt-4 text-lg font-medium text-red-800 dark:text-red-200">
            Analysis Failed
          </h3>
          <p class="mt-2 text-sm text-red-700 dark:text-red-300">
            {{ analysisError }}
          </p>
          <div class="mt-6">
            <router-link to="/" class="btn-primary">
              Try Again
            </router-link>
          </div>
        </div>
      </div>

      <!-- No Analysis State -->
      <div v-else-if="!currentAnalysis" class="text-center py-12">
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-8 max-w-md mx-auto">
          <svg
            class="mx-auto h-12 w-12 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          <h3 class="mt-4 text-lg font-medium text-blue-800 dark:text-blue-200">
            No Analysis Available
          </h3>
          <p class="mt-2 text-sm text-blue-700 dark:text-blue-300">
            Upload a file or record audio to see analysis results here.
          </p>
          <div class="mt-6">
            <router-link to="/" class="btn-primary">
              Create New Analysis
            </router-link>
          </div>
        </div>
      </div>

      <!-- Analysis Results -->
      <div v-else>
        <div class="mb-8">
          <AnalysisResults 
            :analysis="currentAnalysis" 
            :audio-url="currentAnalysis?.metadata?.audioUrl || null"
          />
        </div>

        <!-- Chart Visualization -->
        <div class="mb-8" v-if="currentAnalysis">
          <ScoreChart :analysis="currentAnalysis" />
        </div>

        <!-- Comparison with Previous -->
        <div v-if="canShowComparison" class="mb-8">
          <div class="card p-6">
            <h3
              class="text-lg font-semibold text-gray-800 mb-4 flex items-center"
            >
              <svg
                class="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Progress Comparison
            </h3>

            <div
              v-if="comparison"
              class="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div v-if="comparison.improvements.length > 0">
                <h4 class="font-medium text-green-800 mb-3">Improvements</h4>
                <ul class="space-y-2">
                  <li
                    v-for="improvement in comparison.improvements"
                    :key="improvement"
                    class="flex items-center text-sm text-green-700"
                  >
                    <svg
                      class="w-4 h-4 mr-2 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {{ improvement }}
                  </li>
                </ul>
              </div>

              <div v-if="comparison.regressions.length > 0">
                <h4 class="font-medium text-red-800 mb-3">Areas to Focus On</h4>
                <ul class="space-y-2">
                  <li
                    v-for="regression in comparison.regressions"
                    :key="regression"
                    class="flex items-center text-sm text-red-700"
                  >
                    <svg
                      class="w-4 h-4 mr-2 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {{ regression }}
                  </li>
                </ul>
              </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed } from "vue";
import AppLayout from "@/components/layout/AppLayout.vue";
import AnalysisResults from "@/components/features/AnalysisResults.vue";
import ScoreChart from "@/components/features/ScoreChart.vue";
import LoadingOverlay from "@/components/ui/LoadingOverlay.vue";
import { useAnalysisStore } from "@/stores/analysis";
import { useAnalysis } from "@/composables/useAnalysis";
import { useNotifications } from "@/composables/useNotifications";

// Composables
const analysisStore = useAnalysisStore();
const { compareAnalyses } = useAnalysis();
const { showSuccess } = useNotifications();

// Computed
const currentAnalysis = computed(() => analysisStore.currentAnalysis);
const analysisHistory = computed(() => analysisStore.analysisHistory);
const isAnalyzing = computed(() => analysisStore.isAnalyzing);
const analysisError = computed(() => analysisStore.analysisError);

const canShowComparison = computed(
  () => currentAnalysis.value && analysisHistory.value.length > 1
);

const comparison = computed(() => {
  if (!canShowComparison.value) return null;

  const current = currentAnalysis.value;
  const previous = analysisHistory.value.find((item) => item.id !== current.id);

  return previous ? compareAnalyses(previous, current) : null;
});

// Methods
function downloadReport() {
  if (!currentAnalysis.value) return;

  const reportData = {
    analysis: currentAnalysis.value,
    generated: new Date().toISOString(),
    version: "1.0",
  };

  const blob = new Blob([JSON.stringify(reportData, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `analysis-report-${Date.now()}.json`;
  a.click();

  URL.revokeObjectURL(url);
  showSuccess("Report downloaded successfully!");
}
</script>
