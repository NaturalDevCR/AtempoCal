<!-- /src/App.vue -->
<script setup lang="ts">
import { ref } from 'vue';
// ¡Importa tu componente localmente!
import AtempoCal from './components/AtempoCal.vue';
import type { CalendarEvent, Resource } from './types'; // Es una buena práctica definir y exportar los tipos
import atemporal from 'atemporal'; // Importa el objeto principal

// --- CONFIGURACIÓN GLOBAL DE ATEMPORAL ---
// ¡Hazlo aquí, una sola vez!
// TypeScript ahora buscará `setDefaultLocale` en el objeto `atemporal` y lo encontrará.
atemporal.setDefaultLocale('es');

// --- DATOS DE PRUEBA ---
// Simula los datos que un usuario final le pasaría a tu componente.
const resources = ref<Resource[]>([
  { id: 'res-1', name: 'Josue Orozco A.' },
  { id: 'res-2', name: 'Estudio de Grabación' },
  { id: 'res-3', name: 'Desarrollador (Ana)' },
  { id: 'res-4', name: 'Proyector Móvil' },
]);

const events = ref<CalendarEvent[]>([
  {
    id: 1,
    resourceId: 'res-1',
    date: '2025-07-21',
    title: '08:00am - 02:00pm',
    description: 'Inicio del proyecto "Aries".',
    color: '#f59e0b' // Naranja
  },
  {
    id: 2,
    resourceId: 'res-3',
    date: '2025-07-21',
    title: 'Bloque de código',
    description: 'Desarrollo de la nueva API.',
    type: 'focus', // Usará el estilo CSS para .event-type-focus
  },
  {
    id: 3,
    resourceId: 'res-2',
    date: '2025-07-23',
    title: 'Grabación Podcast',
    color: '#6366f1' // Índigo
  },
  {
    id: 4,
    resourceId: 'res-1',
    date: '2025-07-23',
    title: 'Entrevista a candidato',
    type: 'urgent' // Usará el estilo CSS para .event-type-urgent
  }
]);

// --- MANEJO DE EVENTOS ---
// Prueba que tus 'emits' funcionan correctamente.
function handleEventClick(event: CalendarEvent) {
  console.log('Evento clickeado:', event);
  alert(`Has hecho clic en el evento: "${event.title}"`);
}
</script>

<template>
  <div class="dev-container">
    <header>
      <h1>Entorno de Desarrollo de <code>AtempoCal</code></h1>
      <p>Esta es tu área de pruebas. Cualquier cambio que hagas en <code>AtempoCal.vue</code> se reflejará aquí al instante.</p>
    </header>
    <main>
      <AtempoCal
          :resources="resources"
          :events="events"
          :start-date="new Date('2025-07-22')"
          title="Agenda de Recursos Internos"
          resource-header-text="Colaboradores"
          @event-click="handleEventClick"
      />
    </main>
  </div>
</template>

<style>
/* Estilos generales para la página de prueba */
body {
  background-color: #f1f5f9;
  color: #334155;
  font-family: sans-serif;
}
.dev-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
}
.dev-container header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #cbd5e1;
}
.dev-container code {
  background-color: #e2e8f0;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
}
</style>