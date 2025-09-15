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
  initialView: CalendarView = 'week',
  timezone?: string
): UseCalendarReturn {
  // Reactive state
  const currentDate = ref(
    initialDate 
      ? (typeof initialDate === 'string' ? createAtemporal(initialDate, timezone) : initialDate)
      : createAtemporal(undefined, timezone)
  ) as Ref<Atemporal>
  
  const currentView: Ref<CalendarView> = ref(initialView)
  
  /**
   * Computed property for visible date range based on current view
   */
  const visibleRange: ComputedRef<{ start: Atemporal; end: Atemporal }> = computed(() => {
    const date = currentDate.value
    
    switch (currentView.value) {
      case 'week':
        return {
          start: getWeekStart(date),
          end: getWeekEnd(date)
        }
      case 'day':
        return {
          start: date.startOf('day'),
          end: date.endOf('day')
        }
      default:
        return {
          start: date.startOf('day'),
          end: date.endOf('day')
        }
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
   * Navigate to previous period based on current view
   */
  const navigatePrevious = (): void => {
    switch (currentView.value) {
      case 'week':
        currentDate.value = currentDate.value.subtract(1, 'week')
        break
      case 'day':
        currentDate.value = currentDate.value.subtract(1, 'day')
        break
    }
  }
  
  /**
   * Navigate to next period based on current view
   */
  const navigateNext = (): void => {
    switch (currentView.value) {
      case 'week':
        currentDate.value = currentDate.value.add(1, 'week')
        break
      case 'day':
        currentDate.value = currentDate.value.add(1, 'day')
        break
    }
  }
  
  /**
   * Navigate to today
   */
  const navigateToday = (): void => {
    currentDate.value = createAtemporal(undefined, timezone)
  }
  
  /**
   * Set the current view mode
   * @param view - New view mode
   */
  const setView = (view: CalendarView): void => {
    currentView.value = view
  }
  
  return {
    currentDate,
    currentView,
    visibleRange,
    navigateToDate,
    navigatePrevious,
    navigateNext,
    navigateToday,
    setView
  }
}