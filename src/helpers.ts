import type { CalendarEvent, TimeFormat } from './types';
import atemporal from 'atemporal';

/**
 * Formats a Date object into a time string in 12-hour or 24-hour format.
 * @param date - The Date object to format.
 * @param format - The target format, '12h' or '24h'.
 * @returns The formatted time string (e.g., "1:00 PM" or "13:00"). Returns an empty string if input is invalid.
 */
export function formatTime(date: Date, format: TimeFormat): string {
  if (!date) return '';
  const atemp = atemporal(date);
  const formatString = format === '12h' ? 'h:mm a' : 'HH:mm';
  return atemp.format(formatString);
}

/**
 * Calculates a human-readable duration string for an event (e.g., "1h 30m").
 * This now shows the *actual* duration, not the layout-adjusted one.
 * @param event - The calendar event, which must have `startTime` and `endTime` as Date objects.
 * @returns A string representing the event's duration, or an empty string if not calculable.
 */
export function getEventDurationText(event: CalendarEvent): string {
  if (!event.startTime || !event.endTime) return '';

  const start = atemporal(event.startTime);
  const end = atemporal(event.endTime);

  const diffMinutes = end.diff(start, 'minutes');
  if (diffMinutes <= 0) return '';

  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  const parts: string[] = [];
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  return parts.join(' ');
}

/**
 * Processes events for a single day to calculate their layout (position and dimensions)
 * for rendering in the day view. It handles overlapping events by creating a column-based layout.
 * @param dayEvents - An array of events scheduled for the specific day.
 * @param dayViewStartHour - The hour at which the day view grid starts (e.g., 0 for midnight).
 * @param minuteHeightPx - The height in pixels equivalent to one minute.
 * @param itemWidthPercent - The percentage of a column's width that an event should occupy.
 * @returns An array of event objects, each augmented with a `layout` property containing top, height, left, width, and zIndex.
 */
export function processDayEvents(
  dayEvents: CalendarEvent[],
  dayViewStartHour: number,
  minuteHeightPx: number,
  itemWidthPercent: number
) {
  if (!dayEvents.length) return [];

  // 1. Pre-process events: calculate minutes from start of day, enforce 1-hour minimum for layout, and sort.
  const events = dayEvents
    .map(event => {
      if (!event.startTime || !event.endTime) return null;

      const startTime = event.startTime;
      let endTimeForLayout = event.endTime;

      // Enforce a minimum duration of 60 minutes for layout calculation only.
      const diffMinutes = (endTimeForLayout.getTime() - startTime.getTime()) / (1000 * 60);
      if (diffMinutes > 0 && diffMinutes < 60) {
        endTimeForLayout = new Date(startTime.getTime() + 60 * 60 * 1000);
      }

      const startAtemporal = atemporal(startTime);
      const endAtemporal = atemporal(endTimeForLayout);

      return {
        ...event,
        start: startAtemporal.hour * 60 + startAtemporal.minute,
        end: endAtemporal.hour * 60 + endAtemporal.minute,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a!.start - b!.start || b!.end - a!.end) as (CalendarEvent & { start: number; end: number })[];

  // 2. Identify collision groups. A group is a set of events that visually overlap.
  const collisionGroups: (typeof events)[] = [];
  if (events.length > 0) {
    let lastGroup = [events[0]];
    collisionGroups.push(lastGroup);

    for (let i = 1; i < events.length; i++) {
      const event = events[i];
      const maxEndInGroup = Math.max(...lastGroup.map(e => e.end));
      if (event.start < maxEndInGroup) {
        lastGroup.push(event);
      } else {
        lastGroup = [event];
        collisionGroups.push(lastGroup);
      }
    }
  }

  const layoutEvents: any[] = [];

  // 3. Calculate layout for each collision group.
  for (const group of collisionGroups) {
    group.sort((a, b) => a.start - b.start);
    
    const columns: (typeof group)[] = [];
    for (const event of group) {
      let placed = false;
      for (const col of columns) {
        if (col[col.length - 1].end <= event.start) {
          col.push(event);
          (event as any).column = columns.indexOf(col);
          placed = true;
          break;
        }
      }
      if (!placed) {
        columns.push([event]);
        (event as any).column = columns.length - 1;
      }
    }

    const numColumns = columns.length;

    // 4. Calculate the final layout properties for each event in the group.
    for (const event of group) {
      const { column } = event as any;
      const top = (event.start - dayViewStartHour * 60) * minuteHeightPx;
      const height = (event.end - event.start) * minuteHeightPx;
      
      const colWidth = 100 / numColumns;
      const eventWidth = colWidth * (itemWidthPercent / 100);
      const left = (column * colWidth) + (colWidth - eventWidth) / 2;

      layoutEvents.push({
        ...event,
        layout: {
          top: Math.max(0, top),
          height: Math.max(minuteHeightPx * 60, height), // Ensure min height of 1 hour
          left: left,
          width: eventWidth,
          zIndex: Math.floor(top) + column,
        },
      });
    }
  }

  return layoutEvents;
}
