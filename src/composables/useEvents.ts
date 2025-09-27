import { computed, ref, type Ref, type ComputedRef } from 'vue'
import type { CalendarEvent, Atemporal } from '../types'
import { validateEvent, generateEventId, filterEventsForDate, filterEventsForDateRange } from '../utils/eventHelpers'
import atemporal from 'atemporal'

/**
 * Return type for useEvents composable
 */
export interface UseEventsReturn {
  events: Ref<CalendarEvent[]>
  filteredEvents: ComputedRef<CalendarEvent[]>
  createEvent: (eventData: Partial<CalendarEvent>) => void
  updateEvent: (updatedEvent: CalendarEvent) => void
  deleteEvent: (eventId: string) => void
  getEventsForSlot: (date: string, resourceId?: string) => CalendarEvent[]
  getEventsForDate: (date: Atemporal, resourceId?: string) => CalendarEvent[]
  getEventsForDateRange: (startDate: Atemporal, endDate: Atemporal, resourceId?: string) => CalendarEvent[]
  findEventById: (eventId: string) => CalendarEvent | undefined
  getEventsByResource: (resourceId: string) => CalendarEvent[]
  clearEvents: () => void
  setEvents: (newEvents: CalendarEvent[]) => void
  addEvents: (newEvents: CalendarEvent[]) => void
  getEventCount: () => number
  hasEvent: (eventId: string) => boolean
}

/**
 * Event management composable
 * Handles CRUD operations for calendar events
 * @param initialEvents - Initial array of events
 * @returns Event state and management methods
 */
export function useEvents(initialEvents: CalendarEvent[] = []): UseEventsReturn {
  // Reactive state
  const events: Ref<CalendarEvent[]> = ref([...initialEvents])
  
  /**
   * Computed property for filtered and sorted events
   */
  const filteredEvents: ComputedRef<CalendarEvent[]> = computed(() => {
    return events.value.sort((a, b) => {
      const startA = atemporal(a.startTime)
      const startB = atemporal(b.startTime)
      return startA.isBefore(startB) ? -1 : startA.isAfter(startB) ? 1 : 0
    })
  })
  
  /**
   * Create a new event
   * @param eventData - Partial event data
   * @emits event-create
   */
  const createEvent = (eventData: Partial<CalendarEvent>): void => {
    const validation = validateEvent(eventData)
    
    if (!validation.isValid) {
      // eslint-disable-next-line no-console
      console.warn('Event validation failed:', validation.errors)
      return
    }
    
    const newEvent: CalendarEvent = {
      id: eventData.id || generateEventId(),
      title: eventData.title || 'New Event',
      startTime: eventData.startTime!,
      endTime: eventData.endTime!,
      description: eventData.description,
      resourceId: eventData.resourceId,
      color: eventData.color,
      metadata: eventData.metadata,
      isAllDay: eventData.isAllDay || false
    }
    
    events.value.push(newEvent)
  }
  
  /**
   * Update an existing event
   * @param updatedEvent - Updated event data
   * @emits event-update
   */
  const updateEvent = (updatedEvent: CalendarEvent): void => {
    const validation = validateEvent(updatedEvent)
    
    if (!validation.isValid) {
      // eslint-disable-next-line no-console
      console.warn('Event validation failed:', validation.errors)
      return
    }
    
    const index = events.value.findIndex(event => event.id === updatedEvent.id)
    
    if (index !== -1) {
      events.value[index] = { ...updatedEvent }
    } else {
      // eslint-disable-next-line no-console
      console.warn(`Event with id ${updatedEvent.id} not found`)
    }
  }
  
  /**
   * Delete an event
   * @param eventId - ID of event to delete
   * @emits event-delete
   */
  const deleteEvent = (eventId: string): void => {
    const index = events.value.findIndex(event => event.id === eventId)
    
    if (index !== -1) {
      events.value.splice(index, 1)
    } else {
      // eslint-disable-next-line no-console
      console.warn(`Event with id ${eventId} not found`)
    }
  }
  
  /**
   * Get events for a specific time slot
   * @param date - Target date (ISO string)
   * @param resourceId - Optional resource filter
   * @returns Array of events for the slot
   */
  const getEventsForSlot = (date: string, resourceId?: string): CalendarEvent[] => {
    // This is a simplified implementation
    // In a real scenario, you might want to filter by time range as well
    return events.value.filter(event => {
      const eventDate = atemporal(event.startTime).format('YYYY-MM-DD')
      const targetDate = atemporal(date).format('YYYY-MM-DD')
      
      const matchesDate = eventDate === targetDate
      const matchesResource = !resourceId || event.resourceId === resourceId
      
      return matchesDate && matchesResource
    })
  }
  
  /**
   * Get events for a specific date
   * @param date - Target date
   * @param resourceId - Optional resource filter
   * @returns Array of events for the date
   */
  const getEventsForDate = (date: Atemporal, resourceId?: string): CalendarEvent[] => {
    return filterEventsForDate(events.value, date, resourceId)
  }
  
  /**
   * Get events for a date range
   * @param startDate - Range start date
   * @param endDate - Range end date
   * @param resourceId - Optional resource filter
   * @returns Array of events in the range
   */
  const getEventsForDateRange = (
    startDate: Atemporal, 
    endDate: Atemporal, 
    resourceId?: string
  ): CalendarEvent[] => {
    return filterEventsForDateRange(events.value, startDate, endDate, resourceId)
  }
  
  /**
   * Find an event by ID
   * @param eventId - Event ID to search for
   * @returns Event if found, undefined otherwise
   */
  const findEventById = (eventId: string): CalendarEvent | undefined => {
    return events.value.find(event => event.id === eventId)
  }
  
  /**
   * Get events by resource ID
   * @param resourceId - Resource ID to filter by
   * @returns Array of events for the resource
   */
  const getEventsByResource = (resourceId: string): CalendarEvent[] => {
    return events.value.filter(event => event.resourceId === resourceId)
  }
  
  /**
   * Clear all events
   */
  const clearEvents = (): void => {
    events.value = []
  }
  
  /**
   * Set events (replace all)
   * @param newEvents - New array of events
   */
  const setEvents = (newEvents: CalendarEvent[]): void => {
    events.value = [...newEvents]
  }
  
  /**
   * Add multiple events
   * @param newEvents - Array of events to add
   */
  const addEvents = (newEvents: CalendarEvent[]): void => {
    const validEvents = newEvents.filter(event => {
      const validation = validateEvent(event)
      if (!validation.isValid) {
        // eslint-disable-next-line no-console
        console.warn(`Skipping invalid event ${event.id}:`, validation.errors)
        return false
      }
      return true
    })
    
    events.value.push(...validEvents)
  }
  
  /**
   * Get event count
   * @returns Total number of events
   */
  const getEventCount = (): number => {
    return events.value.length
  }
  
  /**
   * Check if an event exists
   * @param eventId - Event ID to check
   * @returns True if event exists
   */
  const hasEvent = (eventId: string): boolean => {
    return events.value.some(event => event.id === eventId)
  }
  
  return {
    events,
    filteredEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventsForSlot,
    getEventsForDate,
    getEventsForDateRange,
    findEventById,
    getEventsByResource,
    clearEvents,
    setEvents,
    addEvents,
    getEventCount,
    hasEvent
  }
}