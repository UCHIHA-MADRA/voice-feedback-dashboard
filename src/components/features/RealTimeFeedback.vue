<!-- src/components/features/RealTimeFeedback.vue -->
<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
      Real-time Feedback
    </h3>
    
    <!-- Live Metrics -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div class="text-xl font-bold" :class="getVolumeColor(liveMetrics.volume)">
          {{ liveMetrics.volume }}%
        </div>
        <div class="text-xs text-gray-600 dark:text-gray-400">Volume</div>
        <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1 mt-2">
          <div
            class="h-1 rounded-full transition-all duration-200"
            :class="getVolumeBarColor(liveMetrics.volume)"
            :style="{ width: liveMetrics.volume + '%' }"
          ></div>
        </div>
      </div>
      
      <div class="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div class="text-xl font-bold" :class="getPaceColor(liveMetrics.pace)">
          {{ liveMetrics.pace }}
        </div>
        <div class="text-xs text-gray-600 dark:text-gray-400">Words/Min</div>
        <div class="text-xs mt-1" :class="getPaceStatusColor(liveMetrics.pace)">
          {{ getPaceStatus(liveMetrics.pace) }}
        </div>
      </div>
      
      <div class="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div class="text-xl font-bold" :class="getClarityColor(liveMetrics.clarity)">
          {{ liveMetrics.clarity }}%
        </div>
        <div class="text-xs text-gray-600 dark:text-gray-400">Clarity</div>
        <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1 mt-2">
          <div
            class="h-1 rounded-full transition-all duration-200"
            :class="getClarityBarColor(liveMetrics.clarity)"
            :style="{ width: liveMetrics.clarity + '%' }"
          ></div>
        </div>
      </div>
      
      <div class="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div class="text-xl font-bold" :class="getEnergyColor(liveMetrics.energy)">
          {{ liveMetrics.energy }}%
        </div>
        <div class="text-xs text-gray-600 dark:text-gray-400">Energy</div>
        <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1 mt-2">
          <div
            class="h-1 rounded-full transition-all duration-200"
            :class="getEnergyBarColor(liveMetrics.energy)"
            :style="{ width: liveMetrics.energy + '%' }"
          ></div>
        </div>
      </div>
    </div>
    
    <!-- Live Waveform -->
    <div class="mb-6">
      <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Live Audio Waveform
      </h4>
      <div class="w-full h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
        <canvas ref="waveformCanvas" class="w-full h-full"></canvas>
      </div>
    </div>
    
    <!-- Live Tips -->
    <div class="space-y-3">
      <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">
        Live Tips
      </h4>
      <div
        v-for="(tip, index) in activeTips"
        :key="index"
        class="flex items-start p-3 rounded-lg"
        :class="getTipBgColor(tip.type)"
      >
        <div class="flex-shrink-0 mr-3">
          <div
            class="w-6 h-6 rounded-full flex items-center justify-center"
            :class="getTipIconBg(tip.type)"
          >
            <svg
              class="w-4 h-4"
              :class="getTipIconColor(tip.type)"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                v-if="tip.type === 'success'"
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
              <path
                v-else-if="tip.type === 'warning'"
                fill-rule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
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
          <p class="text-sm" :class="getTipTextColor(tip.type)">
            {{ tip.message }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

// Props
const props = defineProps({
  isRecording: {
    type: Boolean,
    default: false
  },
  duration: {
    type: Number,
    default: 0
  }
})

// Refs
const waveformCanvas = ref(null)

// State
const liveMetrics = ref({
  volume: 0,
  pace: 0,
  clarity: 0,
  energy: 0
})

// Computed
const activeTips = computed(() => {
  const tips = []
  
  // Volume tips
  if (liveMetrics.value.volume < 20) {
    tips.push({
      type: 'warning',
      message: 'Volume is too low. Speak closer to the microphone.'
    })
  } else if (liveMetrics.value.volume > 90) {
    tips.push({
      type: 'warning',
      message: 'Volume is too high. Move away from the microphone.'
    })
  } else if (liveMetrics.value.volume >= 40 && liveMetrics.value.volume <= 80) {
    tips.push({
      type: 'success',
      message: 'Great volume level! Keep it consistent.'
    })
  }
  
  // Pace tips
  if (liveMetrics.value.pace < 100) {
    tips.push({
      type: 'info',
      message: 'Try speaking a bit faster for better engagement.'
    })
  } else if (liveMetrics.value.pace > 200) {
    tips.push({
      type: 'warning',
      message: 'Slow down a bit for better clarity.'
    })
  } else if (liveMetrics.value.pace >= 120 && liveMetrics.value.pace <= 180) {
    tips.push({
      type: 'success',
      message: 'Perfect speaking pace!'
    })
  }
  
  // Clarity tips
  if (liveMetrics.value.clarity < 60) {
    tips.push({
      type: 'warning',
      message: 'Focus on clear articulation and pronunciation.'
    })
  } else if (liveMetrics.value.clarity >= 80) {
    tips.push({
      type: 'success',
      message: 'Excellent clarity! Keep it up.'
    })
  }
  
  // Energy tips
  if (liveMetrics.value.energy < 50) {
    tips.push({
      type: 'info',
      message: 'Add more energy and enthusiasm to your voice.'
    })
  } else if (liveMetrics.value.energy >= 70) {
    tips.push({
      type: 'success',
      message: 'Great energy level!'
    })
  }
  
  return tips.slice(0, 3) // Show max 3 tips
})

// Methods
const updateLiveMetrics = () => {
  // Simulate real-time metric updates
  liveMetrics.value = {
    volume: Math.max(0, Math.min(100, liveMetrics.value.volume + (Math.random() - 0.5) * 10)),
    pace: Math.max(0, Math.min(300, liveMetrics.value.pace + (Math.random() - 0.5) * 20)),
    clarity: Math.max(0, Math.min(100, liveMetrics.value.clarity + (Math.random() - 0.5) * 8)),
    energy: Math.max(0, Math.min(100, liveMetrics.value.energy + (Math.random() - 0.5) * 6))
  }
  
  drawWaveform()
}

const drawWaveform = () => {
  if (!waveformCanvas.value) return
  
  const canvas = waveformCanvas.value
  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height)
  
  // Draw waveform bars
  const barCount = 50
  const barWidth = width / barCount
  
  for (let i = 0; i < barCount; i++) {
    const barHeight = Math.random() * height * 0.8
    const x = i * barWidth
    const y = (height - barHeight) / 2
    
    ctx.fillStyle = '#3B82F6'
    ctx.fillRect(x, y, barWidth - 1, barHeight)
  }
}

const getVolumeColor = (volume) => {
  if (volume < 20) return 'text-red-600 dark:text-red-400'
  if (volume > 90) return 'text-red-600 dark:text-red-400'
  if (volume >= 40 && volume <= 80) return 'text-green-600 dark:text-green-400'
  return 'text-yellow-600 dark:text-yellow-400'
}

const getVolumeBarColor = (volume) => {
  if (volume < 20) return 'bg-red-500'
  if (volume > 90) return 'bg-red-500'
  if (volume >= 40 && volume <= 80) return 'bg-green-500'
  return 'bg-yellow-500'
}

const getPaceColor = (pace) => {
  if (pace < 100) return 'text-yellow-600 dark:text-yellow-400'
  if (pace > 200) return 'text-red-600 dark:text-red-400'
  if (pace >= 120 && pace <= 180) return 'text-green-600 dark:text-green-400'
  return 'text-blue-600 dark:text-blue-400'
}

const getPaceStatus = (pace) => {
  if (pace < 100) return 'Too Slow'
  if (pace > 200) return 'Too Fast'
  if (pace >= 120 && pace <= 180) return 'Perfect'
  return 'Good'
}

const getPaceStatusColor = (pace) => {
  if (pace < 100) return 'text-yellow-600 dark:text-yellow-400'
  if (pace > 200) return 'text-red-600 dark:text-red-400'
  if (pace >= 120 && pace <= 180) return 'text-green-600 dark:text-green-400'
  return 'text-blue-600 dark:text-blue-400'
}

const getClarityColor = (clarity) => {
  if (clarity < 60) return 'text-red-600 dark:text-red-400'
  if (clarity >= 80) return 'text-green-600 dark:text-green-400'
  return 'text-yellow-600 dark:text-yellow-400'
}

const getClarityBarColor = (clarity) => {
  if (clarity < 60) return 'bg-red-500'
  if (clarity >= 80) return 'bg-green-500'
  return 'bg-yellow-500'
}

const getEnergyColor = (energy) => {
  if (energy < 50) return 'text-yellow-600 dark:text-yellow-400'
  if (energy >= 70) return 'text-green-600 dark:text-green-400'
  return 'text-blue-600 dark:text-blue-400'
}

const getEnergyBarColor = (energy) => {
  if (energy < 50) return 'bg-yellow-500'
  if (energy >= 70) return 'bg-green-500'
  return 'bg-blue-500'
}

const getTipBgColor = (type) => {
  switch (type) {
    case 'success':
      return 'bg-green-50 dark:bg-green-900/20'
    case 'warning':
      return 'bg-yellow-50 dark:bg-yellow-900/20'
    case 'info':
      return 'bg-blue-50 dark:bg-blue-900/20'
    default:
      return 'bg-gray-50 dark:bg-gray-700'
  }
}

const getTipIconBg = (type) => {
  switch (type) {
    case 'success':
      return 'bg-green-100 dark:bg-green-900'
    case 'warning':
      return 'bg-yellow-100 dark:bg-yellow-900'
    case 'info':
      return 'bg-blue-100 dark:bg-blue-900'
    default:
      return 'bg-gray-100 dark:bg-gray-700'
  }
}

const getTipIconColor = (type) => {
  switch (type) {
    case 'success':
      return 'text-green-600 dark:text-green-400'
    case 'warning':
      return 'text-yellow-600 dark:text-yellow-400'
    case 'info':
      return 'text-blue-600 dark:text-blue-400'
    default:
      return 'text-gray-600 dark:text-gray-400'
  }
}

const getTipTextColor = (type) => {
  switch (type) {
    case 'success':
      return 'text-green-700 dark:text-green-300'
    case 'warning':
      return 'text-yellow-700 dark:text-yellow-300'
    case 'info':
      return 'text-blue-700 dark:text-blue-300'
    default:
      return 'text-gray-700 dark:text-gray-300'
  }
}

// Lifecycle
let updateInterval = null

onMounted(() => {
  if (props.isRecording) {
    updateInterval = setInterval(updateLiveMetrics, 100)
  }
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})

// Watch for recording state changes
watch(() => props.isRecording, (isRecording) => {
  if (isRecording) {
    updateInterval = setInterval(updateLiveMetrics, 100)
  } else {
    if (updateInterval) {
      clearInterval(updateInterval)
      updateInterval = null
    }
  }
})
</script>
