<template>
  <div class="atempo-cal" 
       :class="{ 'atempo-cal--dark': darkMode }" 
       :style="{
         width: props.styleOptions?.width || '100%',
         height: props.styleOptions?.height || 'auto'
       }">
    <!-- Header: Title, Date Navigation, and View Controls -->
    <div class="atempo-cal__header">
      <slot name="header-title">
        <div class="atempo-cal__title-section">
          <h2 class="atempo-cal__title">{{ title }}</h2>
          <div class="atempo-cal__date-range">{{ dateRangeDisplay }}</div>
        </div>
      </slot>

      <slot name="header-controls">
        <div class="atempo-cal__controls-group">
          <div class="atempo-cal__date-navigation">
            <button @click="navigateDate('prev')" class="atempo-cal__btn atempo-cal__btn--nav" aria-label="Previous period">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15,18 9,12 15,6"></polyline>
              </svg>
            </button>
            <button @click="goToToday" class="atempo-cal__btn atempo-cal__btn--today">Today</button>
            <button @click="navigateDate('next')" class="atempo-cal__btn atempo-cal__btn--nav" aria-label="Next period">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9,18 15,12 9,6"></polyline>
              </svg>
            </button>
          </div>

          <div class="atempo-cal__view-controls">
            <button @click="toggleTimeFormat" class="atempo-cal__btn atempo-cal__btn--view atempo-cal__btn--time-format" :aria-label="`Switch to ${timeFormat === '24h' ? '12-hour' : '24-hour'} format`">
              {{ timeFormat === '24h' ? '24h' : '12h' }}
            </button>
            <button @click="changeView('week')" :class="{ 'atempo-cal__btn--active': currentView === 'week' }" class="atempo-cal__btn atempo-cal__btn--view">
              Week
            </button>
            <button @click="changeView('day')" :class="{ 'atempo-cal__btn--active': currentView === 'day' }" class="atempo-cal__btn atempo-cal__btn--view">
              Day
            </button>
          </div>
        </div>
      </slot>
    </div>

    <!-- Week View Grid -->
    <div v-if="currentView === 'week'" class="atempo-cal__grid atempo-cal__grid--week">
      <div class="atempo-cal__grid-header">
        <div class="atempo-cal__resource-header">{{ resourceHeaderText }}</div>
        <div v-for="day in weekView" :key="day.isoDate" class="atempo-cal__day-header" :class="{ 'atempo-cal__day-header--is-today': day.isToday }">
          <div class="atempo-cal__day-name">{{ day.formatted.dayName }}</div>
          <div class="atempo-cal__day-date">{{ day.formatted.dayAndMonth }}</div>
        </div>
      </div>

      <div class="atempo-cal__week-grid-body">
        <div v-for="resource in resourcesWithColors" :key="resource.id" class="atempo-cal__resource-row">
          <div class="atempo-cal__resource-name">
            <slot name="resource-label" :resource="resource">
              {{ resource.name }}
            </slot>
          </div>
          <div v-for="day in weekView" :key="`${resource.id}-${day.isoDate}`" 
               class="atempo-cal__day-cell atempo-cal__day-cell--hoverable"
               @mouseenter="handleCellHover(String(resource.id), day.isoDate, true)"
               @mouseleave="handleCellHover(String(resource.id), day.isoDate, false)">
            <!-- Add Event Button -->
            <button 
              v-if="shouldShowAddButton(String(resource.id), day.isoDate)"
              :class="getAddButtonPosition(String(resource.id), day.isoDate)"
              @click="handleAddEvent(String(resource.id), day.isoDate)"
              title="Add Event">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            
            <!-- Existing Events -->
            <div
                v-for="event in getEventsForDay(resource.events, day.isoDate)"
                :key="event.id"
                class="atempo-cal__event-chip"
                :class="`atempo-cal__event-chip--${event.type}`"
                :style="{ backgroundColor: resource.color }"
                :title="event.title"
                @click="handleEventClick({ ...event, resourceId: String(resource.id), resourceName: resource.name, color: resource.color })">
              {{ getEventDisplayText(event) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Day View Grid -->
    <div v-else-if="currentView === 'day'" class="atempo-cal__grid atempo-cal__grid--day">
      <div class="atempo-cal__grid-header atempo-cal__grid-header--day">
        <div class="atempo-cal__time-header">Time</div>
        <div class="atempo-cal__day-header atempo-cal__day-header--single-day">
          <div class="atempo-cal__day-name">{{ selectedDayView.formatted.dayName }}</div>
          <div class="atempo-cal__day-date">{{ selectedDayView.formatted.dayAndMonth }}</div>
        </div>
      </div>

      <div class="atempo-cal__day-grid-body" ref="dayGridBody">
        <div class="atempo-cal__time-labels-col">
          <div v-for="timeSlot in timeSlots" :key="timeSlot.hour" class="atempo-cal__time-label">
            {{ timeSlot.formatted }}
          </div>
        </div>
        <div class="atempo-cal__day-grid-shadow"></div>
        <div class="atempo-cal__events-col">
          <div
              v-for="event in processedDayEvents"
              :key="event.id"
              class="atempo-cal__event-chip atempo-cal__event-chip--day"
              :class="{ [`atempo-cal__event-chip--${event.type}`]: !!event.type, 'atempo-cal__event-chip--is-short': event.layout!.height < 45 }"
              :style="{
                top: event.layout?.top + 'px',
                height: event.layout?.height + 'px',
                left: `${event.layout?.left}%`,
                width: `${event.layout?.width}%`,
                backgroundColor: event.color,
                zIndex: event.layout?.zIndex
              }"
              :title="event.title"
              @click="handleEventClick(event)"
          >
            <div class="atempo-cal__event-content">
              <strong>{{ event.resourceName }}</strong>
            </div>
            <div v-if="event.from && event.to" class="atempo-cal__event-footer">
              <span class="atempo-cal__event-time">{{ getFormattedEventTimeRange(event) }}</span>
              <span class="atempo-cal__event-duration">{{ getEventDurationText(event) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted } from 'vue';
import atemporal from 'atemporal';
import type { CalendarEvent, Resource, DayView, CalendarView, TimeSlot, TimeFormat, AddButtonPosition, EventDisplayField } from '../types';
import { getEventDurationText, processDayEvents, formatTime } from '../helpers';
import '../assets/atempocal.css';

// --- CONSTANTS ---
const DAY_VIEW_START_HOUR = 0;
const HOUR_HEIGHT_PX = 60;
const MINUTE_HEIGHT_PX = HOUR_HEIGHT_PX / 60;
const PREDEFINED_COLORS = [
  '#f87171', '#fb923c', '#fbbf24', '#a3e635', '#4ade80', '#34d399',
  '#2dd4bf', '#22d3ee', '#38bdf8', '#60a5fa', '#818cf8', '#a78bfa',
  '#c084fc', '#f472b6', '#fb7185'
];

// --- PROPS ---
const props = withDefaults(defineProps<{
  title?: string;
  resources: Resource[];
  startDate?: Date | string;
  resourceHeaderText?: string;
  view?: CalendarView;
  styleOptions?: {
    height?: string;
    width?: string;
    dayViewItemWidthPercent?: number;
  };
  darkMode?: boolean;
  // New props for enhanced functionality
  eventDisplayField?: EventDisplayField;
  addButtonPosition?: AddButtonPosition;
  showAddButton?: boolean;
}>(), {
  title: 'Internal Resource Planner',
  startDate: () => atemporal().toDate(),
  resourceHeaderText: 'Resources',
  view: 'week',
  styleOptions: () => ({
    height: 'auto',
    width: '100%',
    dayViewItemWidthPercent: 95
  }),
  darkMode: false,
  eventDisplayField: 'time',
  addButtonPosition: 'smart',
  showAddButton: true,
});

// --- EMITS ---
const emit = defineEmits<{
  (e: 'view-change', view: CalendarView): void;
  (e: 'date-change', date: Date): void;
  (e: 'event-click', event: CalendarEvent): void;
  (e: 'add-event', data: { resourceId: string; date: string; resourceName: string }): void;
}>();

// --- STATE ---
const currentDate = ref(atemporal(props.startDate));
const internalView = ref<CalendarView>(props.view);
const currentView = computed(() => props.view !== undefined ? props.view : internalView.value);
const dayGridBody = ref<HTMLElement | null>(null);
const timeFormat = ref<TimeFormat>('24h');

// Add hover state for cells
const hoveredCell = ref<{ resourceId: string; date: string } | null>(null);

/**
 * Check if a cell has events that would overlap with the add button
 * @param resourceId - The resource ID
 * @param date - The date in ISO format
 * @returns Whether the cell has events
 */
const cellHasEvents = (resourceId: string, date: string): boolean => {
  const resource = resourcesWithColors.value.find(r => r.id === resourceId);
  if (!resource) return false;
  return getEventsForDay(resource.events, date).length > 0;
};

/**
 * Get the optimal position for the add button based on events and configuration
 * @param resourceId - The resource ID
 * @param date - The date in ISO format
 * @returns CSS classes for button positioning
 */
const getAddButtonPosition = (resourceId: string, date: string): string => {
  const baseClass = 'atempo-cal__add-event-btn';
  
  if (props.addButtonPosition === 'smart') {
    const hasEvents = cellHasEvents(resourceId, date);
    if (hasEvents) {
      return `${baseClass} ${baseClass}--smart-compact`;
    }
    return `${baseClass} ${baseClass}--smart-center`;
  }
  
  return `${baseClass} ${baseClass}--${props.addButtonPosition}`;
};

/**
 * Check if the add button should be shown for a specific cell
 * @param resourceId - The resource ID
 * @param date - The date in ISO format
 * @returns Whether to show the add button
 */
const shouldShowAddButton = (resourceId: string, date: string): boolean => {
  if (!props.showAddButton) return false;
  return hoveredCell.value?.resourceId === resourceId && hoveredCell.value?.date === date;
};

// --- LIFECYCLE ---
onMounted(() => {
  const storedFormat = localStorage.getItem('atempo-cal-time-format') as TimeFormat | null;
  if (storedFormat && ['12h', '24h'].includes(storedFormat)) {
    timeFormat.value = storedFormat;
  }
});

// --- NAVIGATION & CONTROLS ---
// Cambio: Modificar changeView para actualizar el estado interno si no hay prop externo
const changeView = (view: CalendarView) => {
  if (props.view !== undefined) {
    // Si hay un prop externo, emitir el evento para que el componente padre actualice
    emit('view-change', view);
  } else {
    // Si no hay prop externo, actualizar el estado interno
    internalView.value = view;
  }
};

const navigateDate = (direction: 'prev' | 'next') => {
  const unit = currentView.value === 'week' ? 'week' : 'day';
  currentDate.value = direction === 'prev' ? currentDate.value.subtract(1, unit) : currentDate.value.add(1, unit);
  emit('date-change', currentDate.value.toDate());
};

const goToToday = () => {
  currentDate.value = atemporal();
  emit('date-change', currentDate.value.toDate());
};

const toggleTimeFormat = () => {
  timeFormat.value = timeFormat.value === '24h' ? '12h' : '24h';
  localStorage.setItem('atempo-cal-time-format', timeFormat.value);
};

// --- DATE & VIEW LOGIC ---
const weekView = computed((): DayView[] => {
  const monday = currentDate.value.startOf('week');
  return Array.from({ length: 7 }).map((_, i) => {
    const day = monday.add(i, 'days');
    return {
      atemporal: day,
      isoDate: day.format('YYYY-MM-DD'),
      isToday: day.isSame(atemporal(), 'day'),
      formatted: { dayName: day.format('ddd'), dayAndMonth: day.format('D MMM') },
    };
  });
});

const selectedDayView = computed((): DayView => {
  const day = atemporal(currentDate.value);
  return {
    atemporal: day,
    isoDate: day.format('YYYY-MM-DD'),
    isToday: day.isSame(atemporal(), 'day'),
    formatted: {
      dayName: day.format('dddd'),
      dayAndMonth: day.format('MMMM D, YYYY'),
    },
  };
});

const timeSlots = computed((): TimeSlot[] => {
  const baseDay = selectedDayView.value.atemporal;
  return Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    // FIX: Reconstruct the Atemporal instance for each time slot. This approach is more robust
    // than using `.set()`, which was causing a `TypeError` from the underlying polyfill.
    // This ensures the date for the time label is created correctly in the component's timezone.
    const date = atemporal({
      year: baseDay.year,
      month: baseDay.month,
      day: baseDay.day,
      hour: hour,
      timeZone: baseDay.timeZone,
    }).toDate();
    return { hour, formatted: formatTime(date, timeFormat.value) };
  });
});

const dateRangeDisplay = computed((): string => {
  if (currentView.value === 'week') {
    if (!weekView.value.length) return '';
    const start = weekView.value[0].atemporal;
    const end = weekView.value[6].atemporal;
    return `${start.format('MMMM D')} - ${end.format('MMMM D, YYYY')}`;
  }
  return selectedDayView.value.formatted.dayAndMonth;
});

// --- EVENT LOGIC ---
/**
 * Memoized computation of resources with assigned colors
 * Optimizes performance by avoiding unnecessary recalculations
 */
const resourcesWithColors = computed(() => {
  let colorIndex = 0;
  return props.resources.map(resource => ({
    ...resource,
    color: resource.color || PREDEFINED_COLORS[colorIndex++ % PREDEFINED_COLORS.length],
  }));
});

/**
 * Memoized computation of all events with resource information
 * Includes performance optimization for large event sets
 */
const allEventsMemoized = computed((): CalendarEvent[] => {
  return resourcesWithColors.value.flatMap(resource =>
    resource.events.map(event => ({
      ...event,
      resourceId: resource.id,
      resourceName: resource.name,
      color: resource.color,
    }))
  );
});

/**
 * Memoized computation of events grouped by date
 * Optimizes performance for date-based event lookups
 */
const eventsByDate = computed(() => {
  const map = new Map<string, CalendarEvent[]>();
  for (const event of allEventsMemoized.value) {
    if (!event.from) continue;
    const eventDate = atemporal(event.from).format('YYYY-MM-DD');
    if (!map.has(eventDate)) map.set(eventDate, []);
    map.get(eventDate)?.push(event);
  }
  return map;
});

// Backward compatibility alias
const allEvents = allEventsMemoized;

const getEventsForDay = (events: Omit<CalendarEvent, 'resourceId' | 'resourceName'>[], isoDate: string): Omit<CalendarEvent, 'resourceId' | 'resourceName'>[] => {
  return events.filter(event => {
    if (!event.from) return false;
    return atemporal(event.from).format('YYYY-MM-DD') === isoDate;
  });
};

const getFormattedEventTimeRange = (event: CalendarEvent): string => {
  if (!event.from || !event.to) return '';
  const start = formatTime(event.from, timeFormat.value);
  const end = formatTime(event.to, timeFormat.value);
  return `${start} - ${end}`;
};

/**
 * Get display text for events based on the configured display field
 * @param event - The calendar event
 * @returns The formatted display text
 */
const getEventDisplayText = (event: CalendarEvent): string => {
  if (currentView.value === 'week') {
    switch (props.eventDisplayField) {
      case 'title':
        return event.title;
      case 'description':
        return event.description || event.title;
      case 'location':
        return event.location || event.title;
      case 'time':
      default:
        if (event.from && event.to) {
          return getFormattedEventTimeRange(event);
        }
        return event.title;
    }
  }
  return event.title;
};

const handleEventClick = (event: CalendarEvent) => {
  emit('event-click', event);
};

// --- ADVANCED DAY VIEW LOGIC ---
const processedDayEvents = computed(() => {
  const dayEvents = eventsByDate.value.get(selectedDayView.value.isoDate) || [];
  return processDayEvents(
    dayEvents,
    DAY_VIEW_START_HOUR,
    MINUTE_HEIGHT_PX,
    props.styleOptions?.dayViewItemWidthPercent || 95
  );
});

const scrollToFirstEvent = () => {
  if (!dayGridBody.value) return;
  if (!processedDayEvents.value.length) {
    dayGridBody.value.scrollTop = 8 * HOUR_HEIGHT_PX;
    return;
  }
  const firstEvent = processedDayEvents.value.reduce((earliest, current) =>
    current.start! < earliest.start! ? current : earliest
  );
  const targetHour = Math.floor(firstEvent.start! / 60);
  const scrollTop = Math.max(0, (targetHour - 1) * HOUR_HEIGHT_PX);
  dayGridBody.value.scrollTo({ top: scrollTop, behavior: 'smooth' });
};

/**
 * Handle cell hover state for showing add event button
 * @param resourceId - The resource ID
 * @param date - The date in ISO format
 * @param isHovering - Whether the cell is being hovered
 */
const handleCellHover = (resourceId: string, date: string, isHovering: boolean) => {
  if (isHovering) {
    hoveredCell.value = { resourceId, date };
  } else {
    hoveredCell.value = null;
  }
};

/**
 * Handle add event button click
 * @param resourceId - The resource ID where the event should be added
 * @param date - The date for the new event
 */
const handleAddEvent = (resourceId: string, date: string) => {
  const resource = resourcesWithColors.value.find(r => r.id === resourceId);
  if (resource) {
    emit('add-event', {
      resourceId,
      date,
      resourceName: resource.name
    });
  }
};

watch([processedDayEvents, currentView], () => {
  if (currentView.value === 'day') {
    nextTick(() => scrollToFirstEvent());
  }
}, { immediate: true, deep: true });
</script>
