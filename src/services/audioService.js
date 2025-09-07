

// src/services/audioService.js
/**
 * Audio recording and processing service
 * Provides functionality for recording, analyzing and processing audio input
 */

export const audioService = {
  isRecordingSupported() {
    try {
      // Check for basic MediaRecorder support
      if (typeof MediaRecorder === 'undefined') {
        console.warn('MediaRecorder API not supported')
        return false
      }
      
      // Check for getUserMedia support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn('getUserMedia API not supported')
        return false
      }
      
      // Check for at least one supported MIME type
      const supportedMimeType = this.getSupportedMimeType()
      if (!MediaRecorder.isTypeSupported(supportedMimeType)) {
        console.warn('No supported audio MIME types found')
        return false
      }
      
      // Check if we're in a secure context (required for getUserMedia)
      if (!window.isSecureContext && location.protocol !== 'https:' && location.hostname !== 'localhost') {
        console.warn('Audio recording requires HTTPS or localhost')
        return false
      }
      
      return true
    } catch (error) {
      console.error('Error checking recording support:', error)
      return false
    }
  },

  /**
   * Request microphone permission
   * @returns {Promise<boolean>} Whether permission was granted
   */
  async requestMicrophonePermission() {
    try {
      // Check if permissions API is available
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'microphone' })
        if (permission.state === 'denied') {
          throw new Error('Microphone permission permanently denied')
        }
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })
      
      // Stop the stream immediately as we only wanted to check permission
      stream.getTracks().forEach(track => track.stop())
      return true
    } catch (error) {
      console.error('Microphone permission error:', error)
      
      // Provide more specific error messages
      if (error.name === 'NotAllowedError') {
        throw new Error('Microphone access denied by user')
      } else if (error.name === 'NotFoundError') {
        throw new Error('No microphone found on this device')
      } else if (error.name === 'NotReadableError') {
        throw new Error('Microphone is already in use by another application')
      } else if (error.name === 'OverconstrainedError') {
        throw new Error('Microphone constraints cannot be satisfied')
      } else {
        throw new Error('Failed to access microphone: ' + error.message)
      }
    }
  },

  /**
   * Start audio recording
   * @param {Object} options - Recording options
   * @returns {Promise<Object>} Recording controller
   */
  async startRecording(options = {}) {
    if (!this.isRecordingSupported()) {
      throw new Error('Audio recording is not supported in this browser')
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const chunks = []
      const mimeType = this.getSupportedMimeType()
      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      let startTime = null
      let pausedDuration = 0
      let pauseStartTime = null
      let recordingDuration = 0
      
      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }
      
      // Start recording
      mediaRecorder.start(1000) // Collect data every second
      startTime = Date.now()
      
      if (options.onStart) {
        options.onStart()
      }
      
      // Return controller object
      return {
        pause: () => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.pause()
            pauseStartTime = Date.now()
            if (options.onPause) {
              options.onPause()
            }
          }
        },
        resume: () => {
          if (mediaRecorder.state === 'paused') {
            mediaRecorder.resume()
            pausedDuration += Date.now() - pauseStartTime
            pauseStartTime = null
            if (options.onResume) {
              options.onResume()
            }
          }
        },
        stop: () => {
          return new Promise((resolve) => {
            mediaRecorder.onstop = async () => {
              // Stop all tracks
              stream.getTracks().forEach(track => track.stop())
              
              // Create blob from chunks
              const blob = new Blob(chunks, { type: mimeType })
              
              // Calculate actual duration
              const endTime = Date.now()
              const totalDuration = endTime - startTime - pausedDuration
              
              if (options.onStop) {
                options.onStop(blob, totalDuration)
              }
              
              resolve({ blob, duration: totalDuration })
            }
            
            if (mediaRecorder.state !== 'inactive') {
              mediaRecorder.stop()
            } else {
              resolve({ blob: null, duration: 0 })
            }
          })
        },
        getState: () => mediaRecorder.state,
        getStream: () => stream,
        getDuration: () => {
          if (!startTime) return 0
          
          const now = Date.now()
          let currentDuration = now - startTime - pausedDuration
          
          if (pauseStartTime) {
            // If currently paused, don't count time since pause started
            currentDuration -= (now - pauseStartTime)
          }
          
          return Math.floor(currentDuration / 1000) // Return in seconds
        }
      }
    } catch (error) {
      console.error('Failed to start recording:', error)
      
      // Provide more specific error messages
      if (error.name === 'NotAllowedError') {
        throw new Error('Microphone access denied. Please allow microphone access and try again.')
      } else if (error.name === 'NotFoundError') {
        throw new Error('No microphone found. Please connect a microphone and try again.')
      } else if (error.name === 'NotReadableError') {
        throw new Error('Microphone is already in use by another application.')
      } else if (error.name === 'OverconstrainedError') {
        throw new Error('Microphone constraints cannot be satisfied. Please check your microphone settings.')
      } else if (error.name === 'SecurityError') {
        throw new Error('Audio recording is not allowed in this context. Please use HTTPS or localhost.')
      } else {
        throw new Error('Failed to start recording: ' + (error.message || 'Unknown error'))
      }
    }
  },

  /**
   * Create audio file from blob
   * @param {Blob} blob - Audio blob
   * @param {string} filename - Desired filename
   * @returns {File} Audio file
   */
  createAudioFile(blob, filename = 'recording') {
    if (!blob || blob.size === 0) {
      throw new Error('Invalid audio blob: empty or null')
    }
    
    const extension = this.getFileExtension(blob.type)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const finalFilename = `${filename}-${timestamp}.${extension}`
    
    return new File([blob], finalFilename, {
      type: blob.type,
      lastModified: Date.now()
    })
  },

  /**
   * Get file extension from MIME type
   * @param {string} mimeType - MIME type
   * @returns {string} File extension
   */
  getFileExtension(mimeType) {
    const extensions = {
      'audio/webm': 'webm',
      'audio/mp4': 'm4a',
      'audio/ogg': 'ogg',
      'audio/wav': 'wav',
      'audio/mpeg': 'mp3'
    }
    
    return extensions[mimeType] || 'webm'
  },
  
  /**
   * Check if microphone is available and accessible
   * @returns {Promise<boolean>} Whether microphone is available
   */
  async checkMicrophoneAvailability() {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        return false
      }
      
      const devices = await navigator.mediaDevices.enumerateDevices()
      const audioInputs = devices.filter(device => device.kind === 'audioinput')
      
      return audioInputs.length > 0
    } catch (error) {
      console.error('Error checking microphone availability:', error)
      return false
    }
  },

  /**
   * Get supported MIME type for audio recording
   * @returns {string} Supported MIME type
   */
  getSupportedMimeType() {
    // Check if MediaRecorder is available
    if (typeof MediaRecorder === 'undefined') {
      console.warn('MediaRecorder is not supported in this browser');
      return 'audio/webm'; // Return default even though it won't work
    }
    
    // Prioritize MIME types based on browser compatibility and quality
    const mimeTypes = [
      'audio/webm;codecs=opus',  // Best quality, widely supported
      'audio/webm',              // Fallback webm
      'audio/mp4;codecs=mp4a.40.2', // Good quality, iOS support
      'audio/mp4',               // Fallback mp4
      'audio/ogg;codecs=opus',   // Good quality, Firefox
      'audio/ogg',               // Fallback ogg
      'audio/wav',               // Uncompressed, large files
      'audio/mpeg'               // MP3, limited support
    ]
    
    try {
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          console.log(`Using MIME type: ${mimeType}`)
          return mimeType
        }
      }
    } catch (error) {
      console.error('Error checking supported MIME types:', error);
    }
    
    // Fallback to default
    console.warn('No supported MIME types found, using default: audio/webm')
    return 'audio/webm'
  },

  /**
   * Get recording quality information
   * @returns {Object} Quality information
   */
  getRecordingQualityInfo() {
    const mimeType = this.getSupportedMimeType()
    
    const qualityInfo = {
      mimeType,
      extension: this.getFileExtension(mimeType),
      isHighQuality: mimeType.includes('opus') || mimeType.includes('mp4a'),
      estimatedBitrate: this.estimateBitrate(mimeType),
      browserSupport: this.getBrowserSupportInfo()
    }
    
    return qualityInfo
  },

  /**
   * Estimate bitrate for MIME type
   * @param {string} mimeType - MIME type
   * @returns {number} Estimated bitrate in kbps
   */
  estimateBitrate(mimeType) {
    if (mimeType.includes('opus')) return 64
    if (mimeType.includes('mp4a')) return 128
    if (mimeType.includes('webm')) return 96
    if (mimeType.includes('ogg')) return 64
    if (mimeType.includes('wav')) return 1411
    return 64 // Default
  },

  /**
   * Get browser support information
   * @returns {Object} Browser support info
   */
  getBrowserSupportInfo() {
    const userAgent = navigator.userAgent.toLowerCase()
    
    return {
      isChrome: userAgent.includes('chrome'),
      isFirefox: userAgent.includes('firefox'),
      isSafari: userAgent.includes('safari') && !userAgent.includes('chrome'),
      isEdge: userAgent.includes('edge'),
      isMobile: /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
    }
  }
}