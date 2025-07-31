import atemporal from 'atemporal';
import type { CalendarEvent, TimeFormat } from './types';

/**
 * Formats a date object or string into a time string.
 * @param date - The date to format.
 * @param format - '12h' or '24h'.
 * @returns Formatted time string.
 */
export function formatTime(date: Date | string, format: TimeFormat): string {
  const d = atemporal(date);
  if (format === '12h') {
    return d.format('h:mm A');
  }
  return d.format('HH:mm');
}

/**
 * Calculates the duration of an event and returns a human-readable string.
 * @param event - The calendar event.
 * @returns Duration string (e.g., "1h 30m").
 */
export function getEventDurationText(event: CalendarEvent): string {
  if (!event.from || !event.to) return '';
  const start = atemporal(event.from);
  const end = atemporal(event.to);
  const diffMinutes = end.diff(start, 'minutes');
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  let result = '';
  if (hours > 0) {
    result += `${hours}h`;
  }
  if (minutes > 0) {
    result += `${result ? ' ' : ''}${minutes}m`;
  }
  return result;
}

/**
 * Processes events for a single day to calculate layout properties for overlapping events.
 * @param dayEvents - Events for a specific day.
 * @param startHour - The starting hour of the day view.
 * @param minuteHeight - The height of one minute in pixels.
 * @param itemWidthPercent - The width of an event item as a percentage.
 * @returns Processed events with layout properties.
 */
export function processDayEvents(
  dayEvents: CalendarEvent[],
  startHour: number,
  minuteHeight: number,
  itemWidthPercent: number
): CalendarEvent[] {
  if (!dayEvents.length) return [];

  // 1. Add start and end minutes (from midnight) to each event
  const eventsWithMinutes = dayEvents
    .map(event => {
      if (!event.from || !event.to) return null;
      const start = atemporal(event.from);
      const end = atemporal(event.to);
      return {
        ...event,
        start: start.hour * 60 + start.minute,
        end: end.hour * 60 + end.minute,
      };
    })
    .filter((e): e is NonNullable<typeof e> => e !== null)
    .sort((a, b) => a.start - b.start || b.end - a.end);

  // 2. Group overlapping events
  const groups: (typeof eventsWithMinutes)[] = [];
  if (eventsWithMinutes.length > 0) {
      groups.push([eventsWithMinutes[0]]);
      for (let i = 1; i < eventsWithMinutes.length; i++) {
          const currentEvent = eventsWithMinutes[i];
          const lastGroup = groups[groups.length - 1];
          const lastEventInLastGroup = lastGroup[lastGroup.length - 1];
          
          // Check if it overlaps with any event in the last group
          const overlaps = lastGroup.some(eventInGroup => 
              currentEvent.start < eventInGroup.end!
          );

          if (overlaps) {
              lastGroup.push(currentEvent);
          } else {
              groups.push([currentEvent]);
          }
      }
  }

  // 3. Calculate layout for each group
  const processedEvents: CalendarEvent[] = [];
  for (const group of groups) {
      const columns: CalendarEvent[][] = [];
      group.sort((a, b) => a.start - b.start);

      for (const event of group) {
          let placed = false;
          for (const col of columns) {
              if (event.start >= col[col.length - 1].end!) {
                  col.push(event);
                  placed = true;
                  break;
              }
          }
          if (!placed) {
              columns.push([event]);
          }
      }

      const groupWidth = 100 / columns.length;
      columns.forEach((col, colIndex) => {
          col.forEach(event => {
              processedEvents.push({
                  ...event,
                  layout: {
                      top: (event.start! - startHour * 60) * minuteHeight,
                      height: (event.end! - event.start!) * minuteHeight,
                      left: colIndex * groupWidth,
                      width: groupWidth,
                      zIndex: colIndex + 1,
                  },
              });
          });
      });
  }

  // Adjust width for final display
  return processedEvents.map(event => {
    if (event.layout) {
      const newWidth = (event.layout.width / 100) * itemWidthPercent;
      const newLeft = event.layout.left + (event.layout.width - newWidth) / 2;
      event.layout.width = newWidth;
      event.layout.left = newLeft;
    }
    return event;
  });
}
