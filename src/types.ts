import type { Atemporal } from 'atemporal';

export type CalendarView = 'week' | 'day';
export type TimeFormat = '12h' | '24h';
export type AddButtonPosition = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'smart';
export type EventDisplayField = 'time' | 'title' | 'description' | 'location';

export interface CalendarEvent {
  id: string | number;
  title: string;
  from?: Date | string; // Antes era startTime
  to?: Date | string;   // Antes era endTime
  description?: string;
  location?: string;    // Nueva propiedad para ubicación
  
  // Los siguientes campos se agregan internamente por el componente
  resourceId?: string | number;
  resourceName?: string;
  color?: string;
  type?: string; // Para estilos personalizados vía clases
  start?: number; // minutos desde el inicio del día
  end?: number;   // minutos desde el inicio del día
  layout?: {
    top: number;
    height: number;
    left: number;
    width: number;
    zIndex: number;
  };
}

export interface Resource {
  id: string | number;
  name:string;
  color?: string;
  events: Omit<CalendarEvent, 'resourceId' | 'resourceName' | 'color'>[];
}

export interface DayView {
  atemporal: Atemporal;
  isoDate: string;
  isToday: boolean;
  formatted: {
    dayName: string;
    dayAndMonth: string;
  };
}

export interface TimeSlot {
  hour: number;
  formatted: string;
}

/**
 * Enhanced date change event data structure
 * Provides comprehensive information about date navigation changes
 */
export interface DateChangeEvent {
  /** The current selected date */
  currentDate: Date;
  /** The current calendar view mode */
  view: CalendarView;
  /** The date range being displayed */
  range: {
    /** Start date of the current view range */
    start: Date;
    /** End date of the current view range */
    end: Date;
  };
  /** Formatted display string for the date range */
  displayText: string;
}
