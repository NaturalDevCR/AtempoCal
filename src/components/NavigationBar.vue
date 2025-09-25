<template>
  <div class="atempo-cal-nav">
    <!-- Left section: Navigation controls -->
    <div class="nav-left">
      <slot 
        name="left" 
        :navigate-previous="() => $emit('navigate-previous')"
        :navigate-next="() => $emit('navigate-next')"
        :navigate-today="() => $emit('navigate-today')"
        :loading="loading"
        :previous-title="getPreviousTitle()"
        :next-title="getNextTitle()"
      >
        <!-- Default navigation buttons -->
        <button
          class="nav-arrow-btn"
          :disabled="loading"
          @click="$emit('navigate-previous')"
          :title="getPreviousTitle()"
        >
          <ChevronLeftIcon class="w-5 h-5" />
        </button>
        
        <button
          class="nav-arrow-btn"
          :disabled="loading"
          @click="$emit('navigate-next')"
          :title="getNextTitle()"
        >
          <ChevronRightIcon class="w-5 h-5" />
        </button>
        
        <button
          class="nav-today-btn"
          :disabled="loading"
          @click="$emit('navigate-today')"
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
          <CalendarIcon class="w-4 h-4" />
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
import type { Atemporal, CalendarConfig } from '../types'
import { formatDateForDisplay, getWeekStart } from '../utils/dateHelpers'

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
/* Navigation bar specific styles */
.atempo-cal-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background-color: var(--atempo-nav-bg);
  color: var(--atempo-text-primary);
  border-bottom: 1px solid var(--atempo-border-primary);
  min-height: 70px;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-center {
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: center;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-arrow-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: transparent;
  border: 1px solid var(--atempo-border-secondary);
  border-radius: 6px;
  color: var(--atempo-text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-arrow-btn:hover {
  background-color: var(--atempo-bg-secondary);
  border-color: var(--atempo-border-primary);
}

.nav-arrow-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-today-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  background-color: transparent;
  border: 1px solid var(--atempo-border-secondary);
  border-radius: 6px;
  color: var(--atempo-text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: 0.5rem;
}

.nav-today-btn:hover {
  background-color: var(--atempo-bg-secondary);
  border-color: var(--atempo-border-primary);
}

.nav-today-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--atempo-text-primary);
  margin: 0;
  text-align: center;
}

.nav-date-picker-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: transparent;
  border: 1px solid var(--atempo-border-secondary);
  border-radius: 6px;
  color: var(--atempo-text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-date-picker-btn:hover {
  background-color: var(--atempo-bg-secondary);
  border-color: var(--atempo-border-primary);
}

/* Modal styles */
.atempo-cal-modal {
  background-color: var(--atempo-bg-primary);
  border-radius: 8px;
  padding: 1.5rem;
  max-width: 400px;
  width: 100%;
  box-shadow: var(--shadow-xl);
  color: var(--atempo-text-primary);
}

.atempo-cal-modal-close {
  padding: 0.25rem;
  border-radius: 6px;
  transition: background-color 0.2s ease;
  color: var(--atempo-text-secondary);
  background: none;
  border: none;
  cursor: pointer;
}

.atempo-cal-modal-close:hover {
  background-color: var(--atempo-bg-secondary);
  color: var(--atempo-text-primary);
}

.atempo-cal-date-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--atempo-border-primary);
  border-radius: 6px;
  transition: border-color 0.2s ease;
  background-color: var(--atempo-bg-primary);
  color: var(--atempo-text-primary);
  font-size: 0.875rem;
}

.atempo-cal-date-input:focus {
  outline: none;
  border-color: var(--atempo-accent-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--atempo-accent-primary) 10%, transparent);
}

.atempo-cal-modal-button {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  border-radius: 6px;
  transition: background-color 0.2s ease;
  color: var(--atempo-text-secondary);
  background: none;
  border: 1px solid var(--atempo-border-primary);
  cursor: pointer;
}

.atempo-cal-modal-button:hover {
  background-color: var(--atempo-bg-secondary);
  color: var(--atempo-text-primary);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .atempo-cal-nav {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
  
  .nav-center {
    order: -1;
  }
  
  .nav-title {
    font-size: 1.125rem;
  }
  
  .atempo-cal-modal {
    margin: 1rem;
    padding: 1rem;
  }
}
</style>