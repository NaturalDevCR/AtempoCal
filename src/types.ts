import type { Atemporal } from "atemporal";

// --- ENUMS & TYPES ---

/**
 * Defines the possible views for the calendar.
 * @values 'week', 'day'
 */
export type CalendarView = 'week' | 'day';

/**
 * Defines the time format for displaying hours.
 * @values '12h' (e.g., 1:00 PM), '24h' (e.g., 13:00)
 */
export type TimeFormat = '12h' | '24h';


// --- INTERFACES ---

/**
 * Represents a single calendar event.
 * The structure is updated to use Date objects for start and end times.
 */
export interface CalendarEvent {
    /** A unique identifier for the event. */
    id: string | number;
    /** The main title of the event. */
    title: string;
    /** The start date and time of the event. */
    startTime: Date;
    /** The end date and time of the event. */
    endTime: Date;
    /** An optional detailed description of the event. */
    description?: string;
    /** An optional type string, used for applying custom CSS classes (e.g., 'event-type-meeting'). */
    type?: string;
    /** An optional background color for the event chip. This will be overridden by the resource's color if available. */
    color?: string;
    /** Optional: The location of the event. */
    location?: string;
    /** Optional: A list of attendees for the event. */
    attendees?: string[];
    /** The ID of the resource this event belongs to. Added for convenience. */
    resourceId?: string | number;
    /** The name of the resource this event belongs to. Added for convenience. */
    resourceName?: string;
}

/**
 * Represents a resource (e.g., a person, a room) that has a list of associated events.
 * This is the primary data structure expected by the component's `resources` prop.
 */
export interface Resource {
    /** A unique identifier for the resource. */
    id: string | number;
    /** The name of the resource to be displayed. */
    name: string;
    /** An optional background color for all events of this resource. If not provided, a color will be auto-assigned. */
    color?: string;
    /** An array of `CalendarEvent` objects associated with this resource. */
    events: Omit<CalendarEvent, 'resourceId' | 'resourceName'>[];
}

/**
 * Represents an event object that is emitted by the component on user interaction (e.g., click).
 * It extends the base `CalendarEvent` with information about the resource it belongs to.
 */
export interface EmittedCalendarEvent extends CalendarEvent {
    /** The ID of the resource this event belongs to. */
    resourceId: string | number;
    /** The name of the resource this event belongs to. */
    resourceName: string;
}

/**
 * Represents the data structure for a single day in the calendar's internal state.
 * @internal
 */
export interface DayView {
    /** The `atemporal` instance for the day. */
    atemporal: Atemporal;
    /** The ISO date string (YYYY-MM-DD). */
    isoDate: string;
    /** A boolean indicating if this day is the current day. */
    isToday: boolean;
    /** An object containing pre-formatted date strings for display. */
    formatted: {
        dayName: string;
        dayAndMonth: string;
    };
}

/**
 * Represents a time slot in the day view's time column.
 * @internal
 */
export interface TimeSlot {
    /** The hour number (0-23). */
    hour: number;
    /** The formatted time string for display (e.g., "08:00" or "8:00 AM"). */
    formatted: string;
}
