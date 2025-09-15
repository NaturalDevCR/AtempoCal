import type { CalendarEvent, EventPosition, GridConfig, Atemporal } from '../types'
import { parseISOString, getDateDifference, dateRangesOverlap, createAtemporal } from './dateHelpers'

/**
 * Calculate event position within a time grid
 * @param event - Calendar event
 * @param config - Grid configuration
 * @param containerHeight - Height of the container in pixels
 * @returns Event position object with top, height, left, width, zIndex
 */
export function calculateEventPosition(
  event: CalendarEvent,
  config: GridConfig,
  containerHeight: number
): EventPosition {
  const startTime = parseISOString(event.startTime, config.timezone)
  const endTime = parseISOString(event.endTime, config.timezone)
  
  const { startHour, endHour } = config
  const totalMinutes = (endHour - startHour) * 60
  
  // Calculate start position
  const eventStartMinutes = (startTime.hour - startHour) * 60 + startTime.minute
  const eventDurationMinutes = getDateDifference(startTime, endTime, 'minutes')
  
  // Calculate position as percentage of total time range
  const topPercentage = Math.max(0, (eventStartMinutes / totalMinutes) * 100)
  const heightPercentage = Math.min(100 - topPercentage, (eventDurationMinutes / totalMinutes) * 100)
  
  // Convert to pixels
  const top = (topPercentage / 100) * containerHeight
  const height = Math.max(20, (heightPercentage / 100) * containerHeight) // Minimum 20px height
  
  return {
    top,
    height,
    left: 0, // Will be adjusted for overlapping events
    width: 100, // Will be adjusted for overlapping events
    zIndex: 1
  }
}

/**
 * Detect overlapping events and adjust their positions
 * @param events - Array of calendar events
 * @param config - Grid configuration
 * @param containerHeight - Height of the container in pixels
 * @returns Array of events with calculated positions
 */
export function calculateEventPositions(
  events: CalendarEvent[],
  config: GridConfig,
  containerHeight: number
): Array<CalendarEvent & { position: EventPosition }> {
  const eventsWithPositions = events.map(event => ({
    ...event,
    position: calculateEventPosition(event, config, containerHeight)
  }))
  
  // Group overlapping events
  const overlapGroups = findOverlapGroups(eventsWithPositions)
  
  // Adjust positions for overlapping events
  overlapGroups.forEach(group => {
    const groupSize = group.length
    group.forEach((event, index) => {
      event.position.width = 100 / groupSize
      event.position.left = (100 / groupSize) * index
      event.position.zIndex = index + 1
    })
  })
  
  return eventsWithPositions
}

/**
 * Find groups of overlapping events
 * @param events - Array of events with positions
 * @returns Array of overlap groups
 */
function findOverlapGroups(
  events: Array<CalendarEvent & { position: EventPosition }>
): Array<Array<CalendarEvent & { position: EventPosition }>> {
  const groups: Array<Array<CalendarEvent & { position: EventPosition }>> = []
  const processed = new Set<string>()
  
  events.forEach(event => {
    if (processed.has(event.id)) return
    
    const group = [event]
    processed.add(event.id)
    
    // Find all events that overlap with this event
    events.forEach(otherEvent => {
      if (processed.has(otherEvent.id) || event.id === otherEvent.id) return
      
      if (eventsOverlap(event, otherEvent)) {
        group.push(otherEvent)
        processed.add(otherEvent.id)
      }
    })
    
    groups.push(group)
  })
  
  return groups
}

/**
 * Check if two events overlap in time
 * @param event1 - First event
 * @param event2 - Second event
 * @returns True if events overlap
 */
export function eventsOverlap(event1: CalendarEvent, event2: CalendarEvent): boolean {
  const start1 = parseISOString(event1.startTime)
  const end1 = parseISOString(event1.endTime)
  const start2 = parseISOString(event2.startTime)
  const end2 = parseISOString(event2.endTime)
  
  return dateRangesOverlap(start1, end1, start2, end2)
}

/**
 * Filter events for a specific date
 * @param events - Array of calendar events
 * @param date - Target date
 * @param resourceId - Optional resource filter
 * @returns Filtered events
 */
export function filterEventsForDate(
  events: CalendarEvent[],
  date: Atemporal,
  resourceId?: string
): CalendarEvent[] {
  return events.filter(event => {
    const eventStart = parseISOString(event.startTime)
    const eventEnd = parseISOString(event.endTime)
    
    // Check if event occurs on the target date
    const isOnDate = eventStart.isSame(date, 'day') || 
                     eventEnd.isSame(date, 'day') || 
                     (eventStart.isBefore(date.startOf('day')) && eventEnd.isAfter(date.endOf('day')))
    
    // Apply resource filter if specified
    const matchesResource = !resourceId || event.resourceId === resourceId
    
    return isOnDate && matchesResource
  })
}

/**
 * Filter events for a date range
 * @param events - Array of calendar events
 * @param startDate - Range start date
 * @param endDate - Range end date
 * @param resourceId - Optional resource filter
 * @returns Filtered events
 */
export function filterEventsForDateRange(
  events: CalendarEvent[],
  startDate: Atemporal,
  endDate: Atemporal,
  resourceId?: string
): CalendarEvent[] {
  return events.filter(event => {
    const eventStart = parseISOString(event.startTime)
    const eventEnd = parseISOString(event.endTime)
    
    // Check if event overlaps with the date range
    const overlapsRange = dateRangesOverlap(
      eventStart,
      eventEnd,
      startDate.startOf('day'),
      endDate.endOf('day')
    )
    
    // Apply resource filter if specified
    const matchesResource = !resourceId || event.resourceId === resourceId
    
    return overlapsRange && matchesResource
  })
}

/**
 * Generate a unique event ID
 * @returns Unique string ID
 */
export function generateEventId(): string {
  return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Validate event data
 * @param event - Event data to validate
 * @returns Validation result with errors
 */
export function validateEvent(event: Partial<CalendarEvent>): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (!event.title || event.title.trim() === '') {
    errors.push('Event title is required')
  }
  
  if (!event.startTime) {
    errors.push('Start time is required')
  }
  
  if (!event.endTime) {
    errors.push('End time is required')
  }
  
  if (event.startTime && event.endTime) {
    const start = parseISOString(event.startTime)
    const end = parseISOString(event.endTime)
    
    if (end.isBefore(start) || end.isSame(start)) {
      errors.push('End time must be after start time')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Create a new event with default values
 * @param overrides - Properties to override defaults
 * @returns New calendar event
 */
export function createEvent(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
  const now = createAtemporal()
  const startTime = now
  const endTime = now.add(1, 'hour')
  
  return {
    id: generateEventId(),
    title: 'New Event',
    startTime: startTime.toString(),
    endTime: endTime.toString(),
    ...overrides
  }
}

/**
 * Clone an event with new properties
 * @param event - Original event
 * @param overrides - Properties to override
 * @returns Cloned event with overrides
 */
export function cloneEvent(event: CalendarEvent, overrides: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    ...event,
    id: generateEventId(), // Always generate new ID for clones
    ...overrides
  }
}

/**
 * Sort events by start time
 * @param events - Array of events to sort
 * @returns Sorted events array
 */
export function sortEventsByStartTime(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => {
    const startA = parseISOString(a.startTime)
    const startB = parseISOString(b.startTime)
    
    if (startA.isBefore(startB)) return -1
    if (startA.isAfter(startB)) return 1
    return 0
  })
}

/**
 * Get event duration in minutes
 * @param event - Calendar event
 * @returns Duration in minutes
 */
export function getEventDuration(event: CalendarEvent): number {
  const start = parseISOString(event.startTime)
  const end = parseISOString(event.endTime)
  return getDateDifference(start, end, 'minutes')
}

/**
 * Check if an event is all-day
 * @param event - Calendar event
 * @returns True if event is all-day
 */
export function isAllDayEvent(event: CalendarEvent): boolean {
  if (event.isAllDay) return true
  
  const start = parseISOString(event.startTime)
  
  // Check if event spans exactly 24 hours and starts at midnight
  return start.hour === 0 && 
         start.minute === 0 && 
         start.second === 0 && 
         getEventDuration(event) >= 1440 // 24 hours in minutes
}

/**
 * Get event color with fallback
 * @param event - Calendar event
 * @param defaultColor - Default color if none specified
 * @returns Event color
 */
export function getEventColor(event: CalendarEvent, defaultColor: string = '#3b82f6'): string {
  return event.color || defaultColor
}

/**
 * Truncate event title for display
 * @param title - Event title
 * @param maxLength - Maximum length
 * @returns Truncated title
 */
export function truncateEventTitle(title: string, maxLength: number = 30): string {
  if (title.length <= maxLength) return title
  return title.substring(0, maxLength - 3) + '...'
}