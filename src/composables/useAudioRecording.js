
// src/composables/useAudioRecording.js
import { ref, computed, onUnmounted } from 'vue'
import { audioService } from '@/services/audioService'
import { useNotifications } from './useNotifications'

export function useAudioRecording() {
  const { showSuccess, showError, showInfo } = useNotifications()
  
  // State
  const isRecording = ref(false)
  const isPaused = ref(false)
  const duration = ref(0)
  const recordedBlob = ref(null)
  const recordingController = ref(null)
  const permissionGranted = ref(null)
  const isSupported = ref(audioService.isRecordingSupported())
  
  // Timer
  let durationTimer = null
  
  // Computed
  const canRecord = computed(() => 
    isSupported.value && 
    (permissionGranted.value === true || permissionGranted.value === null) && 
    !isRecording.value
  )
  
  const canStop = computed(() => isRecording.value || isPaused.value)
  const canPause = computed(() => isRecording.value && !isPaused.value)
  const canResume = computed(() => isPaused.value)
  const hasRecording = computed(() => !!recordedBlob.value)
  
  const formattedDuration = computed(() => formatDuration(duration.value))
  
  // Request microphone permission
  async function requestPermission() {
    if (!isSupported.value) {
      showError('Audio recording is not supported in this browser')
      return false
    }
    
    try {
      const granted = await audioService.requestMicrophonePermission()
      permissionGranted.value = granted
      
      if (granted) {
        showSuccess('Microphone access granted')
      } else {
        showError('Microphone access denied. Please allow microphone access to record audio.')
      }
      
      return granted
    } catch (error) {
      console.error('Permission request failed:', error)
      permissionGranted.value = false
      
      // Show more specific error messages
      if (error.message.includes('permanently denied')) {
        showError('Microphone access is permanently denied. Please enable it in your browser settings.')
      } else if (error.message.includes('No microphone found')) {
        showError('No microphone detected. Please connect a microphone and try again.')
      } else if (error.message.includes('already in use')) {
        showError('Microphone is being used by another application. Please close other apps and try again.')
      } else {
        showError('Failed to access microphone: ' + error.message)
      }
      
      return false
    }
  }
  
  // Start recording
  async function startRecording(options = {}) {
    console.log('Attempting to start recording...');
    console.log('isSupported:', isSupported.value);
    console.log('permissionGranted:', permissionGranted.value);
    console.log('canRecord:', canRecord.value);

    // Check if recording is supported first
    if (!isSupported.value) {
      showError('Audio recording is not supported in this browser')
      return null
    }
    
    // Check if we have permission or need to request it
    if (permissionGranted.value === null) {
      const granted = await requestPermission()
      if (!granted) {
        showError('Microphone access is required for recording')
        return null
      }
    } else if (!permissionGranted.value) {
      showError('Microphone access is required for recording')
      return null
    }
    
    // Check if we can record
    if (!canRecord.value) {
      showError('Cannot start recording at this time')
      return null
    }
    
    try {
      // Clear any previous recording state
      if (recordingController.value) {
        try {
          await stopRecording()
        } catch (e) {
          console.warn('Failed to stop previous recording:', e)
          // Continue with new recording attempt
        }
      }
      
      resetRecording()
      
      recordingController.value = await audioService.startRecording({
        ...options,
        onStart: () => {
          isRecording.value = true
          isPaused.value = false
          duration.value = 0
          startDurationTimer()
          showInfo('Recording started')
        },
        onStop: () => {
          isRecording.value = false
          isPaused.value = false
          stopDurationTimer()
        },
        onError: (error) => {
          console.error('Recording error:', error)
          showError('Recording failed: ' + error.message)
          resetRecording()
        }
      })
      
      return recordingController.value
      
    } catch (error) {
      console.error('Failed to start recording:', error)
      showError('Failed to start recording: ' + error.message)
      resetRecording()
      return null
    }
  }
  
  // Stop recording
  async function stopRecording() {
    if (!recordingController.value || !canStop.value) return null
    
    try {
      const result = await recordingController.value.stop()
      recordedBlob.value = result.blob
      
      showSuccess(`Recording completed (${formatDuration(result.duration)})`)
      
      return result
      
    } catch (error) {
      console.error('Failed to stop recording:', error)
      showError('Failed to stop recording: ' + (error.message || 'Unknown error'))
      resetRecording()
      throw error
    } finally {
      recordingController.value = null
      stopDurationTimer()
    }
  }
  
  // Pause recording
  function pauseRecording() {
    if (!recordingController.value || !canPause.value) {
      console.warn('Cannot pause recording: invalid state')
      return false
    }
    
    try {
      recordingController.value.pause()
      isPaused.value = true
      stopDurationTimer()
      showInfo('Recording paused')
      return true
    } catch (error) {
      console.error('Failed to pause recording:', error)
      showError('Failed to pause recording: ' + (error.message || 'Unknown error'))
      return false
    }
  }
  
  // Resume recording
  function resumeRecording() {
    if (!recordingController.value || !canResume.value) {
      console.warn('Cannot resume recording: invalid state')
      return false
    }
    
    try {
      recordingController.value.resume()
      isPaused.value = false
      startDurationTimer()
      showInfo('Recording resumed')
      return true
    } catch (error) {
      console.error('Failed to resume recording:', error)
      showError('Failed to resume recording: ' + (error.message || 'Unknown error'))
      return false
    }
  }
  
  // Create audio file from recording
  function createAudioFile(filename = 'recording') {
    if (!recordedBlob.value) {
      console.warn('No recorded blob available to create audio file')
      return null
    }
    
    try {
      return audioService.createAudioFile(recordedBlob.value, filename)
    } catch (error) {
      console.error('Failed to create audio file:', error)
      showError('Failed to create audio file: ' + error.message)
      return null
    }
  }
  
  // Clear recording
  function clearRecording() {
    recordedBlob.value = null
    duration.value = 0
    showInfo('Recording cleared')
  }
  
  // Validate recording quality
  function validateRecording() {
    if (!recordedBlob.value) {
      return { isValid: false, message: 'No recording available' }
    }
    
    const blob = recordedBlob.value
    const minSize = 1024 // 1KB minimum
    const maxSize = 10 * 1024 * 1024 // 10MB maximum
    
    if (blob.size < minSize) {
      return { isValid: false, message: 'Recording is too short or empty' }
    }
    
    if (blob.size > maxSize) {
      return { isValid: false, message: 'Recording is too large (max 10MB)' }
    }
    
    if (!blob.type.startsWith('audio/')) {
      return { isValid: false, message: 'Invalid audio format' }
    }
    
    return { isValid: true, message: 'Recording is valid' }
  }
  
  // Reset recording state
  function resetRecording() {
    isRecording.value = false
    isPaused.value = false
    duration.value = 0
    recordedBlob.value = null
    recordingController.value = null
    stopDurationTimer()
  }
  
  // Duration timer
  function startDurationTimer() {
    stopDurationTimer()
    durationTimer = setInterval(() => {
      if (recordingController.value && recordingController.value.getDuration) {
        duration.value = recordingController.value.getDuration()
      } else if (isRecording.value && !isPaused.value) {
        // Fallback if getDuration is not available
        duration.value += 0.1 // Increment by 0.1 seconds every 100ms
      }
    }, 100)
  }
  
  function stopDurationTimer() {
    if (durationTimer) {
      clearInterval(durationTimer)
      durationTimer = null
    }
  }
  
  // Format duration
  function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  
  // Cleanup on unmount
  onUnmounted(() => {
    if (isRecording.value || isPaused.value) {
      stopRecording()
    }
    stopDurationTimer()
  })
  
  return {
    // State
    isRecording,
    isPaused,
    duration,
    recordedBlob,
    permissionGranted,
    isSupported,
    
    // Computed
    canRecord,
    canStop,
    canPause,
    canResume,
    hasRecording,
    formattedDuration,
    
    // Methods
    requestPermission,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    createAudioFile,
    clearRecording,
    resetRecording,
    validateRecording
  }
}

