<template>
  <div class="atempo-cal-nav">
    <!-- Left section: Navigation controls -->
    <div class="nav-left">
      <slot 
        name="left" 
        :navigate-previous="debouncedNavigatePrevious"
        :navigate-next="debouncedNavigateNext"
        :navigate-today="debouncedNavigateToday"
        :loading="loading"
        :previous-title="getPreviousTitle()"
        :next-title="getNextTitle()"
      >
        <!-- Default navigation buttons -->
        <button
          class="nav-arrow-btn"
          :disabled="loading"
          @click="debouncedNavigatePrevious"
          :title="getPreviousTitle()"
        >
          <ChevronLeftIcon class="nav-icon" />
        </button>
        
        <button
          class="nav-arrow-btn"
          :disabled="loading"
          @click="debouncedNavigateNext"
          :title="getNextTitle()"
        >
          <ChevronRightIcon class="nav-icon" />
        </button>
        
        <button
          class="nav-today-btn"
          :disabled="loading"
          @click="debouncedNavigateToday"
          title="Go to today"
        >
          Today
        </button>
      </slot>
    </div>

    <!-- Center section: Current date/period display -->
    <div class="nav-center">
      <slot 
        name="center" 
        :display-title="getDisplayTitle()"
        :current-date="currentDate"
      >
        <!-- Default title display -->
        <h1 class="nav-title">
          {{ getDisplayTitle() }}
        </h1>
      </slot>
    </div>

    <!-- Right section: Date picker and additional controls -->
    <div class="nav-right">
      <slot 
        name="right" 
        :show-date-picker="showDatePicker"
        :toggle-date-picker="toggleDatePicker"
        :current-date="currentDate"
        :on-date-change="handleDateChange"
      >
        <!-- Default date picker button -->
        <button
          v-if="showDatePicker"
          class="nav-date-picker-btn"
          @click="toggleDatePicker"
          title="Select date"
        >
          <CalendarIcon class="nav-icon-sm" />
        </button>
      </slot>
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
              <XMarkIcon class="nav-icon" />
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
import type { Atemporal, CalendarConfig } from '../types'
import { formatDateForDisplay, getWeekStart } from '../utils/dateHelpers'

/**
 * Debounce utility function
 */
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return ((...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }) as T
}

// Icons (using simple SVG icons for now - can be replaced with icon library)
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

/**
 * NavigationBar component
 * Provides calendar navigation controls and view switching
 */

interface Props {
  currentDate: Atemporal
  config?: CalendarConfig
  loading?: boolean
  showDatePicker?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  config: () => ({}),
  loading: false,
  showDatePicker: true
})

interface Emits {
  'navigate-previous': []
  'navigate-next': []
  'navigate-today': []
  'date-change': [date: string]
}

const emit = defineEmits<Emits>()

// Local state
const showDatePickerModal = ref(false)

// Debounced navigation functions to prevent rapid successive calls
const debouncedNavigatePrevious = debounce(() => {
  emit('navigate-previous')
}, 150)

const debouncedNavigateNext = debounce(() => {
  emit('navigate-next')
}, 150)

const debouncedNavigateToday = debounce(() => {
  emit('navigate-today')
}, 150)

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

/**
 * Handle date change for slot props
 */
const handleDateChange = (date: string): void => {
  emit('date-change', date)
}
</script>

<style scoped>
/* NavigationBar styles are now handled by the main SCSS file */
/* Component-specific styles only */
.nav-icon {
  width: 20px;
  height: 20px;
}

.nav-icon-sm {
  width: 16px;
  height: 16px;
}
</style>