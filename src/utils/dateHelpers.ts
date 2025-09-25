import atemporal from 'atemporal'
import type { TimeSlot, GridConfig } from '../types'

// Use the actual atemporal type from the library
type Atemporal = ReturnType<typeof atemporal>

/**
 * Create an atemporal instance from various input types
 * @param input - Date input (string, Date, number, or Atemporal)
 * @param timezone - Optional timezone override
 * @returns Atemporal instance
 */
export function createAtemporal(input?: any, timezone?: string): Atemporal {
  if (timezone) {
    return atemporal(input, timezone)
  }
  return atemporal(input)
}

/**
 * Get the start of the week for a given date
 * @param date - Input date
 * @param firstDayOfWeek - First day of week (0 = Sunday, 1 = Monday)
 * @returns Start of week date
 */
export function getWeekStart(date: Atemporal, firstDayOfWeek: number = 1): Atemporal {
  const dayOfWeek = date.dayOfWeek() as number
  const daysToSubtract = (dayOfWeek - firstDayOfWeek + 7) % 7
  return date.subtract(daysToSubtract, 'days').startOf('day')
}

/**
 * Get the end of the week for a given date
 * @param date - Input date
 * @param firstDayOfWeek - First day of week (0 = Sunday, 1 = Monday)
 * @returns End of week date
 */
export function getWeekEnd(date: Atemporal, firstDayOfWeek: number = 1): Atemporal {
  const weekStart = getWeekStart(date, firstDayOfWeek)
  return weekStart.add(6, 'days').endOf('day')
}

/**
 * Generate an array of dates for a week
 * @param date - Any date within the target week
 * @param firstDayOfWeek - First day of week (0 = Sunday, 1 = Monday)
 * @returns Array of 7 dates representing the week
 */
export function getWeekDates(date: Atemporal, firstDayOfWeek: number = 1): Atemporal[] {
  const weekStart = getWeekStart(date, firstDayOfWeek)
  const dates: Atemporal[] = []
  
  for (let i = 0; i < 7; i++) {
    dates.push(weekStart.add(i, 'days'))
  }
  
  return dates
}

/**
 * Generate time slots for a day based on grid configuration
 * @param config - Grid configuration with start/end hours and slot duration
 * @returns Array of time slots
 */
export function generateTimeSlots(config: GridConfig): TimeSlot[] {
  const slots: TimeSlot[] = []
  const { startHour, endHour, slotDuration } = config
  
  const totalMinutes = (endHour - startHour) * 60
  const slotsCount = Math.floor(totalMinutes / slotDuration)
  
  for (let i = 0; i < slotsCount; i++) {
    const totalMinutesFromStart = i * slotDuration
    const hour = startHour + Math.floor(totalMinutesFromStart / 60)
    const minute = totalMinutesFromStart % 60
    
    const timeString = formatTime(hour, minute)
    
    slots.push({
      time: timeString,
      hour,
      minute
    })
  }
  
  return slots
}

/**
 * Format time as HH:MM string
 * @param hour - Hour (0-23)
 * @param minute - Minute (0-59)
 * @returns Formatted time string
 */
export function formatTime(hour: number, minute: number): string {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
}

/**
 * Check if a date is today
 * @param date - Date to check
 * @param timezone - Optional timezone
 * @returns True if date is today
 */
export function isToday(date: Atemporal, timezone?: string): boolean {
  const today = createAtemporal(undefined, timezone)
  return date.isSame(today, 'day')
}

/**
 * Check if a date is in the current week
 * @param date - Date to check
 * @param firstDayOfWeek - First day of week
 * @param timezone - Optional timezone
 * @returns True if date is in current week
 */
export function isCurrentWeek(date: Atemporal, firstDayOfWeek: number = 1, timezone?: string): boolean {
  const today = createAtemporal(undefined, timezone)
  const weekStart = getWeekStart(today, firstDayOfWeek)
  const weekEnd = getWeekEnd(today, firstDayOfWeek)
  
  return date.isSame(weekStart, 'day') || date.isSame(weekEnd, 'day') || 
         (date.isAfter(weekStart) && date.isBefore(weekEnd))
}

/**
 * Get the current time position as percentage of the day
 * @param config - Grid configuration
 * @param timezone - Optional timezone
 * @returns Percentage (0-100) representing current time position
 */
export function getCurrentTimePosition(config: GridConfig, timezone?: string): number {
  const now = createAtemporal(undefined, timezone)
  const { startHour, endHour } = config
  
  const currentHour = now.hour
  const currentMinute = now.minute
  
  if (currentHour < startHour || currentHour >= endHour) {
    return -1 // Outside visible hours
  }
  
  const totalMinutes = (endHour - startHour) * 60
  const currentMinutes = (currentHour - startHour) * 60 + currentMinute
  
  return (currentMinutes / totalMinutes) * 100
}

/**
 * Parse ISO date string to atemporal instance
 * @param isoString - ISO 8601 date string
 * @param timezone - Optional timezone
 * @returns Atemporal instance
 */
export function parseISOString(isoString: string, timezone?: string): Atemporal {
  return createAtemporal(isoString, timezone)
}

/**
 * Convert atemporal instance to ISO string
 * @param date - Atemporal instance
 * @returns ISO 8601 string
 */
export function toISOString(date: Atemporal): string {
  return date.toString()
}

/**
 * Get the difference between two dates in specified unit
 * @param start - Start date
 * @param end - End date
 * @param unit - Unit for difference calculation
 * @returns Difference in specified unit
 */
export function getDateDifference(start: Atemporal, end: Atemporal, unit: 'years' | 'months' | 'weeks' | 'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds' = 'minutes'): number {
  return end.diff(start, unit)
}

/**
 * Check if two date ranges overlap
 * @param start1 - First range start
 * @param end1 - First range end
 * @param start2 - Second range start
 * @param end2 - Second range end
 * @returns True if ranges overlap
 */
export function dateRangesOverlap(
  start1: Atemporal, 
  end1: Atemporal, 
  start2: Atemporal, 
  end2: Atemporal
): boolean {
  return start1.isBefore(end2) && end1.isAfter(start2)
}

/**
 * Format date for display based on locale
 * @param date - Date to format
 * @param format - Format string
 * @param _locale - Locale string (for future use)
 * @returns Formatted date string
 */
export function formatDateForDisplay(date: Atemporal, format: string = 'YYYY-MM-DD', _locale?: string): string {
  try {
    // Use atemporal's built-in formatting with locale support
    return date.format(format)
  } catch {
    // Fallback to basic formatting if atemporal fails with timezone issues
    const jsDate = new Date(date.toString())
    
    // Handle common format patterns
    switch (format) {
      case 'MMMM D, YYYY':
        return jsDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      case 'MMMM D':
        return jsDate.toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric' 
        })
      case 'MMM D':
        return jsDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })
      case 'MMM D, YYYY':
        return jsDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        })
      case 'D, YYYY':
        return jsDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          day: 'numeric' 
        })
      default:
        // Basic fallback
        return jsDate.toLocaleDateString('en-US')
    }
  }
}

/**
 * Get localized day names
 * @param locale - Locale string
 * @param format - Format ('long', 'short', 'narrow')
 * @returns Array of day names
 */
export function getLocalizedDayNames(locale: string = 'en', format: 'long' | 'short' | 'narrow' = 'short'): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: format })
  const days: string[] = []
  
  // Generate days starting from Sunday (0) to Saturday (6)
  for (let i = 0; i < 7; i++) {
    const date = new Date(2024, 0, i) // January 2024 starts on Monday
    days.push(formatter.format(date))
  }
  
  return days
}

/**
 * Get localized month names
 * @param locale - Locale string
 * @param format - Format ('long', 'short', 'narrow')
 * @returns Array of month names
 */
export function getLocalizedMonthNames(locale: string = 'en', format: 'long' | 'short' | 'narrow' = 'long'): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { month: format })
  const months: string[] = []
  
  for (let i = 0; i < 12; i++) {
    const date = new Date(2024, i, 1)
    months.push(formatter.format(date))
  }
  
  return months
}