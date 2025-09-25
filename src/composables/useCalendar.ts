import { ref, computed, type Ref, type ComputedRef } from 'vue'
import type { Atemporal, CalendarView, UseCalendarReturn } from '../types'
import { createAtemporal, getWeekStart, getWeekEnd } from '../utils/dateHelpers'

/**
 * Calendar state management composable
 * Handles current date, view switching, and navigation
 * @param initialDate - Initial date for the calendar
 * @param initialView - Initial view mode
 * @param timezone - Optional timezone override
 * @returns Calendar state and navigation methods
 */
export function useCalendar(
  initialDate?: string | Atemporal,
  _initialView: CalendarView = 'week',
  timezone?: string
): UseCalendarReturn {
  // Reactive state
  const currentDate = ref(
    initialDate 
      ? (typeof initialDate === 'string' ? createAtemporal(initialDate, timezone) : initialDate)
      : createAtemporal(undefined, timezone)
  ) as Ref<Atemporal>
  
  /**
   * Computed property for visible date range (week view only)
   */
  const visibleRange: ComputedRef<{ start: Atemporal; end: Atemporal }> = computed(() => {
    const date = currentDate.value
    return {
      start: getWeekStart(date),
      end: getWeekEnd(date)
    }
  })
  
  /**
   * Navigate to a specific date
   * @param date - Target date (string or Atemporal instance)
   */
  const navigateToDate = (date: string | Atemporal): void => {
    if (typeof date === 'string') {
      currentDate.value = createAtemporal(date, timezone)
    } else {
      currentDate.value = date
    }
  }
  
  /**
   * Navigate to previous week
   */
  const navigatePrevious = (): void => {
    currentDate.value = currentDate.value.subtract(1, 'week')
  }
  
  /**
   * Navigate to next week
   */
  const navigateNext = (): void => {
    currentDate.value = currentDate.value.add(1, 'week')
  }
  
  /**
   * Navigate to today
   */
  const navigateToday = (): void => {
    currentDate.value = createAtemporal(undefined, timezone)
  }
  
  return {
    currentDate,
    visibleRange,
    navigateToDate,
    navigatePrevious,
    navigateNext,
    navigateToday
  }
}