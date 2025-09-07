
<!-- src/views/HistoryPage.vue -->
<template>
  <AppLayout>
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Analysis History</h1>
            <p class="text-gray-600 mt-1">
              Browse and compare your previous analysis sessions
            </p>
          </div>
          
          <button
            @click="clearHistory"
            v-if="hasHistory"
            class="btn-secondary"
          >
            Clear History
          </button>
        </div>
      </div>

      <!-- History List -->
      <div v-if="hasHistory" class="space-y-4">
        <div
          v-for="analysis in analysisHistory"
          :key="analysis.id"
          class="card p-6 cursor-pointer hover:shadow-md transition-shadow"
          @click="viewAnalysis(analysis)"
        >
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">
                {{ analysis.metadata?.fileName || 'Analysis' }}
              </h3>
              <p class="text-sm text-gray-500">
                {{ formatAnalysisDate(analysis.timestamp) }}
              </p>
            </div>
            
            <div class="flex items-center space-x-4">
              <div class="text-right">
                <div class="text-2xl font-bold" :class="getScoreColor(analysis.results.overallScore)">
                  {{ analysis.results.overallScore }}
                </div>
                <div class="text-xs text-gray-500">Overall Score</div>
              </div>
              
              <div class="flex items-center">
                <span class="mr-1">{{ getSentimentEmoji(analysis.results.sentiment?.label) }}</span>
                <span class="text-sm text-gray-600 capitalize">
                  {{ analysis.results.sentiment?.label }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div v-for="(score, key) in analysis.results.scores" :key="key" class="flex items-center">
              <div class="w-2 h-2 rounded-full mr-2" :class="getScoreColor(score)"></div>
              <div class="text-sm">
                <span class="font-medium capitalize">{{ formatMetricName(key) }}:</span>
                <span class="ml-1">{{ score }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <svg
          class="w-16 h-16 text-gray-400 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <h3 class="text-xl font-medium text-gray-900 mb-2">No Analysis History</h3>
        <p class="text-gray-600 mb-6">
          You haven't performed any analyses yet. Start by analyzing a file or
          recording audio.
        </p>
        <router-link to="/" class="btn-primary">
          Start New Analysis
        </router-link>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import AppLayout from "@/components/layout/AppLayout.vue";
import { useAnalysisStore } from "@/stores/analysis";
import { useAnalysis } from "@/composables/useAnalysis";
import { useNotifications } from "@/composables/useNotifications";

// Composables
const router = useRouter();
const analysisStore = useAnalysisStore();
const { formatAnalysisDate, getScoreColor, getSentimentEmoji, formatMetricName } = useAnalysis();
const { showSuccess, showWarning } = useNotifications();

// Computed
const analysisHistory = computed(() => analysisStore.analysisHistory);
const hasHistory = computed(() => analysisHistory.value.length > 0);

// Methods
function viewAnalysis(analysis) {
  analysisStore.setCurrentAnalysis(analysis);
  router.push("/");
}

function clearHistory() {
  if (confirm("Are you sure you want to clear your analysis history? This cannot be undone.")) {
    analysisStore.clearHistory();
    showSuccess("Analysis history cleared");
  }
}
</script>

