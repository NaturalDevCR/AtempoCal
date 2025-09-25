<template>
  <div class="weekly-view">
    <!-- Header with navigation -->
    <div class="week-header">
      <div class="week-navigation">
        <button 
          class="nav-btn" 
          @click="$emit('date-change', weekDates[0].subtract(7, 'days').format('YYYY-MM-DD'))"
        >
          ‹
        </button>
        <h2 class="week-title">
          {{ weekDates[0].format('MMMM DD') }} - {{ weekDates[6].format('MMMM DD, YYYY') }}
        </h2>
        <button 
          class="nav-btn" 
          @click="$emit('date-change', weekDates[0].add(7, 'days').format('YYYY-MM-DD'))"
        >
          ›
        </button>
      </div>
    </div>

    <!-- Week header with days -->
     <div class="day-headers">
      <!-- Resource column spacer -->
      <div class="resource-spacer">
        <span class="resource-label">Resources</span>
      </div>
      
      <!-- Day headers -->
      <div class="day-headers">
        <div class="day-grid">
          <div
            v-for="(date, index) in weekDates"
            :key="date.toString()"
            class="day-header"
            :class="{
              'is-today': isToday(date),
              'is-weekend': isWeekend(date),
              'is-selected': isSameDay(date, currentDate)
            }"
            @click="handleDayClick(date)"
          >
            <div class="day-name">
              {{ getDayName(date, index) }}
            </div>
            <div class="day-number">
              {{ date.day }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Scrollable content area -->
    <div class="week-content" ref="scrollContainer">
      <!-- Resource rows -->
      <div class="resource-container">
        <div
          v-for="resource in displayResources"
          :key="resource.id"
          class="resource-row"
          :style="{ height: getResourceRowHeight(resource.id) + 'px' }"
        >
          <!-- Resource info column -->
          <div class="resource-info">
            <div class="resource-content">
              <div class="resource-indicator" :style="{ backgroundColor: resource.color || '#6B7280' }"></div>
              <div class="resource-details">
                <span class="resource-name">{{ resource.name }}</span>
                <span v-if="resource.metadata?.role" class="resource-role">{{ resource.metadata.role }}</span>
              </div>
            </div>
          </div>

          <!-- Day cells for this resource -->
          <div class="resource-days">
            <!-- Multi-day events container positioned relative to day cells only -->
            <div class="multiday-events-overlay">
              <div
                v-for="event in getMultiDayEventsForResourceWithLanes(resource.id)"
                :key="'multiday-' + event.id"
                class="resource-multiday-event"
                :style="getResourceMultiDayEventStyle(event, resource.id)"
                @click="$emit('event-click', event)"
              >
                <div class="multiday-content" :style="{ 
                  backgroundColor: event.color ? event.color + '20' : '#3b82f620',
                  borderLeftColor: event.color || '#3b82f6' 
                }">
                  <span class="multiday-title">{{ event.title }}</span>
                  <span class="multiday-duration">{{ getEventDuration(event) }}</span>
                </div>
              </div>
            </div>

            <div
              v-for="date in weekDates"
              :key="'cell-' + resource.id + '-' + date.toString()"
              class="day-cell"
              :class="{
                'is-today': isToday(date),
                'is-weekend': isWeekend(date)
              }"
              @click="handleResourceSlotClick(resource, date)"
            >
              <!-- Stacked events for this resource and day -->
              <div class="events-stack">
                <div
                  v-for="(event, eventIndex) in getSingleDayEventsForResourceAndDay(resource.id, date)"
                  :key="event.id"
                  class="stacked-event"
                  :style="getStackedEventStyle(eventIndex, resource.id)"
                  @click.stop="$emit('event-click', event)"
                >
                  <div 
                    class="event-bar group"
                    :style="{
                      backgroundColor: event.color ? event.color + '30' : '#3b82f630',
                      borderLeftColor: event.color || '#3b82f6',
                      color: '#1f2937'
                    }"
                  >
                    <span class="event-title">{{ event.title }}</span>
                    <span v-if="!event.isAllDay" class="event-time">{{ formatEventTime(event) }}</span>
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
                v-if="!readonly && getSingleDayEventsForResourceAndDay(resource.id, date).length === 0 && getMultiDayEventsForResource(resource.id).length === 0"
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
import { ref, computed } from 'vue'
import atemporal from 'atemporal'
import type {
  CalendarEvent,
  CalendarResource,
  CalendarConfig,
  EventAction,
  SlotClickInfo,
  Atemporal
} from '../types'
import {
  getWeekDates,
  isToday as checkIsToday,
  getLocalizedDayNames
} from '../utils/dateHelpers'

/**
 * WeeklyView component with true vertical event stacking
 * Events are positioned in separate rows without any overlaps
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

// Configuration constants
const EVENT_HEIGHT = 24
const EVENT_GAP = 2
const MIN_ROW_HEIGHT = 60

// Template refs
const scrollContainer = ref<HTMLElement>()

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
  
  // Default resources if none provided
  return [
    { id: 'worker-john', name: 'John Smith', color: '#3B82F6', metadata: { department: 'Engineering', role: 'Senior Developer' } },
    { id: 'worker-sarah', name: 'Sarah Johnson', color: '#10B981', metadata: { department: 'Design', role: 'UX Designer' } },
    { id: 'worker-mike', name: 'Mike Davis', color: '#F59E0B', metadata: { department: 'Marketing', role: 'Marketing Manager' } },
    { id: 'worker-lisa', name: 'Lisa Chen', color: '#8B5CF6', metadata: { department: 'Engineering', role: 'Frontend Developer' } }
  ]
})

/**
 * Get single-day events (non-multi-day events)
 */
const singleDayEvents = computed((): CalendarEvent[] => {
  // Add comprehensive test single-day events
  const testSingleDayEvents: CalendarEvent[] = [
    // John Smith events (Monday - 3 events, Tuesday - 2 events)
    {
      id: 'john-mon-1',
      title: 'Team Meeting',
      startTime: weekDates.value[0].format('YYYY-MM-DD') + 'T09:00:00',
      endTime: weekDates.value[0].format('YYYY-MM-DD') + 'T10:00:00',
      resourceId: 'worker-john',
      color: '#3B82F6'
    },
    {
      id: 'john-mon-2',
      title: 'Code Review',
      startTime: weekDates.value[0].format('YYYY-MM-DD') + 'T11:00:00',
      endTime: weekDates.value[0].format('YYYY-MM-DD') + 'T12:00:00',
      resourceId: 'worker-john',
      color: '#3B82F6'
    },
    {
      id: 'john-mon-3',
      title: 'Sprint Planning',
      startTime: weekDates.value[0].format('YYYY-MM-DD') + 'T14:00:00',
      endTime: weekDates.value[0].format('YYYY-MM-DD') + 'T15:30:00',
      resourceId: 'worker-john',
      color: '#3B82F6'
    },
    {
      id: 'john-tue-1',
      title: 'Client Call',
      startTime: weekDates.value[1].format('YYYY-MM-DD') + 'T10:00:00',
      endTime: weekDates.value[1].format('YYYY-MM-DD') + 'T11:00:00',
      resourceId: 'worker-john',
      color: '#3B82F6'
    },
    {
      id: 'john-tue-2',
      title: 'Development',
      startTime: weekDates.value[1].format('YYYY-MM-DD') + 'T13:00:00',
      endTime: weekDates.value[1].format('YYYY-MM-DD') + 'T17:00:00',
      resourceId: 'worker-john',
      color: '#3B82F6'
    },
    
    // Sarah Johnson events (Wednesday - 4 events)
    {
      id: 'sarah-wed-1',
      title: 'Design Review',
      startTime: weekDates.value[2].format('YYYY-MM-DD') + 'T09:00:00',
      endTime: weekDates.value[2].format('YYYY-MM-DD') + 'T10:00:00',
      resourceId: 'worker-sarah',
      color: '#10B981'
    },
    {
      id: 'sarah-wed-2',
      title: 'User Research',
      startTime: weekDates.value[2].format('YYYY-MM-DD') + 'T10:30:00',
      endTime: weekDates.value[2].format('YYYY-MM-DD') + 'T12:00:00',
      resourceId: 'worker-sarah',
      color: '#10B981'
    },
    {
      id: 'sarah-wed-3',
      title: 'Wireframing',
      startTime: weekDates.value[2].format('YYYY-MM-DD') + 'T13:00:00',
      endTime: weekDates.value[2].format('YYYY-MM-DD') + 'T15:00:00',
      resourceId: 'worker-sarah',
      color: '#10B981'
    },
    {
      id: 'sarah-wed-4',
      title: 'Prototype Testing',
      startTime: weekDates.value[2].format('YYYY-MM-DD') + 'T15:30:00',
      endTime: weekDates.value[2].format('YYYY-MM-DD') + 'T17:00:00',
      resourceId: 'worker-sarah',
      color: '#10B981'
    },
    
    // Mike Davis events (Thursday - 2 events)
    {
      id: 'mike-thu-1',
      title: 'Campaign Planning',
      startTime: weekDates.value[3].format('YYYY-MM-DD') + 'T09:00:00',
      endTime: weekDates.value[3].format('YYYY-MM-DD') + 'T11:00:00',
      resourceId: 'worker-mike',
      color: '#F59E0B'
    },
    {
      id: 'mike-thu-2',
      title: 'Analytics Review',
      startTime: weekDates.value[3].format('YYYY-MM-DD') + 'T14:00:00',
      endTime: weekDates.value[3].format('YYYY-MM-DD') + 'T16:00:00',
      resourceId: 'worker-mike',
      color: '#F59E0B'
    },
    
    // Lisa Chen events (Friday - 3 events)
    {
      id: 'lisa-fri-1',
      title: 'Bug Fixes',
      startTime: weekDates.value[4].format('YYYY-MM-DD') + 'T09:00:00',
      endTime: weekDates.value[4].format('YYYY-MM-DD') + 'T11:00:00',
      resourceId: 'worker-lisa',
      color: '#8B5CF6'
    },
    {
      id: 'lisa-fri-2',
      title: 'Feature Development',
      startTime: weekDates.value[4].format('YYYY-MM-DD') + 'T11:30:00',
      endTime: weekDates.value[4].format('YYYY-MM-DD') + 'T14:00:00',
      resourceId: 'worker-lisa',
      color: '#8B5CF6'
    },
    {
      id: 'lisa-fri-3',
      title: 'Code Documentation',
      startTime: weekDates.value[4].format('YYYY-MM-DD') + 'T15:00:00',
      endTime: weekDates.value[4].format('YYYY-MM-DD') + 'T17:00:00',
      resourceId: 'worker-lisa',
      color: '#8B5CF6'
    }
  ]
  
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
  // Add test multi-day events with overlapping scenarios to test stacking
  const testMultiDayEvents: CalendarEvent[] = [
    // John Smith - Multiple overlapping events to test stacking
    {
      id: 'vacation-john',
      title: 'Summer Vacation',
      startTime: weekDates.value[0].format('YYYY-MM-DD') + 'T00:00:00',
      endTime: weekDates.value[4].format('YYYY-MM-DD') + 'T23:59:59',
      resourceId: 'worker-john',
      color: '#10B981',
      isAllDay: true
    },
    {
      id: 'conference-john',
      title: 'Multi-Day Conference',
      startTime: weekDates.value[1].format('YYYY-MM-DD') + 'T00:00:00',
      endTime: weekDates.value[3].format('YYYY-MM-DD') + 'T23:59:59',
      resourceId: 'worker-john',
      color: '#3B82F6',
      isAllDay: true
    },
    // Sarah Johnson - Overlapping events
    {
      id: 'conference-sarah',
      title: 'Design Conference',
      startTime: weekDates.value[1].format('YYYY-MM-DD') + 'T00:00:00',
      endTime: weekDates.value[3].format('YYYY-MM-DD') + 'T23:59:59',
      resourceId: 'worker-sarah',
      color: '#8B5CF6',
      isAllDay: true
    },
    {
      id: 'sprint-sarah',
      title: 'Design Sprint',
      startTime: weekDates.value[0].format('YYYY-MM-DD') + 'T00:00:00',
      endTime: weekDates.value[2].format('YYYY-MM-DD') + 'T23:59:59',
      resourceId: 'worker-sarah',
      color: '#EF4444',
      isAllDay: true
    },
    // Mike Davis - Overlapping events
    {
      id: 'sick-mike',
      title: 'Sick Leave',
      startTime: weekDates.value[2].format('YYYY-MM-DD') + 'T00:00:00',
      endTime: weekDates.value[3].format('YYYY-MM-DD') + 'T23:59:59',
      resourceId: 'worker-mike',
      color: '#F59E0B',
      isAllDay: true
    },
    {
      id: 'roadshow-mike',
      title: 'Marketing Roadshow',
      startTime: weekDates.value[0].format('YYYY-MM-DD') + 'T00:00:00',
      endTime: weekDates.value[6].format('YYYY-MM-DD') + 'T23:59:59',
      resourceId: 'worker-mike',
      color: '#8B5CF6',
      isAllDay: true
    },
    // Lisa Chen - Overlapping events
    {
      id: 'training-lisa',
      title: 'Technical Training',
      startTime: weekDates.value[3].format('YYYY-MM-DD') + 'T00:00:00',
      endTime: weekDates.value[5].format('YYYY-MM-DD') + 'T23:59:59',
      resourceId: 'worker-lisa',
      color: '#EF4444',
      isAllDay: true
    },
    {
      id: 'workshop-lisa',
      title: 'Training Workshop',
      startTime: weekDates.value[0].format('YYYY-MM-DD') + 'T00:00:00',
      endTime: weekDates.value[4].format('YYYY-MM-DD') + 'T23:59:59',
      resourceId: 'worker-lisa',
      color: '#10B981',
      isAllDay: true
    }
  ]
  
  const userEvents = props.events.filter(event => {
    const startDate = atemporal(event.startTime)
    const endDate = atemporal(event.endTime)
    return !startDate.isSame(endDate, 'day')
  })
  
  return [...userEvents, ...testMultiDayEvents]
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
 * Get single-day events for a specific resource and day
 */
const getSingleDayEventsForResourceAndDay = (resourceId: string, date: Atemporal): CalendarEvent[] => {
  const targetDate = date.format('YYYY-MM-DD')
  
  return singleDayEvents.value.filter(event => {
    const eventStartDate = atemporal(event.startTime)
    const eventEndDate = atemporal(event.endTime)
    
    const isSameDay = eventStartDate.format('YYYY-MM-DD') === targetDate && 
                      eventEndDate.format('YYYY-MM-DD') === targetDate
    
    return isSameDay && event.resourceId === resourceId
  }).sort((a, b) => {
    // Sort by start time for consistent stacking order
    const startA = atemporal(a.startTime)
    const startB = atemporal(b.startTime)
    return startA.isBefore(startB) ? -1 : 1
  })
}

/**
 * Calculate the maximum number of events in any single day for a resource
 */
const getMaxEventsForResource = (resourceId: string): number => {
  let maxEvents = 0
  
  weekDates.value.forEach(date => {
    const eventsCount = getSingleDayEventsForResourceAndDay(resourceId, date).length
    maxEvents = Math.max(maxEvents, eventsCount)
  })
  
  return maxEvents
}

/**
 * Get multi-day events for a specific resource
 */
const getMultiDayEventsForResource = (resourceId: string): CalendarEvent[] => {
  return multiDayEvents.value.filter(event => event.resourceId === resourceId)
}

/**
 * Check if two multi-day events overlap in their date ranges
 */
const doMultiDayEventsOverlap = (event1: CalendarEvent, event2: CalendarEvent): boolean => {
  const start1 = atemporal(event1.startTime).startOf('day')
  const end1 = atemporal(event1.endTime).startOf('day') // Use startOf('day') for consistent comparison
  const start2 = atemporal(event2.startTime).startOf('day')
  const end2 = atemporal(event2.endTime).startOf('day') // Use startOf('day') for consistent comparison
  
  // Events overlap if start1 <= end2 && start2 <= end1
  return start1.isSameOrBefore(end2) && start2.isSameOrBefore(end1)
}

/**
 * Get multi-day events for a specific resource with proper lane assignments
 */
const getMultiDayEventsForResourceWithLanes = (resourceId: string): (CalendarEvent & { lane: number })[] => {
  const resourceEvents = getMultiDayEventsForResource(resourceId)
  if (resourceEvents.length === 0) return []
  
  // Sort events by start time for consistent processing
  const sortedEvents = resourceEvents.sort((a, b) => {
    const startA = atemporal(a.startTime)
    const startB = atemporal(b.startTime)
    return startA.isBefore(startB) ? -1 : 1
  })
  
  // Assign lanes using proper overlap detection for multi-day events
  const lanes: CalendarEvent[][] = []
  const eventsWithLanes: (CalendarEvent & { lane: number })[] = []
  
  sortedEvents.forEach(event => {
    // Find the first available lane where this event doesn't overlap with any existing event
    let assignedLane = -1
    
    for (let i = 0; i < lanes.length; i++) {
      let canPlaceInLane = true
      
      // Check if this event overlaps with any event in this lane
      for (const laneEvent of lanes[i]) {
        if (doMultiDayEventsOverlap(event, laneEvent)) {
          canPlaceInLane = false
          break
        }
      }
      
      if (canPlaceInLane) {
        assignedLane = i
        lanes[i].push(event)
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
 * Calculate the maximum number of multi-day events for a resource
 */
const getMaxMultiDayEventsForResource = (resourceId: string): number => {
  const eventsWithLanes = getMultiDayEventsForResourceWithLanes(resourceId)
  if (eventsWithLanes.length === 0) return 0
  
  // Return the maximum lane number + 1 (since lanes are 0-indexed)
  return Math.max(...eventsWithLanes.map(event => event.lane)) + 1
}

/**
 * Calculate resource row height based on maximum events (both single-day and multi-day)
 */
const getResourceRowHeight = (resourceId: string): number => {
  const maxSingleDayEvents = getMaxEventsForResource(resourceId)
  const maxMultiDayEvents = getMaxMultiDayEventsForResource(resourceId)
  
  const totalMaxEvents = maxSingleDayEvents + maxMultiDayEvents
  if (totalMaxEvents === 0) return MIN_ROW_HEIGHT
  
  const eventsHeight = totalMaxEvents * EVENT_HEIGHT + (totalMaxEvents - 1) * EVENT_GAP
  const padding = 16 // Top and bottom padding
  
  return Math.max(MIN_ROW_HEIGHT, eventsHeight + padding)
}

/**
 * Get style for stacked event (positioned below multi-day events)
 */
const getStackedEventStyle = (eventIndex: number, resourceId: string): Record<string, string | number> => {
  const multiDayEventsCount = getMaxMultiDayEventsForResource(resourceId)
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
 * Get style for resource-specific multi-day event with proper positioning
 */
const getResourceMultiDayEventStyle = (event: CalendarEvent & { lane: number }, _resourceId: string): Record<string, string | number> => {
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
  const cellWidth = 100 / 7 // Each day cell is 1/7 of the total width
  
  // Position using the pre-calculated lane from the event object
  const top = 8 + event.lane * (EVENT_HEIGHT + EVENT_GAP) // 8px top padding
  
  return {
    position: 'absolute',
    top: top + 'px',
    left: (startIndex * cellWidth) + '%', // Now positioned relative to day cells container
    width: (span * cellWidth) + '%',
    height: EVENT_HEIGHT + 'px',
    zIndex: 10 + event.lane
  }
}

// Removed global multi-day events functions - now handled per resource

/**
 * Get event duration text
 */
const getEventDuration = (event: CalendarEvent): string => {
  const startDate = atemporal(event.startTime)
  const endDate = atemporal(event.endTime)
  const days = endDate.diff(startDate, 'days') + 1
  return `${days} day${days > 1 ? 's' : ''}`
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
  
  return `${startFormatted}-${endFormatted}`
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
    resource: resource,
    dayName: getDayName(date, 0),
    isToday: isToday(date),
    isWeekend: isWeekend(date),
    formattedDate: date.format('dddd, MMMM D, YYYY')
  }
  
  emit('slot-click', slotInfo)
}

// Removed getResourceName function - no longer needed
</script>

<style scoped>
.weekly-view {
  @apply flex flex-col h-full bg-white dark:bg-gray-900;
}

.week-header {
  @apply flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800;
}

.resource-spacer {
  @apply border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800;
  @apply flex items-center justify-center;
  width: 160px;
  height: 80px;
}

.resource-label {
  @apply text-sm font-medium text-gray-700 dark:text-gray-300;
}

.day-headers {
  @apply flex-1 bg-white dark:bg-gray-800;
}

.day-grid {
  @apply grid grid-cols-7 h-full;
}

.day-header {
  @apply flex flex-col items-center justify-center p-2 border-r border-gray-200 dark:border-gray-700;
  @apply cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors;
  height: 80px;
}

.day-header.is-today {
  @apply bg-blue-50 dark:bg-blue-900/20;
}

.day-header.is-weekend {
  @apply bg-gray-50 dark:bg-gray-800;
}

.day-header.is-selected {
  @apply bg-blue-100 dark:bg-blue-800/30;
}

.day-name {
  @apply text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide;
}

.day-number {
  @apply text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1;
}

.day-header.is-today .day-number {
  @apply text-blue-600 dark:text-blue-400;
}

.week-content {
  @apply flex-1 overflow-auto relative;
  max-height: calc(100vh - 200px);
}

/* Removed global multi-day section styles */

.resource-multiday-event {
  @apply cursor-pointer transition-all duration-200 hover:shadow-md;
}

.multiday-content {
  @apply w-full h-full rounded-md shadow-sm border-l-4 px-3 py-1;
  @apply flex items-center justify-between;
  @apply text-gray-800 dark:text-gray-100;
}

.multiday-title {
  @apply text-sm font-medium truncate flex-1;
  @apply text-gray-800 dark:text-gray-100;
}

.multiday-duration {
  @apply text-xs opacity-75 ml-2 flex-shrink-0 font-medium;
  @apply text-gray-600 dark:text-gray-300;
}

.resource-container {
  @apply flex flex-col;
}

.resource-row {
  @apply flex border-b border-gray-200 dark:border-gray-600 relative;
}

.resource-info {
  @apply flex-shrink-0 border-r border-gray-200 dark:border-gray-700;
  width: 160px;
}

.resource-content {
  @apply flex items-center h-full px-3 py-2 bg-gray-50 dark:bg-gray-800;
}

.resource-indicator {
  @apply w-3 h-3 rounded-full flex-shrink-0;
}

.resource-details {
  @apply flex flex-col ml-2;
}

.resource-name {
  @apply text-sm font-medium text-gray-900 dark:text-gray-100 truncate;
}

.resource-role {
  @apply text-xs text-gray-500 dark:text-gray-400 truncate;
}

.resource-days {
  @apply flex flex-1 relative;
}

.multiday-events-overlay {
  @apply absolute inset-0 pointer-events-none;
}

.multiday-events-overlay .resource-multiday-event {
  @apply pointer-events-auto;
}

.day-cell {
  @apply flex-1 relative cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors;
  @apply border-r border-gray-200 dark:border-gray-600;
}

.day-cell.is-today {
  @apply bg-blue-50/30 dark:bg-blue-900/10;
}

.day-cell.is-weekend {
  @apply bg-gray-50/50 dark:bg-gray-800/50;
}

.events-stack {
  @apply relative w-full h-full;
}

.stacked-event {
  @apply absolute;
}

.event-bar {
  @apply w-full h-full rounded-md shadow-sm border-l-4 px-2 py-1 cursor-pointer;
  @apply transition-all duration-200 hover:shadow-md;
  @apply flex items-center justify-between;
  @apply text-gray-800 dark:text-gray-100;
}

.event-title {
  @apply text-xs font-medium truncate flex-1;
  @apply text-gray-800 dark:text-gray-100;
}

.event-time {
  @apply text-xs opacity-75 ml-2 flex-shrink-0;
  @apply text-gray-600 dark:text-gray-300;
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