/**
 * AtempoCal - Vue 3 Calendar Component Library
 * 
 * A highly customizable calendar component built with Vue 3, TypeScript,
 * Tailwind CSS, and the Atemporal library for date/time operations.
 * 
 * @author AtempoCal Team
 * @version 1.0.0
 * @license MIT
 */

import type { App } from 'vue'
import AtempoCal from './AtempoCal.vue'

// Export the component
export { AtempoCal }

// Export all types for TypeScript users
export type {
  CalendarEvent,
  CalendarResource,
  CalendarConfig,
  CalendarView,
  EventAction,
  CustomField,
  SlotClickInfo,
  AtempocalProps
} from './types'

// Export composables for advanced usage
export { useCalendar } from './composables/useCalendar'
export { useEvents } from './composables/useEvents'
export { useTheme } from './composables/useTheme'

// Export utilities
export * from './utils/dateHelpers'
export * from './utils/eventHelpers'

/**
 * Vue plugin installation function
 * Allows global registration of the component
 * 
 * @example
 * ```typescript
 * import { createApp } from 'vue'
 * import AtempoCal from 'atempo-cal'
 * import 'atempo-cal/dist/style.css'
 * 
 * const app = createApp(App)
 * app.use(AtempoCal)
 * ```
 */
const install = (app: App): void => {
  app.component('AtempoCal', AtempoCal)
}

// Plugin interface
interface AtempocalPluginInterface {
  install: (app: App) => void
  AtempoCal: typeof AtempoCal
}

// Default export for plugin usage
const AtempocalPlugin: AtempocalPluginInterface = {
  install,
  AtempoCal
}

export default AtempocalPlugin