// src/composables/useLocalStorage.js

import { ref, watch, Ref } from 'vue'
import { storageService } from '@/services/storageService'

/**
 * Reactive localStorage composable
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value
 * @param {Object} options - Options
 * @returns {Ref} Reactive reference
 */
export function useLocalStorage(key, defaultValue, options = {}) {
  const { 
    serializer = JSON,
    syncAcrossTabs = true 
  } = options
  
  // Create reactive reference
  const storedValue = storageService.get(key, defaultValue)
  const state = ref(storedValue)
  
  // Watch for changes and update localStorage
  watch(state, (newValue) => {
    if (newValue === null || newValue === undefined) {
      storageService.remove(key)
    } else {
      storageService.set(key, newValue)
    }
  }, { deep: true })
  
  // Listen for changes from other tabs
  if (syncAcrossTabs && typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
      if (event.key === key) {
        const newValue = event.newValue ? serializer.parse(event.newValue) : defaultValue
        state.value = newValue
      }
    })
  }
  
  return state
}

