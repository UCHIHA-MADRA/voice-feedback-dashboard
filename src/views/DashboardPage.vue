<!-- src/views/DashboardPage.vue -->

<template>
  <AppLayout>
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          AI Voice & File Analysis
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Upload your audio files or record directly to get instant AI-powered
          feedback on clarity, engagement, and sentiment.
        </p>
      </div>

      <!-- Analysis Options -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <!-- File Upload -->
        <div class="space-y-6">
          <div class="text-center">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Upload File
            </h2>
            <p class="text-gray-600 dark:text-gray-300">Upload audio or text files for analysis</p>
          </div>

          <FileUploader
            :auto-analyze="userPreferences.autoAnalyze"
            @upload-complete="handleUploadComplete"
            @upload-error="handleError"
          />
        </div>

        <!-- Audio Recording -->
        <div class="space-y-6">
          <div class="text-center">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Record Audio
            </h2>
            <p class="text-gray-600 dark:text-gray-300">Record directly in your browser</p>
          </div>

          <AudioRecorder
            :max-duration="300"
            @recording-complete="handleRecordingComplete"
            @analysis-complete="handleAnalysisComplete"
            @error="handleError"
          />
        </div>
      </div>

      <!-- Quick Stats -->
      <div
        v-if="userStats.totalAnalyses > 0"
        class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12"
      >
        <div class="card p-6 text-center">
          <div class="text-3xl font-bold text-blue-600 mb-2">
            {{ userStats.totalAnalyses }}
          </div>
          <div class="text-sm font-medium text-gray-600">Total Analyses</div>
        </div>

        <div class="card p-6 text-center">
          <div class="text-3xl font-bold text-green-600 mb-2">
            {{ Math.round(userStats.averageScore) }}
          </div>
          <div class="text-sm font-medium text-gray-600">Average Score</div>
        </div>

        <div class="card p-6 text-center">
          <div class="text-3xl font-bold text-purple-600 mb-2">
            {{ activityLevel }}
          </div>
          <div class="text-sm font-medium text-gray-600">Activity Level</div>
        </div>
      </div>

      <!-- Recent Analysis -->
      <div v-if="hasHistory" class="card p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Recent Analysis</h3>
          <router-link
            to="/history"
            class="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All
          </router-link>
        </div>

        <div v-if="latestAnalysis" class="border rounded-lg p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="font-medium text-gray-900">
              {{ latestAnalysis.metadata?.fileName || "Analysis" }}
            </span>
            <span class="text-sm text-gray-500">
              {{ formatAnalysisDate(latestAnalysis.timestamp) }}
            </span>
          </div>

          <div class="flex items-center space-x-4">
            <div class="flex items-center">
              <span
                class="text-lg font-semibold"
                :class="getScoreColor(latestAnalysis.results.overallScore)"
              >
                {{ latestAnalysis.results.overallScore }}
              </span>
              <span class="text-sm text-gray-600 ml-1">/100</span>
            </div>

            <div class="flex items-center">
              <span class="mr-1">{{
                getSentimentEmoji(latestAnalysis.results.sentiment?.label)
              }}</span>
              <span class="text-sm text-gray-600 capitalize">
                {{ latestAnalysis.results.sentiment?.label }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Features -->
      <div class="mt-16">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
          Powerful Analysis Features
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <div
              class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg
                class="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Voice Clarity
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              Get detailed feedback on pronunciation, pace, and articulation
            </p>
          </div>

          <div class="text-center">
            <div
              class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg
                class="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Engagement Score
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              Measure how compelling and engaging your communication is
            </p>
          </div>

          <div class="text-center">
            <div
              class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg
                class="w-8 h-8 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M13 16h5a2 2 0 002-2V6a2 2 0 00-2-2H9a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Sentiment Analysis
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              Understand the emotional tone and sentiment of your content
            </p>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed } from "vue";
import AppLayout from "@/components/layout/AppLayout.vue";
import FileUploader from "@/components/features/FileUploader.vue";
import AudioRecorder from "@/components/features/AudioRecorder.vue";
import { useAnalysisStore } from "@/stores/analysis";
import { useUserStore } from "@/stores/user";
import { useAnalysis } from "@/composables/useAnalysis";
import { useNotifications } from "@/composables/useNotifications";
import { useRouter } from "vue-router";

// Composables
const router = useRouter();
const analysisStore = useAnalysisStore();
const userStore = useUserStore();
const { getScoreColor, getSentimentEmoji, formatAnalysisDate } = useAnalysis();
const { showSuccess, showError } = useNotifications();

// Computed
const userPreferences = computed(() => userStore.preferences);
const userStats = computed(() => userStore.stats);
const hasHistory = computed(() => analysisStore.hasHistory);
const latestAnalysis = computed(() => analysisStore.latestAnalysis);
const activityLevel = computed(() => userStore.activityLevel);

// Event handlers
function handleUploadComplete(result) {
  showSuccess("File analyzed successfully!");
}

function handleRecordingComplete(blob) {
  showSuccess("Recording completed!");
}

function handleAnalysisComplete(result) {
  showSuccess("Analysis completed!");
  router.push("/");
}

function handleError(error) {
  showError(error.message || "An error occurred");
}
</script>
