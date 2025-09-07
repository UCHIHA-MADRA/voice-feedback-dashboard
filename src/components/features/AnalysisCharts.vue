<!-- src/components/features/AnalysisCharts.vue -->
<template>
  <div v-if="analysis?.results" class="space-y-6">
    <!-- Overall Score Gauge -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Overall Performance Score
      </h3>
      <div class="flex items-center justify-center">
        <div class="relative w-48 h-48">
          <canvas ref="gaugeChart" class="w-full h-full"></canvas>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-center">
              <div class="text-3xl font-bold" :class="getScoreColor(analysis?.results?.overallScore || 0)">
                {{ analysis?.results?.overallScore || 0 }}
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">out of 100</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Metrics Radar Chart -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Performance Metrics
      </h3>
      <div class="flex items-center justify-center">
        <div class="w-80" style="height: 300px; max-height: 300px; overflow: hidden;">
          <canvas ref="radarChart" class="w-full h-full"></canvas>
        </div>
      </div>
    </div>

    <!-- Detailed Metrics Bar Chart -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Detailed Analysis
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Clarity Metrics -->
        <div>
          <h4 class="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">Clarity Metrics</h4>
          <canvas ref="clarityChart" class="w-full" style="height: 200px; max-height: 200px;"></canvas>
        </div>
        
        <!-- Engagement Metrics -->
        <div>
          <h4 class="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">Engagement Metrics</h4>
          <canvas ref="engagementChart" class="w-full" style="height: 200px; max-height: 200px;"></canvas>
        </div>
      </div>
    </div>

    <!-- Speech Patterns -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Speech Patterns
      </h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {{ analysis?.results?.speechPatterns?.wordsPerMinute || 0 }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Words/Min</div>
        </div>
        <div class="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div class="text-2xl font-bold text-green-600 dark:text-green-400">
            {{ analysis?.results?.speechPatterns?.pauseFrequency || 0 }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Pauses/Min</div>
        </div>
        <div class="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {{ analysis?.results?.speechPatterns?.fillerWords || 0 }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Filler Words</div>
        </div>
        <div class="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {{ analysis?.results?.speechPatterns?.sentenceLength || 0 }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Avg Sentence</div>
        </div>
      </div>
    </div>

    <!-- Trends Chart -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Performance Trends
      </h3>
      <div class="mb-4">
        <div class="flex space-x-2">
          <button
            @click="selectedTrend = 'weekly'"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              selectedTrend === 'weekly'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            ]"
          >
            Weekly
          </button>
          <button
            @click="selectedTrend = 'monthly'"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              selectedTrend === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            ]"
          >
            Monthly
          </button>
        </div>
      </div>
      <div class="w-full" style="height: 300px; max-height: 300px; overflow: hidden;">
        <canvas ref="trendsChart" class="w-full h-full"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import Chart from 'chart.js/auto'

// Props
const props = defineProps({
  analysis: {
    type: Object,
    required: true
  }
})

// Refs
const gaugeChart = ref(null)
const radarChart = ref(null)
const clarityChart = ref(null)
const engagementChart = ref(null)
const trendsChart = ref(null)
const selectedTrend = ref('weekly')

// Chart instances
let gaugeChartInstance = null
let radarChartInstance = null
let clarityChartInstance = null
let engagementChartInstance = null
let trendsChartInstance = null

// Computed
const getScoreColor = (score) => {
  if (score >= 85) return 'text-green-600 dark:text-green-400'
  if (score >= 70) return 'text-blue-600 dark:text-blue-400'
  if (score >= 55) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

// Methods
const createGaugeChart = () => {
  if (!gaugeChart.value) return
  
  try {
    const ctx = gaugeChart.value.getContext('2d')
    const score = props.analysis?.results?.overallScore || 0
    
    // Destroy existing chart
    if (gaugeChartInstance) {
      gaugeChartInstance.destroy()
    }
  
  gaugeChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [score, 100 - score],
        backgroundColor: [
          score >= 85 ? '#10B981' : score >= 70 ? '#3B82F6' : score >= 55 ? '#F59E0B' : '#EF4444',
          '#E5E7EB'
        ],
        borderWidth: 0,
        cutout: '75%'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false
        }
      }
    }
  })
  } catch (error) {
    console.error('Error creating gauge chart:', error)
  }
}

const createRadarChart = () => {
  if (!radarChart.value) return
  
  const ctx = radarChart.value.getContext('2d')
  
  // Destroy existing chart
  if (radarChartInstance) {
    radarChartInstance.destroy()
  }
  
  const data = {
    labels: ['Clarity', 'Engagement', 'Sentiment', 'Technical', 'Energy', 'Confidence'],
    datasets: [{
      label: 'Performance',
      data: [
        props.analysis?.results?.clarity?.score || 0,
        props.analysis?.results?.engagement?.score || 0,
        props.analysis?.results?.sentiment?.score || 0,
        props.analysis?.results?.technical?.score || 0,
        props.analysis?.results?.engagement?.metrics?.energy || 0,
        props.analysis?.results?.engagement?.metrics?.confidence || 0
      ],
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(59, 130, 246, 1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(59, 130, 246, 1)'
    }]
  }
  
  radarChartInstance = new Chart(ctx, {
    type: 'radar',
    data,
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 20
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  })
}

const createClarityChart = () => {
  if (!clarityChart.value) return
  
  const ctx = clarityChart.value.getContext('2d')
  
  // Destroy existing chart
  if (clarityChartInstance) {
    clarityChartInstance.destroy()
  }
  
  clarityChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Articulation', 'Pace', 'Volume', 'Pronunciation'],
      datasets: [{
        label: 'Score',
        data: [
          props.analysis?.results?.clarity?.metrics?.articulation || 0,
          props.analysis?.results?.clarity?.metrics?.pace || 0,
          props.analysis?.results?.clarity?.metrics?.volume || 0,
          props.analysis?.results?.clarity?.metrics?.pronunciation || 0
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(139, 92, 246, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          grid: {
            drawBorder: false
          }
        },
        x: {
          grid: {
            drawBorder: false
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  })
}

const createEngagementChart = () => {
  if (!engagementChart.value) return
  
  const ctx = engagementChart.value.getContext('2d')
  
  // Destroy existing chart
  if (engagementChartInstance) {
    engagementChartInstance.destroy()
  }
  
  engagementChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Energy', 'Enthusiasm', 'Confidence', 'Charisma'],
      datasets: [{
        label: 'Score',
        data: [
          props.analysis?.results?.engagement?.metrics?.energy || 0,
          props.analysis?.results?.engagement?.metrics?.enthusiasm || 0,
          props.analysis?.results?.engagement?.metrics?.confidence || 0,
          props.analysis?.results?.engagement?.metrics?.charisma || 0
        ],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(139, 92, 246, 0.8)'
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(139, 92, 246, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          grid: {
            drawBorder: false
          }
        },
        x: {
          grid: {
            drawBorder: false
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  })
}

const createTrendsChart = () => {
  if (!trendsChart.value) return
  
  const ctx = trendsChart.value.getContext('2d')
  
  // Destroy existing chart
  if (trendsChartInstance) {
    trendsChartInstance.destroy()
  }
  
  const trendData = props.analysis?.results?.trends?.[selectedTrend.value] || []
  const labels = trendData.map(item => 
    selectedTrend.value === 'weekly' ? item.date : item.month
  )
  
  trendsChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Overall Score',
          data: trendData.map(item => item.score),
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Clarity',
          data: trendData.map(item => item.clarity),
          borderColor: 'rgba(16, 185, 129, 1)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: false
        },
        {
          label: 'Engagement',
          data: trendData.map(item => item.engagement),
          borderColor: 'rgba(245, 158, 11, 1)',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.4,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          grid: {
            drawBorder: false
          }
        },
        x: {
          grid: {
            drawBorder: false
          }
        }
      },
      plugins: {
        legend: {
          position: 'top'
        }
      }
    }
  })
}

const createAllCharts = async () => {
  try {
    await nextTick()
    createGaugeChart()
    createRadarChart()
    createClarityChart()
    createEngagementChart()
    createTrendsChart()
  } catch (error) {
    console.error('Error creating charts:', error)
  }
}

// Watch for trend changes
watch(selectedTrend, () => {
  createTrendsChart()
})

// Watch for analysis changes
watch(() => props.analysis, () => {
  createAllCharts()
}, { deep: true })

// Lifecycle
onMounted(() => {
  createAllCharts()
})
</script>
