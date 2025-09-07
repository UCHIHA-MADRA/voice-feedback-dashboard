<!-- src/components/features/AnalysisResults.vue -->
<template>
  <div v-if="analysis && analysis.results" class="space-y-6">
    <!-- Header with Overall Score -->
    <div class="text-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-8">
      <div
        class="inline-flex items-center justify-center w-32 h-32 rounded-full mb-4 shadow-lg"
        :class="getScoreBgColor(analysis.results.overallScore)"
      >
        <div class="text-center">
          <div
            class="text-3xl font-bold"
            :class="getScoreColor(analysis.results.overallScore)"
          >
            {{ analysis.results.overallScore }}
          </div>
          <div class="text-sm font-medium text-gray-600 dark:text-gray-400">Overall</div>
        </div>
      </div>

      <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Analysis Complete</h2>
      <p class="text-gray-600 dark:text-gray-400">
        {{ formatAnalysisDate(analysis.timestamp) }}
      </p>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm">
        <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {{ analysis.results.clarity?.score || 0 }}
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400">Clarity</div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm">
        <div class="text-2xl font-bold text-green-600 dark:text-green-400">
          {{ analysis.results.engagement?.score || 0 }}
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400">Engagement</div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm">
        <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
          {{ analysis.results.sentiment?.score || 0 }}
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400">Sentiment</div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm">
        <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">
          {{ analysis.results.technical?.score || 0 }}
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400">Technical</div>
      </div>
    </div>

    <!-- Interactive Audio Player -->
    <InteractiveAudioPlayer
      v-if="audioUrl"
      :audio-url="audioUrl"
      :analysis="analysis"
    />

    <!-- Analysis Charts -->
    <AnalysisCharts :analysis="analysis" />

    <!-- Insights and Recommendations -->
    <AnalysisInsights :analysis="analysis" />

    <!-- Export and Share Options -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Export & Share
      </h3>
      <div class="flex flex-wrap gap-3">
        <button
          @click="exportToPDF"
          class="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
          Export PDF
        </button>
        <button
          @click="shareResults"
          class="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
          </svg>
          Share
        </button>
        <button
          @click="downloadAudio"
          class="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
          Download Audio
        </button>
      </div>
    </div>
  </div>

  <div v-else class="text-center py-12">
    <svg
      class="mx-auto h-12 w-12 text-gray-400 mb-4"
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
    <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
      No Analysis Available
    </h3>
    <p class="text-gray-500 dark:text-gray-400">
      Upload a file or record audio to see analysis results here.
    </p>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useAnalysis } from "@/composables/useAnalysis";
import AnalysisCharts from "./AnalysisCharts.vue";
import AnalysisInsights from "./AnalysisInsights.vue";
import InteractiveAudioPlayer from "./InteractiveAudioPlayer.vue";

// Props
const props = defineProps({
  analysis: {
    type: Object,
    default: null,
  },
  audioUrl: {
    type: String,
    default: null,
  },
});

// Composables
const {
  getAnalysisInsights,
  getScoreColor,
  getScoreBgColor,
  getSentimentEmoji,
  formatAnalysisDate,
} = useAnalysis();

// Computed
const insights = computed(() =>
  props.analysis ? getAnalysisInsights(props.analysis) : null
);

// Methods
function exportToPDF() {
  // TODO: Implement PDF export functionality
  console.log("Exporting to PDF...");
  // This would typically use a library like jsPDF or html2pdf
}

function shareResults() {
  if (navigator.share) {
    navigator.share({
      title: "Voice Analysis Results",
      text: `My voice analysis score: ${props.analysis.results.overallScore}/100`,
      url: window.location.href,
    });
  } else {
    // Fallback: copy to clipboard
    const text = `My voice analysis score: ${props.analysis.results.overallScore}/100. Check out my results!`;
    navigator.clipboard.writeText(text).then(() => {
      alert("Results copied to clipboard!");
    });
  }
}

function downloadAudio() {
  if (props.audioUrl) {
    const link = document.createElement("a");
    link.href = props.audioUrl;
    link.download = "voice-recording.webm";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
</script>
