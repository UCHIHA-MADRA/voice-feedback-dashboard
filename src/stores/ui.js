// src/stores/ui.js

import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useUiStore = defineStore("ui", () => {
  // State
  const theme = ref(getInitialTheme());
  const sidebarOpen = ref(false);
  const modals = ref({});
  const notifications = ref([]);
  const isGlobalLoading = ref(false);
  const loadingMessage = ref("");

  // Getters
  const isDarkMode = computed(() => theme.value === "dark");
  const activeModals = computed(() =>
    Object.entries(modals.value).filter(([, isOpen]) => isOpen)
  );
  const hasActiveModals = computed(() => activeModals.value.length > 0);

  // Actions
  function toggleTheme() {
    theme.value = theme.value === "light" ? "dark" : "light";
    updateTheme();
    localStorage.setItem("theme", theme.value);
  }

  function setTheme(newTheme) {
    if (["light", "dark", "system"].includes(newTheme)) {
      theme.value = newTheme;
      updateTheme();
      localStorage.setItem("theme", newTheme);
    }
  }

  function updateTheme() {
    const root = document.documentElement;
    const isDark =
      theme.value === "dark" ||
      (theme.value === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (isDark) {
      root.classList.add("dark");
      document.body.classList.add("dark");
    } else {
      root.classList.remove("dark");
      document.body.classList.remove("dark");
    }
  }

  function getInitialTheme() {
    const stored = localStorage.getItem("theme");
    if (stored && ["light", "dark", "system"].includes(stored)) {
      return stored;
    }
    return "system";
  }

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value;
  }

  function closeSidebar() {
    sidebarOpen.value = false;
  }

  function openModal(modalId) {
    modals.value = { ...modals.value, [modalId]: true };
  }

  function closeModal(modalId) {
    modals.value = { ...modals.value, [modalId]: false };
  }

  function closeAllModals() {
    Object.keys(modals.value).forEach((modalId) => {
      modals.value[modalId] = false;
    });
  }

  function addNotification(notification) {
    const id = Date.now().toString();
    const newNotification = {
      id,
      timestamp: new Date(),
      autoClose: notification.autoClose !== false,
      duration: notification.duration || 5000,
      ...notification,
    };

    notifications.value.push(newNotification);

    // Auto-remove notification
    if (newNotification.autoClose) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }

  function removeNotification(notificationId) {
    const index = notifications.value.findIndex((n) => n.id === notificationId);
    if (index !== -1) {
      notifications.value.splice(index, 1);
    }
  }

  function clearNotifications() {
    notifications.value = [];
  }

  function setGlobalLoading(loading, message = "") {
    isGlobalLoading.value = loading;
    loadingMessage.value = message;
  }

  // Initialize theme on store creation
  updateTheme();

  // Watch for system theme changes
  if (typeof window !== "undefined") {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", () => {
        if (theme.value === "system") {
          updateTheme();
        }
      });
  }

  return {
    // State
    theme,
    sidebarOpen,
    modals,
    notifications,
    isGlobalLoading,
    loadingMessage,

    // Getters
    isDarkMode,
    activeModals,
    hasActiveModals,

    // Actions
    toggleTheme,
    setTheme,
    toggleSidebar,
    closeSidebar,
    openModal,
    closeModal,
    closeAllModals,
    addNotification,
    removeNotification,
    clearNotifications,
    setGlobalLoading,
  };
});
