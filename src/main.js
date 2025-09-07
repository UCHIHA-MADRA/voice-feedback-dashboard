    // src/main.js

    import { createApp } from 'vue'
    import { createPinia } from 'pinia'
    import App from './App.vue'
    import router from './router'
    import './assets/css/main.css'

    // Global error handling
    const app = createApp(App)

    app.config.errorHandler = (err, vm, info) => {
    console.error('Global error:', err)
    console.error('Component info:', info)
    
    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
        // sendToMonitoringService(err, vm, info)
    }
    }

    app.use(createPinia())
    app.use(router)

    app.mount('#app')