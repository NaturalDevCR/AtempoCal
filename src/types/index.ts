import type { Ref, ComputedRef } from 'vue'
import atemporal from 'atemporal'

/**
 * Atemporal type from the library
 */
export type Atemporal = ReturnType<typeof atemporal>

/**
 * Calendar event data structure
 */
export interface CalendarEvent {
  id: string
  title: string
  description?: string
  startTime: string // ISO 8601 format
  endTime: string // ISO 8601 format
  resourceId?: string
  color?: string
  metadata?: Record<string, any>
  isAllDay?: boolean
}

/**
 * Resource/Calendar definition for multi-resource views
 */
export interface CalendarResource {
  id: string
  name: string
  color?: string
  avatar?: string
  metadata?: Record<string, any>
}

/**
 * Component configuration options for weekly scheduling calendar
 */
export interface CalendarConfig {
  timezone?: string
  locale?: string
  theme?: 'light' | 'dark' | 'auto'
  showWeekends?: boolean
  firstDayOfWeek?: number // 0-6, 0 = Sunday
  
  // Deprecated properties - not used in weekly scheduling calendar
  /** @deprecated Not used in weekly calendar */
  startHour?: number
  /** @deprecated Not used in weekly calendar */
  endHour?: number
  /** @deprecated Not used in weekly calendar */
  slotDuration?: number
}

/**
 * Available calendar view types
 */
export type CalendarView = 'week' | 'day'

/**
 * Custom action configuration for events
 */
export interface EventAction {
  id: string
  label: string
  icon?: string
  handler: (event: CalendarEvent) => void
  condition?: (event: CalendarEvent) => boolean
}

/**
 * Custom field configuration for event forms
 */
export interface CustomField {
  key: string
  label: string
  type: 'text' | 'number' | 'date' | 'select' | 'boolean'
  required?: boolean
  options?: { value: any; label: string }[]
  validator?: (value: any) => boolean | string
}

/**
 * Main component props interface
 */
export interface AtempocalProps {
  events: CalendarEvent[]
  resources?: CalendarResource[]
  config?: Partial<CalendarConfig>
  view?: CalendarView
  selectedDate?: string
  eventActions?: EventAction[]
  customFields?: CustomField[]
  loading?: boolean
  readonly?: boolean
}

/**
 * Slot click information for event creation
 */
export interface SlotClickInfo {
  date: string
  time: string
  resourceId?: string
  resource?: CalendarResource
  dayName?: string
  isToday?: boolean
  isWeekend?: boolean
  formattedDate?: string
}

/**
 * Event emitter interface for component events
 */
export interface CalendarEvents {
  'event-click': (event: CalendarEvent) => void
  'event-create': (eventData: Partial<CalendarEvent>) => void
  'event-update': (event: CalendarEvent) => void
  'event-delete': (eventId: string) => void
  'date-change': (date: string) => void
  'view-change': (view: CalendarView) => void
  'slot-click': (slotInfo: SlotClickInfo) => void
}

/**
 * useCalendar composable return type
 */
export interface UseCalendarReturn {
  currentDate: Ref<Atemporal>
  visibleRange: ComputedRef<{ start: Atemporal; end: Atemporal }>
  navigateToDate: (date: string | Atemporal) => void
  navigatePrevious: () => void
  navigateNext: () => void
  navigateToday: () => void
}

/**
 * useEvents composable return type
 */
export interface UseEventsReturn {
  events: Ref<CalendarEvent[]>
  filteredEvents: ComputedRef<CalendarEvent[]>
  createEvent: (eventData: Partial<CalendarEvent>) => void
  updateEvent: (event: CalendarEvent) => void
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
 * useTheme composable return type
 */
export interface UseThemeReturn {
  currentTheme: Ref<'light' | 'dark'>
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark' | 'auto') => void
  getThemeIcon: () => string
  getThemeDisplayName: () => string
  isDark: ComputedRef<boolean>
  isLight: ComputedRef<boolean>
  isAuto: ComputedRef<boolean>
  themePreference: ComputedRef<'light' | 'dark' | 'auto'>
  systemPrefersDark: ComputedRef<boolean>
}

/**
 * Internal calendar state structure
 */
export interface CalendarState {
  // Core state
  currentDate: Atemporal
  currentView: CalendarView
  selectedEvent: CalendarEvent | null
  
  // Configuration state
  config: CalendarConfig
  theme: 'light' | 'dark'
  
  // UI state
  loading: boolean
  draggedEvent: CalendarEvent | null
  showConfigPanel: boolean
  
  // Cache
  eventCache: Map<string, CalendarEvent[]>
  dateCache: Map<string, Atemporal>
}

/**
 * Time slot information for grid rendering
 */
export interface TimeSlot {
  time: string
  hour: number
  minute: number
  isCurrentTime?: boolean
}

/**
 * Event position information for rendering
 */
export interface EventPosition {
  top: number
  height: number
  left: number
  width: number
  zIndex: number
}

/**
 * Grid configuration for time-based layouts
 * @deprecated This interface is not used in weekly scheduling calendar
 */
export interface GridConfig {
  startHour: number
  endHour: number
  slotDuration: number
  showCurrentTime: boolean
  timezone: string
}

/**
 * Drag and drop event data
 */
export interface DragEventData {
  event: CalendarEvent
  originalSlot: SlotClickInfo
  newSlot: SlotClickInfo
}

/**
 * Localization configuration
 */
export interface LocaleConfig {
  locale: string
  weekdays: string[]
  months: string[]
  timeFormat: '12h' | '24h'
  dateFormat: string
}

/**
 * Theme configuration
 */
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'auto'
  colors: {
    primary: string
    secondary: string
    background: string
    surface: string
    text: string
    border: string
  }
}