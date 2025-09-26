<template>
  <div class="weekly-view">
    <!-- Week header with days -->
    <div class="week-header">
      <!-- Worker column spacer -->
      <div class="resource-spacer">
        <span class="resource-label">Colaboradores</span>
      </div>
      
      <!-- Day headers -->
      <div class="day-headers">
        <div class="day-grid">
          <div
            v-for="date in weekDates"
            :key="date.toString()"
            v-memo="[date.toString(), isToday(date), isWeekend(date)]"
            class="day-header"
            :class="{
              'is-today': isToday(date),
              'is-weekend': isWeekend(date)
            }"
            @click="handleDayClick(date)"
          >
            <div class="day-name">
              {{ getSpanishDay(date) }}
            </div>
            <div class="day-date">
              {{ formatSpanishDate(date) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Scrollable content area -->
    <div 
      class="week-content" 
      ref="scrollContainer"
      :style="{
        maxHeight: weekContentHeight,
        overflow: shouldEnableScroll ? 'auto' : 'visible'
      }"
    >
      <!-- Worker rows -->
      <div class="resource-container">
        <div
          v-for="worker in displayWorkers"
          :key="worker.id"
          v-memo="[worker.id, worker.name, worker.color, getWorkerRowHeight(worker.id)]"
          class="resource-row"
          :style="{ height: getWorkerRowHeight(worker.id) + 'px' }"
        >
          <!-- Worker info column -->
          <div class="resource-info">
            <div class="resource-content">
              <div class="resource-indicator" :style="{ backgroundColor: worker.color || '#6B7280' }"></div>
              <div class="resource-details">
                <span class="resource-name">{{ worker.name }}</span>
                <span v-if="worker.metadata?.role" class="resource-role">{{ worker.metadata.role }}</span>
              </div>
            </div>
          </div>

          <!-- Day cells for this worker -->
          <div class="resource-days">
            <!-- Multi-day events container positioned relative to day cells only -->
            <div class="multiday-events-overlay">
              <div
                v-for="event in getMultiDayEventsForWorkerWithLanes(worker.id)"
                :key="'multiday-' + event.id"
                class="resource-multiday-event group"
                :style="getWorkerMultiDayEventStyle(event, worker.id)"
                @click="handleEventClick(event, 'multiday')"
              >
                <div class="multiday-content" 
                  :class="{
                    'time-off': event.metadata?.type === 'time-off',
                    'training': event.metadata?.type === 'training',
                    'project': event.metadata?.type === 'project',
                    'certification': event.metadata?.category === 'certification'
                  }"
                  :style="{ 
                    backgroundColor: getEventColor(event, props.resources, props.specialEventColors) ? getEventColor(event, props.resources, props.specialEventColors) + '20' : '#3b82f620',
                    borderLeftColor: getEventColor(event, props.resources, props.specialEventColors) || '#3b82f6' 
                  }">
                  <span class="multiday-title">{{ formatMultiDayEvent(event) }}</span>
                  <!-- Delete button for multi-day events -->
                  <button
                    v-if="!readonly"
                    class="delete-btn multiday-delete-btn"
                    @click.stop="$emit('event-delete', event)"
                  >
                    <svg class="delete-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div
              v-for="date in weekDates"
              :key="'cell-' + worker.id + '-' + date.toString()"
              class="day-cell"
              :class="{
                'is-today': isToday(date),
                'is-weekend': isWeekend(date)
              }"

              @click="handleWorkerSlotClick(worker, date)"
            >
              <!-- Stacked events for this resource and day -->
              <div class="events-stack">
                <div
                  v-for="(event, eventIndex) in getSingleDayEventsForWorkerAndDay(worker.id, date)"
                  :key="event.id"
                  class="stacked-event"
                  :style="getStackedEventStyle(eventIndex, worker.id, date)"
                  @click.stop="handleEventClick(event, 'single-day')"
                >
                  <div 
                    class="event-bar group"
                    :class="{
                      'shift-morning': event.metadata?.shiftType === 'morning',
                      'shift-day': event.metadata?.shiftType === 'day',
                      'shift-evening': event.metadata?.shiftType === 'evening',
                      'shift-night': event.metadata?.shiftType === 'night',
                      'meeting': event.metadata?.type === 'meeting',
                      'training': event.metadata?.type === 'training',
                      'time-off': event.metadata?.type === 'time-off',
                      'maintenance': event.metadata?.type === 'maintenance',
                      'administrative': event.metadata?.type === 'administrative'
                    }"
                    :style="{
                      backgroundColor: getEventColor(event, props.resources, props.specialEventColors) ? getEventColor(event, props.resources, props.specialEventColors) + '30' : '#3b82f630',
                      borderLeftColor: getEventColor(event, props.resources, props.specialEventColors) || '#3b82f6',
                      color: '#1f2937'
                    }"
                  >
                    <span class="event-time">{{ formatEventTime(event) }}</span>
                    <!-- Delete button -->
                    <button
                      v-if="!readonly"
                      class="delete-btn"
                      @click.stop="$emit('event-delete', event)"
                    >
                      <svg class="delete-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Add event indicator for empty cells -->
              <div 
                v-if="!readonly && getSingleDayEventsForWorkerAndDay(worker.id, date).length === 0 && getMultiDayEventsForWorker(worker.id).length === 0"
                class="add-indicator"
              >
                <div class="add-btn">
                  <svg class="add-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
import { ref, computed, withDefaults, shallowRef, watch, onMounted } from 'vue'
import atemporal from 'atemporal'
import type {
  CalendarEvent,
  CalendarResource,
  SlotClickInfo,
  Atemporal
} from '../types'
import {
  getWeekDates,
  isToday as checkIsToday
} from '../utils/dateHelpers'
import {
  assignWorkerColors,
  getEventColor
} from '../utils/colorHelpers'
import {
  getSpanishDay,
  formatSpanishDate
} from '../utils/spanishDateHelpers'

/**
 * WeeklyView component with true vertical event stacking
 * Events are positioned in separate rows without any overlaps
 */

interface Props {
  events: CalendarEvent[]
  resources: CalendarResource[]
  weekStart: Atemporal
  onPrevWeek: () => void
  onNextWeek: () => void
  onDateSelect: (date: Atemporal) => void
  specialEventColors?: Record<string, string>
  readonly?: boolean
  // Scroll configuration options
  maxWorkersBeforeScroll?: number
  fixedHeight?: string | number
  enableAutoScroll?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  enableAutoScroll: true
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

// Configuration constants
const EVENT_HEIGHT = 24
const EVENT_GAP = 2
const MIN_ROW_HEIGHT = 60

// Template refs
const scrollContainer = ref<HTMLElement>()

/**
 * Get week dates based on week start
 */
const weekDates = computed((): Atemporal[] => {
  return getWeekDates(props.weekStart, 1)
})

/**
 * Get display workers (use provided resources)
 * Ensures consistent color assignment using the color helper system
 */
const displayWorkers = computed((): CalendarResource[] => {
  return assignWorkerColors(props.resources)
})

/**
 * Calculate dynamic height for the week content based on scroll configuration
 */
const weekContentHeight = computed((): string => {
  // Priority 1: Fixed height if specified
  if (props.fixedHeight) {
    return typeof props.fixedHeight === 'number' 
      ? `${props.fixedHeight}px` 
      : props.fixedHeight
  }
  
  // Priority 2: Check maxWorkersBeforeScroll threshold
  if (props.maxWorkersBeforeScroll && props.enableAutoScroll) {
    const workerCount = displayWorkers.value.length
    if (workerCount > props.maxWorkersBeforeScroll) {
      // Calculate height based on maxWorkersBeforeScroll
      const maxHeight = props.maxWorkersBeforeScroll * MIN_ROW_HEIGHT + 100 // Add padding
      return `${maxHeight}px`
    } else {
      // Don't enable scroll, let content expand naturally
      return 'auto'
    }
  }
  
  // Priority 3: Auto scroll behavior (default)
  if (props.enableAutoScroll) {
    return 'calc(100vh - 200px)'
  }
  
  // Priority 4: No scroll, expand to fit content
  return 'auto'
})

/**
 * Determine if scroll should be enabled based on configuration
 */
const shouldEnableScroll = computed((): boolean => {
  // Always enable scroll if fixed height is set
  if (props.fixedHeight) {
    return true
  }
  
  // Check worker count threshold
  if (props.maxWorkersBeforeScroll) {
    return displayWorkers.value.length > props.maxWorkersBeforeScroll
  }
  
  // Default auto scroll behavior
  return props.enableAutoScroll ?? true
})



/**
 * Get single-day events (non-multi-day events)
 */
const singleDayEvents = computed((): CalendarEvent[] => {
  // Filter events to only include single-day events (start and end on same day)
  const userEvents = props.events.filter(event => {
    try {
      const startDate = atemporal(event.startTime)
      const endDate = atemporal(event.endTime)
      const isSameDay = startDate.isSame(endDate, 'day')
      
      return isSameDay
    } catch {
      return false
    }
  })
  
  return userEvents
})

/**
 * Get multi-day events
 */
const multiDayEvents = computed((): CalendarEvent[] => {
  // Filter events that span multiple days
  const userEvents = props.events.filter(event => {
    const startDate = atemporal(event.startTime)
    const endDate = atemporal(event.endTime)
    return !startDate.isSame(endDate, 'day')
  })
  
  return userEvents
})

/**
 * Check if date is today
 */
const isToday = (date: Atemporal): boolean => {
  return checkIsToday(date)
}

/**
 * Check if date is weekend
 */
const isWeekend = (date: Atemporal): boolean => {
  const dayOfWeek = date.dayOfWeek() as number
  return dayOfWeek === 6 || dayOfWeek === 0 // Saturday or Sunday
}



/**
 * Get localized day name
 */
const getDayName = (date: Atemporal, _index: number): string => {
  // Use atemporal's built-in formatting which is more reliable
  try {
    return date.format('ddd') // This should give us the correct abbreviated day name
  } catch {
    // Final fallback - avoid timezone issues by using date string directly
    const dateStr = date.format('YYYY-MM-DD')
    const jsDate = new Date(dateStr + 'T12:00:00') // Add noon time to avoid timezone shifts
    return jsDate.toLocaleDateString('en-US', { weekday: 'short' })
  }
}

/**
 * Memoized cache for single-day events by worker and date
 */
const singleDayEventsCache = shallowRef(new Map<string, CalendarEvent[]>())

/**
 * Get single-day events for a specific worker and day (memoized)
 */
const getSingleDayEventsForWorkerAndDay = (workerId: string, date: Atemporal): CalendarEvent[] => {
  const targetDate = date.format('YYYY-MM-DD')
  const cacheKey = `${workerId}-${targetDate}`
  

  
  // Check cache first
  if (singleDayEventsCache.value.has(cacheKey)) {
    return singleDayEventsCache.value.get(cacheKey)!
  }
  


  
  const result = singleDayEvents.value.filter(event => {
    const eventStartDate = atemporal(event.startTime)
    const eventEndDate = atemporal(event.endTime)
    
    const isSameDay = eventStartDate.format('YYYY-MM-DD') === targetDate && 
                      eventEndDate.format('YYYY-MM-DD') === targetDate
    
    const matchesWorker = event.resourceId === workerId
    const matches = isSameDay && matchesWorker
    

    
    return matches
  }).sort((a, b) => {
    // Sort by start time for consistent stacking order
    const startA = atemporal(a.startTime)
    const startB = atemporal(b.startTime)
    return startA.isBefore(startB) ? -1 : 1
  })
  

  
  // Cache the result
  singleDayEventsCache.value.set(cacheKey, result)
  return result
}

/**
 * Memoized cache for max events per worker
 */
const maxEventsCache = shallowRef(new Map<string, number>())

/**
 * Calculate the maximum number of total events (single-day + multi-day) that can appear on any single day for a worker - memoized
 */
const getMaxEventsForWorker = (workerId: string): number => {
  const firstWeekDate = weekDates.value[0]
  if (!firstWeekDate) return 0
  
  const weekKey = firstWeekDate.format('YYYY-MM-DD')
  const cacheKey = `${workerId}-${weekKey}`
  
  // Check cache first
  if (maxEventsCache.value.has(cacheKey)) {
    return maxEventsCache.value.get(cacheKey)!
  }
  
  let maxEvents = 0
  let debugInfo: any[] = []
  
  weekDates.value.forEach(date => {
    // Count single-day events for this specific date
    const singleDayEventsCount = getSingleDayEventsForWorkerAndDay(workerId, date).length
    
    // Count multi-day events that overlap with this specific date
    const multiDayEvents = getMultiDayEventsForWorker(workerId)
    const multiDayEventsCount = multiDayEvents.filter(event => {
      const eventStart = atemporal(event.startTime).startOf('day')
      const eventEnd = atemporal(event.endTime).startOf('day')
      const targetDate = date.startOf('day')
      
      // Check if the multi-day event overlaps with this specific date
      return eventStart.isSameOrBefore(targetDate) && eventEnd.isSameOrAfter(targetDate)
    }).length
    
    // Total events that can appear on this day
    const totalEventsForDay = singleDayEventsCount + multiDayEventsCount
    maxEvents = Math.max(maxEvents, totalEventsForDay)
    
    debugInfo.push({
      date: date.format('YYYY-MM-DD'),
      singleDay: singleDayEventsCount,
      multiDay: multiDayEventsCount,
      total: totalEventsForDay
    })
  })
  

  
  // Cache the result
  maxEventsCache.value.set(cacheKey, maxEvents)
  return maxEvents
}

/**
 * Memoized cache for multi-day events by worker
 */
const multiDayEventsCache = shallowRef(new Map<string, CalendarEvent[]>())

/**
 * Get multi-day events for a specific worker that intersect with the current week (memoized)
 */
const getMultiDayEventsForWorker = (workerId: string): CalendarEvent[] => {
  const weekStart = weekDates.value[0]
  const weekEnd = weekDates.value[weekDates.value.length - 1]
  
  if (!weekStart || !weekEnd) return []
  
  const cacheKey = `${workerId}-${weekStart.format('YYYY-MM-DD')}`
  
  // Check cache first
  if (multiDayEventsCache.value.has(cacheKey)) {
    return multiDayEventsCache.value.get(cacheKey)!
  }
  
  const result = multiDayEvents.value.filter(event => {
    if (event.resourceId !== workerId) return false
    
    const eventStart = atemporal(event.startTime).startOf('day')
    const eventEnd = atemporal(event.endTime).startOf('day')
    const weekStartDay = weekStart!.startOf('day')
    const weekEndDay = weekEnd!.startOf('day')
    
    // Event intersects with week if:
    // event start <= week end AND event end >= week start
    return eventStart.isSameOrBefore(weekEndDay) && eventEnd.isSameOrAfter(weekStartDay)
  })
  
  // Cache the result
  multiDayEventsCache.value.set(cacheKey, result)
  return result
}

/**
 * Check if two multi-day events overlap in their date ranges
 * Fixed to properly handle end times for multi-day events
 */
const doMultiDayEventsOverlap = (event1: CalendarEvent, event2: CalendarEvent): boolean => {
  const start1 = atemporal(event1.startTime).startOf('day')
  // For end times, use endOf('day') to include the entire end date
  const end1 = atemporal(event1.endTime).endOf('day')
  const start2 = atemporal(event2.startTime).startOf('day')
  const end2 = atemporal(event2.endTime).endOf('day')
  
  // Events overlap if start1 <= end2 && start2 <= end1
  // Use proper date comparison for multi-day events
  return start1.isSameOrBefore(end2) && start2.isSameOrBefore(end1)
}

/**
 * Get multi-day events for a specific worker with proper lane assignments
 */
const getMultiDayEventsForWorkerWithLanes = (workerId: string): (CalendarEvent & { lane: number })[] => {
  const workerEvents = getMultiDayEventsForWorker(workerId)
  if (workerEvents.length === 0) return []
  
  // Sort events by start time for consistent processing
  const sortedEvents = workerEvents.sort((a, b) => {
    const startA = atemporal(a.startTime)
    const startB = atemporal(b.startTime)
    return startA.isBefore(startB) ? -1 : 1
  })
  
  // Assign lanes using proper overlap detection for multi-day events
  const lanes: CalendarEvent[][] = []
  const eventsWithLanes: (CalendarEvent & { lane: number })[] = []
  
  sortedEvents.forEach((event) => {
    // Find the first available lane where this event doesn't overlap with any existing event
    let assignedLane = -1
    
    for (let i = 0; i < lanes.length; i++) {
      let canPlaceInLane = true
      
      // Check if this event overlaps with any event in this lane
      const currentLane = lanes[i]
      if (currentLane) {
        for (const laneEvent of currentLane) {
          if (doMultiDayEventsOverlap(event, laneEvent)) {
            canPlaceInLane = false
            break
          }
        }
      }
      
      if (canPlaceInLane) {
        assignedLane = i
        const targetLane = lanes[i]
        if (targetLane) {
          targetLane.push(event)
        }
        break
      }
    }
    
    // If no existing lane is available, create a new one
    if (assignedLane === -1) {
      assignedLane = lanes.length
      lanes.push([event])
    }
    
    eventsWithLanes.push({ ...event, lane: assignedLane })
  })
  
  return eventsWithLanes
}

/**
 * Calculate the maximum number of multi-day events for a worker
 */
const getMaxMultiDayEventsForWorker = (workerId: string): number => {
  const eventsWithLanes = getMultiDayEventsForWorkerWithLanes(workerId)
  if (eventsWithLanes.length === 0) return 0
  
  // Return the maximum lane number + 1 (since lanes are 0-indexed)
  return Math.max(...eventsWithLanes.map(event => event.lane)) + 1
}

/**
 * Memoized cache for worker row heights
 */
const workerRowHeightCache = shallowRef(new Map<string, number>())

/**
 * Calculate worker row height based on maximum events that can appear on any single day - memoized
 */
const getWorkerRowHeight = (workerId: string): number => {
  const firstWeekDate = weekDates.value[0]
  if (!firstWeekDate) return MIN_ROW_HEIGHT
  
  const weekKey = firstWeekDate.format('YYYY-MM-DD')
  const cacheKey = `${workerId}-${weekKey}`
  
  // Check cache first
  if (workerRowHeightCache.value.has(cacheKey)) {
    return workerRowHeightCache.value.get(cacheKey)!
  }
  
  // Get the maximum number of events that can appear on any single day
  const maxEventsPerDay = getMaxEventsForWorker(workerId)
  
  // Calculate height with proper padding for stacked events
  // Need top padding (8px) + bottom padding (16px) + extra space for proper visual separation
  const result = maxEventsPerDay === 0 ? MIN_ROW_HEIGHT : 
    Math.max(MIN_ROW_HEIGHT, maxEventsPerDay * (EVENT_HEIGHT + EVENT_GAP) + 32) // 32px total padding (8px top + 24px bottom)
  
  // Cache the result
  workerRowHeightCache.value.set(cacheKey, result)
  return result
}

/**
 * Get style for stacked event (positioned below multi-day events for the specific day)
 */
const getStackedEventStyle = (eventIndex: number, workerId: string, eventDate?: Atemporal): Record<string, string | number> => {
  let multiDayEventsCount = 0
  
  if (eventDate) {
    // Count multi-day events that overlap with this specific date
    const multiDayEvents = getMultiDayEventsForWorker(workerId)
    multiDayEventsCount = multiDayEvents.filter(event => {
      const eventStart = atemporal(event.startTime).startOf('day')
      // Fix: Use endOf('day') to properly include the entire end date
      const eventEnd = atemporal(event.endTime).endOf('day')
      const targetDate = eventDate.startOf('day')
      
      return eventStart.isSameOrBefore(targetDate) && eventEnd.isSameOrAfter(targetDate)
    }).length
  } else {
    // Fallback to maximum multi-day events for the worker
    multiDayEventsCount = getMaxMultiDayEventsForWorker(workerId)
  }
  
  // Calculate proper vertical positioning with adequate spacing
  const multiDayOffset = multiDayEventsCount * (EVENT_HEIGHT + EVENT_GAP)
  const eventOffset = eventIndex * (EVENT_HEIGHT + EVENT_GAP)
  const top = 8 + multiDayOffset + eventOffset // 8px top padding + multi-day offset + event stacking
  
  return {
    position: 'absolute',
    top: top + 'px',
    left: '4px',
    right: '4px',
    width: 'calc(100% - 8px)', // Explicit width calculation
    height: EVENT_HEIGHT + 'px',
    zIndex: 10 + eventIndex, // Higher z-index for proper layering
    // Prevent overlapping with proper containment
    boxSizing: 'border-box'
  }
}

/**
 * Get style for worker-specific multi-day event with proper positioning
 */
const getWorkerMultiDayEventStyle = (event: CalendarEvent & { lane: number }, _workerId: string): Record<string, string | number> => {
  const firstWeekDate = weekDates.value[0]
  const lastWeekDate = weekDates.value[weekDates.value.length - 1]
  
  if (!firstWeekDate || !lastWeekDate) {
    return { display: 'none' }
  }
  
  const eventStartDate = atemporal(event.startTime).startOf('day')
  // Fix: Use endOf('day') for proper end date calculation
  const eventEndDate = atemporal(event.endTime).endOf('day')
  const weekStart = firstWeekDate.startOf('day')
  const weekEnd = lastWeekDate.endOf('day')
  
  // Calculate the actual start and end dates within the current week
  const displayStartDate = eventStartDate.isBefore(weekStart) ? weekStart : eventStartDate
  const displayEndDate = eventEndDate.isAfter(weekEnd) ? weekEnd : eventEndDate
  
  // Find start and end indices within the current week
  let startIndex = -1
  let endIndex = -1
  
  weekDates.value.forEach((date, index) => {
    const dateDay = date.startOf('day')
    
    if (dateDay.isSame(displayStartDate)) {
      startIndex = index
    }
    if (dateDay.isSame(displayEndDate)) {
      endIndex = index
    }
  })
  
  // Fallback: if exact dates not found, find closest indices
  if (startIndex === -1) {
    startIndex = weekDates.value.findIndex(date => 
      date.startOf('day').isSameOrAfter(displayStartDate)
    )
    if (startIndex === -1) startIndex = 0
  }
  
  if (endIndex === -1) {
    endIndex = weekDates.value.findIndex(date => 
      date.startOf('day').isSameOrAfter(displayEndDate)
    )
    if (endIndex === -1) endIndex = weekDates.value.length - 1
  }
  
  const span = Math.max(1, endIndex - startIndex + 1)
  const cellWidth = 100 / 7 // Each day cell is 1/7 of the total width
  
  // Position using the pre-calculated lane from the event object
  const top = 8 + event.lane * (EVENT_HEIGHT + EVENT_GAP) // 8px top padding
  
  return {
    position: 'absolute',
    top: top + 'px',
    left: (startIndex * cellWidth) + '%',
    width: (span * cellWidth) + '%',
    height: EVENT_HEIGHT + 'px',
    zIndex: 10 + event.lane
  }
}

// Removed global multi-day events functions - now handled per resource

/**
 * Format event time for display in 12-hour format
 */
const formatEventTime = (event: CalendarEvent): string => {
  if (event.isAllDay) {
    return 'All day'
  }
  
  const startTime = atemporal(event.startTime)
  const endTime = atemporal(event.endTime)
  
  const startFormatted = startTime.format('h:mma')
  const endFormatted = endTime.format('h:mma')
  
  return `${startFormatted} - ${endFormatted}`
}

/**
 * Format multi-day event with title and date range in DD/MM format
 */
const formatMultiDayEvent = (event: CalendarEvent): string => {
  const startDate = atemporal(event.startTime)
  const endDate = atemporal(event.endTime)
  
  const startFormatted = startDate.format('DD/MM')
  const endFormatted = endDate.format('DD/MM')
  
  return `${event.title} ${startFormatted} - ${endFormatted}`
}

/**
 * Handle day header click
 */
const handleDayClick = (date: Atemporal): void => {
  emit('date-change', date.toString())
}

/**
 * Handle worker slot click
 */
const handleWorkerSlotClick = (worker: CalendarResource, date: Atemporal): void => {
  if (props.readonly) return
  
  const slotInfo: SlotClickInfo = {
    date: date.format('YYYY-MM-DD'),
    time: '09:00', // Default time for new events
    resourceId: worker.id,
    resource: worker,
    dayName: getDayName(date, 0),
    isToday: isToday(date),
    isWeekend: isWeekend(date),
    formattedDate: date.format('dddd, MMMM D, YYYY')
  }
  
  emit('slot-click', slotInfo)
}

/**
 * Handle event click
 */
const handleEventClick = (event: CalendarEvent, _eventType: 'single-day' | 'multiday'): void => {
  emit('event-click', event)
}

// Cache invalidation watchers for performance optimization
watch([() => props.events, () => props.resources, weekDates], () => {
  singleDayEventsCache.value.clear()
  multiDayEventsCache.value.clear()
  workerRowHeightCache.value.clear()
  maxEventsCache.value.clear()
}, { deep: true, immediate: true })

// Component lifecycle
onMounted(() => {
  // Component mounted successfully
})

// Removed getResourceName function - no longer needed
</script>

<style scoped>

.weekly-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--atempo-bg-primary);
  color: var(--atempo-text-primary);
  border: 1px solid var(--atempo-border-primary) !important;
  will-change: scroll-position;
  transform: translateZ(0);
}

.week-header {
  display: flex;
  border-bottom: 1px solid var(--atempo-border-primary);
  background-color: var(--atempo-header-bg);
}

.resource-spacer {
  width: 190px;
  min-width: 190px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 0.5rem;
  border-right: 1px solid var(--atempo-border-primary);
  background-color: var(--atempo-colaboradores-bg);
  height: 90px;
}

.resource-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--atempo-text-primary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.day-headers {
  flex: 1;
  background-color: var(--atempo-bg-primary);
}

.day-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  height: 100%;
}

.day-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem 0.5rem;
  border-right: 1px solid var(--atempo-border-primary) !important;
  border-bottom: 1px solid var(--atempo-border-primary) !important;
  cursor: pointer;
  transition: background-color 0.2s ease;
  height: 90px;
  background-color: var(--atempo-bg-primary);
  gap: 0.5rem;
}

.day-header:hover {
  background-color: var(--atempo-bg-secondary);
}

.day-header.is-today {
  background-color: var(--atempo-accent-primary);
  color: white;
  font-weight: 600;
}

.day-header.is-weekend {
  background-color: var(--atempo-bg-primary);
  color: var(--atempo-text-secondary);
}

.day-header.is-selected {
  background-color: color-mix(in srgb, var(--atempo-accent-primary) 20%, var(--atempo-bg-primary));
}

.day-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: inherit;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.25rem;
}

.day-date {
  font-size: 0.875rem;
  font-weight: 500;
  color: inherit;
  line-height: 1.2;
}

.day-number {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--atempo-text-primary);
  margin-top: 0.25rem;
}

.day-header.is-today .day-number {
  color: var(--atempo-accent-primary);
}

.week-content {
  flex: 1;
  position: relative;
  background-color: var(--atempo-bg-primary);
  /* Height and overflow are now controlled dynamically via inline styles */
  /* Optimize scrolling performance */
  -webkit-overflow-scrolling: touch;
  will-change: scroll-position;
  transform: translateZ(0); /* Force hardware acceleration */
}

/* Removed global multi-day section styles */

.worker-multiday-event {
  cursor: pointer;
  transition: all 0.2s ease;
}

.worker-multiday-event:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
}

/* Keep resource-multiday-event for backward compatibility */
.resource-multiday-event {
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
  will-change: transform;
  transform: translateZ(0); /* Force hardware acceleration */
}

.resource-multiday-event:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
}

.multiday-content {
  width: 100%;
  height: 100%;
  border-radius: 0.375rem;
  box-shadow: 0 1px 2px 0 var(--atempo-shadow);
  border-left: 4px solid var(--atempo-accent-primary);
  padding: 0.25rem 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--atempo-text-primary);
  position: relative;
  overflow: visible;
}

/* Multi-day event type styles */
.multiday-content.time-off {
  background-color: #dcfce7;
  border-left-color: #16a34a;
}

.dark .multiday-content.time-off {
  background-color: rgba(20, 83, 45, 0.3);
}

.multiday-content.training {
  background-color: #fed7aa;
  border-left-color: #b45309;
}

.dark .multiday-content.training {
  background-color: rgba(154, 52, 18, 0.3);
}

.multiday-content.project {
  background-color: #fef3c7;
  border-left-color: #b45309;
}

.dark .multiday-content.project {
  background-color: rgba(161, 98, 7, 0.3);
}

.multiday-content.certification {
  background-color: #fed7aa;
  border-left-color: #b45309;
}

.dark .multiday-content.certification {
  background-color: rgba(154, 52, 18, 0.3);
}

.multiday-title {
    font-size: 0.75rem;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--atempo-text-primary);
    flex: 1;
    margin-right: 0.5rem;
  }

.multiday-duration {
  font-size: 0.75rem;
  opacity: 0.85;
  margin-left: 0.5rem;
  flex-shrink: 0;
  font-weight: 500;
  color: var(--atempo-text-primary);
}

.worker-container {
  display: flex;
  flex-direction: column;
}

.worker-row {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  position: relative;
}

.dark .worker-row {
  border-bottom-color: #4b5563;
}

.worker-info {
  flex-shrink: 0;
  border-right: 1px solid #e5e7eb;
  width: 190px;
}

.dark .worker-info {
  border-right-color: #374151;
}

.worker-content {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0.5rem 0.75rem;
  background-color: #f9fafb;
}

.dark .worker-content {
  background-color: #1f2937;
}

.worker-indicator {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.worker-details {
  display: flex;
  flex-direction: column;
  margin-left: 0.5rem;
}

.worker-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dark .worker-name {
  color: #f9fafb;
}

.worker-role {
  font-size: 0.75rem;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dark .worker-role {
  color: #9ca3af;
}

.worker-days {
  display: flex;
  flex: 1;
  position: relative;
}

/* Keep resource classes for backward compatibility */
.resource-container {
  display: flex;
  flex-direction: column;
}

.resource-row {
  display: flex;
  border-bottom: 1px solid var(--atempo-border-primary) !important;
  position: relative;
  background-color: var(--atempo-bg-primary);
  /* Framework compatibility - ensure borders are visible */
  border-left: 1px solid var(--atempo-border-primary) !important;
  border-right: 1px solid var(--atempo-border-primary) !important;
  /* Optimize paint performance */
  will-change: transform;
  transform: translateZ(0); /* Force hardware acceleration */
}

.resource-info {
  flex-shrink: 0;
  border-right: 1px solid var(--atempo-border-primary) !important;
  /* Dynamic width based on content */
  min-width: 190px;
  max-width: 250px;
  height: 100% !important;
  width: auto;
  /* Ensure full height inheritance */
  height: 100%;
  display: flex;
  flex-direction: column;
}

.resource-content {
  display: flex;
  align-items: center;
  /* Expand to full row height */
  height: 100%;
  flex: 1;
  padding: 0.5rem 0.75rem;
  background-color: var(--atempo-bg-secondary);
}

.resource-indicator {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.resource-details {
  display: flex;
  flex-direction: column;
  margin-left: 0.5rem;
}

.resource-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--atempo-text-primary);
  /* Allow text wrapping for longer names */
  word-wrap: break-word;
  line-height: 1.2;
}

.resource-role {
  font-size: 0.75rem;
  color: var(--atempo-text-secondary);
  /* Allow text wrapping for longer roles */
  word-wrap: break-word;
  line-height: 1.2;
  margin-top: 0.125rem;
}

.resource-days {
  display: flex;
  flex: 1;
  position: relative;
  /* Ensure resource-days container expands to match row height */
  height: 100%;
  min-height: inherit;
}

.multiday-events-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  /* Ensure overlay expands to full row height */
  height: 100%;

  .worker-multiday-event,
  .resource-multiday-event {
    pointer-events: auto;
  }
}

.day-cell {
  flex: 1;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-right: 1px solid var(--atempo-border-primary) !important;
  border-top: 1px solid var(--atempo-border-secondary) !important;
  min-height: 60px;
  /* Force day-cell to inherit full row height */
  height: 100%;
  display: flex;
  flex-direction: column;
  /* Ensure proper height inheritance from parent */
  align-self: stretch;
}

.day-cell:hover {
  background-color: var(--atempo-bg-secondary);
}

.day-cell.is-today {
  background-color: color-mix(in srgb, var(--atempo-accent-primary) 5%, var(--atempo-bg-primary));
}

.day-cell.is-weekend {
  background-color: color-mix(in srgb, var(--atempo-text-tertiary) 3%, var(--atempo-bg-primary));
}

.events-stack {
  position: relative;
  width: 100%;
  /* Take full height of day-cell */
  height: 100%;
  flex: 1;
  /* Ensure events stack properly within the expanded day-cell */
  min-height: inherit;
  /* Provide proper container for absolutely positioned events */
  overflow: visible;
}

.stacked-event {
  position: absolute;
  will-change: transform;
  transform: translateZ(0);
}

.event-bar {
  width: 100%;
  height: 100%;
  border-radius: 0.375rem;
  box-shadow: 0 1px 2px 0 var(--atempo-shadow);
  border-left: 4px solid var(--atempo-accent-primary);
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--atempo-text-primary);
  background-color: color-mix(in srgb, var(--atempo-accent-primary) 10%, var(--atempo-bg-primary));
  /* Optimize paint performance */
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  will-change: transform;
  transform: translateZ(0); /* Force hardware acceleration */
}

.event-bar:hover {
  box-shadow: 0 4px 6px -1px var(--atempo-shadow-lg);
}

/* Worker scheduling event type styles */
.event-bar.shift-morning {
  background-color: #dbeafe;
  border-left-color: #2563eb;
}

.event-bar.shift-day {
  background-color: #d1fae5;
  border-left-color: #059669;
}

.event-bar.shift-evening {
  background-color: #fef3c7;
  border-left-color: #d97706;
}

.event-bar.shift-night {
  background-color: #e9d5ff;
  border-left-color: #7c3aed;
}

.event-bar.meeting {
  background-color: #fee2e2;
  border-left-color: #dc2626;
}

.event-bar.training {
  background-color: #fed7aa;
  border-left-color: #ea580c;
}

.event-bar.time-off {
  background-color: #dcfce7;
  border-left-color: #16a34a;
}

.event-bar.maintenance {
  background-color: #fef3c7;
  border-left-color: #ca8a04;
}

.event-bar.administrative {
  background-color: #e0e7ff;
  border-left-color: #4f46e5;
}

.event-title {
  font-size: 0.75rem;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  color: var(--atempo-text-primary);
}

.event-time {
  font-size: 0.75rem;
  opacity: 0.85;
  margin-left: 0.5rem;
  flex-shrink: 0;
  color: var(--atempo-text-primary);
  font-weight: 500;
}

.event-resource {
  font-size: 0.75rem;
  opacity: 0.75;
  margin-left: 0.5rem;
  flex-shrink: 0;
}

.delete-btn {
  opacity: 0;
  width: 1.25rem;
  height: 1.25rem;
  border: none;
  border-radius: 0.375rem;
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #dc2626;
  transition: all 0.2s ease;
  margin-left: 0.5rem;
  cursor: pointer;
  flex-shrink: 0;
  z-index: 10;
}

.group:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  background-color: #fee2e2;
  color: #b91c1c;
  transform: scale(1.1);
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.15);
}

.delete-btn:active {
  transform: scale(0.95);
}

.delete-btn:focus {
  outline: 2px solid #dc2626;
  outline-offset: 2px;
}

.delete-icon {
  width: 0.75rem;
  height: 0.75rem;
  stroke-width: 2.5;
}

/* Multi-day event delete button specific styling */
.multiday-delete-btn {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  width: 1.125rem;
  height: 1.125rem;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
}

.multiday-delete-btn:hover {
  background-color: #fee2e2;
  backdrop-filter: blur(8px);
}

.multiday-delete-btn .delete-icon {
  width: 0.625rem;
  height: 0.625rem;
}

.add-indicator {
  opacity: 0;
  transition: opacity 0.2s ease;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  /* Ensure it works with flexbox day-cell */
  z-index: 1;
}

.day-cell:hover .add-indicator {
  opacity: 1;
}

.add-btn {
  background-color: #3b82f6;
  color: white;
  border-radius: 50%;
  width: 2.125rem;
  height: 2.125rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
}

.add-icon {
  width: 1rem;
  height: 1rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .day-header {
    padding: 0.25rem;
    min-height: 60px;
  }
  
  .day-name {
    font-size: 0.75rem;
  }
  
  .day-number {
    font-size: 0.875rem;
  }
  
  .resource-spacer {
    min-height: 60px;
  }
}
</style>