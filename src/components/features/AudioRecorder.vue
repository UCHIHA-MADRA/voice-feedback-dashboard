<!-- src/components/features/AudioRecorder.vue -->
<template>
  <div class="w-full space-y-4">
    <!-- Recording Status -->
    <div class="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-700">
      <div class="mb-4">
        <div
          class="w-24 h-24 mx-auto rounded-full flex items-center justify-center transition-all duration-300"
          :class="{
            'bg-red-100 text-red-600': isRecording && !isPaused,
            'bg-yellow-100 text-yellow-600': isPaused,
            'bg-gray-100 text-gray-400': !isRecording && !isPaused,
            'bg-green-100 text-green-600': hasRecording && !isRecording,
          }"
        >
          <svg
            v-if="!isRecording && !isPaused"
            class="w-10 h-10 dark:text-gray-200"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
              clip-rule="evenodd"
            />
          </svg>

          <svg
            v-else-if="isPaused"
            class="w-10 h-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>

          <div
            v-else
            class="w-6 h-6 bg-current rounded-full animate-pulse"
          ></div>
        </div>
      </div>

      <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        {{ getStatusText }}
      </h3>

      <div class="text-2xl font-mono font-bold text-gray-700 dark:text-gray-300 mb-4">
        {{ formattedDuration }}
      </div>

      <p class="text-sm text-gray-500 dark:text-gray-400">
        {{ getStatusDescription }}
      </p>
    </div>

    <!-- Permission Request -->
    <div
      v-if="!isSupported"
      class="p-4 bg-red-50 rounded-lg border border-red-200"
    >
      <div class="flex items-center">
        <svg
          class="w-5 h-5 text-red-400 mr-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p class="text-sm text-red-700">
          Audio recording is not supported in this browser.
        </p>
      </div>
    </div>

    <div
      v-else-if="permissionGranted === false"
      class="p-4 bg-yellow-50 rounded-lg border border-yellow-200"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <svg
            class="w-5 h-5 text-yellow-400 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p class="text-sm text-yellow-700">
            Microphone access is required for recording.
          </p>
        </div>
        <button
          @click="requestPermission"
          class="text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded-md font-medium"
        >
          Grant Access
        </button>
      </div>
    </div>

    <!-- Recording Controls -->
    <div class="flex justify-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-700">
      <button
        v-if="!isRecording && !isPaused"
        @click="handleStartRecording"
        :disabled="!canRecord || !isSupported"
        class="flex items-center justify-center w-16 h-16 bg-gray-600 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-full transition-colors duration-200 shadow-lg dark:shadow-gray-900/30"
        :class="{ 'cursor-not-allowed': !canRecord || !isSupported }"
      >
        <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
            clip-rule="evenodd"
          />
        </svg>
      </button>

      <button
        v-if="canPause"
        @click="pauseRecording"
        class="flex items-center justify-center w-12 h-12 bg-yellow-600 hover:bg-yellow-700 text-white rounded-full shadow-lg dark:shadow-yellow-900/30"
      >
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 9v6m4-6v6"
          />
        </svg>
      </button>

      <button
        v-if="canResume"
        @click="resumeRecording"
        class="flex items-center justify-center w-12 h-12 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg dark:shadow-green-900/30"
      >
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15"
          />
        </svg>
      </button>

      <button
        v-if="canStop"
        @click="stopRecording"
        class="flex items-center justify-center w-12 h-12 bg-gray-600 hover:bg-gray-700 text-white rounded-full shadow-lg dark:shadow-gray-900/30"
      >
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
          />
        </svg>
      </button>
    </div>

    <!-- Real-time Feedback -->
    <RealTimeFeedback
      v-if="isRecording"
      :is-recording="isRecording"
      :duration="duration"
    />

    <!-- Recorded Audio Preview -->
    <div
      v-if="hasRecording"
      class="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
    >
      <h4 class="font-medium text-green-800 dark:text-green-400 mb-3">Recording Complete</h4>

      <audio
        v-if="audioUrl"
        controls
        class="w-full mb-4"
        :src="audioUrl"
      ></audio>

      <div class="flex space-x-3">
        <button @click="handleAnalyze" class="flex-1 btn-primary">
          Analyze Recording
        </button>

        <button
          @click="clearRecording"
          class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg"
        >
          Clear
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useAudioRecording } from "@/composables/useAudioRecording";
import { useAnalysis } from "@/composables/useAnalysis";
import { useRouter } from "vue-router";
import { useNotifications } from "@/composables/useNotifications";
import RealTimeFeedback from "./RealTimeFeedback.vue";

// Props
const props = defineProps({
  maxDuration: {
    type: Number,
    default: 300, // 5 minutes
  },
});

// Emits
const emit = defineEmits(["recording-complete", "analysis-complete", "error"]);

// Composables
const router = useRouter();
const { analyzeFile } = useAnalysis();
const { showInfo, showError, showSuccess } = useNotifications();
const {
  isRecording,
  isPaused,
  duration,
  recordedBlob,
  permissionGranted,
  isSupported,
  canRecord,
  canStop,
  canPause,
  canResume,
  hasRecording,
  formattedDuration,
  requestPermission,
  startRecording,
  stopRecording,
  pauseRecording,
  resumeRecording,
  createAudioFile,
  clearRecording,
  validateRecording,
} = useAudioRecording();

// Local state
const audioUrl = ref(null);

// Computed
const getStatusText = computed(() => {
  if (isRecording.value && !isPaused.value) return "Recording...";
  if (isPaused.value) return "Paused";
  if (hasRecording.value) return "Recording Complete";
  return "Ready to Record";
});

const getStatusDescription = computed(() => {
  if (!isSupported.value)
    return "Audio recording not supported in this browser";
  if (permissionGranted.value === false) return "Microphone access required";
  if (isRecording.value && !isPaused.value)
    return "Speaking into your microphone...";
  if (isPaused.value) return "Recording paused - click resume to continue";
  if (hasRecording.value) return "Ready to analyze your recording";
  return "Click the record button to start";
});

// Watch for recording blob changes to create audio URL
watch(recordedBlob, (newBlob) => {
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value);
    audioUrl.value = null;
  }

  if (newBlob) {
    audioUrl.value = URL.createObjectURL(newBlob);
    emit("recording-complete", newBlob);
  }
});

// Auto-stop recording when max duration is reached
watch(duration, (newDuration) => {
  if (newDuration >= props.maxDuration && isRecording.value) {
    stopRecording();
  }
});

// Methods
async function handleStartRecording() {
  console.log('Record button clicked!');
  console.log('canRecord:', canRecord.value);
  console.log('isSupported:', isSupported.value);
  console.log('permissionGranted:', permissionGranted.value);
  
  try {
    await startRecording();
  } catch (error) {
    console.error('Failed to start recording:', error);
  }
}

async function handleAnalyze() {
  if (!hasRecording.value) {
    showError("No recording available to analyze");
    return;
  }

  // Validate recording quality first
  const validation = validateRecording();
  if (!validation.isValid) {
    showError(validation.message);
    return;
  }

  try {
    const audioFile = createAudioFile("voice-recording");
    if (!audioFile) {
      throw new Error("Failed to create audio file from recording");
    }
    
    // Show loading state
    const loadingToast = showInfo("Analyzing your recording...", { timeout: 0 });
    
    const result = await analyzeFile(audioFile);

    // Clear loading toast
    if (loadingToast && loadingToast.close) {
      loadingToast.close();
    }

    if (result) {
      showSuccess("Analysis complete!");
      emit("analysis-complete", result);
      await router.push("/dashboard");
    } else {
      throw new Error("Analysis failed to return results");
    }
  } catch (error) {
    console.error("Analysis error:", error);
    
    // Provide more specific error messages
    let errorMessage = "Failed to analyze recording";
    if (error.message.includes("too large")) {
      errorMessage = error.message;
    } else if (error.message.includes("network")) {
      errorMessage = "Network error. Please check your connection and try again.";
    } else if (error.message.includes("timeout")) {
      errorMessage = "Analysis timed out. Please try again with a shorter recording.";
    } else {
      errorMessage += ": " + (error.message || "Unknown error");
    }
    
    showError(errorMessage);
    emit("error", error);
  }
}

// Cleanup on unmount
import { onUnmounted } from "vue";
onUnmounted(() => {
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value);
  }
});
</script>
