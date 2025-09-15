<template>
  <div class="atempo-cal-weekly-view">
    <!-- Week header with days -->
    <div class="atempo-cal-week-header">
      <!-- Resource column spacer -->
      <div class="atempo-cal-resource-spacer" :style="{ width: resourceColumnWidth + 'px' }">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Resources</span>
      </div>
      
      <!-- Day headers -->
      <div class="atempo-cal-day-headers flex-1">
        <div class="grid grid-cols-7 h-full">
          <div
            v-for="(date, index) in weekDates"
            :key="date.toString()"
            class="atempo-cal-day-header"
            :class="{
              'today': isToday(date),
              'weekend': isWeekend(date),
              'selected': isSameDay(date, currentDate)
            }"
            @click="handleDayClick(date)"
          >
            <div class="atempo-cal-day-name">
              {{ getDayName(date, index) }}
            </div>
            <div class="atempo-cal-day-number">
              {{ date.day }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Scrollable content area -->
    <div class="atempo-cal-week-content atempo-cal-scroll" ref="scrollContainer">
      <!-- Resource calendar layout using flexbox -->
      <div class="atempo-cal-resource-calendar">
        <!-- For each resource, create a complete row -->
        <div
          v-for="resource in displayResources"
          :key="resource.id"
          class="atempo-cal-resource-calendar-row relative"
          :style="{ height: resourceRowHeight + 'px' }"
        >
          <!-- Multi-day events layer (positioned absolutely to span across day cells) -->
          <div class="absolute inset-0 pointer-events-none" :style="{ left: resourceColumnWidth + 'px' }">
            <div
               v-for="(event, eventIndex) in getMultiDayEventsForResource(resource.id)"
               :key="event.id + '-multiday'"
               class="absolute pointer-events-auto atempo-cal-multiday-event"
               :style="{
                 top: getMultiDayEventPosition(event, eventIndex).top + 'px',
                 height: getMultiDayEventPosition(event, eventIndex).height + 'px',
                 left: getMultiDayEventPosition(event, eventIndex).left + '%',
                 width: getMultiDayEventPosition(event, eventIndex).width + '%',
                 zIndex: getMultiDayEventPosition(event, eventIndex).zIndex,
                 borderLeftColor: event.color || '#3b82f6'
               }"
             >
              <EventCard
                :event="event"
                :position="{ top: 0, height: 100, left: 0, width: 100, zIndex: 1 }"
                :actions="eventActions"
                :readonly="readonly"
                :show-time="true"
                :show-description="false"
                :max-title-length="50"
                @click="$emit('event-click', event)"
                @update="$emit('event-update', $event)"
                @delete="$emit('event-delete', $event)"
              />
            </div>
          </div>
          <!-- Resource info column -->
          <div 
            class="atempo-cal-resource-info"
            :style="{ width: resourceColumnWidth + 'px' }"
          >
            <div class="flex items-center h-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
              <div class="flex items-center space-x-2">
                <div 
                  class="w-3 h-3 rounded-full flex-shrink-0"
                  :style="{ backgroundColor: resource.color || '#6B7280' }"
                />
                <div class="flex flex-col">
                  <span class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {{ resource.name }}
                  </span>
                  <span v-if="resource.metadata?.role" class="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {{ resource.metadata.role }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Day cells for this resource -->
          <div class="atempo-cal-resource-days flex flex-1">
            <div
              v-for="date in weekDates"
              :key="'cell-' + resource.id + '-' + date.toString()"
              class="atempo-cal-resource-day-cell group flex-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-r border-gray-200 dark:border-gray-600 relative"
              :class="{
                'today': isToday(date),
                'weekend': isWeekend(date)
              }"
              :style="{ 
                height: resourceRowHeight + 'px',
                minHeight: resourceRowHeight + 'px'
              }"
              @click="handleResourceSlotClick(resource, date)"
            >
              <!-- Single-day events for this resource and day -->
              <div class="absolute inset-0 p-1 overflow-hidden">
                <div
                  v-for="(event, eventIndex) in getSingleDayEventsForResourceAndDay(resource.id, date)"
                  :key="event.id + '-single'"
                  class="absolute w-full transition-all duration-300 ease-in-out"
                  :class="{
                    'atempo-cal-event-expanded': hoveredEventId === event.id,
                    'atempo-cal-event-compact': hoveredEventId && hoveredEventId !== event.id && isInSameCell(hoveredEventId, resource.id, date)
                  }"
                  :style="getEventStyle(event, eventIndex, resource.id, date)"
                  @mouseenter="hoveredEventId = event.id"
                  @mouseleave="hoveredEventId = null"
                >
                  <div 
                    class="w-full h-full rounded-md shadow-sm border-l-4 px-2 py-1 cursor-pointer transition-all duration-300 hover:shadow-md text-xs font-medium truncate flex items-center group"
                    :style="{
                      backgroundColor: event.color ? event.color + '20' : '#3b82f620',
                      borderLeftColor: event.color || '#3b82f6',
                      color: event.color || '#1f2937'
                    }"
                    @click="$emit('event-click', event)"
                  >
                    <span class="truncate">{{ event.title }}</span>
                    <span v-if="!event.isAllDay && (hoveredEventId === event.id || getSingleDayEventsForResourceAndDay(resource.id, date).length === 1)" class="ml-2 text-xs opacity-75 flex-shrink-0">
                      {{ formatEventTime(event) }}
                    </span>
                    <!-- Delete button -->
                    <button
                      v-if="!readonly"
                      class="ml-auto opacity-0 group-hover:opacity-100 w-4 h-4 rounded bg-white/80 shadow-sm flex items-center justify-center text-gray-600 hover:bg-white transition-all"
                      @click.stop="$emit('event-delete', event)"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Add event indicator for empty cells -->
              <div 
                v-if="!readonly && getSingleDayEventsForResourceAndDay(resource.id, date).length === 0"
                class="atempo-cal-add-event-indicator opacity-0 group-hover:opacity-100 transition-opacity absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div class="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import atemporal from 'atemporal'
import type {
  CalendarEvent,
  CalendarResource,
  CalendarConfig,
  EventPosition,
  EventAction,
  SlotClickInfo,
  Atemporal
} from '../types'
import {
  getWeekDates,
  isToday as checkIsToday,
  getLocalizedDayNames
} from '../utils/dateHelpers'
import EventCard from './EventCard.vue'

/**
 * WeeklyView component
 * Displays calendar in weekly view with 7-day grid
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
  'date-change': [date: string]
}

const emit = defineEmits<Emits>()

// Component configuration
const resourceColumnWidth = 160
const resourceRowHeight = 120 // Increased height to accommodate multiple stacked events

// Template refs
const scrollContainer = ref<HTMLElement>()

// Hover state for Google Calendar-style expansion
const hoveredEventId = ref<string | null>(null)

/**
 * Get week dates based on current date
 */
const weekDates = computed((): Atemporal[] => {
  return getWeekDates(props.currentDate, props.config.firstDayOfWeek || 1)
})

/**
 * Get display resources (use provided resources or create default ones)
 */
const displayResources = computed((): CalendarResource[] => {
  if (props.resources && props.resources.length > 0) {
    return props.resources
  }
  
  // Default resources if none provided (Worker examples)
  return [
    { id: 'worker-john', name: 'John Smith', color: '#3B82F6', metadata: { department: 'Engineering', role: 'Senior Developer' } },
    { id: 'worker-sarah', name: 'Sarah Johnson', color: '#10B981', metadata: { department: 'Design', role: 'UX Designer' } },
    { id: 'worker-mike', name: 'Mike Davis', color: '#F59E0B', metadata: { department: 'Marketing', role: 'Marketing Manager' } },
    { id: 'worker-lisa', name: 'Lisa Chen', color: '#8B5CF6', metadata: { department: 'Engineering', role: 'Frontend Developer' } }
  ]
})

/**
 * Check if date is today
 */
const isToday = (date: Atemporal): boolean => {
  return checkIsToday(date, props.config.timezone)
}

/**
 * Check if date is weekend
 */
const isWeekend = (date: Atemporal): boolean => {
  const dayOfWeek = date.dayOfWeek() as number
  return dayOfWeek === 6 || dayOfWeek === 0 // Saturday or Sunday
}

/**
 * Check if two dates are the same day
 */
const isSameDay = (date1: Atemporal, date2: Atemporal): boolean => {
  return date1.isSame(date2, 'day')
}

/**
 * Get localized day name
 */
const getDayName = (date: Atemporal, _index: number): string => {
  const dayNames = getLocalizedDayNames(props.config.locale || 'en', 'short')
  const dayOfWeek = date.dayOfWeek() as number
  return dayNames[dayOfWeek] || date.format('ddd')
}

/**
 * Check if an event spans multiple days
 */
const isMultiDayEvent = (event: CalendarEvent): boolean => {
  const startDate = atemporal(event.startTime)
  const endDate = atemporal(event.endTime)
  return !startDate.isSame(endDate, 'day')
}

/**
 * Get single-day events for a specific resource and day
 */
const getSingleDayEventsForResourceAndDay = (resourceId: string, date: Atemporal): CalendarEvent[] => {
  return props.events.filter(event => {
    const eventStartDate = atemporal(event.startTime)
    const eventEndDate = atemporal(event.endTime)
    const targetDate = date.format('YYYY-MM-DD')
    
    // Only include single-day events that match this exact date
    const isSameDay = eventStartDate.format('YYYY-MM-DD') === targetDate && 
                      eventEndDate.format('YYYY-MM-DD') === targetDate
    
    const matchesResource = event.resourceId === resourceId
    return isSameDay && matchesResource
  })
}

/**
 * Get multi-day events for a specific resource
 */
const getMultiDayEventsForResource = (resourceId: string): CalendarEvent[] => {
  return props.events.filter(event => {
    const matchesResource = event.resourceId === resourceId
    return matchesResource && isMultiDayEvent(event)
  })
}

/**
 * Calculate multi-day event position and span
 */
const getMultiDayEventSpan = (event: CalendarEvent): { startIndex: number; span: number; isVisible: boolean } => {
  const eventStartDate = atemporal(event.startTime)
  const eventEndDate = atemporal(event.endTime)
  
  // Find start and end indices within the current week
  let startIndex = -1
  let endIndex = -1
  
  weekDates.value.forEach((date, index) => {
    const dateStr = date.format('YYYY-MM-DD')
    const eventStartStr = eventStartDate.format('YYYY-MM-DD')
    const eventEndStr = eventEndDate.format('YYYY-MM-DD')
    
    if (dateStr === eventStartStr || (dateStr > eventStartStr && startIndex === -1)) {
      startIndex = index
    }
    if (dateStr === eventEndStr || (dateStr < eventEndStr && dateStr >= eventStartStr)) {
      endIndex = index
    }
  })
  
  // Handle events that start before or end after the current week
  if (startIndex === -1) startIndex = 0
  if (endIndex === -1) endIndex = weekDates.value.length - 1
  
  const span = endIndex - startIndex + 1
  const isVisible = span > 0
  
  return { startIndex, span, isVisible }
}

/**
 * Check if an event is in the same cell as the hovered event
 */
const isInSameCell = (hoveredEventId: string, resourceId: string, date: Atemporal): boolean => {
  const hoveredEvent = props.events.find(e => e.id === hoveredEventId)
  if (!hoveredEvent) return false
  
  const eventsInCell = getSingleDayEventsForResourceAndDay(resourceId, date)
  return eventsInCell.some(e => e.id === hoveredEventId)
}

/**
 * Get Google Calendar-style event styling with dynamic sizing
 */
const getEventStyle = (event: CalendarEvent, eventIndex: number, resourceId: string, date: Atemporal) => {
  const eventsInCell = getSingleDayEventsForResourceAndDay(resourceId, date)
  const totalEvents = eventsInCell.length
  
  // Single event fills the entire cell
  if (totalEvents === 1) {
    return {
      top: '4px',
      height: (resourceRowHeight - 12) + 'px', // Full height minus padding
      left: '0px',
      right: '4px',
      zIndex: 1
    }
  }
  
  // Multiple events - Google Calendar style with proper positioning
  const isHovered = hoveredEventId.value === event.id
  const hoveredEventIndex = hoveredEventId.value ? eventsInCell.findIndex(e => e.id === hoveredEventId.value) : -1
  const hasHoveredEvent = hoveredEventIndex !== -1
  
  let height: number
  let top: number
  
  // Define heights for different states
  const expandedHeight = 50
  const compactHeight = 16
  const normalHeight = Math.max(18, Math.min(28, (resourceRowHeight - 12) / totalEvents - 2))
  
  if (isHovered) {
     // Expanded event
     height = expandedHeight
     
     if (eventIndex === 0) {
       // First event - expand at top
       top = 4
     } else if (eventIndex === totalEvents - 1) {
       // Last event - expand at bottom
       top = resourceRowHeight - expandedHeight - 4
     } else {
       // Middle event - expand in center
       const beforeEvents = eventIndex
       top = 4 + (beforeEvents * (compactHeight + 2))
     }
  } else if (hasHoveredEvent) {
    // Compact other events when one is hovered
    height = compactHeight
    
    if (eventIndex < hoveredEventIndex) {
      // Events before hovered event
      top = 4 + (eventIndex * (compactHeight + 2))
    } else {
      // Events after hovered event
      const hoveredEventTop = hoveredEventIndex === 0 ? 4 : 
                             hoveredEventIndex === totalEvents - 1 ? resourceRowHeight - expandedHeight - 4 :
                             4 + (hoveredEventIndex * (compactHeight + 2))
      const afterHoveredIndex = eventIndex - hoveredEventIndex - 1
      top = hoveredEventTop + expandedHeight + 2 + (afterHoveredIndex * (compactHeight + 2))
    }
  } else {
    // Normal stacking - no hover state
    height = normalHeight
    top = 4 + (eventIndex * (height + 2))
  }
  
  // Ensure event doesn't overflow the cell
  const maxTop = resourceRowHeight - height - 4
  top = Math.min(top, maxTop)
  
  return {
    top: top + 'px',
    height: height + 'px',
    left: '0px',
    right: '4px',
    zIndex: isHovered ? 10 : (1 + eventIndex)
  }
}

/**
 * Format event time for display
 */
const formatEventTime = (event: CalendarEvent): string => {
  if (event.isAllDay) {
    return 'All day'
  }
  
  const startTime = atemporal(event.startTime)
  const endTime = atemporal(event.endTime)
  
  const startFormatted = startTime.format('HH:mm')
  const endFormatted = endTime.format('HH:mm')
  
  return `${startFormatted} - ${endFormatted}`
}

/**
 * Calculate multi-day event position spanning multiple cells
 */
const getMultiDayEventPosition = (event: CalendarEvent, eventIndex: number): EventPosition => {
  const span = getMultiDayEventSpan(event)
  const cellWidth = 100 / 7 // Each day cell is 1/7 of the total width
  
  // Calculate vertical position to avoid overlapping with single-day events
  const multiDayEventHeight = 20
  const multiDayEventSpacing = 3
  const topOffset = 5 // Initial offset from top
  
  return {
    top: topOffset + (eventIndex * (multiDayEventHeight + multiDayEventSpacing)),
    height: multiDayEventHeight,
    left: span.startIndex * cellWidth,
    width: span.span * cellWidth,
    zIndex: 20 + eventIndex // Higher z-index to appear above single-day events
  }
}

/**
 * Handle day header click
 */
const handleDayClick = (date: Atemporal): void => {
  emit('date-change', date.toString())
}

/**
 * Handle resource slot click
 */
const handleResourceSlotClick = (resource: CalendarResource, date: Atemporal): void => {
  if (props.readonly) return
  
  const slotInfo: SlotClickInfo = {
    date: date.format('YYYY-MM-DD'),
    time: '09:00', // Default time for new events
    resourceId: resource.id,
    resource: resource, // Complete resource object
    dayName: getDayName(date, 0),
    isToday: isToday(date),
    isWeekend: isWeekend(date),
    formattedDate: date.format('dddd, MMMM D, YYYY')
  }
  
  emit('slot-click', slotInfo)
}

// Removed unused grid styles - now using flexbox layout

// Lifecycle
onMounted(() => {
  // Component mounted - resource calendar ready
})
</script>

<style scoped>
.atempo-cal-weekly-view {
  @apply flex flex-col h-full;
}

.atempo-cal-week-header {
  @apply flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800;
}

.atempo-cal-resource-spacer {
  @apply border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800;
  @apply flex items-center justify-center;
  height: 80px;
}

.atempo-cal-day-headers {
  @apply bg-white dark:bg-gray-800;
}

.atempo-cal-day-header {
  @apply flex flex-col items-center justify-center p-2 border-r border-gray-200 dark:border-gray-700;
  @apply cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors;
  height: 80px;
}

.atempo-cal-day-header.today {
  @apply bg-blue-50 dark:bg-blue-900/20;
}

.atempo-cal-day-header.weekend {
  @apply bg-gray-50 dark:bg-gray-800;
}

.atempo-cal-day-header.selected {
  @apply bg-blue-100 dark:bg-blue-800/30;
}

.atempo-cal-day-name {
  @apply text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide;
}

.atempo-cal-day-number {
  @apply text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1;
}

.atempo-cal-day-header.today .atempo-cal-day-number {
  @apply text-blue-600 dark:text-blue-400;
}

.atempo-cal-week-content {
  @apply flex-1 overflow-auto;
  max-height: calc(100vh - 200px);
}

.atempo-cal-resource-calendar {
  @apply flex flex-col;
}

.atempo-cal-resource-calendar-row {
  @apply flex border-b border-gray-200 dark:border-gray-600;
}

.atempo-cal-resource-info {
  @apply flex-shrink-0;
}

.atempo-cal-resource-days {
  @apply flex;
}

.atempo-cal-resource-day-cell {
  @apply relative overflow-hidden;
  @apply border-r border-gray-200 dark:border-gray-600;
}

.atempo-cal-resource-day-cell.today {
  @apply bg-blue-50/30 dark:bg-blue-900/10;
}

.atempo-cal-resource-day-cell.weekend {
  @apply bg-gray-50/50 dark:bg-gray-800/50;
}

/* Multi-day event styles */
.atempo-cal-multiday-event {
  @apply rounded-md shadow-sm border-l-4 px-2 py-1 cursor-pointer transition-all duration-200;
  @apply hover:shadow-md;
  min-height: 20px;
}

.atempo-cal-multiday-event .atempo-cal-event {
  @apply static w-full h-full;
  min-height: 20px;
}

.atempo-cal-multiday-event .atempo-cal-event-content {
  @apply flex items-center;
}

.atempo-cal-multiday-event .atempo-cal-event-title {
  @apply text-xs font-medium truncate;
}

.atempo-cal-multiday-event .atempo-cal-event-time {
  @apply text-xs opacity-75 ml-2 flex-shrink-0;
}

/* Single-day event stacking styles */
.atempo-cal-resource-day-cell .atempo-cal-event {
  @apply static w-full h-full;
  min-height: 18px;
}

.atempo-cal-resource-day-cell .atempo-cal-event-content {
  @apply flex items-center;
}

.atempo-cal-resource-day-cell .atempo-cal-event-title {
  @apply text-xs font-medium truncate;
}

.atempo-cal-resource-day-cell .atempo-cal-event-time {
  @apply text-xs opacity-75 ml-1 flex-shrink-0;
}

.atempo-cal-current-time-line {
  @apply absolute bg-red-500 h-0.5 z-20;
}

.atempo-cal-current-time-dot {
  @apply absolute -left-1 -top-1 w-2 h-2 bg-red-500 rounded-full;
}

/* Google Calendar-style event transitions */
.atempo-cal-event-expanded {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.atempo-cal-event-compact {
  opacity: 0.7;
  transform: scale(0.98);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .atempo-cal-day-header {
    @apply p-1;
    height: 60px;
  }
  
  .atempo-cal-day-name {
    @apply text-xs;
  }
  
  .atempo-cal-day-number {
    @apply text-sm;
  }
  
  .atempo-cal-time-spacer {
    height: 60px;
  }
}
</style>