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
    >
      <!-- Pass through navbar slots for customization -->
      <template #left="slotProps">
        <slot 
          name="navbar-left" 
          v-bind="slotProps"
        />
      </template>
      
      <template #center="slotProps">
        <slot 
          name="navbar-center" 
          v-bind="slotProps"
        />
      </template>
      
      <template #right="slotProps">
        <slot 
          name="navbar-right" 
          v-bind="slotProps"
        />
      </template>
    </NavigationBar>

    <!-- Main Calendar Content -->
    <div class="atempo-cal-content">
      <!-- Loading Overlay -->
      <div v-if="loading" class="atempo-cal-loading-overlay">
        <div class="atempo-cal-loading">
          <div class="atempo-cal-spinner"></div>
        </div>
      </div>

      <!-- Calendar Views -->
      <WeeklyView
        :key="'week-' + currentDate.toString()"
        :events="props.events"
        :resources="resources"
        :week-start="visibleRange.start"
        :on-prev-week="navigatePrevious"
        :on-next-week="navigateNext"
        :on-date-select="(date) => navigateToDate(date)"
        :readonly="readonly"
        :special-event-colors="specialEventColors"
        :show-event-titles="mergedConfig.showEventTitles"
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
  // AtempoCal mounted
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

<style lang="scss">
// Use AtempoCal SCSS styles
@use './style.scss';
</style>