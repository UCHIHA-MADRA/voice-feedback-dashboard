
// src/composables/useNotifications.js
import { useUiStore } from '@/stores/ui'

export function useNotifications() {
  const uiStore = useUiStore()
  
  function showNotification(type, title, message, options = {}) {
    return uiStore.addNotification({
      type,
      title,
      message,
      ...options
    })
  }
  
  function showSuccess(message, options = {}) {
    return showNotification('success', 'Success', message, {
      duration: 4000,
      ...options
    })
  }
  
  function showError(message, options = {}) {
    return showNotification('error', 'Error', message, {
      duration: 6000,
      ...options
    })
  }
  
  function showWarning(message, options = {}) {
    return showNotification('warning', 'Warning', message, {
      duration: 5000,
      ...options
    })
  }
  
  function showInfo(message, options = {}) {
    return showNotification('info', 'Information', message, {
      duration: 4000,
      ...options
    })
  }
  
  function clearNotifications() {
    uiStore.clearNotifications()
  }
  
  return {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearNotifications
  }
}

