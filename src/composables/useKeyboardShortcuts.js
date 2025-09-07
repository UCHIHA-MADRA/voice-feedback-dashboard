// src/composables/useKeyboardShortcuts.js

import { onMounted, onUnmounted } from 'vue'

/**
 * Keyboard shortcuts composable
 * @param {Object} shortcuts - Map of key combinations to handlers
 */
export function useKeyboardShortcuts(shortcuts) {
  function handleKeydown(event) {
    const key = event.key.toLowerCase()
    const modifiers = {
      ctrl: event.ctrlKey,
      meta: event.metaKey,
      alt: event.altKey,
      shift: event.shiftKey
    }
    
    // Check each shortcut
    Object.entries(shortcuts).forEach(([combination, handler]) => {
      const parts = combination.toLowerCase().split('+')
      const targetKey = parts.pop()
      const requiredModifiers = parts
      
      // Check if key matches
      if (key !== targetKey) return
      
      // Check if all required modifiers are pressed
      const modifierMatch = requiredModifiers.every(mod => {
        switch (mod) {
          case 'ctrl':
          case 'cmd':
            return modifiers.ctrl || modifiers.meta
          case 'alt':
            return modifiers.alt
          case 'shift':
            return modifiers.shift
          default:
            return false
        }
      })
      
      // Check if no extra modifiers are pressed
      const extraModifiers = Object.entries(modifiers).some(([mod, pressed]) => {
        if (!pressed) return false
        
        const isRequired = requiredModifiers.some(req => {
          return (req === mod) || 
                 (req === 'cmd' && mod === 'meta') || 
                 (req === 'ctrl' && mod === 'ctrl')
        })
        
        return !isRequired
      })
      
      if (modifierMatch && !extraModifiers) {
        event.preventDefault()
        handler(event)
      }
    })
  }
  
  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
  })
  
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })
}



