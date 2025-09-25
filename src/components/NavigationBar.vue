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

    <!-- Right section: Additional controls -->
    <div class="flex items-center space-x-2">
      <!-- Theme Toggle Button -->
      <button
        class="atempo-cal-nav-button"
        @click="$emit('toggle-theme')"
        title="Toggle theme"
      >
        <SunIcon v-if="isDark" class="w-4 h-4" />
        <MoonIcon v-else class="w-4 h-4" />
      </button>
    </div>

    <!-- Date picker modal (if enabled) -->
    <Teleport to="body">
      <div
        v-if="showDatePickerModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click="closeDatePicker"
      >
        <div
          class="atempo-cal-modal"
          @click.stop
        >
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium">
              Select Date
            </h3>
            <button
              class="atempo-cal-modal-close"
              @click="closeDatePicker"
              title="Close"
            >
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>
          
          <input
            type="date"
            :value="currentDate.format('YYYY-MM-DD')"
            class="atempo-cal-date-input"
            @change="handleDatePickerChange"
          />
          
          <div class="flex justify-end space-x-2 mt-4">
            <button
              class="atempo-cal-modal-button"
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
import type { Atemporal, CalendarView, CalendarConfig } from '../types'
import { formatDateForDisplay, getWeekStart } from '../utils/dateHelpers'

// Icons (using simple SVG icons for now - can be replaced with icon library)
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  XMarkIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/vue/24/outline'

/**
 * NavigationBar component
 * Provides calendar navigation controls and view switching
 */

interface Props {
  currentDate: Atemporal
  currentView: CalendarView
  config?: CalendarConfig
  loading?: boolean
  showDatePicker?: boolean
  isDark?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  config: () => ({}),
  loading: false,
  showDatePicker: true,
  isDark: false
})

interface Emits {
  'navigate-previous': []
  'navigate-next': []
  'navigate-today': []
  'date-change': [date: string]
  'toggle-theme': []
}

const emit = defineEmits<Emits>()

// Local state
const showDatePickerModal = ref(false)

/**
 * Get display title for week view
 */
const getDisplayTitle = (): string => {
  const date = props.currentDate
  const firstDayOfWeek = props.config?.firstDayOfWeek ?? 1 // Default to Monday
  
  // For week view, show the week range using the same calculation as WeeklyView
  const weekStart = getWeekStart(date, firstDayOfWeek)
  // Use the last day of the week (6 days after start) instead of getWeekEnd which goes to end of day
  const weekEnd = weekStart.add(6, 'days')
  
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
@reference "tailwindcss";

/* Navigation bar specific styles */
.atempo-cal-nav {
  @apply flex items-center justify-between p-4 border-b;
  background-color: var(--atempo-bg-primary);
  border-color: var(--atempo-border-primary);
  color: var(--atempo-text-primary);
}

.atempo-cal-nav-button {
  @apply inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-all duration-200 cursor-pointer;
  color: var(--atempo-text-primary);
  background-color: var(--atempo-bg-primary);
  border-color: var(--atempo-border-secondary);
}

.atempo-cal-nav-button:hover {
  background-color: var(--atempo-bg-secondary);
}

.atempo-cal-nav-button:focus {
  @apply outline-none;
  box-shadow: 0 0 0 2px var(--atempo-accent-primary);
  border-color: var(--atempo-accent-primary);
}

.atempo-cal-nav-button:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.atempo-cal-nav-title {
  @apply text-lg font-semibold;
  color: var(--atempo-text-primary);
}

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

/* Modal styles */
.atempo-cal-modal {
  @apply rounded-lg p-6 max-w-sm w-full shadow-xl;
  background-color: var(--atempo-bg-primary);
  border: 1px solid var(--atempo-border-primary);
  color: var(--atempo-text-primary);
}

.atempo-cal-modal-close {
  @apply p-1 rounded-md transition-colors duration-200;
  color: var(--atempo-text-secondary);
}

.atempo-cal-modal-close:hover {
  background-color: var(--atempo-bg-secondary);
  color: var(--atempo-text-primary);
}

.atempo-cal-date-input {
  @apply w-full px-3 py-2 border rounded-md transition-colors duration-200;
  background-color: var(--atempo-bg-primary);
  border-color: var(--atempo-border-secondary);
  color: var(--atempo-text-primary);
}

.atempo-cal-date-input:focus {
  @apply outline-none;
  border-color: var(--atempo-accent-primary);
  box-shadow: 0 0 0 1px var(--atempo-accent-primary);
}

.atempo-cal-modal-button {
  @apply px-4 py-2 text-sm rounded-md transition-colors duration-200;
  color: var(--atempo-text-secondary);
}

.atempo-cal-modal-button:hover {
  background-color: var(--atempo-bg-secondary);
  color: var(--atempo-text-primary);
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
  
  .atempo-cal-modal {
    @apply mx-4 p-4;
  }
}
</style>