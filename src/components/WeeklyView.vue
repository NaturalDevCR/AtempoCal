<template>
  <div class="weekly-view">
    <!-- Week header with days -->
    <div class="week-header">
      <!-- Worker column spacer -->
      <div class="resource-spacer">
        <span class="resource-label">Workers</span>
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
      <!-- Worker rows -->
      <div class="resource-container">
        <div
          v-for="worker in displayWorkers"
          :key="worker.id"
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
                @click="$emit('event-click', event)"
              >
                <div class="multiday-content" 
                  :class="{
                    'time-off': event.metadata?.type === 'time-off',
                    'training': event.metadata?.type === 'training',
                    'project': event.metadata?.type === 'project',
                    'certification': event.metadata?.category === 'certification'
                  }"
                  :style="{ 
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
                  @click.stop="$emit('event-click', event)"
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
  workers?: CalendarResource[]
  config: CalendarConfig
  currentDate: Atemporal
  visibleRange: { start: Atemporal; end: Atemporal }
  eventActions?: EventAction[]
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  workers: () => [],
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
 * Get display workers (use provided workers or create default ones)
 */
const displayWorkers = computed((): CalendarResource[] => {
  if (props.workers && props.workers.length > 0) {
    return props.workers
  }
  
  // Default workers if none provided
  return [
    { 
      id: 'emp-001', 
      name: 'John Smith', 
      color: '#3B82F6', 
      metadata: { 
        employeeId: 'EMP-001',
        department: 'Operations', 
        role: 'Shift Supervisor', 
        email: 'john.smith@company.com',
        phone: '(555) 123-4567',
        shiftPreference: 'Morning',
        skills: ['Leadership', 'Quality Control', 'Safety Training'],
        certifications: ['OSHA 30', 'First Aid'],
        hireDate: '2020-03-15'
      } 
    },
    { 
      id: 'emp-002', 
      name: 'Sarah Johnson', 
      color: '#10B981', 
      metadata: { 
        employeeId: 'EMP-002',
        department: 'Customer Service', 
        role: 'Team Lead', 
        email: 'sarah.johnson@company.com',
        phone: '(555) 234-5678',
        shiftPreference: 'Day',
        skills: ['Customer Relations', 'Training', 'Conflict Resolution'],
        certifications: ['Customer Service Excellence'],
        hireDate: '2019-08-22'
      } 
    },
    { 
      id: 'emp-003', 
      name: 'Mike Davis', 
      color: '#F59E0B', 
      metadata: { 
        employeeId: 'EMP-003',
        department: 'Maintenance', 
        role: 'Maintenance Technician', 
        email: 'mike.davis@company.com',
        phone: '(555) 345-6789',
        shiftPreference: 'Evening',
        skills: ['Electrical', 'HVAC', 'Plumbing', 'Preventive Maintenance'],
        certifications: ['EPA 608', 'Electrical License'],
        hireDate: '2021-01-10'
      } 
    },
    { 
      id: 'emp-004', 
      name: 'Lisa Chen', 
      color: '#8B5CF6', 
      metadata: { 
        employeeId: 'EMP-004',
        department: 'Security', 
        role: 'Security Officer', 
        email: 'lisa.chen@company.com',
        phone: '(555) 456-7890',
        shiftPreference: 'Night',
        skills: ['Surveillance', 'Access Control', 'Emergency Response'],
        certifications: ['Security Guard License', 'CPR/AED'],
        hireDate: '2022-06-05'
      } 
    }
  ]
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
        color: '#1E40AF',
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
        color: '#047857',
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
        color: '#1E40AF',
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
        color: '#6D28D9',
        metadata: { type: 'inventory', category: 'tools' }
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
        color: '#059669',
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
        color: '#7C2D12',
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
        color: '#DC2626',
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
  
  if (dayNames[dayOfWeek]) {
    return dayNames[dayOfWeek]
  }
  
  // Fallback to JavaScript Date if atemporal format fails
  try {
    return date.format('ddd')
  } catch {
    const jsDate = new Date(date.toString())
    return jsDate.toLocaleDateString('en-US', { weekday: 'short' })
  }
}

/**
 * Get single-day events for a specific worker and day
 */
const getSingleDayEventsForWorkerAndDay = (workerId: string, date: Atemporal): CalendarEvent[] => {
  const targetDate = date.format('YYYY-MM-DD')
  
  return singleDayEvents.value.filter(event => {
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
 * Get multi-day events for a specific worker
 */
const getMultiDayEventsForWorker = (workerId: string): CalendarEvent[] => {
  return multiDayEvents.value.filter(event => event.resourceId === workerId)
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
 * Calculate the maximum number of multi-day events for a worker
 */
const getMaxMultiDayEventsForWorker = (workerId: string): number => {
  const eventsWithLanes = getMultiDayEventsForWorkerWithLanes(workerId)
  if (eventsWithLanes.length === 0) return 0
  
  // Return the maximum lane number + 1 (since lanes are 0-indexed)
  return Math.max(...eventsWithLanes.map(event => event.lane)) + 1
}

/**
 * Calculate worker row height based on maximum events (both single-day and multi-day)
 */
const getWorkerRowHeight = (workerId: string): number => {
  const maxSingleDayEvents = getMaxEventsForWorker(workerId)
  const maxMultiDayEvents = getMaxMultiDayEventsForWorker(workerId)
  
  const totalMaxEvents = maxSingleDayEvents + maxMultiDayEvents
  if (totalMaxEvents === 0) return MIN_ROW_HEIGHT
  
  const eventsHeight = totalMaxEvents * EVENT_HEIGHT + (totalMaxEvents - 1) * EVENT_GAP
  const padding = 16 // Top and bottom padding
  
  return Math.max(MIN_ROW_HEIGHT, eventsHeight + padding)
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

.worker-multiday-event {
  @apply cursor-pointer transition-all duration-200 hover:shadow-md;
}

/* Keep resource-multiday-event for backward compatibility */
.resource-multiday-event {
  @apply cursor-pointer transition-all duration-200 hover:shadow-md;
}

.multiday-content {
  @apply w-full h-full rounded-md shadow-sm border-l-4 px-3 py-1;
  @apply flex items-center justify-between;
  @apply text-gray-800 dark:text-gray-100;
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
  @apply text-sm font-medium truncate flex-1;
  @apply text-gray-800 dark:text-gray-100;
}

.multiday-duration {
  @apply text-xs opacity-75 ml-2 flex-shrink-0 font-medium;
  @apply text-gray-600 dark:text-gray-300;
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

.multiday-events-overlay .worker-multiday-event,
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