import type { Atemporal } from 'atemporal';

export type CalendarView = 'week' | 'day';
export type TimeFormat = '12h' | '24h';

export interface CalendarEvent {
  id: string | number;
  title: string;
  startTime?: Date | string;
  endTime?: Date | string;
  type?: string; // For custom styling via classes

  // The following are added internally by the component
  resourceId?: string | number;
  description?: string;
  location?: string;
  attendees?: string[];
  resourceName?: string;
  color?: string;
  start?: number; // minutes from day start
  end?: number; // minutes from day start
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
