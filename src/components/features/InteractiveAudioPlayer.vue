<!-- src/components/features/InteractiveAudioPlayer.vue -->
<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
      Audio Playback & Analysis
    </h3>
    
    <!-- Audio Player -->
    <div class="mb-6">
      <audio
        ref="audioPlayer"
        :src="audioUrl"
        @loadedmetadata="onAudioLoaded"
        @timeupdate="onTimeUpdate"
        @ended="onAudioEnded"
        class="w-full mb-4"
        controls
      ></audio>
      
      <!-- Custom Controls -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <button
            @click="togglePlayback"
            class="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
          >
            <svg
              v-if="!isPlaying"
              class="w-5 h-5 ml-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M8 5v10l8-5-8-5z" />
            </svg>
            <svg
              v-else
              class="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M6 4h2v12H6V4zm6 0h2v12h-2V4z" />
            </svg>
          </button>
          
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-600 dark:text-gray-400">
              {{ formatTime(currentTime) }}
            </span>
            <div class="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                class="h-full bg-blue-600 transition-all duration-100"
                :style="{ width: progressPercentage + '%' }"
              ></div>
            </div>
            <span class="text-sm text-gray-600 dark:text-gray-400">
              {{ formatTime(duration) }}
            </span>
          </div>
        </div>
        
        <div class="flex items-center space-x-2">
          <button
            @click="toggleMute"
            class="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <svg
              v-if="!isMuted"
              class="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L5.707 14H3a1 1 0 01-1-1V7a1 1 0 011-1h2.707l2.676-2.793a1 1 0 011.617.793zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
            <svg
              v-else
              class="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L5.707 14H3a1 1 0 01-1-1V7a1 1 0 011-1h2.707l2.676-2.793a1 1 0 011.617.793zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
          
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-600 dark:text-gray-400">Volume</span>
            <input
              v-model="volume"
              @input="onVolumeChange"
              type="range"
              min="0"
              max="1"
              step="0.1"
              class="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Real-time Analysis -->
    <div class="mb-6">
      <h4 class="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
        Real-time Analysis
      </h4>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="text-lg font-bold text-gray-900 dark:text-gray-100">
            {{ currentMetrics.energy }}
          </div>
          <div class="text-xs text-gray-600 dark:text-gray-400">Energy</div>
        </div>
        <div class="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="text-lg font-bold text-gray-900 dark:text-gray-100">
            {{ currentMetrics.clarity }}
          </div>
          <div class="text-xs text-gray-600 dark:text-gray-400">Clarity</div>
        </div>
        <div class="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="text-lg font-bold text-gray-900 dark:text-gray-100">
            {{ currentMetrics.pace }}
          </div>
          <div class="text-xs text-gray-600 dark:text-gray-400">Pace</div>
        </div>
        <div class="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="text-lg font-bold text-gray-900 dark:text-gray-100">
            {{ currentMetrics.volume }}
          </div>
          <div class="text-xs text-gray-600 dark:text-gray-400">Volume</div>
        </div>
      </div>
    </div>
    
    <!-- Waveform Visualization -->
    <div class="mb-6">
      <h4 class="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
        Audio Waveform
      </h4>
      <div class="w-full h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
        <canvas ref="waveformCanvas" class="w-full h-full"></canvas>
      </div>
    </div>
    
    <!-- Analysis Timeline -->
    <div>
      <h4 class="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
        Analysis Timeline
      </h4>
      <div class="space-y-2">
        <div
          v-for="(segment, index) in analysisSegments"
          :key="index"
          class="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
          :class="{ 'bg-blue-50 dark:bg-blue-900/20': isCurrentSegment(index) }"
        >
          <div class="w-3 h-3 rounded-full mr-3" :class="getSegmentColor(segment.score)"></div>
          <div class="flex-1">
            <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
              {{ segment.label }}
            </div>
            <div class="text-xs text-gray-600 dark:text-gray-400">
              {{ formatTime(segment.startTime) }} - {{ formatTime(segment.endTime) }}
            </div>
          </div>
          <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
            {{ segment.score }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

// Props
const props = defineProps({
  audioUrl: {
    type: String,
    required: true
  },
  analysis: {
    type: Object,
    required: true
  }
})

// Refs
const audioPlayer = ref(null)
const waveformCanvas = ref(null)

// State
const isPlaying = ref(false)
const isMuted = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(1)
const currentMetrics = ref({
  energy: 75,
  clarity: 82,
  pace: 68,
  volume: 85
})

// Computed
const progressPercentage = computed(() => {
  if (duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
})

const analysisSegments = computed(() => {
  if (!props.analysis?.results) return []
  
  const segments = []
  const segmentDuration = duration.value / 10 // 10 segments
  
  for (let i = 0; i < 10; i++) {
    const startTime = i * segmentDuration
    const endTime = (i + 1) * segmentDuration
    const score = Math.round(70 + Math.random() * 30) // Mock segment scores
    
    segments.push({
      startTime,
      endTime,
      score,
      label: `Segment ${i + 1}`
    })
  }
  
  return segments
})

// Methods
const togglePlayback = () => {
  if (!audioPlayer.value) return
  
  if (isPlaying.value) {
    audioPlayer.value.pause()
  } else {
    audioPlayer.value.play()
  }
}

const toggleMute = () => {
  if (!audioPlayer.value) return
  
  isMuted.value = !isMuted.value
  audioPlayer.value.muted = isMuted.value
}

const onVolumeChange = () => {
  if (!audioPlayer.value) return
  audioPlayer.value.volume = volume.value
}

const onAudioLoaded = () => {
  if (!audioPlayer.value) return
  duration.value = audioPlayer.value.duration
  drawWaveform()
}

const onTimeUpdate = () => {
  if (!audioPlayer.value) return
  currentTime.value = audioPlayer.value.currentTime
  updateCurrentMetrics()
}

const onAudioEnded = () => {
  isPlaying.value = false
  currentTime.value = 0
}

const formatTime = (time) => {
  if (!time || isNaN(time)) return '0:00'
  
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const updateCurrentMetrics = () => {
  // Simulate real-time metric updates based on current time
  const timeRatio = currentTime.value / duration.value
  
  currentMetrics.value = {
    energy: Math.round(70 + Math.sin(timeRatio * Math.PI * 4) * 20),
    clarity: Math.round(80 + Math.cos(timeRatio * Math.PI * 3) * 15),
    pace: Math.round(65 + Math.sin(timeRatio * Math.PI * 2) * 25),
    volume: Math.round(75 + Math.cos(timeRatio * Math.PI * 5) * 20)
  }
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
  const barCount = 100
  const barWidth = width / barCount
  
  for (let i = 0; i < barCount; i++) {
    const barHeight = Math.random() * height * 0.8
    const x = i * barWidth
    const y = (height - barHeight) / 2
    
    ctx.fillStyle = '#3B82F6'
    ctx.fillRect(x, y, barWidth - 2, barHeight)
  }
  
  // Draw progress indicator
  const progressX = (currentTime.value / duration.value) * width
  ctx.fillStyle = '#1D4ED8'
  ctx.fillRect(progressX, 0, 2, height)
}

const getSegmentColor = (score) => {
  if (score >= 85) return 'bg-green-500'
  if (score >= 70) return 'bg-blue-500'
  if (score >= 55) return 'bg-yellow-500'
  return 'bg-red-500'
}

const isCurrentSegment = (index) => {
  const segment = analysisSegments.value[index]
  if (!segment) return false
  return currentTime.value >= segment.startTime && currentTime.value < segment.endTime
}

// Watch for audio URL changes
watch(() => props.audioUrl, () => {
  if (audioPlayer.value) {
    audioPlayer.value.load()
  }
})

// Watch for playing state
watch(isPlaying, (playing) => {
  if (audioPlayer.value) {
    if (playing) {
      audioPlayer.value.play()
    } else {
      audioPlayer.value.pause()
    }
  }
})

// Lifecycle
onMounted(() => {
  if (audioPlayer.value) {
    audioPlayer.value.addEventListener('play', () => { isPlaying.value = true })
    audioPlayer.value.addEventListener('pause', () => { isPlaying.value = false })
    audioPlayer.value.addEventListener('ended', () => { isPlaying.value = false })
  }
})

onUnmounted(() => {
  if (audioPlayer.value) {
    audioPlayer.value.removeEventListener('play', () => { isPlaying.value = true })
    audioPlayer.value.removeEventListener('pause', () => { isPlaying.value = false })
    audioPlayer.value.removeEventListener('ended', () => { isPlaying.value = false })
  }
})
</script>
