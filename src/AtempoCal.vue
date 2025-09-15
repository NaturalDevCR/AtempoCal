<template>
  <div class="atempo-cal" :class="{ 'dark': isDark }">
    <!-- Navigation Bar -->
    <NavigationBar
      :current-date="currentDate"
      :current-view="currentView"
      :loading="loading"
      @navigate-previous="navigatePrevious"
      @navigate-next="navigateNext"
      @navigate-today="navigateToday"
      @date-change="handleDateChange"
      @view-change="handleViewChange"
      @toggle-config="showConfigPanel = !showConfigPanel"
    />

    <!-- Main Calendar Content -->
    <div class="atempo-cal-content relative">
      <!-- Loading Overlay -->
      <div v-if="loading" class="absolute inset-0 bg-white/50 dark:bg-gray-900/50 z-50 flex items-center justify-center">
        <div class="atempo-cal-loading">
          <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>

      <!-- Calendar Views -->
      <Transition name="atempo-cal-fade" mode="out-in">
        <WeeklyView
          v-if="currentView === 'week'"
          :key="'week-' + currentDate.toString()"
          :events="filteredEvents"
          :resources="resources"
          :config="mergedConfig"
          :current-date="currentDate"
          :visible-range="visibleRange"
          :event-actions="eventActions"
          :readonly="readonly"
          @event-click="handleEventClick"
          @event-create="handleEventCreate"
          @event-update="handleEventUpdate"
          @event-delete="handleEventDelete"
          @slot-click="handleSlotClick"
        />
        <DailyView
          v-else-if="currentView === 'day'"
          :key="'day-' + currentDate.toString()"
          :events="filteredEvents"
          :resources="resources"
          :config="mergedConfig"
          :current-date="currentDate"
          :visible-range="visibleRange"
          :event-actions="eventActions"
          :readonly="readonly"
          @event-click="handleEventClick"
          @event-create="handleEventCreate"
          @event-update="handleEventUpdate"
          @event-delete="handleEventDelete"
          @slot-click="handleSlotClick"
        />
      </Transition>
    </div>

    <!-- Configuration Panel -->
    <Transition name="atempo-cal-slide">
      <ConfigPanel
        v-if="showConfigPanel"
        :config="mergedConfig"
        :theme="currentTheme"
        @config-change="handleConfigChange"
        @theme-change="handleThemeChange"
        @close="showConfigPanel = false"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, provide } from 'vue'
import type {
  CalendarEvent,
  CalendarResource,
  CalendarConfig,
  CalendarView,
  EventAction,
  CustomField,
  SlotClickInfo
} from './types'
import { useCalendar } from './composables/useCalendar'
import { useEvents } from './composables/useEvents'
import { useTheme } from './composables/useTheme'
import NavigationBar from './components/NavigationBar.vue'
import WeeklyView from './components/WeeklyView.vue'
import DailyView from './components/DailyView.vue'
import ConfigPanel from './components/ConfigPanel.vue'

/**
 * AtempoCal - Main calendar component
 * A highly customizable Vue 3 calendar component with atemporal integration
 */

// Component props with defaults
interface Props {
  events?: CalendarEvent[]
  resources?: CalendarResource[]
  config?: Partial<CalendarConfig>
  view?: CalendarView
  selectedDate?: string
  eventActions?: EventAction[]
  customFields?: CustomField[]
  loading?: boolean
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  events: () => [],
  resources: () => [],
  config: () => ({}),
  view: 'week',
  selectedDate: undefined,
  eventActions: () => [],
  customFields: () => [],
  loading: false,
  readonly: false
})

// Component emits
interface Emits {
  'event-click': [event: CalendarEvent]
  'event-create': [eventData: Partial<CalendarEvent>]
  'event-update': [event: CalendarEvent]
  'event-delete': [event: CalendarEvent]
  'date-change': [date: string]
  'view-change': [view: CalendarView]
  'slot-click': [slotInfo: SlotClickInfo]
  'config-change': [config: Partial<CalendarConfig>]
}

const emit = defineEmits<Emits>()

// Default configuration
const defaultConfig: CalendarConfig = {
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  locale: 'en',
  theme: 'auto',
  startHour: 0,
  endHour: 24,
  slotDuration: 60,
  showWeekends: true,
  firstDayOfWeek: 1 // Monday
}

// Merged configuration
const mergedConfig = computed(() => ({
  ...defaultConfig,
  ...props.config
}))

// Initialize composables
const {
  currentDate,
  currentView,
  visibleRange,
  navigateToDate,
  navigatePrevious,
  navigateNext,
  navigateToday,
  setView
} = useCalendar(
  props.selectedDate,
  props.view,
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
  setTheme,
  isDark
} = useTheme(mergedConfig.value.theme)

// Local state
const showConfigPanel = ref(false)

// Watch for prop changes
watch(() => props.events, (newEvents) => {
  setEvents(newEvents)
}, { deep: true })

watch(() => props.view, (newView) => {
  setView(newView)
})

watch(() => props.selectedDate, (newDate) => {
  if (newDate) {
    navigateToDate(newDate)
  }
})

// Watch for internal state changes and emit events
watch(currentDate, (newDate) => {
  emit('date-change', newDate.toString())
})

watch(currentView, (newView) => {
  emit('view-change', newView)
})

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
  navigateToDate(date)
}

const handleViewChange = (view: CalendarView): void => {
  setView(view)
}

const handleConfigChange = (config: Partial<CalendarConfig>): void => {
  emit('config-change', config)
}

const handleThemeChange = (theme: 'light' | 'dark' | 'auto'): void => {
  setTheme(theme)
}

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
  setView,
  toggleTheme,
  getCurrentDate: () => currentDate.value,
  getCurrentView: () => currentView.value,
  getVisibleRange: () => visibleRange.value,
  getEvents: () => filteredEvents.value,
  createEvent,
  updateEvent,
  deleteEvent
})
</script>

<style scoped>
.atempo-cal-content {
  @apply min-h-96;
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
</style>