// src/composables/useAsync.js

import { ref, computed } from 'vue'

/**
 * Async operation composable with loading and error states
 * @param {Function} asyncFn - Async function to execute
 * @param {Object} options - Options
 * @returns {Object} Async state and methods
 */
export function useAsync(asyncFn, options = {}) {
  const { immediate = false, resetOnExecute = true } = options
  
  const loading = ref(false)
  const error = ref(null)
  const data = ref(null)
  
  const isReady = computed(() => !loading.value && data.value !== null)
  const isError = computed(() => !!error.value)
  
  async function execute(...args) {
    try {
      if (resetOnExecute) {
        data.value = null
        error.value = null
      }
      
      loading.value = true
      const result = await asyncFn(...args)
      data.value = result
      return result
      
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }
  
  function reset() {
    loading.value = false
    error.value = null
    data.value = null
  }
  
  if (immediate) {
    execute()
  }
  
  return {
    loading,
    error,
    data,
    isReady,
    isError,
    execute,
    reset
  }
}