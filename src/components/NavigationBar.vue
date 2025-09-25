<template>
  <div class="atempo-cal-nav">
    <!-- Left section: Navigation controls -->
    <div class="flex items-center space-x-2">
      <!-- Previous/Next buttons -->
      <button
        class="atempo-cal-nav-button"
        :disabled="loading"
        @click="$emit('navigate-previous')"
        :title="getPreviousTitle()"
      >
        <ChevronLeftIcon class="w-4 h-4" />
      </button>
      
      <button
        class="atempo-cal-nav-button"
        :disabled="loading"
        @click="$emit('navigate-next')"
        :title="getNextTitle()"
      >
        <ChevronRightIcon class="w-4 h-4" />
      </button>
      
      <!-- Today button -->
      <button
        class="atempo-cal-nav-button"
        :disabled="loading"
        @click="$emit('navigate-today')"
        title="Go to today"
      >
        Today
      </button>
    </div>

    <!-- Center section: Current date/period display -->
    <div class="flex items-center space-x-4">
      <h2 class="atempo-cal-nav-title">
        {{ getDisplayTitle() }}
      </h2>
      
      <!-- Date picker (optional) -->
      <button
        v-if="showDatePicker"
        class="atempo-cal-nav-button text-sm"
        @click="toggleDatePicker"
        title="Select date"
      >
        <CalendarIcon class="w-4 h-4 mr-1" />
        Pick Date
      </button>
    </div>

    <!-- Right section: Settings -->
    <div class="flex items-center space-x-2">
      <!-- Settings button -->
      <button
        class="atempo-cal-nav-button"
        @click="$emit('toggle-config')"
        title="Settings"
      >
        <CogIcon class="w-4 h-4" />
      </button>
    </div>

    <!-- Date picker modal (if enabled) -->
    <Teleport to="body">
      <div
        v-if="showDatePickerModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click="closeDatePicker"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-sm w-full mx-4"
          @click.stop
        >
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
              Select Date
            </h3>
            <button
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              @click="closeDatePicker"
            >
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>
          
          <input
            type="date"
            :value="currentDate.format('YYYY-MM-DD')"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            @change="handleDatePickerChange"
          />
          
          <div class="flex justify-end space-x-2 mt-4">
            <button
              class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              @click="closeDatePicker"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Atemporal, CalendarView } from '../types'
import { formatDateForDisplay } from '../utils/dateHelpers'

// Icons (using simple SVG icons for now - can be replaced with icon library)
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  CogIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

/**
 * NavigationBar component
 * Provides calendar navigation controls and view switching
 */

interface Props {
  currentDate: Atemporal
  currentView: CalendarView
  loading?: boolean
  showDatePicker?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  showDatePicker: true
})

interface Emits {
  'navigate-previous': []
  'navigate-next': []
  'navigate-today': []
  'date-change': [date: string]
  'toggle-config': []
}

const emit = defineEmits<Emits>()

// Local state
const showDatePickerModal = ref(false)

/**
 * Get display title for week view
 */
const getDisplayTitle = (): string => {
  const date = props.currentDate
  
  // For week view, show the week range
  const weekStart = date.startOf('week')
  const weekEnd = date.endOf('week')
  
  if (weekStart.month === weekEnd.month) {
    // Same month
    return `${formatDateForDisplay(weekStart, 'MMMM D')} - ${formatDateForDisplay(weekEnd, 'D, YYYY')}`
  } else if (weekStart.year === weekEnd.year) {
    // Same year, different months
    return `${formatDateForDisplay(weekStart, 'MMM D')} - ${formatDateForDisplay(weekEnd, 'MMM D, YYYY')}`
  } else {
    // Different years
    return `${formatDateForDisplay(weekStart, 'MMM D, YYYY')} - ${formatDateForDisplay(weekEnd, 'MMM D, YYYY')}`
  }
}

/**
 * Get tooltip text for previous button
 */
const getPreviousTitle = (): string => {
  return 'Previous week'
}

/**
 * Get tooltip text for next button
 */
const getNextTitle = (): string => {
  return 'Next week'
}

/**
 * Toggle date picker modal
 */
const toggleDatePicker = (): void => {
  showDatePickerModal.value = !showDatePickerModal.value
}

/**
 * Close date picker modal
 */
const closeDatePicker = (): void => {
  showDatePickerModal.value = false
}

/**
 * Handle date picker change
 */
const handleDatePickerChange = (event: Event): void => {
  const target = event.target as HTMLInputElement
  const selectedDate = target.value
  
  if (selectedDate) {
    emit('date-change', selectedDate)
    closeDatePicker()
  }
}
</script>

<style scoped>
/* Additional component-specific styles */
.atempo-cal-view-toggle {
  @apply inline-flex rounded-md shadow-sm;
}

.atempo-cal-view-toggle button:not(:first-child) {
  @apply -ml-px;
}

.atempo-cal-view-toggle button:first-child {
  @apply rounded-l-md;
}

.atempo-cal-view-toggle button:last-child {
  @apply rounded-r-md;
}

.atempo-cal-view-toggle button.active {
  @apply bg-blue-600 text-white border-blue-600 z-10;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .atempo-cal-nav {
    @apply flex-col space-y-2 p-2;
  }
  
  .atempo-cal-nav > div {
    @apply justify-center;
  }
  
  .atempo-cal-nav-title {
    @apply text-base text-center;
  }
}
</style>