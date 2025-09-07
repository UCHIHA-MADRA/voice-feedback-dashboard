// src/composables/useDebounce.js

import { ref, watch } from "vue";

/**
 * Debounce a reactive value
 * @param {Ref} value - Reactive value to debounce
 * @param {number} delay - Debounce delay in milliseconds
 * @returns {Ref} Debounced reactive value
 */
export function useDebounce(value, delay = 300) {
  const debouncedValue = ref(value.value);
  let timeoutId = null;

  watch(value, (newValue) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      debouncedValue.value = newValue;
    }, delay);
  });

  return debouncedValue;
}
