<template>
  <div class="atempo-cal-time-grid relative" :style="{ height: gridHeight + 'px' }">
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

    <!-- Content area -->
    <div 
      class="atempo-cal-content-area absolute top-0 bottom-0"
      :style="{ left: timeColumnWidth + 'px', right: '0' }"
    >
      <!-- Grid lines -->
      <div class="absolute inset-0">
        <!-- Horizontal lines -->
        <div
          v-for="(slot, index) in timeSlots"
          :key="'line-' + slot.time"
          class="grid-line-horizontal"
          :style="{ top: (index * slotHeight) + 'px' }"
        />
        
        <!-- Vertical lines for resources -->
        <div
          v-for="(resource, index) in resources"
          :key="'resource-line-' + resource.id"
          class="grid-line-vertical"
          :style="{ left: (index * resourceColumnWidth) + 'px' }"
        />
      </div>

      <!-- Resource columns -->
      <div
        v-for="(resource, resourceIndex) in resources"
        :key="resource.id"
        class="atempo-cal-resource-column absolute top-0 bottom-0"
        :style="{
          left: (resourceIndex * resourceColumnWidth) + 'px',
          width: resourceColumnWidth + 'px'
        }"
      >
        <!-- Resource header -->
        <div class="atempo-cal-resource-header sticky top-0 z-10">
          <div class="resource-header-content">
            <div
              v-if="resource.avatar"
              class="resource-avatar"
            >
              <img
                v-if="resource.avatar.startsWith('http')"
                :src="resource.avatar"
                :alt="resource.name"
                class="avatar-image"
              />
              <span v-else class="avatar-text">
                {{ resource.avatar }}
              </span>
            </div>
            <div
              v-else
              class="resource-avatar"
              :style="{ backgroundColor: resource.color || '#3b82f6' }"
            >
              <span class="avatar-initial">
                {{ resource.name.charAt(0).toUpperCase() }}
              </span>
            </div>
            <span class="resource-name">
              {{ resource.name }}
            </span>
          </div>
        </div>

        <!-- Time slots for this resource -->
        <div class="relative" :style="{ height: gridHeight + 'px' }">
          <!-- Clickable time slots -->
          <div
            v-for="(slot, slotIndex) in timeSlots"
            :key="'slot-' + resource.id + '-' + slot.time"
            class="time-slot-clickable"
            :style="{
              top: (slotIndex * slotHeight) + 'px',
              height: slotHeight + 'px'
            }"
            @click="handleSlotClick(slot, resource)"
          >
            <!-- Slot content will be filled by events -->
          </div>

          <!-- Events for this resource -->
          <EventCard
            v-for="event in getEventsForResource(resource.id)"
            :key="event.id"
            :event="event"
            :position="getEventPosition(event)"
            :actions="eventActions"
            :resources="resources"
            :custom-special-colors="config.specialEventColors"
            :readonly="readonly"
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
        left: timeColumnWidth + 'px'
      }"
    >
      <div class="atempo-cal-current-time-dot" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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
  isToday
} from '../utils/dateHelpers'
import {
  calculateEventPositions,
  filterEventsForDate
} from '../utils/eventHelpers'
import EventCard from './EventCard.vue'

/**
 * TimeGrid component
 * Shared grid component for displaying time-based calendar views
 */

interface Props {
  events: CalendarEvent[]
  resources: CalendarResource[]
  config: CalendarConfig
  currentDate: Atemporal
  eventActions?: EventAction[]
  readonly?: boolean
  timeColumnWidth?: number
  slotHeight?: number
}

const props = withDefaults(defineProps<Props>(), {
  eventActions: () => [],
  readonly: false,
  timeColumnWidth: 80,
  slotHeight: 60
})

interface Emits {
  'event-click': [event: CalendarEvent]
  'event-update': [event: CalendarEvent]
  'event-delete': [event: CalendarEvent]
  'slot-click': [slotInfo: SlotClickInfo]
}

const emit = defineEmits<Emits>()

// Inject calendar context (for future use)
// const calendarConfig = inject<CalendarConfig>('calendar-config', props.config)

/**
 * Generate time slots based on configuration
 */
const timeSlots = computed((): TimeSlot[] => {
  const gridConfig = {
    startHour: props.config.startHour || 0,
    endHour: props.config.endHour || 24,
    slotDuration: props.config.slotDuration || 60,
    showCurrentTime: true,
    timezone: props.config.timezone || 'UTC'
  }
  
  const slots = generateTimeSlots(gridConfig)
  
  // Mark current time slot if viewing today
  if (isToday(props.currentDate, props.config.timezone)) {
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
 * Calculate grid height based on time slots
 */
const gridHeight = computed((): number => {
  return timeSlots.value.length * props.slotHeight
})

/**
 * Calculate resource column width
 */
const resourceColumnWidth = computed((): number => {
  const availableWidth = 800 // This should be calculated from container width
  return Math.max(200, availableWidth / Math.max(1, props.resources.length))
})

/**
 * Show current time indicator
 */
const showCurrentTime = computed((): boolean => {
  return isToday(props.currentDate, props.config.timezone)
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
  
  const percentage = getCurrentTimePosition(gridConfig, props.config.timezone)
  return percentage >= 0 ? (percentage / 100) * gridHeight.value : -1
})

/**
 * Format time slot for display
 */
const formatTimeSlot = (slot: TimeSlot): string => {
  return formatTime(slot.hour, slot.minute)
}

/**
 * Get events for a specific resource
 */
const getEventsForResource = (resourceId: string): CalendarEvent[] => {
  return filterEventsForDate(props.events, props.currentDate, resourceId)
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
    height: props.slotHeight,
    left: 0,
    width: 100,
    zIndex: 1
  }
}

/**
 * Handle time slot click
 */
const handleSlotClick = (slot: TimeSlot, resource: CalendarResource): void => {
  if (props.readonly) return
  
  const slotInfo: SlotClickInfo = {
    date: props.currentDate.format('YYYY-MM-DD'),
    time: slot.time,
    resourceId: resource.id
  }
  
  emit('slot-click', slotInfo)
}
</script>

<style scoped>

.atempo-cal-time-grid {
  border-radius: $border-radius-lg;
  overflow: hidden;
  border: 1px solid;
  
  @include theme-aware('background-color', (
    light: white,
    dark: $gray-900
  ));
  
  @include theme-aware('border-color', (
    light: $gray-200,
    dark: $gray-700
  ));
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

.time-slot-label {
  font-size: $font-size-xs;
  
  @include theme-aware('color', (
    light: $gray-600,
    dark: $gray-400
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

.grid-line-vertical {
  position: absolute;
  top: 0;
  bottom: 0;
  border-left: 1px solid;
  
  @include theme-aware('border-color', (
    light: $gray-200,
    dark: $gray-600
  ));
}

.atempo-cal-resource-header {
  border-bottom: 1px solid;
  padding: $spacing-xs $spacing-sm;
  height: 60px;
  
  @include theme-aware('background-color', (
    light: white,
    dark: $gray-800
  ));
  
  @include theme-aware('border-color', (
    light: $gray-200,
    dark: $gray-700
  ));
}

.resource-header-content {
  @include flex-center;
  gap: $spacing-sm;
}

.resource-avatar {
  width: $spacing-lg * 1.5;
  height: $spacing-lg * 1.5;
  border-radius: 50%;
  @include flex-center;
  
  @include theme-aware('background-color', (
    light: $gray-200,
    dark: $gray-600
  ));
}

.avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-text {
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;
  
  @include theme-aware('color', (
    light: $gray-600,
    dark: $gray-300
  ));
}

.avatar-initial {
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;
  color: white;
}

.resource-name {
  font-weight: $font-weight-medium;
  @include truncate;
  
  @include theme-aware('color', (
    light: $gray-900,
    dark: $gray-100
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

.atempo-cal-current-time-line {
  background-color: $red-500;
  height: 2px;
  z-index: 20;
}

.atempo-cal-current-time-dot {
  position: absolute;
  left: -4px;
  top: -4px;
  width: $spacing-sm;
  height: $spacing-sm;
  background-color: $red-500;
  border-radius: 50%;
}

// Responsive adjustments
@include mobile {
  .atempo-cal-resource-header {
    padding: $spacing-sm $spacing-xs;
    font-size: $font-size-sm;
    height: 50px;
  }
}
</style>