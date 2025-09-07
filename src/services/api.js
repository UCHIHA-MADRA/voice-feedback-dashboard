// src/services/api.js

import axios from 'axios'
import { useUiStore } from '@/stores/ui'

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000, // 30 seconds for file uploads
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Add request timestamp for performance tracking
    config.metadata = { startTime: Date.now() }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const duration = Date.now() - response.config.metadata.startTime
    console.log(`API Request took ${duration}ms:`, response.config.url)
    
    return response
  },
  (error) => {
    const uiStore = useUiStore()
    
    // Handle different error types
    if (error.code === 'ECONNABORTED') {
      uiStore.addNotification({
        type: 'error',
        title: 'Request Timeout',
        message: 'The request took too long to complete. Please try again.',
        duration: 8000
      })
    } else if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      
      switch (status) {
        case 400:
          uiStore.addNotification({
            type: 'error',
            title: 'Bad Request',
            message: data.message || 'Invalid request parameters.',
            duration: 6000
          })
          break
          
        case 401:
          uiStore.addNotification({
            type: 'error',
            title: 'Unauthorized',
            message: 'Please check your authentication credentials.',
            duration: 6000
          })
          // Clear auth token
          localStorage.removeItem('auth_token')
          break
          
        case 403:
          uiStore.addNotification({
            type: 'error',
            title: 'Forbidden',
            message: 'You do not have permission to access this resource.',
            duration: 6000
          })
          break
          
        case 404:
          uiStore.addNotification({
            type: 'error',
            title: 'Not Found',
            message: 'The requested resource was not found.',
            duration: 5000
          })
          break
          
        case 413:
          uiStore.addNotification({
            type: 'error',
            title: 'File Too Large',
            message: 'The uploaded file exceeds the maximum size limit.',
            duration: 6000
          })
          break
          
        case 429:
          uiStore.addNotification({
            type: 'warning',
            title: 'Rate Limited',
            message: 'Too many requests. Please wait before trying again.',
            duration: 8000
          })
          break
          
        case 500:
          uiStore.addNotification({
            type: 'error',
            title: 'Server Error',
            message: 'An internal server error occurred. Please try again later.',
            duration: 8000
          })
          break
          
        default:
          uiStore.addNotification({
            type: 'error',
            title: 'Request Failed',
            message: data.message || 'An unexpected error occurred.',
            duration: 6000
          })
      }
    } else if (error.request) {
      // Network error
      uiStore.addNotification({
        type: 'error',
        title: 'Network Error',
        message: 'Unable to connect to the server. Please check your internet connection.',
        duration: 10000
      })
    }
    
    return Promise.reject(error)
  }
)

export default api
