<template>
  <div class="atempo-cal">
    <!-- Navigation Bar -->
    <NavigationBar
      :current-date="currentDate"
      :config="mergedConfig"
      :loading="loading"
      @navigate-previous="navigatePrevious"
      @navigate-next="navigateNext"
      @navigate-today="navigateToday"
      @date-change="handleDateChange"
      @export-pdf="handleExportPdf"
    />

    <!-- Main Calendar Content -->
    <div class="atempo-cal-content relative">
      <!-- Loading Overlay -->
      <div v-if="loading" class="atempo-cal-loading-overlay">
        <div class="atempo-cal-loading">
          <div class="atempo-cal-spinner"></div>
        </div>
      </div>

      <!-- Calendar Views -->
      <WeeklyView
        :key="'week-' + currentDate.toString()"
        :events="filteredEvents"
        :resources="resources"
        :week-start="visibleRange.start"
        :on-prev-week="navigatePrevious"
        :on-next-week="navigateNext"
        :on-date-select="(date) => navigateToDate(date)"
        :readonly="readonly"
        :special-event-colors="specialEventColors"
        :max-workers-before-scroll="mergedConfig.maxWorkersBeforeScroll"
        :fixed-height="mergedConfig.fixedHeight"
        :enable-auto-scroll="mergedConfig.enableAutoScroll"
        @event-click="handleEventClick"
        @event-create="handleEventCreate"
        @event-update="handleEventUpdate"
        @event-delete="handleEventDelete"
        @slot-click="handleSlotClick"
      />
    </div>


  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, provide } from 'vue'
import atemporal from 'atemporal'
import type {
  CalendarEvent,
  CalendarResource,
  CalendarConfig,
  EventAction,
  CustomField,
  SlotClickInfo,
  SpecialEventColors
} from './types'
import { useCalendar } from './composables/useCalendar'
import { useEvents } from './composables/useEvents'
import { useTheme } from './composables/useTheme'
import NavigationBar from './components/NavigationBar.vue'
import WeeklyView from './components/WeeklyView.vue'

/**
 * AtempoCal - Main calendar component
 * A highly customizable Vue 3 calendar component with atemporal integration
 */

// Component props with defaults
interface Props {
  events?: CalendarEvent[]
  resources?: CalendarResource[]
  config?: Partial<CalendarConfig>
  selectedDate?: string
  eventActions?: EventAction[]
  customFields?: CustomField[]
  loading?: boolean
  readonly?: boolean
  theme?: 'light' | 'dark' | 'auto'
  specialEventColors?: Partial<SpecialEventColors>
}

const props = withDefaults(defineProps<Props>(), {
  events: () => [],
  resources: () => [],
  config: () => ({}),
  selectedDate: undefined,
  eventActions: () => [],
  customFields: () => [],
  loading: false,
  readonly: false,
  theme: 'auto',
  specialEventColors: () => ({})
})

// Component emits
interface Emits {
  'event-click': [event: CalendarEvent]
  'event-create': [eventData: Partial<CalendarEvent>]
  'event-update': [event: CalendarEvent]
  'event-delete': [event: CalendarEvent]
  'date-change': [date: string]
  'slot-click': [slotInfo: SlotClickInfo]
  'config-change': [config: Partial<CalendarConfig>]
}

const emit = defineEmits<Emits>()

// Default configuration for weekly scheduling calendar
const defaultConfig: CalendarConfig = {
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  locale: 'en',
  theme: 'auto',
  showWeekends: true,
  firstDayOfWeek: 1 // Monday
}

// Merged configuration
const mergedConfig = computed(() => ({
  ...defaultConfig,
  ...props.config,
  specialEventColors: props.specialEventColors
}))

// Initialize composables
const {
  currentDate,
  visibleRange,
  navigateToDate,
  navigatePrevious,
  navigateNext,
  navigateToday
} = useCalendar(
  props.selectedDate,
  'week',
  mergedConfig.value.timezone
)

const {
  filteredEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  setEvents
} = useEvents(props.events)

const {
  currentTheme,
  toggleTheme,
  setTheme
} = useTheme(props.theme)

// Watch for prop changes
watch(() => props.events, (newEvents) => {
  setEvents(newEvents)
}, { deep: true })

watch(() => props.selectedDate, (newDate) => {
  if (newDate) {
    navigateToDate(atemporal(newDate))
  }
})

// Emit initial values
watch(currentDate, (newDate) => {
  emit('date-change', newDate.toString())
}, { immediate: true })

// Event handlers
const handleEventClick = (event: CalendarEvent): void => {
  emit('event-click', event)
}

const handleEventCreate = (eventData: Partial<CalendarEvent>): void => {
  createEvent(eventData)
  emit('event-create', eventData)
}

const handleEventUpdate = (event: CalendarEvent): void => {
  updateEvent(event)
  emit('event-update', event)
}

const handleEventDelete = (event: CalendarEvent): void => {
  deleteEvent(event.id)
  emit('event-delete', event)
}

const handleSlotClick = (slotInfo: SlotClickInfo): void => {
  emit('slot-click', slotInfo)
}

const handleDateChange = (date: string): void => {
  navigateToDate(atemporal(date))
}

/**
 * Handle PDF export by creating a print-optimized version of the calendar
 * This function isolates the AtempoCal component and switches to light mode for printing
 */
const handleExportPdf = (): void => {
  // Store current theme to restore later
  const originalTheme = currentTheme.value
  
  // Create a print-specific container
  const printContainer = document.createElement('div')
  printContainer.className = 'atempo-cal-print-container'
  printContainer.style.display = 'none'
  
  // Clone the calendar element
  const calendarElement = document.querySelector('.atempo-cal')
  if (!calendarElement) {
    // Calendar element not found for PDF export
    return
  }
  
  const calendarClone = calendarElement.cloneNode(true) as HTMLElement
  
  // Apply print-specific classes and light theme
  calendarClone.classList.add('atempo-cal-print-mode')
  calendarClone.setAttribute('data-theme', 'light')
  
  // Add the clone to the print container
  printContainer.appendChild(calendarClone)
  document.body.appendChild(printContainer)
  
  // Temporarily switch to light mode for better print quality
  setTheme('light')
  
  // Add print-specific styles to the document
  const printStyles = document.createElement('style')
  printStyles.id = 'atempo-cal-print-styles'
  printStyles.textContent = `
    @page {
      size: A4 landscape;
      margin: 0.3in;
    }
    
    @media print {
      /* Hide everything except the print container */
      body > *:not(.atempo-cal-print-container) {
        display: none !important;
      }
      
      /* Reset body margins and padding */
      body {
        margin: 0 !important;
        padding: 0 !important;
      }
      
      /* Show and style the print container */
      .atempo-cal-print-container {
        display: block !important;
        position: static !important;
        width: 100% !important;
        height: auto !important;
        margin: 0 !important;
        padding: 0 !important;
        page-break-inside: avoid;
      }
      
      /* Ensure the calendar fills the print area */
      .atempo-cal-print-mode {
        width: 100% !important;
        height: auto !important;
        min-height: auto !important;
        max-height: none !important;
        overflow: visible !important;
        box-shadow: none !important;
        border: none !important;
        border-radius: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        page-break-inside: avoid;
      }
    }
  `
  document.head.appendChild(printStyles)
  
  // Use setTimeout to ensure DOM updates are complete before printing
  setTimeout(() => {
    // Trigger print dialog
    window.print()
    
    // Clean up after printing (with a delay to ensure print dialog has processed)
    setTimeout(() => {
      // Remove print-specific elements
      document.body.removeChild(printContainer)
      const printStylesElement = document.getElementById('atempo-cal-print-styles')
      if (printStylesElement) {
        document.head.removeChild(printStylesElement)
      }
      
      // Restore original theme
      setTheme(originalTheme)
    }, 1000)
  }, 200)
}

// Watch for theme prop changes
watch(() => props.theme, (newTheme) => {
  if (newTheme) {
    setTheme(newTheme)
  }
})

// Provide calendar context to child components
provide('calendar-config', mergedConfig)
provide('calendar-theme', currentTheme)
provide('calendar-readonly', computed(() => props.readonly))

// Component lifecycle
onMounted(() => {
  // Initialize any additional setup if needed
  // eslint-disable-next-line no-console
  console.log('AtempoCal mounted with config:', mergedConfig.value)
})

// Expose public methods for parent components
defineExpose({
  navigateToDate,
  navigatePrevious,
  navigateNext,
  navigateToday,
  toggleTheme,
  getCurrentDate: () => currentDate.value,
  getVisibleRange: () => visibleRange.value,
  getEvents: () => filteredEvents.value,
  createEvent,
  updateEvent,
  deleteEvent
})
</script>

<style scoped>
@reference "tailwindcss";

.atempo-cal {
  background-color: var(--atempo-bg-primary);
  color: var(--atempo-text-primary);
  min-height: 100%;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  border: 1px solid var(--atempo-border-primary);
  overflow: hidden;
}

.atempo-cal-content {
  background-color: var(--atempo-bg-primary);
  min-height: 24rem;
}

.atempo-cal-loading-overlay {
  position: absolute;
  inset: 0;
  background-color: color-mix(in srgb, var(--atempo-bg-primary) 50%, transparent);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
}

.atempo-cal-spinner {
  width: 2rem;
  height: 2rem;
  border: 4px solid color-mix(in srgb, var(--atempo-accent-primary) 20%, transparent);
  border-top-color: var(--atempo-accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Transition animations */
.atempo-cal-fade-enter-active,
.atempo-cal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.atempo-cal-fade-enter-from,
.atempo-cal-fade-leave-to {
  opacity: 0;
}

.atempo-cal-slide-enter-active,
.atempo-cal-slide-leave-active {
  transition: transform 0.3s ease;
}

.atempo-cal-slide-enter-from {
  transform: translateX(100%);
}

.atempo-cal-slide-leave-to {
  transform: translateX(100%);
}

/* Print styles for PDF export */
@media print {
  @page {
    size: A4 landscape;
    margin: 0.3in;
  }
  
  /* Reset body and html for print */
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    height: auto !important;
  }
  
  /* Force light theme colors for print */
  .atempo-cal,
  .atempo-cal-print-mode {
    /* Light theme CSS variables for print */
    --atempo-bg-primary: #ffffff !important;
    --atempo-bg-secondary: #f8fafc !important;
    --atempo-bg-tertiary: #f1f5f9 !important;
    --atempo-text-primary: #1f2937 !important;
    --atempo-text-secondary: #6b7280 !important;
    --atempo-text-tertiary: #9ca3af !important;
    --atempo-border-primary: #e5e7eb !important;
    --atempo-border-secondary: #d1d5db !important;
    --atempo-accent-primary: #3b82f6 !important;
    --atempo-accent-secondary: #1d4ed8 !important;
    --atempo-nav-bg: #ffffff !important;
    
    /* Base styles */
    height: auto !important;
    min-height: auto !important;
    max-height: none !important;
    overflow: visible !important;
    box-shadow: none !important;
    border: 1px solid #e5e7eb !important;
    border-radius: 0 !important;
    background: #ffffff !important;
    color: #1f2937 !important;
    page-break-inside: avoid;
    margin: 0 !important;
    padding: 0 !important;
  }
  
  .atempo-cal-content {
    height: auto !important;
    min-height: auto !important;
    max-height: none !important;
    overflow: visible !important;
    position: static !important;
    background: #ffffff !important;
  }
  
  /* Hide loading overlay in print */
  .atempo-cal-loading-overlay {
    display: none !important;
  }
  
  /* Force light theme for all calendar elements */
  .atempo-cal * {
    color-adjust: exact !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  
  /* Ensure navigation bar uses light theme */
  .atempo-cal-nav {
    background-color: #ffffff !important;
    color: #1f2937 !important;
    border-bottom: 1px solid #e5e7eb !important;
  }
  
  /* Ensure proper contrast for text elements */
  .nav-title,
  .resource-info h3,
  .resource-info p {
    color: #1f2937 !important;
  }
  
  /* Force light theme for event cards */
  .event-card {
    background-color: #f8fafc !important;
    border: 1px solid #e5e7eb !important;
    color: #1f2937 !important;
  }
  
  /* Ensure grid lines are visible */
  .time-grid-line,
  .day-column-border {
    border-color: #e5e7eb !important;
  }
}
</style>