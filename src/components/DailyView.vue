<template>
  <div class="atempo-cal-daily-view">
    <!-- Day header -->
    <div class="atempo-cal-day-header-section">
      <div class="atempo-cal-day-info">
        <h3 class="atempo-cal-day-title">
          {{ getDayTitle() }}
        </h3>
        <p class="atempo-cal-day-subtitle">
          {{ getDaySubtitle() }}
        </p>
      </div>
      
      <!-- Day summary stats -->
      <div class="atempo-cal-day-stats">
        <div class="atempo-cal-stat">
          <span class="atempo-cal-stat-value">{{ dayEvents.length }}</span>
          <span class="atempo-cal-stat-label">Events</span>
        </div>
        <div v-if="resources.length > 0" class="atempo-cal-stat">
          <span class="atempo-cal-stat-value">{{ resources.length }}</span>
          <span class="atempo-cal-stat-label">Resources</span>
        </div>
      </div>
    </div>

    <!-- Scrollable content area -->
    <div class="atempo-cal-day-content atempo-cal-scroll" ref="scrollContainer">
      <div class="relative">
        <!-- Time column -->
        <div class="atempo-cal-time-column absolute left-0 top-0 bottom-0" :style="{ width: timeColumnWidth + 'px' }">
          <div
            v-for="slot in timeSlots"
            :key="slot.time"
            class="atempo-cal-time-slot"
            :class="{ 'current-time': slot.isCurrentTime }"
            :style="{ height: slotHeight + 'px' }"
          >
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ formatTimeSlot(slot) }}
            </span>
          </div>
        </div>

        <!-- Main content area -->
        <div 
          class="atempo-cal-main-content"
          :style="{ marginLeft: timeColumnWidth + 'px' }"
        >
          <!-- Grid lines -->
          <div class="absolute inset-0">
            <!-- Horizontal lines -->
            <div
              v-for="(slot, index) in timeSlots"
              :key="'hline-' + slot.time"
              class="absolute left-0 right-0 border-t border-gray-100 dark:border-gray-700"
              :style="{ top: (index * slotHeight) + 'px' }"
            />
            
            <!-- Vertical lines for resources (if any) -->
            <template v-if="resources.length > 0">
              <div
                v-for="(resource, index) in resources"
                :key="'vline-' + resource.id"
                class="absolute top-0 bottom-0 border-l border-gray-200 dark:border-gray-600"
                :style="{ left: (index * resourceColumnWidth) + 'px' }"
              />
            </template>
          </div>

          <!-- Resource columns (if resources are provided) -->
          <template v-if="resources.length > 0">
            <!-- Resource headers -->
            <div class="atempo-cal-resource-headers sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div
                v-for="resource in resources"
                :key="'header-' + resource.id"
                class="atempo-cal-resource-header inline-block"
                :style="{ width: resourceColumnWidth + 'px' }"
              >
                <div class="flex items-center space-x-2 p-3">
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    :style="{ backgroundColor: resource.color || '#3b82f6' }"
                  >
                    {{ resource.name.charAt(0).toUpperCase() }}
                  </div>
                  <span class="font-medium text-gray-900 dark:text-gray-100">
                    {{ resource.name }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Resource columns content -->
            <div
              v-for="(resource, resourceIndex) in resources"
              :key="resource.id"
              class="atempo-cal-resource-column absolute top-0"
              :style="{
                left: (resourceIndex * resourceColumnWidth) + 'px',
                width: resourceColumnWidth + 'px',
                height: gridHeight + 'px',
                marginTop: '60px'
              }"
            >
              <!-- Time slots for this resource -->
              <div
                v-for="(slot, slotIndex) in timeSlots"
                :key="'slot-' + resource.id + '-' + slot.time"
                class="absolute left-0 right-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                :style="{
                  top: (slotIndex * slotHeight) + 'px',
                  height: slotHeight + 'px'
                }"
                @click="handleSlotClick(slot, resource.id)"
              />

              <!-- Events for this resource -->
              <EventCard
                v-for="event in getEventsForResource(resource.id)"
                :key="event.id"
                :event="event"
                :position="getEventPosition(event)"
                :actions="eventActions"
                :readonly="readonly"
                :show-description="true"
                :max-title-length="40"
                :max-description-length="80"
                @click="$emit('event-click', event)"
                @update="$emit('event-update', $event)"
                @delete="$emit('event-delete', $event)"
              />
            </div>
          </template>

          <!-- Single column layout (no resources) -->
          <template v-else>
            <div
              class="atempo-cal-single-column relative"
              :style="{ height: gridHeight + 'px' }"
            >
              <!-- Time slots -->
              <div
                v-for="(slot, slotIndex) in timeSlots"
                :key="'slot-' + slot.time"
                class="absolute left-0 right-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                :style="{
                  top: (slotIndex * slotHeight) + 'px',
                  height: slotHeight + 'px'
                }"
                @click="handleSlotClick(slot)"
              />

              <!-- All events -->
              <EventCard
                v-for="event in dayEvents"
                :key="event.id"
                :event="event"
                :position="getEventPosition(event)"
                :actions="eventActions"
                :readonly="readonly"
                :show-description="true"
                :max-title-length="50"
                :max-description-length="100"
                @click="$emit('event-click', event)"
                @update="$emit('event-update', $event)"
                @delete="$emit('event-delete', $event)"
              />
            </div>
          </template>
        </div>
      </div>

      <!-- Current time indicator -->
      <div
        v-if="showCurrentTime && currentTimePosition >= 0"
        class="atempo-cal-current-time-line"
        :style="{
          top: currentTimePosition + (resources.length > 0 ? 60 : 0) + 'px',
          left: timeColumnWidth + 'px',
          width: `calc(100% - ${timeColumnWidth}px)`
        }"
      >
        <div class="atempo-cal-current-time-dot" />
        <span class="atempo-cal-current-time-label">
          {{ getCurrentTimeLabel() }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import type {
  CalendarEvent,
  CalendarResource,
  CalendarConfig,
  TimeSlot,
  EventPosition,
  EventAction,
  SlotClickInfo,
  Atemporal
} from '../types'
import {
  generateTimeSlots,
  getCurrentTimePosition,
  formatTime,
  isToday as checkIsToday,
  formatDateForDisplay
} from '../utils/dateHelpers'
import {
  calculateEventPositions,
  filterEventsForDate
} from '../utils/eventHelpers'
import EventCard from './EventCard.vue'

/**
 * DailyView component
 * Displays calendar in daily view with detailed hourly breakdown
 */

interface Props {
  events: CalendarEvent[]
  resources?: CalendarResource[]
  config: CalendarConfig
  currentDate: Atemporal
  visibleRange: { start: Atemporal; end: Atemporal }
  eventActions?: EventAction[]
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  resources: () => [],
  eventActions: () => [],
  readonly: false
})

interface Emits {
  'event-click': [event: CalendarEvent]
  'event-create': [eventData: Partial<CalendarEvent>]
  'event-update': [event: CalendarEvent]
  'event-delete': [event: CalendarEvent]
  'slot-click': [slotInfo: SlotClickInfo]
}

const emit = defineEmits<Emits>()

// Component configuration
const timeColumnWidth = 100
const slotHeight = 80 // Larger slots for daily view

// Template refs
const scrollContainer = ref<HTMLElement>()

/**
 * Get events for the current day
 */
const dayEvents = computed((): CalendarEvent[] => {
  return filterEventsForDate(props.events, props.currentDate)
})

/**
 * Generate time slots based on configuration
 */
const timeSlots = computed((): TimeSlot[] => {
  const gridConfig = {
    startHour: props.config.startHour || 0,
    endHour: props.config.endHour || 24, // Ensure full 24 hours
    slotDuration: props.config.slotDuration || 60,
    showCurrentTime: true,
    timezone: props.config.timezone || 'UTC'
  }
  
  // Force 24-hour coverage if endHour is less than 24
  if (gridConfig.endHour < 24) {
    gridConfig.endHour = 24
  }
  
  const slots = generateTimeSlots(gridConfig)
  
  // Mark current time slot if viewing today
  if (checkIsToday(props.currentDate, props.config.timezone)) {
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    
    slots.forEach(slot => {
      const slotTime = slot.hour * 60 + slot.minute
      const currentTime = currentHour * 60 + currentMinute
      
      slot.isCurrentTime = Math.abs(slotTime - currentTime) < (props.config.slotDuration || 60) / 2
    })
  }
  
  return slots
})

/**
 * Calculate grid height
 */
const gridHeight = computed((): number => {
  // Ensure we have enough height for full 24 hours
  const minSlots = 24 // 24 hours with 1-hour slots
  const actualSlots = Math.max(timeSlots.value.length, minSlots)
  return actualSlots * slotHeight
})

/**
 * Calculate resource column width
 */
const resourceColumnWidth = computed((): number => {
  if (props.resources.length === 0) return 0
  
  const availableWidth = 800 // This should be calculated from container width
  return Math.max(250, availableWidth / props.resources.length)
})

/**
 * Show current time indicator
 */
const showCurrentTime = computed((): boolean => {
  if (!checkIsToday(props.currentDate, props.config.timezone)) {
    return false
  }
  
  // Only show if current time is within visible hours
  const now = new Date()
  const currentHour = now.getHours()
  const startHour = props.config.startHour || 0
  const endHour = props.config.endHour || 24
  
  return currentHour >= startHour && currentHour < endHour
})

/**
 * Calculate current time position
 */
const currentTimePosition = computed((): number => {
  if (!showCurrentTime.value) return -1
  
  const gridConfig = {
    startHour: props.config.startHour || 0,
    endHour: props.config.endHour || 24,
    slotDuration: props.config.slotDuration || 60,
    showCurrentTime: true,
    timezone: props.config.timezone || 'UTC'
  }
  
  // Force 24-hour coverage if endHour is less than 24
  if (gridConfig.endHour < 24) {
    gridConfig.endHour = 24
  }
  
  const percentage = getCurrentTimePosition(gridConfig, props.config.timezone)
  
  // Only return valid position if within visible range
  if (percentage < 0 || percentage > 100) {
    return -1
  }
  
  return (percentage / 100) * gridHeight.value
})

/**
 * Get day title
 */
const getDayTitle = (): string => {
  return formatDateForDisplay(props.currentDate, 'dddd, MMMM D, YYYY')
}

/**
 * Get day subtitle
 */
const getDaySubtitle = (): string => {
  if (checkIsToday(props.currentDate, props.config.timezone)) {
    return 'Today'
  }
  
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const targetDate = new Date(props.currentDate.year, props.currentDate.month - 1, props.currentDate.day)
  
  const diffTime = targetDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'
  if (diffDays > 0) return `In ${diffDays} days`
  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`
  
  return ''
}

/**
 * Format time slot for display
 */
const formatTimeSlot = (slot: TimeSlot): string => {
  return formatTime(slot.hour, slot.minute)
}

/**
 * Get current time label
 */
const getCurrentTimeLabel = (): string => {
  const now = new Date()
  return formatTime(now.getHours(), now.getMinutes())
}

/**
 * Get events for a specific resource
 */
const getEventsForResource = (resourceId: string): CalendarEvent[] => {
  return dayEvents.value.filter(event => event.resourceId === resourceId)
}

/**
 * Calculate event position within the grid
 */
const getEventPosition = (event: CalendarEvent): EventPosition => {
  const gridConfig = {
    startHour: props.config.startHour || 0,
    endHour: props.config.endHour || 24,
    slotDuration: props.config.slotDuration || 60,
    showCurrentTime: true,
    timezone: props.config.timezone || 'UTC'
  }
  
  const eventsWithPositions = calculateEventPositions([event], gridConfig, gridHeight.value)
  return eventsWithPositions[0]?.position || {
    top: 0,
    height: slotHeight,
    left: 0,
    width: 100,
    zIndex: 1
  }
}

/**
 * Handle time slot click
 */
const handleSlotClick = (slot: TimeSlot, resourceId?: string): void => {
  if (props.readonly) return
  
  const slotInfo: SlotClickInfo = {
    date: props.currentDate.format('YYYY-MM-DD'),
    time: slot.time,
    resourceId
  }
  
  emit('slot-click', slotInfo)
}

/**
 * Scroll to current time on mount
 */
const scrollToCurrentTime = async (): Promise<void> => {
  if (!showCurrentTime.value || currentTimePosition.value < 0) return
  
  await nextTick()
  
  if (scrollContainer.value) {
    const scrollTop = Math.max(0, currentTimePosition.value - 200)
    scrollContainer.value.scrollTop = scrollTop
  }
}

// Lifecycle
onMounted(() => {
  scrollToCurrentTime()
})
</script>

<style scoped>
.atempo-cal-daily-view {
  @apply flex flex-col h-full;
}

.atempo-cal-day-header-section {
  @apply flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700;
  @apply bg-white dark:bg-gray-800;
}

.atempo-cal-day-info {
  @apply flex-1;
}

.atempo-cal-day-title {
  @apply text-xl font-semibold text-gray-900 dark:text-gray-100;
}

.atempo-cal-day-subtitle {
  @apply text-sm text-gray-600 dark:text-gray-400 mt-1;
}

.atempo-cal-day-stats {
  @apply flex space-x-6;
}

.atempo-cal-stat {
  @apply text-center;
}

.atempo-cal-stat-value {
  @apply block text-2xl font-bold text-gray-900 dark:text-gray-100;
}

.atempo-cal-stat-label {
  @apply block text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide;
}

.atempo-cal-day-content {
  @apply flex-1 overflow-auto;
  max-height: calc(100vh - 200px);
}

.atempo-cal-time-column {
  @apply bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700;
}

.atempo-cal-time-slot {
  @apply border-b border-gray-100 dark:border-gray-700 px-3 py-2 text-right flex items-center justify-end;
}

.atempo-cal-time-slot.current-time {
  @apply bg-blue-50 dark:bg-blue-900/20;
}

.atempo-cal-main-content {
  @apply relative;
}

.atempo-cal-resource-headers {
  height: 60px;
}

.atempo-cal-resource-header {
  @apply border-r border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800;
}

.atempo-cal-resource-column {
  @apply border-r border-gray-200 dark:border-gray-600;
}

.atempo-cal-single-column {
  @apply w-full;
}

.atempo-cal-current-time-line {
  @apply absolute bg-red-500 h-0.5 z-20 flex items-center;
}

.atempo-cal-current-time-dot {
  @apply w-2 h-2 bg-red-500 rounded-full -ml-1;
}

.atempo-cal-current-time-label {
  @apply ml-2 text-xs font-medium text-red-600 dark:text-red-400 bg-white dark:bg-gray-800;
  @apply px-2 py-1 rounded shadow-sm border border-red-200 dark:border-red-700;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .atempo-cal-day-header-section {
    @apply flex-col items-start space-y-2 p-3;
  }
  
  .atempo-cal-day-stats {
    @apply space-x-4;
  }
  
  .atempo-cal-stat-value {
    @apply text-lg;
  }
  
  .atempo-cal-resource-header {
    @apply p-2;
  }
}
</style>