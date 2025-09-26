import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

/**
 * Demo application entry point
 * Bootstraps the AtempoCal demo with Vue 3
 */

const app = createApp(App)

// Mount the application
app.mount('#app')

// Log demo information
// Development mode logging
// AtempoCal Demo Started

if (import.meta.env.DEV) {
  // Development mode enabled
  // Make app instance available globally for debugging
  ;(window as any).__ATEMPO_CAL_APP__ = app
}