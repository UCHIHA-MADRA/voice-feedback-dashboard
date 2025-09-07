<!-- src/components/features/AnalysisInsights.vue -->
<template>
  <div v-if="analysis?.results" class="space-y-6">
    <!-- Key Insights -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Key Insights
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="(insight, index) in analysis.results.insights"
          :key="index"
          class="p-4 rounded-lg border-l-4"
          :class="getInsightBorderColor(insight.type)"
        >
          <div class="flex items-start">
            <div class="flex-shrink-0 mr-3">
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center"
                :class="getInsightIconBg(insight.type)"
              >
                <svg
                  class="w-5 h-5"
                  :class="getInsightIconColor(insight.type)"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    v-if="insight.type === 'strength'"
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                  <path
                    v-else-if="insight.type === 'improvement'"
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                  />
                  <path
                    v-else
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <div class="flex-1">
              <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100">
                {{ insight.title }}
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {{ insight.description }}
              </p>
              <div class="mt-2">
                <span
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  :class="getImpactBadgeClass(insight.impact)"
                >
                  {{ insight.impact }} impact
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recommendations -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Recommendations
      </h3>
      <div class="space-y-3">
        <div
          v-for="(recommendation, index) in analysis.results.recommendations"
          :key="index"
          class="flex items-start p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
        >
          <div class="flex-shrink-0 mr-3">
            <div class="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
          <p class="text-sm text-gray-700 dark:text-gray-300">
            {{ recommendation }}
          </p>
        </div>
      </div>
    </div>

    <!-- Technical Analysis -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Technical Analysis
      </h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {{ analysis?.results?.technical?.metrics?.audioQuality || 0 }}%
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Audio Quality</div>
        </div>
        <div class="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {{ analysis?.results?.technical?.metrics?.backgroundNoise || 0 }}%
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Background Noise</div>
        </div>
        <div class="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {{ analysis?.results?.technical?.metrics?.echo || 0 }}%
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Echo Level</div>
        </div>
        <div class="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {{ analysis?.results?.technical?.metrics?.distortion || 0 }}%
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Distortion</div>
        </div>
      </div>
    </div>

    <!-- Sentiment Analysis -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Sentiment Analysis
      </h3>
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <div
            class="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
            :class="getSentimentBgColor(analysis.results.sentiment.label)"
          >
            {{ getSentimentEmoji(analysis.results.sentiment.label) }}
          </div>
          <div class="ml-4">
            <h4 class="text-lg font-medium text-gray-900 dark:text-gray-100 capitalize">
              {{ analysis.results.sentiment.label }} Sentiment
            </h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Confidence: {{ Math.round(analysis.results.sentiment.confidence * 100) }}%
            </p>
          </div>
        </div>
        <div class="text-right">
          <div class="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {{ analysis.results.sentiment.score }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Score</div>
        </div>
      </div>
    </div>

    <!-- Action Items -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Action Items
      </h3>
      <div class="space-y-3">
        <div
          v-for="(action, index) in actionItems"
          :key="index"
          class="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
        >
          <div class="flex-shrink-0 mr-3">
            <input
              type="checkbox"
              :id="`action-${index}`"
              class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <label
            :for="`action-${index}`"
            class="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
          >
            {{ action }}
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  analysis: {
    type: Object,
    required: true
  }
})

// Computed
const actionItems = computed(() => {
  const items = []
  
  if (props.analysis.results.clarity.score < 70) {
    items.push('Practice articulation exercises daily')
  }
  
  if (props.analysis.results.engagement.score < 70) {
    items.push('Work on vocal energy and enthusiasm')
  }
  
  if (props.analysis.results.technical.metrics.backgroundNoise > 30) {
    items.push('Improve recording environment to reduce background noise')
  }
  
  if (props.analysis.results.speechPatterns.fillerWords > 5) {
    items.push('Practice reducing filler words like "um" and "uh"')
  }
  
  if (props.analysis.results.speechPatterns.wordsPerMinute < 120) {
    items.push('Practice speaking at a faster pace')
  } else if (props.analysis.results.speechPatterns.wordsPerMinute > 180) {
    items.push('Slow down speech for better clarity')
  }
  
  return items
})

// Methods
const getInsightBorderColor = (type) => {
  switch (type) {
    case 'strength':
      return 'border-green-500 bg-green-50 dark:bg-green-900/20'
    case 'improvement':
      return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
    case 'tip':
      return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
    default:
      return 'border-gray-500 bg-gray-50 dark:bg-gray-900/20'
  }
}

const getInsightIconBg = (type) => {
  switch (type) {
    case 'strength':
      return 'bg-green-100 dark:bg-green-900'
    case 'improvement':
      return 'bg-yellow-100 dark:bg-yellow-900'
    case 'tip':
      return 'bg-blue-100 dark:bg-blue-900'
    default:
      return 'bg-gray-100 dark:bg-gray-900'
  }
}

const getInsightIconColor = (type) => {
  switch (type) {
    case 'strength':
      return 'text-green-600 dark:text-green-400'
    case 'improvement':
      return 'text-yellow-600 dark:text-yellow-400'
    case 'tip':
      return 'text-blue-600 dark:text-blue-400'
    default:
      return 'text-gray-600 dark:text-gray-400'
  }
}

const getImpactBadgeClass = (impact) => {
  switch (impact) {
    case 'high':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case 'low':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
}

const getSentimentBgColor = (sentiment) => {
  switch (sentiment) {
    case 'positive':
      return 'bg-green-100 dark:bg-green-900'
    case 'neutral':
      return 'bg-gray-100 dark:bg-gray-900'
    case 'negative':
      return 'bg-red-100 dark:bg-red-900'
    default:
      return 'bg-gray-100 dark:bg-gray-900'
  }
}

const getSentimentEmoji = (sentiment) => {
  switch (sentiment) {
    case 'positive':
      return '😊'
    case 'neutral':
      return '😐'
    case 'negative':
      return '😔'
    default:
      return '😐'
  }
}
</script>
