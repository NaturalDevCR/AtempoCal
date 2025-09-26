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
                class="resource-multiday-event"
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
                  :style="getStackedEventStyle(eventIndex, worker.id)"
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
import { ref, computed, withDefaults, shallowRef, watch } from 'vue'
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
  // Generate example events for the week of September 22-28, 2025
  const testSingleDayEvents: CalendarEvent[] = []
  
  // Check if current week contains September 25, 2025 (Thursday)
  const targetDate = atemporal('2025-09-25')
  const isTargetWeek = weekDates.value.some(date => date.isSame(targetDate, 'day'))
  
  if (isTargetWeek) {
    // September 22, 2025 (Monday) - John Smith (Production Supervisor)
    testSingleDayEvents.push(
      {
        id: 'john-sep22-1',
        title: 'Morning Shift Supervision',
        startTime: '2025-09-22T06:00:00',
        endTime: '2025-09-22T14:00:00',
        resourceId: 'emp-001',
        metadata: { type: 'shift', shiftType: 'morning' }
      },
      
      // September 23, 2025 (Tuesday) - John Smith & Sarah Johnson
      {
        id: 'john-sep23-1',
        title: 'Q3 Performance Reviews',
        startTime: '2025-09-23T09:00:00',
        endTime: '2025-09-23T11:00:00',
        resourceId: 'emp-001',
        color: '#059669',
        metadata: { type: 'meeting', category: 'hr' }
      },
      {
        id: 'sarah-sep23-1',
        title: 'Safety Training Renewal',
        startTime: '2025-09-23T09:00:00',
        endTime: '2025-09-23T12:00:00',
        resourceId: 'emp-002',
        color: '#DC2626',
        metadata: { type: 'training', category: 'safety' }
      },
      {
        id: 'mike-sep23-1',
        title: 'Vendor Meeting',
        startTime: '2025-09-23T10:00:00',
        endTime: '2025-09-23T11:00:00',
        resourceId: 'emp-003',
        color: '#7C3AED',
        metadata: { type: 'meeting', category: 'vendor' }
      },
      
      // September 24, 2025 (Wednesday) - Equipment & Quality Focus
      {
        id: 'john-sep24-1',
        title: 'Equipment Maintenance Oversight',
        startTime: '2025-09-24T08:00:00',
        endTime: '2025-09-24T16:00:00',
        resourceId: 'emp-001',
        color: '#D97706',
        metadata: { type: 'maintenance', category: 'oversight' }
      },
      {
        id: 'sarah-sep24-1',
        title: 'Inspection Rounds',
        startTime: '2025-09-24T06:00:00',
        endTime: '2025-09-24T14:00:00',
        resourceId: 'emp-002',
        metadata: { type: 'inspection', category: 'quality' }
      },
      {
        id: 'mike-sep24-1',
        title: 'Staff Training',
        startTime: '2025-09-24T14:00:00',
        endTime: '2025-09-24T16:00:00',
        resourceId: 'emp-003',
        color: '#7C2D12',
        metadata: { type: 'training', category: 'staff' }
      },
      {
        id: 'lisa-sep24-1',
        title: 'Emergency Repair',
        startTime: '2025-09-24T10:00:00',
        endTime: '2025-09-24T18:00:00',
        resourceId: 'emp-004',
        color: '#DC2626',
        metadata: { type: 'maintenance', category: 'emergency' }
      },
      
      // September 25, 2025 (Thursday) - Today's Events
      {
        id: 'john-sep25-1',
        title: 'Team Meeting',
        startTime: '2025-09-25T09:00:00',
        endTime: '2025-09-25T10:00:00',
        resourceId: 'emp-001',
        color: '#7C3AED',
        metadata: { type: 'meeting', category: 'team' }
      },
      {
        id: 'john-sep25-2',
        title: 'Afternoon Shift',
        startTime: '2025-09-25T14:00:00',
        endTime: '2025-09-25T22:00:00',
        resourceId: 'emp-001',
        metadata: { type: 'shift', shiftType: 'afternoon' }
      },
      {
        id: 'sarah-sep25-1',
        title: 'Quality Review Meeting',
        startTime: '2025-09-25T13:00:00',
        endTime: '2025-09-25T14:00:00',
        resourceId: 'emp-002',
        color: '#B45309',
        metadata: { type: 'meeting', category: 'quality' }
      },
      {
        id: 'mike-sep25-1',
        title: 'Logistics Planning',
        startTime: '2025-09-25T09:00:00',
        endTime: '2025-09-25T17:00:00',
        resourceId: 'emp-003',
        color: '#047857',
        metadata: { type: 'planning', category: 'logistics' }
      },
      {
        id: 'lisa-sep25-1',
        title: 'Maintenance Planning',
        startTime: '2025-09-25T07:00:00',
        endTime: '2025-09-25T15:00:00',
        resourceId: 'emp-004',
        color: '#D97706',
        metadata: { type: 'planning', category: 'maintenance' }
      },
      
      // September 26, 2025 (Friday) - End of Quarter Prep
      {
        id: 'john-sep26-1',
        title: 'End-of-Quarter Planning',
        startTime: '2025-09-26T10:00:00',
        endTime: '2025-09-26T12:00:00',
        resourceId: 'emp-001',
        color: '#059669',
        metadata: { type: 'planning', category: 'quarterly' }
      },
      {
        id: 'sarah-sep26-1',
        title: 'Documentation Review',
        startTime: '2025-09-26T08:00:00',
        endTime: '2025-09-26T16:00:00',
        resourceId: 'emp-002',
        color: '#7C3AED',
        metadata: { type: 'administrative', category: 'documentation' }
      },
      {
        id: 'mike-sep26-1',
        title: 'Weekend Prep',
        startTime: '2025-09-26T07:00:00',
        endTime: '2025-09-26T15:00:00',
        resourceId: 'emp-003',
        color: '#92400E',
        metadata: { type: 'preparation', category: 'weekend' }
      },
      {  
        id: 'lisa-sep26-1',
        title: 'Tool Inventory',
        startTime: '2025-09-26T09:00:00',
        endTime: '2025-09-26T13:00:00',
        resourceId: 'emp-004',
        metadata: { type: 'inventory', category: 'tools' }
      },
      
      // September 27, 2025 (Saturday) - Special Events Examples
      {
        id: 'mike-sep27-dayoff',
        title: 'Day Off',
        startTime: '2025-09-27T00:00:00',
        endTime: '2025-09-27T23:59:59',
        resourceId: 'emp-003',
        eventType: 'day-off',
        isAllDay: true,
        metadata: { type: 'time-off', category: 'personal' }
      },
      {
        id: 'lisa-sep28-sick',
        title: 'Sick Leave',
        startTime: '2025-09-28T00:00:00',
        endTime: '2025-09-28T23:59:59',
        resourceId: 'emp-004',
        eventType: 'sick-leave',
        isAllDay: true,
        metadata: { type: 'time-off', category: 'medical' }
      }
    )
  }
  
  const userEvents = props.events.filter(event => {
    const startDate = atemporal(event.startTime)
    const endDate = atemporal(event.endTime)
    return startDate.isSame(endDate, 'day')
  })
  
  return [...userEvents, ...testSingleDayEvents]
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
  
  // Generate multi-day events for September 2025
  const testMultiDayEvents: CalendarEvent[] = []
  
  // Check if current week contains September 25, 2025 (Thursday)
  const targetDate = atemporal('2025-09-25')
  const isTargetWeek = weekDates.value.some(date => date.isSame(targetDate, 'day'))
  
  if (isTargetWeek) {
    // Multi-day events for September 2025
    testMultiDayEvents.push(
      // Annual leave period (September 23-25, 2025)
      {
        id: 'sarah-leave-sep2025',
        title: 'Annual Leave',
        startTime: '2025-09-23T00:00:00',
        endTime: '2025-09-25T23:59:59',
        resourceId: 'emp-002',
        eventType: 'annual-leave',
        isAllDay: true,
        metadata: { type: 'time-off', category: 'vacation' }
      },
      
      // Equipment upgrade project (September 22-26, 2025)
      {
        id: 'equipment-upgrade-sep2025',
        title: 'Equipment Upgrade Project',
        startTime: '2025-09-22T00:00:00',
        endTime: '2025-09-26T23:59:59',
        resourceId: 'emp-003',
        color: '#92400E',
        isAllDay: true,
        metadata: { type: 'project', category: 'equipment' }
      },
      
      // Safety certification course (September 24-25, 2025)
      {
        id: 'safety-cert-sep2025',
        title: 'Safety Certification Course',
        startTime: '2025-09-24T00:00:00',
        endTime: '2025-09-25T23:59:59',
        resourceId: 'emp-004',
        eventType: 'training',
        isAllDay: true,
        metadata: { type: 'training', category: 'certification' }
      },
      
      // Facility maintenance shutdown (September 27-28, 2025)
      {
        id: 'facility-shutdown-sep2025',
        title: 'Facility Maintenance Shutdown',
        startTime: '2025-09-27T00:00:00',
        endTime: '2025-09-28T23:59:59',
        resourceId: 'emp-001',
        eventType: 'maintenance',
        isAllDay: true,
        metadata: { type: 'maintenance', category: 'shutdown' }
      }
    )
  }
  
  return [...userEvents, ...testMultiDayEvents]
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
    
    return isSameDay && event.resourceId === workerId
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
 * Calculate the maximum number of events in any single day for a worker
 */
const getMaxEventsForWorker = (workerId: string): number => {
  let maxEvents = 0
  
  weekDates.value.forEach(date => {
    const eventsCount = getSingleDayEventsForWorkerAndDay(workerId, date).length
    maxEvents = Math.max(maxEvents, eventsCount)
  })
  
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
 */
const doMultiDayEventsOverlap = (event1: CalendarEvent, event2: CalendarEvent): boolean => {
  const start1 = atemporal(event1.startTime).startOf('day')
  const end1 = atemporal(event1.endTime).startOf('day')
  const start2 = atemporal(event2.startTime).startOf('day')
  const end2 = atemporal(event2.endTime).startOf('day')
  
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
 * Calculate worker row height based on maximum events (both single-day and multi-day) - memoized
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
  
  const maxSingleDayEvents = getMaxEventsForWorker(workerId)
  const maxMultiDayEvents = getMaxMultiDayEventsForWorker(workerId)
  
  const totalMaxEvents = maxSingleDayEvents + maxMultiDayEvents
  const result = totalMaxEvents === 0 ? MIN_ROW_HEIGHT : 
    Math.max(MIN_ROW_HEIGHT, totalMaxEvents * EVENT_HEIGHT + (totalMaxEvents - 1) * EVENT_GAP + 16)
  
  // Cache the result
  workerRowHeightCache.value.set(cacheKey, result)
  return result
}

/**
 * Get style for stacked event (positioned below multi-day events)
 */
const getStackedEventStyle = (eventIndex: number, workerId: string): Record<string, string | number> => {
  const multiDayEventsCount = getMaxMultiDayEventsForWorker(workerId)
  const multiDayOffset = multiDayEventsCount * (EVENT_HEIGHT + EVENT_GAP)
  const top = 8 + multiDayOffset + eventIndex * (EVENT_HEIGHT + EVENT_GAP) // 8px top padding + multi-day offset
  
  return {
    position: 'absolute',
    top: top + 'px',
    left: '4px',
    right: '4px',
    height: EVENT_HEIGHT + 'px',
    zIndex: 1
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
  const eventEndDate = atemporal(event.endTime).startOf('day')
  const weekStart = firstWeekDate.startOf('day')
  const weekEnd = lastWeekDate.startOf('day')
  
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
watch([() => props.events, weekDates], () => {
  // Clear all caches when events or week changes
  singleDayEventsCache.value.clear()
  multiDayEventsCache.value.clear()
  workerRowHeightCache.value.clear()
}, { deep: true })

// Removed getResourceName function - no longer needed
</script>

<style scoped>
@reference "tailwindcss";

.weekly-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--atempo-bg-primary);
  color: var(--atempo-text-primary);
}

.week-header {
  display: flex;
  border-bottom: 1px solid var(--atempo-border-primary);
  background-color: var(--atempo-header-bg);
}

.resource-spacer {
  width: 160px;
  min-width: 160px;
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
  border-right: 1px solid var(--atempo-border-primary);
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
  @apply cursor-pointer transition-all duration-200 hover:shadow-md;
}

/* Keep resource-multiday-event for backward compatibility */
.resource-multiday-event {
  @apply cursor-pointer hover:shadow-md;
  transition: transform 0.2s ease, opacity 0.2s ease;
  will-change: transform;
  transform: translateZ(0); /* Force hardware acceleration */
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
}

/* Multi-day event type styles */
.multiday-content.time-off {
  @apply bg-green-100 dark:bg-green-900/30 border-l-green-600;
}

.multiday-content.training {
  @apply bg-orange-100 dark:bg-orange-900/30 border-l-orange-700;
}

.multiday-content.project {
  @apply bg-yellow-100 dark:bg-yellow-900/30 border-l-yellow-700;
}

.multiday-content.certification {
  @apply bg-orange-100 dark:bg-orange-900/30 border-l-orange-700;
}

.multiday-title {
  font-size: 0.875rem;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  color: var(--atempo-text-primary);
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
  @apply flex flex-col;
}

.worker-row {
  @apply flex border-b border-gray-200 dark:border-gray-600 relative;
}

.worker-info {
  @apply flex-shrink-0 border-r border-gray-200 dark:border-gray-700;
  width: 160px;
}

.worker-content {
  @apply flex items-center h-full px-3 py-2 bg-gray-50 dark:bg-gray-800;
}

.worker-indicator {
  @apply w-3 h-3 rounded-full flex-shrink-0;
}

.worker-details {
  @apply flex flex-col ml-2;
}

.worker-name {
  @apply text-sm font-medium text-gray-900 dark:text-gray-100 truncate;
}

.worker-role {
  @apply text-xs text-gray-500 dark:text-gray-400 truncate;
}

.worker-days {
  @apply flex flex-1 relative;
}

/* Keep resource classes for backward compatibility */
.resource-container {
  display: flex;
  flex-direction: column;
}

.resource-row {
  display: flex;
  border-bottom: 1px solid var(--atempo-border-primary);
  position: relative;
}

.resource-info {
  flex-shrink: 0;
  border-right: 1px solid var(--atempo-border-primary);
  width: 160px;
  min-width: 160px;
}

.resource-content {
  display: flex;
  align-items: center;
  height: 100%;
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.resource-role {
  font-size: 0.75rem;
  color: var(--atempo-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.resource-days {
  display: flex;
  flex: 1;
  position: relative;
}

.multiday-events-overlay {
  @apply absolute inset-0 pointer-events-none;
}

.multiday-events-overlay .worker-multiday-event,
.multiday-events-overlay .resource-multiday-event {
  @apply pointer-events-auto;
}

.day-cell {
  flex: 1;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-right: 1px solid var(--atempo-border-primary);
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
  @apply relative w-full h-full;
}

.stacked-event {
  @apply absolute;
  will-change: transform;
  transform: translateZ(0); /* Force hardware acceleration */
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
  @apply bg-blue-100 dark:bg-blue-900/30 border-l-blue-600;
}

.event-bar.shift-day {
  @apply bg-emerald-100 dark:bg-emerald-900/30 border-l-emerald-600;
}

.event-bar.shift-evening {
  @apply bg-amber-100 dark:bg-amber-900/30 border-l-amber-600;
}

.event-bar.shift-night {
  @apply bg-purple-100 dark:bg-purple-900/30 border-l-purple-600;
}

.event-bar.meeting {
  @apply bg-red-100 dark:bg-red-900/30 border-l-red-600;
}

.event-bar.training {
  @apply bg-orange-100 dark:bg-orange-900/30 border-l-orange-700;
}

.event-bar.time-off {
  @apply bg-green-100 dark:bg-green-900/30 border-l-green-600;
}

.event-bar.maintenance {
  @apply bg-yellow-100 dark:bg-yellow-900/30 border-l-yellow-700;
}

.event-bar.administrative {
  @apply bg-indigo-100 dark:bg-indigo-900/30 border-l-indigo-600;
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
  @apply text-xs opacity-75 ml-2 flex-shrink-0;
}

.delete-btn {
  @apply opacity-0 group-hover:opacity-100 w-4 h-4 rounded bg-white/80 shadow-sm;
  @apply flex items-center justify-center text-gray-600 hover:bg-white transition-all ml-1;
}

.delete-icon {
  @apply w-3 h-3;
}

.add-indicator {
  @apply opacity-0 hover:opacity-100 transition-opacity absolute inset-0;
  @apply flex items-center justify-center pointer-events-none;
}

.add-btn {
  @apply bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg;
}

.add-icon {
  @apply w-4 h-4;
}



/* Print styles for PDF export */
@media print {
  .weekly-view {
    height: auto !important;
    min-height: auto !important;
    max-height: none !important;
    overflow: visible !important;
    page-break-inside: avoid;
  }
  
  .week-content {
    height: auto !important;
    min-height: auto !important;
    max-height: none !important;
    overflow: visible !important;
  }
  
  .resource-container {
    height: auto !important;
    min-height: auto !important;
    max-height: none !important;
    overflow: visible !important;
  }
  
  .resource-row {
    height: auto !important;
    min-height: 60px !important;
    page-break-inside: avoid;
    overflow: visible !important;
  }
  
  .resource-info {
    background: white !important;
    color: black !important;
    border-color: #ccc !important;
  }
  
  .resource-name {
    color: black !important;
  }
  
  .resource-role {
    color: #666 !important;
  }
  
  .day-cell {
    border-color: #ccc !important;
    background: white !important;
  }
  
  .day-cell.is-today {
    background: #f0f0f0 !important;
  }
  
  .day-cell.is-weekend {
    background: #f8f8f8 !important;
  }
  
  .week-header {
    background: white !important;
    color: black !important;
    border-color: #ccc !important;
  }
  
  .day-header {
    background: white !important;
    color: black !important;
    border-color: #ccc !important;
  }
  
  .resource-spacer {
    background: white !important;
    color: black !important;
    border-color: #ccc !important;
  }
  
  .resource-label {
    color: black !important;
  }
  
  .day-name {
    color: black !important;
  }
  
  .day-date {
    color: #666 !important;
  }
  
  .event-bar {
    background: white !important;
    color: black !important;
    border-color: #666 !important;
    box-shadow: none !important;
  }
  
  .multiday-content {
    background: white !important;
    color: black !important;
    border-color: #666 !important;
  }
  
  .multiday-title {
    color: black !important;
  }
  
  .event-time {
    color: black !important;
  }
  
  /* Hide interactive elements in print */
  .delete-btn,
  .add-indicator {
    display: none !important;
  }
  
  /* Ensure proper text colors for print */
  * {
    color-adjust: exact;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .day-header {
    @apply p-1;
    height: 60px;
  }
  
  .day-name {
    @apply text-xs;
  }
  
  .day-number {
    @apply text-sm;
  }
  
  .resource-spacer {
    height: 60px;
  }
}
</style>