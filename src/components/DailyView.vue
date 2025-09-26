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
            <span class="time-slot-label">
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
              class="grid-line-horizontal"
              :style="{ top: (index * slotHeight) + 'px' }"
            />
          </div>

          <!-- Single unified column layout for all events -->
          <div
            class="atempo-cal-unified-column relative"
            :style="{ height: gridHeight + 'px' }"
          >
            <!-- Time slots for interaction -->
            <div
              v-for="(slot, slotIndex) in timeSlots"
              :key="'slot-' + slot.time"
              class="time-slot-clickable"
              :style="{
                top: (slotIndex * slotHeight) + 'px',
                height: slotHeight + 'px'
              }"
              @click="handleSlotClick(slot)"
            />

            <!-- All events with integrated resource information -->
            <EventCard
              v-for="event in dayEvents"
              :key="event.id"
              :event="event"
              :position="getEventPosition(event)"
              :actions="eventActions"
              :readonly="readonly"
              :show-description="true"
              :show-resource="true"
              :resource-name="getResourceName(event.resourceId)"
              :resource-color="getResourceColor(event.resourceId)"
              :resources="resources"
              :custom-special-colors="config.specialEventColors"
              :max-title-length="50"
              :max-description-length="100"
              @click="$emit('event-click', event)"
              @update="$emit('event-update', $event)"
              @delete="$emit('event-delete', $event)"
            />
          </div>
        </div>
      </div>

      <!-- Current time indicator -->
      <div
        v-if="showCurrentTime && currentTimePosition >= 0"
        class="atempo-cal-current-time-line"
        :style="{
          top: currentTimePosition + 'px',
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

// Legacy functions removed as they're no longer needed in unified layout

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
 * Get resource name by ID
 */
const getResourceName = (resourceId?: string): string => {
  if (!resourceId) return ''
  const resource = props.resources.find(r => r.id === resourceId)
  return resource?.name || ''
}

/**
 * Get resource color by ID
 */
const getResourceColor = (resourceId?: string): string => {
  if (!resourceId) return '#3b82f6'
  const resource = props.resources.find(r => r.id === resourceId)
  return resource?.color || '#3b82f6'
}

/**
 * Calculate event position within the grid with overlap prevention
 */
const getEventPosition = (event: CalendarEvent): EventPosition => {
  const gridConfig = {
    startHour: props.config.startHour || 0,
    endHour: props.config.endHour || 24,
    slotDuration: props.config.slotDuration || 60,
    showCurrentTime: true,
    timezone: props.config.timezone || 'UTC'
  }
  
  // Get all events for overlap detection
  const allEvents = dayEvents.value
  const eventsWithPositions = calculateEventPositions(allEvents, gridConfig, gridHeight.value)
  const eventWithPosition = eventsWithPositions.find(e => e.id === event.id)
  
  return eventWithPosition?.position || {
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
  @include flex-column;
  height: 100%;
}

.atempo-cal-day-header-section {
  @include flex-between;
  padding: $spacing-md;
  border-bottom: 1px solid;
  
  @include theme-aware('background-color', (
    light: white,
    dark: $gray-800
  ));
  
  @include theme-aware('border-color', (
    light: $gray-200,
    dark: $gray-700
  ));
}

.atempo-cal-day-info {
  flex: 1;
}

.atempo-cal-day-title {
  font-size: $font-size-xl;
  font-weight: $font-weight-semibold;
  
  @include theme-aware('color', (
    light: $gray-900,
    dark: $gray-100
  ));
}

.atempo-cal-day-subtitle {
  font-size: $font-size-sm;
  margin-top: $spacing-xs;
  
  @include theme-aware('color', (
    light: $gray-600,
    dark: $gray-400
  ));
}

.atempo-cal-day-stats {
  display: flex;
  gap: $spacing-lg * 1.5;
}

.atempo-cal-stat {
  text-align: center;
}

.atempo-cal-stat-value {
  display: block;
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  
  @include theme-aware('color', (
    light: $gray-900,
    dark: $gray-100
  ));
}

.atempo-cal-stat-label {
  display: block;
  font-size: $font-size-xs;
  text-transform: uppercase;
  letter-spacing: $letter-spacing-wide;
  
  @include theme-aware('color', (
    light: $gray-600,
    dark: $gray-400
  ));
}

.atempo-cal-day-content {
  flex: 1;
  overflow: auto;
  max-height: calc(100vh - 200px);
}

.atempo-cal-time-column {
  border-right: 1px solid;
  
  @include theme-aware('background-color', (
    light: $gray-50,
    dark: $gray-800
  ));
  
  @include theme-aware('border-color', (
    light: $gray-200,
    dark: $gray-700
  ));
}

.atempo-cal-time-slot {
  border-bottom: 1px solid;
  padding: $spacing-sm $spacing-sm;
  text-align: right;
  @include flex-center;
  justify-content: flex-end;
  
  @include theme-aware('border-color', (
    light: $gray-100,
    dark: $gray-700
  ));
  
  &.current-time {
    @include theme-aware('background-color', (
      light: $blue-50,
      dark: rgba($blue-900, 0.2)
    ));
  }
}

.time-slot-label {
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  
  @include theme-aware('color', (
    light: $gray-700,
    dark: $gray-300
  ));
}

.grid-line-horizontal {
  position: absolute;
  left: 0;
  right: 0;
  border-top: 1px solid;
  
  @include theme-aware('border-color', (
    light: $gray-100,
    dark: $gray-700
  ));
}

.time-slot-clickable {
  position: absolute;
  left: 0;
  right: 0;
  cursor: pointer;
  transition: $transition-colors;
  
  &:hover {
    @include theme-aware('background-color', (
      light: $gray-50,
      dark: rgba($gray-800, 0.5)
    ));
  }
}

.atempo-cal-main-content {
  position: relative;
}

.atempo-cal-resource-headers {
  height: 60px;
}

.atempo-cal-resource-header {
  border-right: 1px solid;
  
  @include theme-aware('background-color', (
    light: white,
    dark: $gray-800
  ));
  
  @include theme-aware('border-color', (
    light: $gray-200,
    dark: $gray-600
  ));
}

.atempo-cal-resource-column {
  border-right: 1px solid;
  
  @include theme-aware('border-color', (
    light: $gray-200,
    dark: $gray-600
  ));
}

.atempo-cal-single-column {
  width: 100%;
}

.atempo-cal-current-time-line {
  position: absolute;
  background-color: $red-500;
  height: 2px;
  z-index: 20;
  @include flex-center;
}

.atempo-cal-current-time-dot {
  width: $spacing-sm;
  height: $spacing-sm;
  background-color: $red-500;
  border-radius: 50%;
  margin-left: -4px;
}

.atempo-cal-current-time-label {
  margin-left: $spacing-sm;
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;
  padding: $spacing-xs $spacing-sm;
  border-radius: $border-radius-sm;
  box-shadow: $shadow-sm;
  border: 1px solid;
  
  @include theme-aware('color', (
    light: $red-600,
    dark: $red-400
  ));
  
  @include theme-aware('background-color', (
    light: white,
    dark: $gray-800
  ));
  
  @include theme-aware('border-color', (
    light: $red-200,
    dark: $red-700
  ));
}

// Responsive adjustments
@include mobile {
  .atempo-cal-day-header-section {
    @include flex-column;
    align-items: flex-start;
    gap: $spacing-sm;
    padding: $spacing-sm;
  }
  
  .atempo-cal-day-stats {
    gap: $spacing-md;
  }
  
  .atempo-cal-stat-value {
    font-size: $font-size-lg;
  }
  
  .atempo-cal-resource-header {
    padding: $spacing-sm;
  }
}
</style>