// src/composables/useIntersectionObserver.js
import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Intersection Observer composable for lazy loading and animations
 * @param {Object} options - Observer options
 * @returns {Object} Observer utilities
 */
export function useIntersectionObserver(options = {}) {
  const isVisible = ref(false)
  const target = ref(null)
  let observer = null
  
  const defaultOptions = {
    threshold: 0.1,
    rootMargin: '0px',
    ...options
  }
  
  onMounted(() => {
    if (!target.value) return
    
    observer = new IntersectionObserver(([entry]) => {
      isVisible.value = entry.isIntersecting
      
      if (options.once && entry.isIntersecting) {
        observer.unobserve(target.value)
      }
    }, defaultOptions)
    
    observer.observe(target.value)
  })
  
  onUnmounted(() => {
    if (observer && target.value) {
      observer.unobserve(target.value)
    }
  })
  
  return {
    target,
    isVisible
  }
}



