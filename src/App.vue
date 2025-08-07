<template>
  <div class="dev-container" :class="theme">
    <header>
      <h1>AtempoCal Development Environment</h1>
      <p>This is your refactored test area. Use the controls to test the new features.</p>

      <!-- Test Controls -->
      <div class="test-controls">
        <div class="control-group">
          <label for="view-select">Current View</label>
          <select id="view-select" v-model="currentView">
            <option value="week">Week</option>
            <option value="day">Day</option>
          </select>
        </div>
        <div class="control-group">
          <label for="width-slider">Event Width ({{ itemWidth }}%)</label>
          <input type="range" id="width-slider" min="10" max="100" v-model.number="itemWidth" />
        </div>
        <div class="control-group">
          <label for="theme-toggle">Theme Mode</label>
          <button id="theme-toggle" @click="toggleTheme" class="theme-toggle-btn">
            <span v-if="theme === 'light'">🌙</span>
            <span v-else>☀️</span>
            Switch to {{ theme === 'light' ? 'Dark' : 'Light' }}
          </button>
        </div>
      </div>
    </header>
    <main>
      <AtempoCal
          :darkMode="theme === 'dark'"
          :resources="resources"
          :start-date="new Date('2025-07-22T00:00:00')"
          :view="currentView"
          @add-event="handleAddEvent"
          @event-click="handleEventClick"
          :styleOptions="{
            dayViewItemWidthPercent: itemWidth,
            height: '600px',
            width: '100%'
          }"
          title="Internal Resource Planner"
          resource-header-text="Team Members"
          @view-change="handleViewChange"
          @date-change="handleDateChange"
          @time-format-change="handleTimeFormatChange"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AtempoCal from './components/AtempoCal.vue';
import type { Resource, CalendarView, CalendarEvent, DateChangeEvent, TimeFormat } from './types';
import atemporal from 'atemporal';

// --- ATEMPORAL GLOBAL CONFIGURATION ---
atemporal.setDefaultLocale('en');
atemporal.setDefaultTimeZone('America/Los_Angeles');


// --- TEST APP STATE ---
const currentView = ref<CalendarView>('day');
const itemWidth = ref(95);
const theme = ref<'light' | 'dark'>('light');

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
};

// --- TEST DATA (GENERATED WITH ATEMPORAL) ---
const resources = ref<Resource[]>([
  {
    id: 'res-1',
    name: 'Alex Johnson',
    events: [
      { id: 1, title: 'Sprint 24 Planning', description: 'Define tasks and goals for the next sprint.', from: atemporal('2025-07-21T08:00:00').toDate(), to: atemporal('2025-07-21T14:00:00').toDate()},
      { id: 5, title: 'Daily Stand-up', type: 'meeting', from: atemporal('2025-07-22T10:00:00').toDate(), to: atemporal('2025-07-22T10:30:00').toDate() },
      { id: 11, title: 'Code Review Session', type: 'focus', from: atemporal('2025-07-24T13:00:00').toDate(), to: atemporal('2025-07-24T15:00:00').toDate() },
      { id: 12, title: 'Frontend Architecture Meeting', type: 'meeting', from: atemporal('2025-07-25T09:30:00').toDate(), to: atemporal('2025-07-25T11:00:00').toDate() },
      { id: 13, title: 'Lunch with Team', from: atemporal('2025-07-22T12:30:00').toDate(), to: atemporal('2025-07-22T13:30:00').toDate() },
    ]
  },
  {
    id: 'res-2',
    name: 'Beatrice Miller',
    color: '#a855f7',
    events: [
      { id: 3, title: 'UX Design Review', description: 'Review mockups for the new profile feature.', from: atemporal('2025-07-23T10:00:00').toDate(), to: atemporal('2025-07-23T11:30:00').toDate() },
      { id: 6, title: 'Pair Programming Session', description: 'Work on the authentication module with the team.', from: atemporal('2025-07-22T10:30:00').toDate(), to: atemporal('2025-07-22T12:30:00').toDate() },
      { id: 14, title: 'Design System Workshop', type: 'training', from: atemporal('2025-07-24T09:00:00').toDate(), to: atemporal('2025-07-24T12:00:00').toDate() },
      { id: 15, title: 'User Testing Session', from: atemporal('2025-07-25T14:00:00').toDate(), to: atemporal('2025-07-25T16:30:00').toDate() },
      { id: 16, title: 'Product Team Sync', type: 'meeting', from: atemporal('2025-07-21T15:30:00').toDate(), to: atemporal('2025-07-21T16:30:00').toDate() },
    ]
  },
  {
    id: 'res-3',
    name: 'Charles Davis',
    color: '#22c55e',
    events: [
      { id: 2, title: 'Focus Block: API Gateway', description: 'Implement endpoints for the user service.', type: 'focus', from: atemporal('2025-07-21T09:00:00').toDate(), to: atemporal('2025-07-21T12:00:00').toDate() },
      { id: 7, title: 'Pull Request #112 Review', type: 'focus', from: atemporal('2025-07-22T10:45:00').toDate(), to: atemporal('2025-07-22T11:45:00').toDate() },
      { id: 9, title: 'Security Training', type: 'training', from: atemporal('2025-07-22T14:00:00').toDate(), to: atemporal('2025-07-22T15:30:00').toDate() },
      { id: 17, title: 'Database Optimization', type: 'focus', from: atemporal('2025-07-24T11:00:00').toDate(), to: atemporal('2025-07-24T13:30:00').toDate() },
      { id: 18, title: 'Backend Architecture Review', type: 'meeting', from: atemporal('2025-07-25T10:00:00').toDate(), to: atemporal('2025-07-25T12:00:00').toDate() },
      { id: 19, title: 'DevOps Pipeline Setup', type: 'focus', from: atemporal('2025-07-23T13:00:00').toDate(), to: atemporal('2025-07-23T16:00:00').toDate() },
    ]
  },
  {
    id: 'res-4',
    name: 'Diana Smith',
    events: [
      { id: 4, title: 'Demo for "Innovate Corp" Client', type: 'urgent', from: atemporal('2025-07-23T15:00:00').toDate(), to: atemporal('2025-07-23T17:00:00').toDate() },
      { id: 8, title: 'Sync with Marketing', type: 'meeting', from: atemporal('2025-07-22T13:00:00').toDate(), to: atemporal('2025-07-22T13:45:00').toDate() },
      { id: 10, title: 'Q3 Final Review', type: 'urgent', from: atemporal('2025-07-22T19:00:00').toDate(), to: atemporal('2025-07-22T19:45:00').toDate() },
      { id: 20, title: 'Client Onboarding Call', type: 'meeting', from: atemporal('2025-07-24T15:30:00').toDate(), to: atemporal('2025-07-24T16:30:00').toDate() },
      { id: 21, title: 'Project Status Update', type: 'meeting', from: atemporal('2025-07-25T09:00:00').toDate(), to: atemporal('2025-07-25T10:00:00').toDate() },
      { id: 22, title: 'Sales Team Coordination', from: atemporal('2025-07-21T11:00:00').toDate(), to: atemporal('2025-07-21T12:30:00').toDate() },
    ]
  },
  {
    id: 'res-5',
    name: 'Ethan Williams',
    color: '#0ea5e9',
    events: [
      { id: 23, title: 'QA Testing Session', type: 'focus', from: atemporal('2025-07-21T10:00:00').toDate(), to: atemporal('2025-07-21T13:00:00').toDate() },
      { id: 24, title: 'Automated Test Review', type: 'meeting', from: atemporal('2025-07-22T15:00:00').toDate(), to: atemporal('2025-07-22T16:00:00').toDate() },
      { id: 25, title: 'Bug Triage', type: 'urgent', from: atemporal('2025-07-23T09:00:00').toDate(), to: atemporal('2025-07-23T11:00:00').toDate() },
      { id: 26, title: 'Test Plan Development', from: atemporal('2025-07-24T14:00:00').toDate(), to: atemporal('2025-07-24T17:00:00').toDate() },
      { id: 27, title: 'Release Testing', type: 'focus', from: atemporal('2025-07-25T13:00:00').toDate(), to: atemporal('2025-07-25T18:00:00').toDate() },
    ]
  },
  {
    id: 'res-6',
    name: 'Fiona Garcia',
    color: '#f43f5e',
    events: [
      { id: 28, title: 'Product Roadmap Planning', type: 'meeting', from: atemporal('2025-07-21T14:00:00').toDate(), to: atemporal('2025-07-21T16:00:00').toDate() },
      { id: 29, title: 'Feature Prioritization', from: atemporal('2025-07-22T11:00:00').toDate(), to: atemporal('2025-07-22T12:00:00').toDate() },
      { id: 30, title: 'Stakeholder Meeting', type: 'urgent', from: atemporal('2025-07-23T13:30:00').toDate(), to: atemporal('2025-07-23T15:00:00').toDate() },
      { id: 31, title: 'User Story Workshop', type: 'training', from: atemporal('2025-07-24T10:00:00').toDate(), to: atemporal('2025-07-24T12:30:00').toDate() },
      { id: 32, title: 'Competitor Analysis', type: 'focus', from: atemporal('2025-07-25T11:00:00').toDate(), to: atemporal('2025-07-25T13:00:00').toDate() },
    ]
  },
  {
    id: 'res-7',
    name: 'George Thompson',
    color: '#8b5cf6',
    events: [
      { id: 33, title: 'DevOps Strategy Meeting', type: 'meeting', from: atemporal('2025-07-21T09:30:00').toDate(), to: atemporal('2025-07-21T11:30:00').toDate() },
      { id: 34, title: 'Infrastructure Maintenance', type: 'focus', from: atemporal('2025-07-22T08:00:00').toDate(), to: atemporal('2025-07-22T10:00:00').toDate() },
      { id: 35, title: 'Cloud Migration Planning', from: atemporal('2025-07-23T11:30:00').toDate(), to: atemporal('2025-07-23T13:30:00').toDate() },
      { id: 36, title: 'Security Audit', type: 'urgent', from: atemporal('2025-07-24T09:00:00').toDate(), to: atemporal('2025-07-24T11:00:00').toDate() },
      { id: 37, title: 'Deployment Pipeline Review', type: 'meeting', from: atemporal('2025-07-25T15:00:00').toDate(), to: atemporal('2025-07-25T16:00:00').toDate() },
    ]
  },
  {
    id: 'res-8',
    name: 'Hannah Lee',
    color: '#10b981',
    events: [
      { id: 38, title: 'Content Strategy Session', from: atemporal('2025-07-21T13:00:00').toDate(), to: atemporal('2025-07-21T15:00:00').toDate() },
      { id: 39, title: 'Blog Post Review', type: 'focus', from: atemporal('2025-07-22T14:30:00').toDate(), to: atemporal('2025-07-22T16:00:00').toDate() },
      { id: 40, title: 'Social Media Planning', from: atemporal('2025-07-23T09:30:00').toDate(), to: atemporal('2025-07-23T11:00:00').toDate() },
      { id: 41, title: 'Email Campaign Setup', type: 'focus', from: atemporal('2025-07-24T13:30:00').toDate(), to: atemporal('2025-07-24T15:00:00').toDate() },
      { id: 42, title: 'Marketing Team Sync', type: 'meeting', from: atemporal('2025-07-25T11:30:00').toDate(), to: atemporal('2025-07-25T12:30:00').toDate() },
    ]
  },
]);


// --- EVENT HANDLERS ---
function handleViewChange(view: CalendarView) {
  currentView.value = view;
  console.log('View changed to:', view);
}

function handleDateChange(data: DateChangeEvent) {
  console.log('Date changed to:', data.currentDate);
  console.log('View:', data.view);
  console.log('Range:', data.range);
  console.log('Display text:', data.displayText);
}

function handleTimeFormatChange(format: TimeFormat) {
  console.log('Time format changed to:', format);
}

const handleAddEvent = (data:any) => {
  console.log('Add event for:', data);
  // data contiene: { resourceId, date, resourceName }
  // Aquí puedes abrir un modal o formulario para crear el evento
};

function handleEventClick(event: CalendarEvent) {
  console.log('EVENT CLICKED:', event);
  alert(`Event clicked: "${event.title}" for ${event.resourceName}. You can open your own modal or perform another action.`);
}
</script>

<style>
/* General styles for the test page */
body {
  background-color: #f1f5f9;
  color: #334155;
  font-family: sans-serif;
  transition: background-color 0.3s ease, color 0.3s ease;
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
  transition: border-color 0.3s ease;
}
.dev-container code {
  background-color: #e2e8f0;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.test-controls {
  margin-top: 1rem;
  display: flex;
  gap: 1.5rem;
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  align-items: center;
  border: 1px solid #e2e8f0;
  flex-wrap: wrap;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}
.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.control-group label {
  font-weight: 500;
  font-size: 0.875rem;
  color: #475569;
  transition: color 0.3s ease;
}
.control-group select, .control-group input[type="range"], .control-group button {
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background-color: white;
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}
.control-group input[type="range"] {
  padding: 0;
}
.theme-toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  cursor: pointer;
}

/* --- Dark Mode for Dev Container --- */
.dev-container.dark {
  background-color: #0f172a;
  color: #cbd5e1;
}
.dev-container.dark .atempo-cal {
  --ac-bg: #0f172a;
  --ac-border-color: #334155;
  --ac-grid-bg: #334155;
  --ac-primary-text: #f1f5f9;
  --ac-secondary-text: #94a3b8;
  --ac-header-bg: #0f172a;
  --ac-day-header-bg: #1e293b;
  --ac-resource-name-bg: #1e293b;
  --ac-day-cell-bg: #1e293b;
}
.dev-container.dark .atempo-cal .atempo-cal__btn {
  color: var(--ac-secondary-text);
}
.dev-container.dark .atempo-cal .atempo-cal__date-navigation,
.dev-container.dark .atempo-cal .atempo-cal__view-controls {
  background: #1e293b;
}
.dev-container.dark .atempo-cal .atempo-cal__btn:hover {
  background: #334155;
  color: var(--ac-primary-text);
}
.dev-container.dark .atempo-cal .atempo-cal__btn--active {
  background: #475569;
  color: var(--ac-primary-text);
}
.dev-container.dark code {
  background-color: #334155;
  color: #e2e8f0;
}
.dev-container.dark header {
  border-color: #334155;
}
.dev-container.dark .test-controls {
  background: #1e293b;
  border-color: #334155;
}
.dev-container.dark .control-group label {
  color: #94a3b8;
}
.dev-container.dark .control-group select,
.dev-container.dark .control-group input[type="range"],
.dev-container.dark .control-group button {
  background-color: #334155;
  border-color: #475569;
  color: #f1f5f9;
}
</style>
