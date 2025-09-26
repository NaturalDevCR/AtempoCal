<template>
  <div id="app">
    <!-- Header -->
    <header class="demo-header">
      <div class="container">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 class="text-xl font-semibold text-gray-900">
                AtempoCal Demo
              </h1>
            </div>
            <span class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              v1.0.0
            </span>
          </div>
          
          <div class="flex items-center space-x-4">
            <!-- Theme Toggle -->
            <button
              @click="toggleTheme"
              class="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
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
              class="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
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
    <main class="container py-8">
      <!-- Demo Info -->
      <div class="mb-8">
        <div class="demo-card p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-2">
            Welcome to AtempoCal - Resource Calendar
          </h2>
          <p class="text-gray-600 mb-4">
            A highly customizable Vue 3 resource calendar component built with TypeScript, SCSS, and the Atemporal library.
            This demo showcases a worker scheduling system where the weekly view shows resources (workers) on the left, and the daily view shows hourly time slots.
          </p>
          <div class="flex flex-wrap gap-2">
            <span class="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
              Vue 3 + TypeScript
            </span>
            <span class="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">
              Atemporal Library
            </span>
            <span class="px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded-full">
              SCSS
            </span>
            <span class="px-3 py-1 text-sm bg-orange-100 text-orange-800 rounded-full">
              Dark/Light Theme
            </span>
          </div>
        </div>
      </div>

      <!-- Scroll Configuration Demo Controls -->
      <div class="mb-8">
        <div class="demo-card p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            🔧 Scroll Configuration Demo
          </h3>
          <p class="text-gray-600 mb-4">
            Test different scroll behaviors with {{ demoResources.length }} workers. Change the settings below to see how the calendar adapts.
          </p>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Scroll Mode Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Scroll Mode
              </label>
              <select 
                v-model="scrollMode"
                class="demo-select"
              >
                <option value="auto">Auto (Default)</option>
                <option value="fixed">Fixed Height</option>
                <option value="workers">Max Workers Threshold</option>
                <option value="disabled">No Scroll</option>
              </select>
              <p class="text-xs text-gray-500 mt-1">
                <span v-if="scrollMode === 'auto'">Automatic scroll when content exceeds viewport</span>
                <span v-else-if="scrollMode === 'fixed'">Fixed height with scroll</span>
                <span v-else-if="scrollMode === 'workers'">Scroll after worker count threshold</span>
                <span v-else>No scroll, expand to fit content</span>
              </p>
            </div>

            <!-- Fixed Height Control -->
            <div :class="{ 'opacity-50': scrollMode !== 'fixed' }">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Fixed Height (px)
              </label>
              <input 
                v-model.number="fixedHeightValue"
                type="range"
                min="200"
                max="800"
                step="50"
                :disabled="scrollMode !== 'fixed'"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div class="flex justify-between text-xs text-gray-500 mt-1">
                <span>200px</span>
                <span class="font-medium">{{ fixedHeightValue }}px</span>
                <span>800px</span>
              </div>
            </div>

            <!-- Max Workers Control -->
            <div :class="{ 'opacity-50': scrollMode !== 'workers' }">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Max Workers Before Scroll
              </label>
              <input 
                v-model.number="maxWorkersValue"
                type="range"
                min="3"
                max="15"
                step="1"
                :disabled="scrollMode !== 'workers'"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div class="flex justify-between text-xs text-gray-500 mt-1">
                <span>3</span>
                <span class="font-medium">{{ maxWorkersValue }} workers</span>
                <span>15</span>
              </div>
              <p class="text-xs text-gray-500 mt-1">
                Current: {{ demoResources.length }} workers
                <span v-if="scrollMode === 'workers'" class="ml-2">
                  ({{ demoResources.length > maxWorkersValue ? 'Scroll enabled' : 'No scroll' }})
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Calendar Component -->
      <AtempoCal
          :current-date="selectedDate"
          :events="demoEvents"
          :resources="demoResources"
          :config="calendarConfig"
          :event-actions="eventActions"
          :loading="false"
          :special-event-colors="{
            'day-off': '#EF4444',
            'annual-leave': '#3B82F6',
            'training': '#10B981'
          }"
          @event-click="handleEventClick"
          @event-create="handleEventCreate"
          @event-update="handleEventUpdate"
          @event-delete="handleEventDelete"
          @date-change="handleDateChange"
          @slot-click="handleSlotClick"
        >
          <!-- Custom Navigation Slot (Left) -->
          <template #navigation="{ navigatePrevious, navigateNext, navigateToday }">
            <div class="flex items-center space-x-2">
              <button
                @click="navigatePrevious"
                class="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200 shadow-sm"
                title="Previous"
              >
                <ChevronLeftIcon class="w-5 h-5" />
              </button>
              <button
                @click="navigateNext"
                class="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200 shadow-sm"
                title="Next"
              >
                <ChevronRightIcon class="w-5 h-5" />
              </button>
              <button
                @click="navigateToday"
                class="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition-colors duration-200 shadow-sm"
                title="Go to Today"
              >
                Today
              </button>
            </div>
          </template>

          <!-- Custom Title Slot (Center) -->
          <template #title="{ displayTitle }">
            <div class="flex flex-col items-center">
              <h2 class="text-xl font-bold text-gray-900">
                📅 {{ displayTitle }}
              </h2>
              <p class="text-sm text-gray-500 mt-1">
                Custom Demo Calendar
              </p>
            </div>
          </template>

          <!-- Custom Date Picker Slot (Right) -->
          <template #datepicker="{ currentDate, onDateChange }">
            <div class="flex items-center space-x-3">
              <div class="flex items-center space-x-2">
                <CalendarDaysIcon class="w-5 h-5 text-gray-500" />
                <input
                  type="date"
                  :value="atemporal(currentDate).format('YYYY-MM-DD')"
                  @change="(e) => onDateChange((e.target as HTMLInputElement).value)"
                  class="demo-input"
                />
              </div>
              <!-- View selector removed since only one view is supported -->
            </div>
          </template>
        </AtempoCal>

      <!-- Event Details Modal -->
      <div
        v-if="selectedEvent"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        @click="selectedEvent = null"
      >
        <div
          class="demo-modal max-w-md w-full p-6"
          @click.stop
        >
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ selectedEvent.title }}
            </h3>
            <button
              @click="selectedEvent = null"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="space-y-3">
            <div v-if="selectedEvent.description">
              <p class="text-sm font-medium text-gray-700">Description</p>
              <p class="text-gray-600">{{ selectedEvent.description }}</p>
            </div>
            
            <div>
              <p class="text-sm font-medium text-gray-700">Time</p>
              <p class="text-gray-600">
                {{ formatEventTime(selectedEvent) }}
              </p>
            </div>
            
            <div v-if="selectedEvent.resourceId">
              <p class="text-sm font-medium text-gray-700">Resource</p>
              <p class="text-gray-600">
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
import { ref, onMounted, watch } from 'vue'
import atemporal from 'atemporal'
import AtempoCal from '../../src/AtempoCal.vue'
import { useTheme } from '../../src/composables/useTheme'
import type { CalendarEvent, CalendarResource, CalendarConfig, EventAction } from '../../src/types'
import { ChevronLeftIcon, ChevronRightIcon, CalendarDaysIcon } from '@heroicons/vue/24/outline'

/**
 * Demo application for AtempoCal component
 * Showcases all calendar features with sample data
 */

// Theme management
const { currentTheme, toggleTheme } = useTheme()

// Calendar state
// Set to the week where our demo events are located (September 8-14, 2025)
const selectedDate = ref(atemporal('2025-09-08').toString())
const selectedEvent = ref<CalendarEvent | null>(null)

// Scroll configuration options for demo
const scrollMode = ref<'auto' | 'fixed' | 'workers' | 'disabled'>('auto')
const fixedHeightValue = ref(400)
const maxWorkersValue = ref(8)

// Calendar configuration
const calendarConfig = ref<CalendarConfig>({
  timezone: 'America/Costa_Rica',
  locale: 'es-ES',
  theme: 'auto',
  showWeekends: true,
  firstDayOfWeek: 1, // Monday
  // Scroll configuration - dynamically updated based on demo controls
  maxWorkersBeforeScroll: scrollMode.value === 'workers' ? maxWorkersValue.value : undefined,
  fixedHeight: scrollMode.value === 'fixed' ? `${fixedHeightValue.value}px` : undefined,
  enableAutoScroll: scrollMode.value !== 'disabled'
})

// Demo resources (Workers) - 14 total workers
const demoResources = ref<CalendarResource[]>([
  {
    id: 'worker-john',
    name: 'John Smith',
    metadata: { department: 'Engineering', role: 'Senior Developer', email: 'john.smith@company.com' }
  },
  {
    id: 'worker-sarah',
    name: 'Sarah Johnson',
    metadata: { department: 'Design', role: 'UX Designer', email: 'sarah.johnson@company.com' }
  },
  {
    id: 'worker-mike',
    name: 'Mike Davis',
    metadata: { department: 'Marketing', role: 'Marketing Manager', email: 'mike.davis@company.com' }
  },
  {
    id: 'worker-lisa',
    name: 'Lisa Chen',
    metadata: { department: 'Engineering', role: 'Frontend Developer', email: 'lisa.chen@company.com' }
  },
  {
    id: 'worker-alex',
    name: 'Alex Rodriguez',
    metadata: { department: 'Engineering', role: 'Backend Developer', email: 'alex.rodriguez@company.com' }
  },
  {
    id: 'worker-emma',
    name: 'Emma Wilson',
    metadata: { department: 'Design', role: 'UI Designer', email: 'emma.wilson@company.com' }
  },
  {
    id: 'worker-david',
    name: 'David Brown',
    metadata: { department: 'Engineering', role: 'DevOps Engineer', email: 'david.brown@company.com' }
  },
  {
    id: 'worker-maria',
    name: 'Maria Garcia',
    metadata: { department: 'Product', role: 'Product Manager', email: 'maria.garcia@company.com' }
  },
  {
    id: 'worker-james',
    name: 'James Taylor',
    metadata: { department: 'QA', role: 'QA Engineer', email: 'james.taylor@company.com' }
  },
  {
    id: 'worker-sophia',
    name: 'Sophia Lee',
    metadata: { department: 'Marketing', role: 'Content Manager', email: 'sophia.lee@company.com' }
  },
  {
    id: 'worker-ryan',
    name: 'Ryan Miller',
    metadata: { department: 'Sales', role: 'Sales Manager', email: 'ryan.miller@company.com' }
  },
  {
    id: 'worker-olivia',
    name: 'Olivia Davis',
    metadata: { department: 'HR', role: 'HR Specialist', email: 'olivia.davis@company.com' }
  },
  {
    id: 'worker-noah',
    name: 'Noah Anderson',
    metadata: { department: 'Finance', role: 'Financial Analyst', email: 'noah.anderson@company.com' }
  },
  {
    id: 'worker-ava',
    name: 'Ava Thompson',
    metadata: { department: 'Operations', role: 'Operations Manager', email: 'ava.thompson@company.com' }
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
    metadata: { type: 'development', feature: 'dashboard' }
  },
  {
    id: 'event-13',
    title: 'Bug Fixing Session',
    description: 'Address critical bugs in production',
    startTime: '2025-09-12T11:30:00Z',
    endTime: '2025-09-12T13:00:00Z',
    resourceId: 'worker-lisa',
    metadata: { type: 'maintenance', priority: 'critical' }
  },
  {
    id: 'event-14',
    title: 'Code Documentation',
    description: 'Update technical documentation and API docs',
    startTime: '2025-09-12T14:00:00Z',
    endTime: '2025-09-12T16:00:00Z',
    resourceId: 'worker-lisa',
    metadata: { type: 'documentation', components: ['API', 'Components'] }
  },

  // NEW WORKERS EVENTS - Alex Rodriguez (Backend Developer)
  {
    id: 'event-alex-1',
    title: 'API Development',
    description: 'Build REST API endpoints',
    startTime: '2025-09-08T10:00:00Z',
    endTime: '2025-09-08T12:00:00Z',
    resourceId: 'worker-alex',
    metadata: { type: 'development', feature: 'api' }
  },
  {
    id: 'event-alex-2',
    title: 'Database Optimization',
    description: 'Optimize database queries and indexes',
    startTime: '2025-09-09T14:00:00Z',
    endTime: '2025-09-09T16:00:00Z',
    resourceId: 'worker-alex',
    metadata: { type: 'optimization', priority: 'high' }
  },
  {
    id: 'event-alex-3',
    title: 'Code Review',
    description: 'Review backend pull requests',
    startTime: '2025-09-11T09:00:00Z',
    endTime: '2025-09-11T10:30:00Z',
    resourceId: 'worker-alex',
    metadata: { type: 'review' }
  },

  // Emma Wilson (UI Designer)
  {
    id: 'event-emma-1',
    title: 'UI Mockups',
    description: 'Create UI mockups for mobile app',
    startTime: '2025-09-08T09:00:00Z',
    endTime: '2025-09-08T11:00:00Z',
    resourceId: 'worker-emma',
    metadata: { type: 'design', platform: 'mobile' }
  },
  {
    id: 'event-emma-2',
    title: 'Design System Update',
    description: 'Update component library',
    startTime: '2025-09-10T13:00:00Z',
    endTime: '2025-09-10T15:00:00Z',
    resourceId: 'worker-emma',
    metadata: { type: 'design-system' }
  },

  // David Brown (DevOps Engineer)
  {
    id: 'event-david-1',
    title: 'CI/CD Pipeline Setup',
    description: 'Configure deployment pipeline',
    startTime: '2025-09-09T10:00:00Z',
    endTime: '2025-09-09T12:00:00Z',
    resourceId: 'worker-david',
    metadata: { type: 'devops', feature: 'pipeline' }
  },
  {
    id: 'event-david-2',
    title: 'Server Maintenance',
    description: 'Update server configurations',
    startTime: '2025-09-11T15:00:00Z',
    endTime: '2025-09-11T17:00:00Z',
    resourceId: 'worker-david',
    metadata: { type: 'maintenance', priority: 'medium' }
  },

  // Maria Garcia (Product Manager)
  {
    id: 'event-maria-1',
    title: 'Product Planning',
    description: 'Plan next quarter roadmap',
    startTime: '2025-09-08T14:00:00Z',
    endTime: '2025-09-08T16:00:00Z',
    resourceId: 'worker-maria',
    metadata: { type: 'planning', quarter: 'Q4' }
  },
  {
    id: 'event-maria-2',
    title: 'Stakeholder Meeting',
    description: 'Weekly stakeholder sync',
    startTime: '2025-09-10T10:00:00Z',
    endTime: '2025-09-10T11:00:00Z',
    resourceId: 'worker-maria',
    metadata: { type: 'meeting', stakeholders: true }
  },

  // James Taylor (QA Engineer)
  {
    id: 'event-james-1',
    title: 'Test Automation',
    description: 'Write automated test scripts',
    startTime: '2025-09-09T09:00:00Z',
    endTime: '2025-09-09T11:00:00Z',
    resourceId: 'worker-james',
    metadata: { type: 'testing', automation: true }
  },
  {
    id: 'event-james-2',
    title: 'Bug Testing',
    description: 'Test recent bug fixes',
    startTime: '2025-09-12T10:00:00Z',
    endTime: '2025-09-12T12:00:00Z',
    resourceId: 'worker-james',
    metadata: { type: 'testing', priority: 'high' }
  },

  // Sophia Lee (Content Manager)
  {
    id: 'event-sophia-1',
    title: 'Content Creation',
    description: 'Create blog posts and social media content',
    startTime: '2025-09-08T10:00:00Z',
    endTime: '2025-09-08T12:00:00Z',
    resourceId: 'worker-sophia',
    metadata: { type: 'content', platforms: ['blog', 'social'] }
  },
  {
    id: 'event-sophia-2',
    title: 'Content Review',
    description: 'Review and approve marketing content',
    startTime: '2025-09-11T14:00:00Z',
    endTime: '2025-09-11T15:30:00Z',
    resourceId: 'worker-sophia',
    metadata: { type: 'review', content: 'marketing' }
  },

  // Ryan Miller (Sales Manager)
  {
    id: 'event-ryan-1',
    title: 'Sales Calls',
    description: 'Client prospecting calls',
    startTime: '2025-09-09T13:00:00Z',
    endTime: '2025-09-09T15:00:00Z',
    resourceId: 'worker-ryan',
    metadata: { type: 'sales', activity: 'prospecting' }
  },
  {
    id: 'event-ryan-2',
    title: 'Sales Training',
    description: 'Train new sales team members',
    startTime: '2025-09-12T09:00:00Z',
    endTime: '2025-09-12T11:00:00Z',
    resourceId: 'worker-ryan',
    eventType: 'training',
    metadata: { type: 'training', team: 'sales' }
  },

  // Olivia Davis (HR Specialist)
  {
    id: 'event-olivia-1',
    title: 'Employee Interviews',
    description: 'Conduct candidate interviews',
    startTime: '2025-09-10T09:00:00Z',
    endTime: '2025-09-10T12:00:00Z',
    resourceId: 'worker-olivia',
    metadata: { type: 'interview', candidates: 3 }
  },
  {
    id: 'event-olivia-2',
    title: 'HR Policy Review',
    description: 'Review and update HR policies',
    startTime: '2025-09-11T10:00:00Z',
    endTime: '2025-09-11T12:00:00Z',
    resourceId: 'worker-olivia',
    metadata: { type: 'policy', department: 'hr' }
  },

  // Noah Anderson (Financial Analyst)
  {
    id: 'event-noah-1',
    title: 'Financial Analysis',
    description: 'Quarterly financial report analysis',
    startTime: '2025-09-08T13:00:00Z',
    endTime: '2025-09-08T15:00:00Z',
    resourceId: 'worker-noah',
    metadata: { type: 'analysis', period: 'quarterly' }
  },
  {
    id: 'event-noah-2',
    title: 'Budget Planning',
    description: 'Plan next year budget allocations',
    startTime: '2025-09-12T13:00:00Z',
    endTime: '2025-09-12T16:00:00Z',
    resourceId: 'worker-noah',
    metadata: { type: 'planning', budget: 'annual' }
  },

  // Ava Thompson (Operations Manager)
  {
    id: 'event-ava-1',
    title: 'Operations Review',
    description: 'Weekly operations performance review',
    startTime: '2025-09-09T08:00:00Z',
    endTime: '2025-09-09T09:30:00Z',
    resourceId: 'worker-ava',
    metadata: { type: 'review', scope: 'operations' }
  },
  {
    id: 'event-ava-2',
    title: 'Process Optimization',
    description: 'Optimize workflow processes',
    startTime: '2025-09-11T13:00:00Z',
    endTime: '2025-09-11T15:00:00Z',
    resourceId: 'worker-ava',
    metadata: { type: 'optimization', area: 'workflow' }
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
    eventType: 'training',
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
 * Watch for scroll configuration changes and update calendar config
 */
watch([scrollMode, fixedHeightValue, maxWorkersValue], () => {
  calendarConfig.value = {
    ...calendarConfig.value,
    maxWorkersBeforeScroll: scrollMode.value === 'workers' ? maxWorkersValue.value : undefined,
    fixedHeight: scrollMode.value === 'fixed' ? `${fixedHeightValue.value}px` : undefined,
    enableAutoScroll: scrollMode.value !== 'disabled'
  }
}, { deep: true })

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