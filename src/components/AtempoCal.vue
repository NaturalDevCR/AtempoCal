<template>
  <div class="atempo-cal">
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

      <div v-for="resource in resourcesWithColors" :key="resource.id" class="atempo-cal__resource-row">
        <div class="atempo-cal__resource-name">
          <slot name="resource-label" :resource="resource">
            {{ resource.name }}
          </slot>
        </div>
        <div v-for="day in weekView" :key="`${resource.id}-${day.isoDate}`" class="atempo-cal__day-cell">
          <div
              v-for="event in getEventsForDay(resource.events, day.isoDate)"
              :key="event.id"
              class="atempo-cal__event-chip"
              :class="`atempo-cal__event-chip--${event.type}`"
              :style="{ backgroundColor: resource.color }"
              :title="event.title"
              @click="handleEventClick({ ...event, resourceId: resource.id, resourceName: resource.name, color: resource.color })"
          >
            {{ getEventDisplayText(event) }}
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
            <div v-if="event.startTime && event.endTime" class="atempo-cal__event-footer">
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
import type { CalendarEvent, Resource, DayView, CalendarView, TimeSlot, TimeFormat } from '../types';
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
  dayViewItemWidthPercent?: number;
}>(), {
  title: 'Internal Resource Planner',
  startDate: () => new Date(),
  resourceHeaderText: 'Resources',
  view: 'week',
  dayViewItemWidthPercent: 95,
});

// --- EMITS ---
const emit = defineEmits<{
  (e: 'view-change', view: CalendarView): void;
  (e: 'date-change', date: Date): void;
  (e: 'event-click', event: CalendarEvent): void;
}>();

// --- STATE ---
const currentDate = ref(atemporal(props.startDate));
const currentView = computed(() => props.view);
const dayGridBody = ref<HTMLElement | null>(null);
const timeFormat = ref<TimeFormat>('24h');

// --- LIFECYCLE ---
onMounted(() => {
  const storedFormat = localStorage.getItem('atempo-cal-time-format') as TimeFormat | null;
  if (storedFormat && ['12h', '24h'].includes(storedFormat)) {
    timeFormat.value = storedFormat;
  }
});

// --- NAVIGATION & CONTROLS ---
const changeView = (view: CalendarView) => emit('view-change', view);
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
const resourcesWithColors = computed(() => {
  let colorIndex = 0;
  return props.resources.map(resource => ({
    ...resource,
    color: resource.color || PREDEFINED_COLORS[colorIndex++ % PREDEFINED_COLORS.length],
  }));
});

const allEvents = computed((): CalendarEvent[] => {
  return resourcesWithColors.value.flatMap(resource =>
    resource.events.map(event => ({
      ...event,
      resourceId: resource.id,
      resourceName: resource.name,
      color: resource.color,
    }))
  );
});

const eventsByDate = computed(() => {
  const map = new Map<string, CalendarEvent[]>();
  for (const event of allEvents.value) {
    if (!event.startTime) continue;
    const eventDate = atemporal(event.startTime).format('YYYY-MM-DD');
    if (!map.has(eventDate)) map.set(eventDate, []);
    map.get(eventDate)?.push(event);
  }
  return map;
});

const getEventsForDay = (events: Omit<CalendarEvent, 'resourceId' | 'resourceName'>[], isoDate: string): Omit<CalendarEvent, 'resourceId' | 'resourceName'>[] => {
  return events.filter(event => {
    if (!event.startTime) return false;
    return atemporal(event.startTime).format('YYYY-MM-DD') === isoDate;
  });
};

const getFormattedEventTimeRange = (event: CalendarEvent): string => {
  if (!event.startTime || !event.endTime) return '';
  const start = formatTime(event.startTime, timeFormat.value);
  const end = formatTime(event.endTime, timeFormat.value);
  return `${start} - ${end}`;
};

const getEventDisplayText = (event: CalendarEvent): string => {
  if (currentView.value === 'week' && event.startTime && event.endTime) {
    return getFormattedEventTimeRange(event);
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
    props.dayViewItemWidthPercent
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

watch([processedDayEvents, currentView], () => {
  if (currentView.value === 'day') {
    nextTick(() => scrollToFirstEvent());
  }
}, { immediate: true, deep: true });
</script>
