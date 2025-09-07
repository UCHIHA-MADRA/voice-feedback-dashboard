// src/composables/useFileUpload.js

import { ref, computed } from "vue";
import { useAnalysisStore } from "@/stores/analysis";
import { useNotifications } from "./useNotifications";

export function useFileUpload() {
  const analysisStore = useAnalysisStore();
  const { showSuccess, showError } = useNotifications();

  // State
  const isDragOver = ref(false);
  const isUploading = ref(false);
  const uploadProgress = ref(0);
  const selectedFile = ref(null);

  // Computed
  const canUpload = computed(
    () => !isUploading.value && !analysisStore.isAnalyzing
  );
  const hasFile = computed(() => !!selectedFile.value);

  // File validation
  function validateFile(file) {
    return analysisStore.validateFile(file);
  }

  // Handle file selection
  function handleFileSelect(event) {
    const files = event.target.files || event.dataTransfer?.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const validation = validateFile(file);

    if (!validation.isValid) {
      showError(validation.error);
      return;
    }

    selectedFile.value = file;
    showSuccess(`File selected: ${file.name}`);
  }

  // Handle drag and drop
  function handleDragOver(event) {
    event.preventDefault();
    isDragOver.value = true;
  }

  function handleDragLeave(event) {
    event.preventDefault();
    isDragOver.value = false;
  }

  function handleDrop(event) {
    event.preventDefault();
    isDragOver.value = false;
    handleFileSelect(event);
  }

  // Upload and analyze file
  async function uploadAndAnalyze(options = {}) {
    if (!selectedFile.value || !canUpload.value) return;

    try {
      isUploading.value = true;
      uploadProgress.value = 0;

      const result = await analysisStore.analyzeFile(selectedFile.value, {
        ...options,
        onUploadProgress: (progress) => {
          uploadProgress.value = Math.round(
            (progress.loaded * 100) / progress.total
          );
        },
      });

      // Clear selected file after successful upload
      selectedFile.value = null;
      uploadProgress.value = 0;

      return result;
    } catch (error) {
      console.error("Upload failed:", error);
      throw error;
    } finally {
      isUploading.value = false;
      uploadProgress.value = 0;
    }
  }

  // Clear selected file
  function clearFile() {
    selectedFile.value = null;
    uploadProgress.value = 0;
  }

  // Get file preview info
  function getFilePreview(file) {
    if (!file) return null;

    const isAudio = file.type.startsWith("audio/");
    const isText =
      file.type.startsWith("text/") ||
      file.name.endsWith(".txt") ||
      file.name.endsWith(".doc") ||
      file.name.endsWith(".pdf");

    return {
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type,
      isAudio,
      isText,
      icon: getFileIcon(file),
    };
  }

  // Format file size
  function formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  // Get file icon
  function getFileIcon(file) {
    if (file.type.startsWith("audio/")) return "🎵";
    if (file.type.startsWith("text/")) return "📄";
    if (file.name.endsWith(".pdf")) return "📋";
    if (file.name.endsWith(".doc") || file.name.endsWith(".docx")) return "📝";
    return "📁";
  }

  return {
    // State
    isDragOver,
    isUploading,
    uploadProgress,
    selectedFile,

    // Computed
    canUpload,
    hasFile,

    // Methods
    handleFileSelect,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    uploadAndAnalyze,
    clearFile,
    validateFile,
    getFilePreview,
    formatFileSize,
  };
}
