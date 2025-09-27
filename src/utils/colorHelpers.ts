import type { CalendarEvent, CalendarResource, SpecialEventColors, SpecialEventType } from '../types'
import atemporal from 'atemporal'

/**
 * Default color palette for special event types
 * These colors are used across all workers for consistency
 */
export const DEFAULT_SPECIAL_EVENT_COLORS: SpecialEventColors = {
  'day-off': '#ef4444', // Red
  'annual-leave': '#3b82f6', // Blue
  'sick-leave': '#f59e0b', // Amber
  'personal-leave': '#8b5cf6', // Violet
  'training': '#10b981', // Emerald
  'meeting': '#6366f1', // Indigo
  'maintenance': '#f97316', // Orange
  'holiday': '#ec4899', // Pink
  'overtime': '#84cc16', // Lime
  'vacation': '#06b6d4' // Cyan
}

/**
 * Predefined color palette for worker assignments
 * These colors are used to randomly assign colors to workers
 */
const WORKER_COLOR_PALETTE = [
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#ef4444', // Red
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#f97316', // Orange
  '#ec4899', // Pink
  '#6366f1', // Indigo
  '#14b8a6', // Teal
  '#f43f5e', // Rose
  '#a855f7', // Purple
  '#22c55e', // Green
  '#eab308', // Yellow
  '#0ea5e9' // Sky
]

/**
 * Cache for worker color assignments to ensure consistency
 */
const workerColorCache = new Map<string, string>()

/**
 * Get a consistent color for a worker based on their ID
 * Uses a hash function to ensure the same worker always gets the same color
 * 
 * @param workerId - The worker's unique identifier
 * @returns A hex color string
 */
export function getWorkerColor(workerId: string): string {
  // Check cache first
  if (workerColorCache.has(workerId)) {
    const cachedColor = workerColorCache.get(workerId)
    if (cachedColor) {
      return cachedColor
    }
  }
  
  // Generate hash from worker ID
  let hash = 0
  for (let i = 0; i < workerId.length; i++) {
    const char = workerId.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  // Use absolute value and modulo to get palette index
  const index = Math.abs(hash) % WORKER_COLOR_PALETTE.length
  const color = WORKER_COLOR_PALETTE[index] || '#6b7280' // Fallback color
  
  // Cache the result
  workerColorCache.set(workerId, color)
  
  return color
}

/**
 * Get the color for a special event type
 * 
 * @param eventType - The special event type
 * @param customColors - Optional custom color overrides
 * @returns A hex color string
 */
export function getSpecialEventColor(
  eventType: SpecialEventType,
  customColors?: Partial<SpecialEventColors>
): string {
  // Use custom color if provided, otherwise fall back to default
  return customColors?.[eventType] || DEFAULT_SPECIAL_EVENT_COLORS[eventType]
}

/**
 * Determine the appropriate color for an event based on priority:
 * 1. Manual color override (event.color)
 * 2. Special event type color (if eventType is set)
 * 3. Worker-specific color (based on resourceId)
 * 
 * @param event - The calendar event
 * @param resources - Available resources/workers
 * @param customSpecialColors - Custom special event colors
 * @returns A hex color string
 */
export function getEventColor(
  event: CalendarEvent,
  resources?: CalendarResource[],
  customSpecialColors?: Partial<SpecialEventColors>
): string {
  // Priority 1: Manual color override
  if (event.color) {
    return event.color
  }

  // Priority 2: Special event type color
  if (event.eventType) {
    return getSpecialEventColor(event.eventType, customSpecialColors)
  }

  // Priority 3: Worker-specific color
  if (event.resourceId) {
    // Check if resource has a predefined color
    const resource = resources?.find(r => r.id === event.resourceId)
    if (resource?.color) {
      return resource.color
    }
    
    // Generate worker-specific color
    return getWorkerColor(event.resourceId)
  }

  // Fallback: Default gray color
  return '#6b7280'
}

/**
 * Update resource colors to match their assigned worker colors
 * This ensures consistency between worker labels and their events
 * 
 * @param resources - Array of calendar resources
 * @returns Updated resources with assigned colors
 */
export function assignWorkerColors(resources: CalendarResource[]): CalendarResource[] {
  return resources.map(resource => ({
    ...resource,
    color: resource.color || getWorkerColor(resource.id)
  }))
}

/**
 * Check if an event is a special event (multi-day or all-day)
 * 
 * @param event - The calendar event
 * @returns True if the event is considered special
 */
export function isSpecialEvent(event: CalendarEvent): boolean {
  // All-day events are always special
  if (event.isAllDay) {
    return true
  }

  // Events with eventType are special
  if (event.eventType) {
    return true
  }

  // Multi-day events are special
  const startDate = atemporal(event.startTime).format('YYYY-MM-DD')
  const endDate = atemporal(event.endTime).format('YYYY-MM-DD')
  
  return startDate !== endDate
}

/**
 * Clear the worker color cache
 * Useful for testing or when worker assignments change
 */
export function clearWorkerColorCache(): void {
  workerColorCache.clear()
}

/**
 * Get all cached worker colors
 * Useful for debugging or displaying color assignments
 * 
 * @returns Map of worker IDs to their assigned colors
 */
export function getWorkerColorCache(): Map<string, string> {
  return new Map(workerColorCache)
}