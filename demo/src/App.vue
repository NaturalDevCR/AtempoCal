<template>
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
                AtempoCal Demo
              </h1>
            </div>
            <span class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
              v1.0.0
            </span>
          </div>
          
          <div class="flex items-center space-x-4">
            <!-- Theme Toggle -->
            <button
              @click="toggleTheme"
              class="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Toggle theme"
            >
              <svg v-if="currentTheme === 'light'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </button>
            
            <!-- GitHub Link -->
            <a
              href="https://github.com/your-org/atempo-cal"
              target="_blank"
              class="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="View on GitHub"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Demo Info -->
      <div class="mb-8">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Welcome to AtempoCal - Resource Calendar
          </h2>
          <p class="text-gray-600 dark:text-gray-300 mb-4">
            A highly customizable Vue 3 resource calendar component built with TypeScript, Tailwind CSS, and the Atemporal library.
            This demo showcases a worker scheduling system where the weekly view shows resources (workers) on the left, and the daily view shows hourly time slots.
          </p>
          <div class="flex flex-wrap gap-2">
            <span class="px-3 py-1 text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
              Vue 3 + TypeScript
            </span>
            <span class="px-3 py-1 text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
              Atemporal Library
            </span>
            <span class="px-3 py-1 text-sm bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full">
              Tailwind CSS
            </span>
            <span class="px-3 py-1 text-sm bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded-full">
              Dark/Light Theme
            </span>
          </div>
        </div>
      </div>

      <!-- Calendar Component -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <AtempoCal
          :events="demoEvents"
          :resources="demoResources"
          :config="calendarConfig"
          :selected-date="selectedDate"
          :event-actions="eventActions"
          :loading="loading"
          :theme="currentTheme"
          @event-click="handleEventClick"
          @event-create="handleEventCreate"
          @event-update="handleEventUpdate"
          @event-delete="handleEventDelete"
          @date-change="handleDateChange"
          @slot-click="handleSlotClick"
        />
      </div>

      <!-- Event Details Modal -->
      <div
        v-if="selectedEvent"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        @click="selectedEvent = null"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
          @click.stop
        >
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ selectedEvent.title }}
            </h3>
            <button
              @click="selectedEvent = null"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="space-y-3">
            <div v-if="selectedEvent.description">
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Description</p>
              <p class="text-gray-600 dark:text-gray-400">{{ selectedEvent.description }}</p>
            </div>
            
            <div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Time</p>
              <p class="text-gray-600 dark:text-gray-400">
                {{ formatEventTime(selectedEvent) }}
              </p>
            </div>
            
            <div v-if="selectedEvent.resourceId">
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Resource</p>
              <p class="text-gray-600 dark:text-gray-400">
                {{ getResourceName(selectedEvent.resourceId) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable no-console */
import { ref, onMounted } from 'vue'
import atemporal from 'atemporal'
import AtempoCal from '../../src/AtempoCal.vue'
import { useTheme } from '../../src/composables/useTheme'
import type { CalendarEvent, CalendarResource, CalendarConfig, EventAction } from '../../src/types'

/**
 * Demo application for AtempoCal component
 * Showcases all calendar features with sample data
 */

// Theme management
const { currentTheme, toggleTheme } = useTheme()

// Calendar state
// Set to the week where our demo events are located (September 8-14, 2025)
const selectedDate = ref(atemporal('2025-09-08').toString())
const loading = ref(false)
const selectedEvent = ref<CalendarEvent | null>(null)

// Calendar configuration
const calendarConfig = ref<CalendarConfig>({
  timezone: 'America/New_York',
  locale: 'en-US',
  theme: 'auto',
  startHour: 8,
  endHour: 18,
  slotDuration: 30,
  showWeekends: true,
  firstDayOfWeek: 1 // Monday
})

// Demo resources (Workers)
const demoResources = ref<CalendarResource[]>([
  {
    id: 'worker-john',
    name: 'John Smith',
    color: '#3B82F6',
    metadata: { department: 'Engineering', role: 'Senior Developer', email: 'john.smith@company.com' }
  },
  {
    id: 'worker-sarah',
    name: 'Sarah Johnson',
    color: '#10B981',
    metadata: { department: 'Design', role: 'UX Designer', email: 'sarah.johnson@company.com' }
  },
  {
    id: 'worker-mike',
    name: 'Mike Davis',
    color: '#F59E0B',
    metadata: { department: 'Marketing', role: 'Marketing Manager', email: 'mike.davis@company.com' }
  },
  {
    id: 'worker-lisa',
    name: 'Lisa Chen',
    color: '#8B5CF6',
    metadata: { department: 'Engineering', role: 'Frontend Developer', email: 'lisa.chen@company.com' }
  }
])

// Demo events (Worker Schedules) - Comprehensive test data to showcase vertical stacking
const demoEvents = ref<CalendarEvent[]>([
  // MONDAY - John Smith (3 events)
  {
    id: 'event-1',
    title: 'Morning Standup',
    description: 'Daily team standup meeting',
    startTime: '2025-09-08T09:00:00Z',
    endTime: '2025-09-08T09:30:00Z',
    resourceId: 'worker-john',
    color: '#3B82F6',
    metadata: { type: 'meeting', recurring: true }
  },
  {
    id: 'event-2',
    title: 'Code Review Session',
    description: 'Review pull requests and discuss architecture changes',
    startTime: '2025-09-08T10:00:00Z',
    endTime: '2025-09-08T11:30:00Z',
    resourceId: 'worker-john',
    color: '#3B82F6',
    metadata: { type: 'development', priority: 'high' }
  },
  {
    id: 'event-3',
    title: 'Sprint Planning',
    description: 'Plan next sprint tasks and estimates',
    startTime: '2025-09-08T14:00:00Z',
    endTime: '2025-09-08T16:00:00Z',
    resourceId: 'worker-john',
    color: '#3B82F6',
    metadata: { type: 'planning', sprint: 'Sprint 23' }
  },

  // TUESDAY - John Smith (2 events)
  {
    id: 'event-4',
    title: 'Architecture Review',
    description: 'Review system architecture proposals',
    startTime: '2025-09-09T09:00:00Z',
    endTime: '2025-09-09T10:30:00Z',
    resourceId: 'worker-john',
    color: '#3B82F6',
    metadata: { type: 'review', priority: 'high' }
  },
  {
    id: 'event-5',
    title: 'Mentoring Session',
    description: 'One-on-one mentoring with junior developer',
    startTime: '2025-09-09T15:00:00Z',
    endTime: '2025-09-09T16:00:00Z',
    resourceId: 'worker-john',
    color: '#3B82F6',
    metadata: { type: 'mentoring', mentee: 'Alex Johnson' }
  },

  // WEDNESDAY - Sarah Johnson (4 events)
  {
    id: 'event-6',
    title: 'User Research Interview',
    description: 'Conduct user interviews for new feature validation',
    startTime: '2025-09-10T09:00:00Z',
    endTime: '2025-09-10T10:00:00Z',
    resourceId: 'worker-sarah',
    color: '#10B981',
    metadata: { type: 'research', participants: 3 }
  },
  {
    id: 'event-7',
    title: 'Design Workshop',
    description: 'Collaborative design session for mobile app',
    startTime: '2025-09-10T10:30:00Z',
    endTime: '2025-09-10T12:00:00Z',
    resourceId: 'worker-sarah',
    color: '#10B981',
    metadata: { type: 'workshop', collaborative: true }
  },
  {
    id: 'event-8',
    title: 'Prototype Review',
    description: 'Review and iterate on design prototypes',
    startTime: '2025-09-10T13:00:00Z',
    endTime: '2025-09-10T14:30:00Z',
    resourceId: 'worker-sarah',
    color: '#10B981',
    metadata: { type: 'review', prototype: 'v2.1' }
  },
  {
    id: 'event-9',
    title: 'Stakeholder Presentation',
    description: 'Present design concepts to stakeholders',
    startTime: '2025-09-10T15:00:00Z',
    endTime: '2025-09-10T16:30:00Z',
    resourceId: 'worker-sarah',
    color: '#10B981',
    metadata: { type: 'presentation', stakeholders: ['CEO', 'CTO', 'Product Manager'] }
  },

  // THURSDAY - Mike Davis (2 events)
  {
    id: 'event-10',
    title: 'Marketing Campaign Planning',
    description: 'Plan Q4 marketing campaigns and budget allocation',
    startTime: '2025-09-11T10:00:00Z',
    endTime: '2025-09-11T12:00:00Z',
    resourceId: 'worker-mike',
    color: '#F59E0B',
    metadata: { type: 'planning', budget: 50000 }
  },
  {
    id: 'event-11',
    title: 'Client Call',
    description: 'Weekly check-in with key client',
    startTime: '2025-09-11T14:00:00Z',
    endTime: '2025-09-11T15:00:00Z',
    resourceId: 'worker-mike',
    color: '#F59E0B',
    metadata: { type: 'client-meeting', client: 'Acme Corp' }
  },

  // FRIDAY - Lisa Chen (3 events)
  {
    id: 'event-12',
    title: 'Frontend Development',
    description: 'Implement new dashboard components',
    startTime: '2025-09-12T09:00:00Z',
    endTime: '2025-09-12T11:00:00Z',
    resourceId: 'worker-lisa',
    color: '#8B5CF6',
    metadata: { type: 'development', feature: 'dashboard' }
  },
  {
    id: 'event-13',
    title: 'Bug Fixing Session',
    description: 'Address critical bugs in production',
    startTime: '2025-09-12T11:30:00Z',
    endTime: '2025-09-12T13:00:00Z',
    resourceId: 'worker-lisa',
    color: '#8B5CF6',
    metadata: { type: 'maintenance', priority: 'critical' }
  },
  {
    id: 'event-14',
    title: 'Code Documentation',
    description: 'Update technical documentation and API docs',
    startTime: '2025-09-12T14:00:00Z',
    endTime: '2025-09-12T16:00:00Z',
    resourceId: 'worker-lisa',
    color: '#8B5CF6',
    metadata: { type: 'documentation', components: ['API', 'Components'] }
  },

  // MULTI-DAY EVENTS
  {
    id: 'event-15',
    title: 'Multi-Day Conference',
    description: 'Annual tech conference - attending sessions and networking',
    startTime: '2025-09-09T08:00:00Z', // Tuesday
    endTime: '2025-09-11T18:00:00Z',   // Thursday
    resourceId: 'worker-john',
    color: '#F59E0B',
    metadata: { type: 'conference', duration: 'multi-day', location: 'Convention Center' }
  },
  {
    id: 'event-16',
    title: 'Design Sprint',
    description: 'Intensive 3-day design sprint for new product feature',
    startTime: '2025-09-08T09:00:00Z', // Monday
    endTime: '2025-09-10T17:00:00Z',   // Wednesday
    resourceId: 'worker-sarah',
    color: '#EF4444',
    metadata: { type: 'sprint', duration: 'multi-day', feature: 'Mobile Checkout' }
  },
  {
    id: 'event-17',
    title: 'Marketing Roadshow',
    description: 'Multi-city marketing events and client visits',
    startTime: '2025-09-10T08:00:00Z', // Wednesday
    endTime: '2025-09-12T19:00:00Z',   // Friday
    resourceId: 'worker-mike',
    color: '#EC4899',
    metadata: { type: 'travel', cities: ['NYC', 'Boston', 'Philadelphia'] }
  },
  {
    id: 'event-18',
    title: 'Training Workshop',
    description: 'Advanced React and TypeScript training program',
    startTime: '2025-09-11T08:00:00Z', // Thursday
    endTime: '2025-09-14T17:00:00Z',   // Sunday
    resourceId: 'worker-lisa',
    color: '#06B6D4',
    metadata: { type: 'training', duration: 'multi-day', skills: ['React', 'TypeScript', 'Testing'] }
  },
  // ADDITIONAL OVERLAPPING MULTI-DAY EVENTS FOR TESTING STACKING
  {
    id: 'event-19',
    title: 'Summer Vacation',
    description: 'Annual summer vacation',
    startTime: '2025-09-08T00:00:00Z', // Monday
    endTime: '2025-09-12T23:59:59Z',   // Friday
    resourceId: 'worker-john',
    color: '#10B981',
    metadata: { type: 'vacation', duration: 'multi-day' }
  },
  {
    id: 'event-20',
    title: 'Design Conference',
    description: 'UX/UI Design conference',
    startTime: '2025-09-09T08:00:00Z', // Tuesday
    endTime: '2025-09-11T18:00:00Z',   // Thursday
    resourceId: 'worker-sarah',
    color: '#8B5CF6',
    metadata: { type: 'conference', duration: 'multi-day' }
  },
  {
    id: 'event-21',
    title: 'Sick Leave',
    description: 'Medical leave',
    startTime: '2025-09-11T00:00:00Z', // Thursday
    endTime: '2025-09-12T23:59:59Z',   // Friday
    resourceId: 'worker-mike',
    color: '#F59E0B',
    metadata: { type: 'leave', duration: 'multi-day' }
  },
  {
    id: 'event-22',
    title: 'Technical Training',
    description: 'Advanced technical skills training',
    startTime: '2025-09-12T08:00:00Z', // Friday
    endTime: '2025-09-15T17:00:00Z',   // Monday
    resourceId: 'worker-lisa',
    color: '#EF4444',
    metadata: { type: 'training', duration: 'multi-day' }
  }
])

// Event actions - using default actions from EventCard (only delete)
const eventActions = ref<EventAction[]>([])

/**
 * Handle event click
 */
const handleEventClick = (event: CalendarEvent) => {
  console.log('Event clicked:', event)
  selectedEvent.value = event
}

/**
 * Handle event creation
 */
const handleEventCreate = (eventData: Partial<CalendarEvent>) => {
  console.log('Create event:', eventData)
  const newEvent: CalendarEvent = {
    id: `event-${Date.now()}`,
    title: eventData.title || 'New Event',
    description: eventData.description || '',
    startTime: eventData.startTime || atemporal().toString(),
    endTime: eventData.endTime || atemporal().add(1, 'hour').toString(),
    resourceId: eventData.resourceId,
    color: eventData.color || '#6B7280',
    metadata: eventData.metadata || {}
  }
  demoEvents.value.push(newEvent)
}

/**
 * Handle event update
 */
const handleEventUpdate = (event: CalendarEvent) => {
  console.log('Update event:', event)
  const index = demoEvents.value.findIndex(e => e.id === event.id)
  if (index > -1) {
    demoEvents.value[index] = event
  }
}

/**
 * Handle event deletion
 */
const handleEventDelete = (event: CalendarEvent) => {
  console.log('Delete event requested:', event)
  // Show alert with event data for user to handle deletion
  const message = `Delete Event Request:\n\nTitle: ${event.title}\nID: ${event.id}\nStart: ${event.startTime}\nEnd: ${event.endTime}\nResource: ${getResourceName(event.resourceId || '')}\n\nAtempoCal emits the complete event object.\nThe user should implement their own deletion logic.\n\n(Event is NOT actually deleted in this demo)`
  alert(message)
  
  // AtempoCal only emits the event data - user handles actual deletion
  // No actual deletion performed here to demonstrate pure display component behavior
}

/**
 * Handle date change
 */
const handleDateChange = (date: string) => {
  console.log('Date changed:', date)
  selectedDate.value = date
}

/**
 * Handle slot click
 */
const handleSlotClick = (slotInfo: any) => {
  console.log('Slot clicked:', slotInfo)
  // Show alert with comprehensive slot data for user to handle event creation
  const resourceName = slotInfo.resource ? slotInfo.resource.name : getResourceName(slotInfo.resourceId || '')
  const message = `Slot Click Data:\n\nDate: ${slotInfo.date}\nFormatted Date: ${slotInfo.formattedDate || slotInfo.date}\nDay Name: ${slotInfo.dayName || 'N/A'}\nDefault Time: ${slotInfo.time}\nResource ID: ${slotInfo.resourceId}\nResource Name: ${resourceName}\nIs Today: ${slotInfo.isToday || false}\nIs Weekend: ${slotInfo.isWeekend || false}\n\nThe user should handle event creation with this data.`
  alert(message)
}

/**
 * Format event time for display
 */
const formatEventTime = (event: CalendarEvent): string => {
  const start = atemporal(event.startTime)
  const end = atemporal(event.endTime)
  
  if (event.isAllDay) {
    return 'All Day'
  }
  
  return `${start.format('MMM DD, YYYY h:mm A')} - ${end.format('h:mm A')}`
}

/**
 * Get resource name by ID
 */
const getResourceName = (resourceId: string): string => {
  const resource = demoResources.value.find(r => r.id === resourceId)
  return resource?.name || 'Unknown Resource'
}

/**
 * Initialize demo data on mount
 */
onMounted(() => {
  console.log('🗓️ AtempoCal Demo initialized')
  console.log('📅 Sample events loaded:', demoEvents.value.length)
  console.log('🏢 Sample resources loaded:', demoResources.value.length)
})
</script>

<style scoped>
/* Component-specific styles */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Custom scrollbar for webkit browsers */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}

.dark ::-webkit-scrollbar-thumb {
  background: rgba(75, 85, 99, 0.5);
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: rgba(75, 85, 99, 0.7);
}
</style>