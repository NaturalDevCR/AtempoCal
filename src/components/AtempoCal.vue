<template>
  <div class="atempo-cal">
    <!-- Controles de Vista -->
    <div class="ac-header">
      <div class="ac-title-section">
        <h2 class="ac-title">{{ title }}</h2>
        <div class="ac-date-range">{{ dateRangeDisplay }}</div>
      </div>
<<<<<<< HEAD

      <!-- Controles de Navegación de Fechas -->
      <div class="ac-date-navigation">
        <button @click="navigateDate('prev')" class="ac-nav-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15,18 9,12 15,6"></polyline>
          </svg>
        </button>
        <button @click="goToToday" class="ac-today-btn">Hoy</button>
        <button @click="navigateDate('next')" class="ac-nav-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9,18 15,12 9,6"></polyline>
          </svg>
        </button>
      </div>

      <div class="ac-view-controls">
        <button
            @click="changeView('week')"
            :class="{ active: currentView === 'week' }"
            class="ac-view-btn"
        >
          Semana
        </button>
        <button
            @click="changeView('day')"
            :class="{ active: currentView === 'day' }"
            class="ac-view-btn"
        >
          Día
        </button>
      </div>
    </div>

=======
      
      <!-- Controles de Navegación de Fechas -->
      <div class="ac-date-navigation">
        <button @click="navigateDate('prev')" class="ac-nav-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15,18 9,12 15,6"></polyline>
          </svg>
        </button>
        <button @click="goToToday" class="ac-today-btn">Hoy</button>
        <button @click="navigateDate('next')" class="ac-nav-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9,18 15,12 9,6"></polyline>
          </svg>
        </button>
      </div>
      
      <div class="ac-view-controls">
        <button 
          @click="changeView('week')" 
          :class="{ active: currentView === 'week' }"
          class="ac-view-btn"
        >
          Semana
        </button>
        <button 
          @click="changeView('day')" 
          :class="{ active: currentView === 'day' }"
          class="ac-view-btn"
        >
          Día
        </button>
      </div>
    </div>

>>>>>>> 0d7eab57a75e6777b5b9c38c325c6d37ce070abc
    <!-- Vista de Semana -->
    <div v-if="currentView === 'week'" class="ac-grid ac-week-grid">
      <!-- Fila de Cabecera -->
      <div class="ac-grid-header">
        <div class="ac-resource-header">{{ resourceHeaderText }}</div>
        <div
            v-for="day in weekView"
            :key="day.isoDate"
            class="ac-day-header"
            :class="{ 'is-today': day.isToday }"
        >
          <div class="ac-day-name">{{ day.formatted.dayName }}</div>
          <div class="ac-day-date">{{ day.formatted.dayAndMonth }}</div>
        </div>
      </div>

      <!-- Filas de Recursos -->
      <div
          v-for="resource in resources"
          :key="resource.id"
          class="ac-resource-row"
      >
        <div class="ac-resource-name">{{ resource.name }}</div>
        <div
            v-for="day in weekView"
            :key="`${resource.id}-${day.isoDate}`"
            class="ac-day-cell"
        >
          <div
              v-for="event in getEventsForResource(resource.id, day.isoDate)"
              :key="event.id"
              class="ac-event-chip"
              :class="`event-type-${event.type}`"
              :style="{ backgroundColor: event.color }"
              :title="event.description"
              @click="$emit('event-click', event)"
          >
            {{ getEventDisplayText(event) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Vista de Día -->
    <div v-else-if="currentView === 'day'" class="ac-grid ac-day-grid">
      <!-- Fila de Cabecera para Vista de Día -->
      <div class="ac-grid-header">
        <div class="ac-time-header">Hora</div>
        <div class="ac-day-header is-single-day">
          <div class="ac-day-name">{{ selectedDayView.formatted.dayName }}</div>
          <div class="ac-day-date">{{ selectedDayView.formatted.dayAndMonth }}</div>
        </div>
      </div>

      <!-- Filas de Horarios -->
      <div
          v-for="timeSlot in timeSlots"
          :key="timeSlot.hour"
          class="ac-time-row"
      >
        <div class="ac-time-label">{{ timeSlot.formatted }}</div>
        <div class="ac-time-cell">
          <div
              v-for="event in getEventsForTimeSlot(timeSlot.hour, selectedDayView.isoDate)"
              :key="event.id"
              class="ac-event-chip ac-event-chip-day"
              :class="`event-type-${event.type}`"
<<<<<<< HEAD
              :style="{
=======
              :style="{ 
>>>>>>> 0d7eab57a75e6777b5b9c38c325c6d37ce070abc
                backgroundColor: event.color,
                height: getEventHeight(event) + 'px',
                top: getEventTopPosition(event, timeSlot.hour) + 'px'
              }"
              :title="event.description"
              @click="$emit('event-click', event)"
          >
            {{ getResourceName(event.resourceId) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import atemporal from 'atemporal';
// Asegúrate de que tus tipos se importen correctamente
import type { CalendarEvent, Resource, DayView, CalendarView, TimeSlot } from '../types';

// --- PROPS ---
// Se elimina la prop `locale`. El componente confía en la configuración global.
const props = withDefaults(defineProps<{
  title?: string;
  resources: Resource[];
  events: CalendarEvent[];
  startDate?: Date | string;
  resourceHeaderText?: string;
  view?: CalendarView;
}>(), {
  title: 'Calendario de Recursos',
  startDate: () => new Date(),
  resourceHeaderText: 'Recursos',
  view: 'week',
});

// --- EMITS ---
const emit = defineEmits<{
  (e: 'event-click', event: CalendarEvent): void;
  (e: 'view-change', view: CalendarView): void;
  (e: 'date-change', date: Date): void;
}>();

// --- FECHA ACTUAL ---
const currentDate = ref(atemporal(props.startDate));

// --- VISTA ACTUAL ---
const currentView = computed(() => props.view);

const changeView = (view: CalendarView) => {
  emit('view-change', view);
};

// --- NAVEGACIÓN DE FECHAS ---
const navigateDate = (direction: 'prev' | 'next') => {
  if (currentView.value === 'week') {
    // Navegar por semanas
    if (direction === 'prev') {
      currentDate.value = currentDate.value.subtract(1, 'week');
    } else {
      currentDate.value = currentDate.value.add(1, 'week');
    }
  } else {
    // Navegar por días
    if (direction === 'prev') {
      currentDate.value = currentDate.value.subtract(1, 'day');
    } else {
      currentDate.value = currentDate.value.add(1, 'day');
    }
  }
  emit('date-change', currentDate.value.toDate());
};

const goToToday = () => {
  currentDate.value = atemporal();
  emit('date-change', currentDate.value.toDate());
};

// --- LÓGICA DE FECHAS (SIMPLIFICADA) ---
// Ahora la lógica es más limpia, ya que no se preocupa por el `locale`.
// Simplemente usa atemporal, que ya ha sido configurado globalmente.
const weekView = computed((): DayView[] => {
  const start = currentDate.value;
  const monday = start.startOf('week');

  return Array.from({ length: 7 }).map((_, i) => {
    const currentDay = monday.add(i, 'days');
    return {
      atemporal: currentDay,
      isoDate: currentDay.format('YYYY-MM-DD'),
      isToday: currentDay.isSame(atemporal(), 'day'),
      formatted: {
        dayName: currentDay.format('ddd'),
        dayAndMonth: currentDay.format('D MMM'),
      },
    };
  });
});

// Vista de día seleccionado
const selectedDayView = computed((): DayView => {
  const start = currentDate.value;
  return {
    atemporal: start,
    isoDate: start.format('YYYY-MM-DD'),
    isToday: start.isSame(atemporal(), 'day'),
    formatted: {
      dayName: start.format('dddd'),
      dayAndMonth: start.format('D [de] MMMM [de] YYYY'),
    },
  };
});

// Slots de tiempo para vista de día (8 AM a 6 PM)
const timeSlots = computed((): TimeSlot[] => {
  return Array.from({ length: 11 }, (_, i) => {
    const hour = i + 8; // Empezar desde las 8 AM
    return {
      hour,
      formatted: `${hour.toString().padStart(2, '0')}:00`,
    };
  });
});

const dateRangeDisplay = computed((): string => {
  if (currentView.value === 'week') {
    if (!weekView.value.length) return '';
    const start = weekView.value[0].atemporal;
    const end = weekView.value[6].atemporal;
    return `${start.format('D [de] MMMM')} - ${end.format('D [de] MMMM [de] YYYY')}`;
  } else {
    return selectedDayView.value.formatted.dayAndMonth;
  }
});

// --- LÓGICA DE EVENTOS (SIN CAMBIOS) ---
const eventsByDate = computed(() => {
  const map = new Map<string, CalendarEvent[]>();
  for (const event of props.events) {
    const eventDate = atemporal(event.date).format('YYYY-MM-DD');
    if (!map.has(eventDate)) {
      map.set(eventDate, []);
    }
    map.get(eventDate)?.push(event);
  }
  return map;
});

const getEventsForResource = (resourceId: string | number, isoDate: string): CalendarEvent[] => {
  const dailyEvents = eventsByDate.value.get(isoDate) || [];
  return dailyEvents.filter(event => event.resourceId === resourceId);
};

// --- LÓGICA PARA VISTA DE DÍA ---
const getEventsForTimeSlot = (hour: number, isoDate: string): CalendarEvent[] => {
  const dailyEvents = eventsByDate.value.get(isoDate) || [];
  return dailyEvents.filter(event => {
    if (!event.startTime || !event.endTime) return false;
    const startHour = parseInt(event.startTime.split(':')[0]);
    const endHour = parseInt(event.endTime.split(':')[0]);
    return hour >= startHour && hour < endHour;
  });
};

const getResourceName = (resourceId: string | number): string => {
  const resource = props.resources.find(r => r.id === resourceId);
  return resource?.name || 'Recurso desconocido';
};

const getEventHeight = (event: CalendarEvent): number => {
  if (!event.startTime || !event.endTime) return 60;
  const start = parseInt(event.startTime.split(':')[0]) + parseInt(event.startTime.split(':')[1]) / 60;
  const end = parseInt(event.endTime.split(':')[0]) + parseInt(event.endTime.split(':')[1]) / 60;
  const duration = end - start;
  return Math.max(duration * 60, 30); // Mínimo 30px de altura
};

const getEventTopPosition = (event: CalendarEvent, slotHour: number): number => {
  if (!event.startTime) return 0;
  const eventStartHour = parseInt(event.startTime.split(':')[0]);
  const eventStartMinutes = parseInt(event.startTime.split(':')[1]);
<<<<<<< HEAD

=======
  
>>>>>>> 0d7eab57a75e6777b5b9c38c325c6d37ce070abc
  if (eventStartHour === slotHour) {
    return eventStartMinutes; // Posición en minutos desde el inicio de la hora
  }
  return 0;
};

const getEventDisplayText = (event: CalendarEvent): string => {
  if (currentView.value === 'week') {
    if (event.startTime && event.endTime) {
      return `${event.startTime} - ${event.endTime}`;
    }
    return event.title;
  }
  return event.title;
};
</script>

<style scoped>
/* ---------------------------------- */
/* ---        Variables CSS       --- */
/* --- para fácil personalización --- */
/* ---------------------------------- */
.atempo-cal {
  --ac-bg: #f8fafc;
  --ac-border-color: #e2e8f0;
  --ac-grid-bg: #cbd5e1;
  --ac-primary-text: #1e293b;
  --ac-secondary-text: #64748b;
  --ac-header-bg: #334155;
  --ac-header-text: #ffffff;
  --ac-day-header-bg: #475569;
  --ac-resource-name-bg: #f1f5f9;
  --ac-day-cell-bg: #ffffff;
  --ac-today-indicator: #f59e0b;
  --ac-event-default-bg: #64748b;
  --ac-event-default-text: #ffffff;

  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  width: 100%;
  /*background: var(--ac-bg); */
  border-radius: 12px;
  /* padding: 24px; */
  box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.08);
}

/* ---------------------------------- */
/* ---        Header Section      --- */
/* ---------------------------------- */
.ac-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 4px;
  gap: 16px;
  flex-wrap: wrap;
}

.ac-title-section {
  flex: 1;
  min-width: 200px;
}

.ac-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--ac-primary-text);
  margin: 0 0 8px 0;
}

.ac-date-range {
  font-size: 1.125rem;
  color: var(--ac-secondary-text);
  font-weight: 500;
}

/* ---------------------------------- */
/* ---   Navegación de Fechas     --- */
/* ---------------------------------- */
.ac-date-navigation {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--ac-border-color);
  border-radius: 8px;
  padding: 4px;
}

.ac-nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: var(--ac-secondary-text);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ac-nav-btn:hover {
  background: rgba(255, 255, 255, 0.7);
  color: var(--ac-primary-text);
}

.ac-today-btn {
  padding: 8px 16px;
  border: none;
  background: transparent;
  color: var(--ac-secondary-text);
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  white-space: nowrap;
}

.ac-today-btn:hover {
  background: rgba(255, 255, 255, 0.7);
  color: var(--ac-primary-text);
}

.ac-view-controls {
  display: flex;
  gap: 4px;
  background: var(--ac-border-color);
  border-radius: 8px;
  padding: 4px;
}

.ac-view-btn {
  padding: 8px 16px;
  border: none;
  background: transparent;
  color: var(--ac-secondary-text);
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.ac-view-btn:hover {
  background: rgba(255, 255, 255, 0.7);
}

.ac-view-btn.active {
  background: white;
  color: var(--ac-primary-text);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* ---------------------------------- */
/* ---        Grid General        --- */
/* ---------------------------------- */
.ac-grid {
  gap: 1px;
  background: var(--ac-grid-bg);
  border-radius: 8px;
  overflow: hidden; /* Clave para que los bordes redondeados afecten a los hijos */
  width: 100%;
  min-width: 900px; /* Ancho mínimo para mantener legibilidad */
}

.ac-week-grid {
  display: grid;
  grid-template-columns: 200px repeat(7, 1fr);
}

.ac-day-grid {
  display: grid;
  grid-template-columns: 100px 1fr;
}

.ac-grid-header {
  /* Hace que los hijos se posicionen en la grid principal */
  display: contents;
}


/* ---------------------------------- */
/* ---   Cabeceras de la Grid     --- */
/* ---------------------------------- */
.ac-resource-header {
  background: var(--ac-header-bg);
  color: var(--ac-header-text);
  font-weight: 600;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  /* Asegura que la cabecera superior izquierda no tenga borde redondeado */
  border-top-left-radius: 8px;
}

.ac-time-header {
  background: var(--ac-header-bg);
  color: var(--ac-header-text);
  font-weight: 600;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  border-top-left-radius: 8px;
}

.ac-day-header {
  background: var(--ac-day-header-bg);
  color: var(--ac-header-text);
  padding: 12px;
  text-align: center;
  transition: background-color 0.3s ease;
}

.ac-day-header.is-single-day {
  border-top-right-radius: 8px;
}

.ac-day-header.is-today {
  background: var(--ac-today-indicator);
  font-weight: 700;
}

.ac-day-name {
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.ac-day-date {
  font-size: 0.75rem;
  opacity: 0.9;
}


/* ---------------------------------- */
/* ---    Contenido de la Grid    --- */
/* ---------------------------------- */
.ac-resource-row {
  display: contents;
}

.ac-time-row {
  display: contents;
}

.ac-resource-name {
  background: var(--ac-resource-name-bg);
  padding: 16px;
  font-weight: 600;
  color: var(--ac-primary-text);
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  border-right: 2px solid var(--ac-border-color);
}

.ac-time-label {
  background: var(--ac-resource-name-bg);
  padding: 16px;
  font-weight: 600;
  color: var(--ac-primary-text);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  border-right: 2px solid var(--ac-border-color);
  min-height: 80px;
}

.ac-day-cell {
  background: var(--ac-day-cell-bg);
  padding: 8px;
  min-height: 80px;
  min-width: 0; /* Permite que el contenido se ajuste al ancho disponible */
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: stretch;
}

.ac-time-cell {
  background: var(--ac-day-cell-bg);
  padding: 8px;
  min-height: 80px;
  position: relative;
  border-bottom: 1px solid var(--ac-border-color);
}

/* ---------------------------------- */
/* ---      Chips de Eventos      --- */
/* ---------------------------------- */
.ac-event-chip {
  background: var(--ac-event-default-bg);
  color: var(--ac-event-default-text);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center; /* Texto centrado */
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  line-height: 1.3;
  word-wrap: break-word;
  hyphens: auto;
  overflow-wrap: break-word;
}

.ac-event-chip-day {
  position: absolute;
  left: 8px;
  right: 8px;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 0.7rem;
  z-index: 1;
}

.ac-event-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px -2px rgba(0, 0, 0, 0.2);
  filter: brightness(1.1);
}

/*
  Ejemplo de cómo podrías usar la prop `type` para estilizar eventos.
  Si un evento tiene `type: 'training'`, se le aplicará esta clase.
  <div class="ac-event-chip event-type-training">...</div>
*/
.ac-event-chip.event-type-training {
  background: #8b5cf6;
}
.ac-event-chip.event-type-focus {
  background: #10b981;
}
.ac-event-chip.event-type-meeting {
  background: #06b6d4;
}
.ac-event-chip.event-type-urgent {
  background: #ef4444;
}


/* ---------------------------------- */
/* ---     Diseño Responsivo      --- */
/* ---------------------------------- */
@media (max-width: 1024px) {
  .ac-week-grid {
    grid-template-columns: 150px repeat(7, 1fr);
    min-width: 750px;
  }
  .ac-day-grid {
    grid-template-columns: 80px 1fr;
  }
  .ac-resource-name {
    font-size: 0.8rem;
    padding: 12px;
  }
  .ac-time-label {
    font-size: 0.8rem;
    padding: 12px;
  }
}

@media (max-width: 768px) {
  .atempo-cal {
    overflow-x: auto; /* Permite scroll horizontal en pantallas pequeñas */
  }
  .ac-header {
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
  }
  .ac-title-section {
    flex: 1 1 100%;
    text-align: center;
    min-width: auto;
  }
  .ac-title {
    font-size: 1.5rem;
  }
  .ac-date-range {
    font-size: 1rem;
  }
  .ac-week-grid {
    grid-template-columns: 100px repeat(7, 1fr);
    min-width: 600px;
  }
  .ac-day-grid {
    grid-template-columns: 60px 1fr;
  }
  .ac-resource-name {
    font-size: 0.75rem;
    padding: 8px;
    word-break: break-word;
  }
  .ac-time-label {
    font-size: 0.75rem;
    padding: 8px;
  }
  .ac-day-name {
    font-size: 0.7rem; /* Mon -> L */
  }
  .ac-day-date {
    font-size: 0.65rem;
  }
  .ac-event-chip {
    font-size: 0.7rem;
    padding: 4px 8px;
  }
}

@media (max-width: 480px) {
  .ac-week-grid {
    grid-template-columns: 80px repeat(7, 1fr);
    min-width: 500px;
  }
  .ac-day-grid {
    grid-template-columns: 50px 1fr;
  }
  .ac-resource-name {
    font-size: 0.7rem;
    padding: 6px;
  }
  .ac-time-label {
    font-size: 0.7rem;
    padding: 6px;
  }
  .ac-day-name {
    font-size: 0.65rem;
  }
  .ac-event-chip {
    font-size: 0.65rem;
    padding: 3px 6px;
    text-align: left;
  }
}

</style>