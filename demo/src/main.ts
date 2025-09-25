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
/* eslint-disable no-console */
console.log('🗓️ AtempoCal Demo Started')
console.log('📚 Documentation: https://github.com/your-org/atempo-cal')
console.log('🎨 Built with Vue 3 + TypeScript + Tailwind CSS')
console.log('⏰ Powered by Atemporal library')

// Development helpers
if (import.meta.env.DEV) {
  console.log('🔧 Development mode enabled')
  
  // Make app instance available globally for debugging
  ;(window as any).__ATEMPO_CAL_APP__ = app
}