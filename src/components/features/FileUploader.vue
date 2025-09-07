<!-- src/components/features/FileUploader.vue -->
<template>
  <div class="w-full">
    <!-- Drag and Drop Area -->
    <div
      ref="dropZone"
      class="relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300"
      :class="{
        'border-blue-400 bg-blue-50': isDragOver,
        'border-gray-300 hover:border-gray-400': !isDragOver && !hasFile,
        'border-green-400 bg-green-50': hasFile,
      }"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <!-- Upload Icon -->
      <div class="mb-4">
        <svg
          class="mx-auto h-12 w-12 text-gray-400"
          :class="{ 'text-blue-500': isDragOver, 'text-green-500': hasFile }"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>

      <!-- Upload Text -->
      <div v-if="!hasFile">
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          {{ isDragOver ? "Drop your file here" : "Upload your file" }}
        </h3>
        <p class="text-sm text-gray-500 mb-4">
          Drag and drop your audio or text file, or click to browse
        </p>
        <p class="text-xs text-gray-400">
          Supports: MP3, WAV, M4A, TXT, DOC, PDF (Max 10MB)
        </p>
      </div>

      <!-- File Preview -->
      <div v-else class="space-y-3">
        <div class="flex items-center justify-center space-x-3">
          <span class="text-2xl">{{ filePreview.icon }}</span>
          <div class="text-left">
            <p class="font-medium text-gray-900">{{ filePreview.name }}</p>
            <p class="text-sm text-gray-500">{{ filePreview.size }}</p>
          </div>
        </div>
        <button
          @click="clearFile"
          class="text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Remove file
        </button>
      </div>

      <!-- File Input -->
      <input
        ref="fileInput"
        type="file"
        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        accept=".mp3,.wav,.m4a,.ogg,.txt,.doc,.docx,.pdf"
        @change="handleFileSelect"
        :disabled="isUploading"
      />

      <!-- Upload Progress -->
      <div
        v-if="isUploading"
        class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-xl"
      >
        <div class="text-center">
          <div
            class="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"
          ></div>
          <p class="text-sm font-medium text-gray-900">Uploading...</p>
          <div class="w-48 bg-gray-200 rounded-full h-2 mt-2">
            <div
              class="bg-blue-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${uploadProgress}%` }"
            ></div>
          </div>
          <p class="text-xs text-gray-500 mt-1">{{ uploadProgress }}%</p>
        </div>
      </div>
    </div>

    <!-- Upload Button -->
    <div v-if="hasFile && !isUploading" class="mt-4">
      <button
        @click="handleUpload"
        :disabled="!canUpload"
        class="w-full btn-primary"
      >
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
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          />
        </svg>
        Analyze File
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useFileUpload } from "@/composables/useFileUpload";
import { useRouter } from "vue-router";

// Props
const props = defineProps({
  autoAnalyze: {
    type: Boolean,
    default: false,
  },
});

// Emits
const emit = defineEmits(["upload-complete", "upload-error"]);

// Composables
const router = useRouter();
const {
  isDragOver,
  isUploading,
  uploadProgress,
  selectedFile,
  canUpload,
  hasFile,
  handleFileSelect,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  uploadAndAnalyze,
  clearFile,
  getFilePreview,
} = useFileUpload();

// Computed
const filePreview = computed(() =>
  selectedFile.value ? getFilePreview(selectedFile.value) : null
);

// Methods
async function handleUpload() {
  if (!selectedFile.value || isUploading.value) return;
  
  // Validate file before uploading
  const maxSizeMB = 10;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (selectedFile.value.size > maxSizeBytes) {
    emit("upload-error", new Error(`File size exceeds the maximum limit of ${maxSizeMB}MB`));
    return;
  }
  
  // Check file type
  const extension = selectedFile.value.name.split(".").pop().toLowerCase();
  const supportedAudio = ["mp3", "wav", "m4a", "ogg"];
  const supportedText = ["txt", "doc", "docx", "pdf"];
  const isSupported = [...supportedAudio, ...supportedText].includes(extension);
  
  if (!isSupported) {
    emit("upload-error", new Error(`Unsupported file format. Supported: ${[...supportedAudio, ...supportedText].join(", ")}`));
    return;
  }
  
  try {
    const result = await uploadAndAnalyze();
    emit("upload-complete", result);

    // Navigate to dashboard if auto-analyze is enabled
    if (props.autoAnalyze) {
      await router.push("/dashboard");
    }
  } catch (error) {
    emit("upload-error", error);
  }
}
</script>
