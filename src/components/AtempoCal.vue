<template>
  <div class="atempo-cal">

    <div class="ac-grid">
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
            {{ event.title }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import atemporal from 'atemporal';
// Asegúrate de que tus tipos se importen correctamente
import type { CalendarEvent, Resource, DayView } from '../types';

// --- PROPS ---
// Se elimina la prop `locale`. El componente confía en la configuración global.
const props = withDefaults(defineProps<{
  title?: string;
  resources: Resource[];
  events: CalendarEvent[];
  startDate?: Date | string;
  resourceHeaderText?: string;
}>(), {
  title: 'Calendario de Recursos',
  startDate: () => new Date(),
  resourceHeaderText: 'Recursos',
});

// --- EMITS ---
const emit = defineEmits<{
  (e: 'event-click', event: CalendarEvent): void;
}>();

// --- LÓGICA DE FECHAS (SIMPLIFICADA) ---
// Ahora la lógica es más limpia, ya que no se preocupa por el `locale`.
// Simplemente usa atemporal, que ya ha sido configurado globalmente.
const weekView = computed((): DayView[] => {
  const start = atemporal(props.startDate);
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

const dateRangeDisplay = computed((): string => {
  if (!weekView.value.length) return '';
  const start = weekView.value[0].atemporal;
  const end = weekView.value[6].atemporal;
  return `${start.format('D [de] MMMM')} - ${end.format('D [de] MMMM [de] YYYY')}`;
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
/* ---        Grid General        --- */
/* ---------------------------------- */
.ac-grid {
  display: grid;
  grid-template-columns: 200px repeat(7, minmax(100px, max-content));
  gap: 1px;
  background: var(--ac-grid-bg);
  border-radius: 8px;
  overflow: hidden; /* Clave para que los bordes redondeados afecten a los hijos */
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

.ac-day-header {
  background: var(--ac-day-header-bg);
  color: var(--ac-header-text);
  padding: 12px;
  text-align: center;
  transition: background-color 0.3s ease;
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

.ac-day-cell {
  background: var(--ac-day-cell-bg);
  padding: 8px;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: stretch;
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
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  .ac-grid {
    grid-template-columns: 150px repeat(7, 1fr);
  }
  .ac-resource-name {
    font-size: 0.8rem;
    padding: 12px;
  }
}

@media (max-width: 768px) {
  .atempo-cal {
    padding: 16px;
  }
  .ac-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  .ac-title {
    font-size: 1.5rem;
  }
  .ac-date-range {
    font-size: 1rem;
    width: 100%;
    text-align: center;
  }
  .ac-grid {
    grid-template-columns: 100px repeat(7, 1fr);
  }
  .ac-resource-name {
    font-size: 0.75rem;
    padding: 8px;
    word-break: break-word;
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
  .ac-grid {
    grid-template-columns: 80px repeat(7, 1fr);
  }
  .ac-resource-name {
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