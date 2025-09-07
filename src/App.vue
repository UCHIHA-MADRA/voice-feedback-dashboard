// src/App.vue
<template>
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-white transition-colors duration-200">
    <RouterView />

    <!-- Global notifications -->
    <NotificationContainer />

    <!-- Global loading overlay -->
    <LoadingOverlay v-if="uiStore.isGlobalLoading" />
  </div>
</template>

<script setup>
import { RouterView } from "vue-router";
import { useUiStore } from "@/stores/ui";
import NotificationContainer from "@/components/ui/NotificationContainer.vue";
import LoadingOverlay from "@/components/ui/LoadingOverlay.vue";

const uiStore = useUiStore();

// Global keyboard shortcuts
document.addEventListener("keydown", (e) => {
  // Ctrl/Cmd + K for search
  if ((e.ctrlKey || e.metaKey) && e.key === "k") {
    e.preventDefault();
    // Open search modal
  }

  // Escape to close modals
  if (e.key === "Escape") {
    uiStore.closeAllModals();
  }
});
</script>
