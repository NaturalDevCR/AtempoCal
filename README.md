# AtempoCal

> A high-performance Vue 3 weekly scheduling calendar component designed for worker/resource management with Spanish localization, dark/light theme support, and comprehensive TypeScript integration.

[![npm version](https://badge.fury.io/js/atempo-cal.svg)](https://badge.fury.io/js/atempo-cal)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-green.svg)](https://vuejs.org/)

## ✨ Features

- 📅 **Weekly Scheduling Focus**: Exclusively designed for weekly calendar view and resource scheduling
- 👥 **Worker/Resource Management**: Advanced employee/resource scheduling with detailed metadata support
- 🇪🇸 **Spanish Localization**: Built-in Spanish date formatting with memoized performance optimization
- 🌙 **Dark/Light Theme**: Automatic theme detection with smooth transitions and prop-based configuration
- 🎨 **Modern UI**: Clean, professional interface with integrated styling (borders, shadows, rounded corners)
- 🕐 **Timezone Support**: Global timezone configuration with Atemporal library integration
- 🌍 **Internationalization**: Built-in i18n support for multiple locales
- 🔧 **TypeScript**: Full type safety with comprehensive type definitions
- 📱 **Perfect Responsive Design**: Mobile-first approach with horizontal scrolling, vertical navbar stacking, and optimized touch interactions
- 🚫 **Smart Event Stacking**: Intelligent vertical stacking prevents visual overlaps
- 🏷️ **Multi-Day Events**: Seamless handling of events spanning multiple days with date ranges
- ⏰ **Time Display**: Time ranges for single-day events, title + date range for multi-day events
- ⚡ **Performance Optimized**: Memoization caches, debounced navigation, hardware acceleration
- 🎯 **Easy Integration**: Works with Vue 3, Nuxt, Quasar, and other Vue-based frameworks
- 🎛️ **Self-Contained Styling**: No wrapper divs needed - component includes integrated visual styling

## 🚀 Quick Start

### Installation

```bash
# npm
npm install atempo-cal

# yarn
yarn add atempo-cal

# pnpm
pnpm add atempo-cal
```

### Peer Dependencies

AtempoCal requires the following peer dependencies:

```bash
npm install vue@^3.5.22 atemporal@0.1.9
```

### Basic Usage

```vue
<template>
  <div>
    <AtempoCal
      :events="events"
      :resources="resources"
      :config="config"
      :theme="theme"
      @event-click="handleEventClick"
      @event-create="handleEventCreate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AtempoCal from 'atempo-cal'
import type { CalendarEvent, CalendarResource, CalendarConfig } from 'atempo-cal'
import 'atempo-cal/dist/style.css'

// Sample events for worker scheduling
const events = ref<CalendarEvent[]>([
  {
    id: '1',
    title: 'Morning Shift',
    startTime: '2024-01-15T06:00:00Z',
    endTime: '2024-01-15T14:00:00Z',
    resourceId: 'emp-001',
    color: '#3B82F6',
    metadata: { type: 'shift', shiftType: 'morning' }
  },
  {
    id: '2',
    title: 'Annual Leave',
    startTime: '2024-01-16T00:00:00Z',
    endTime: '2024-01-18T23:59:59Z',
    resourceId: 'emp-002',
    color: '#10B981',
    isAllDay: true,
    metadata: { type: 'time-off', category: 'vacation' }
  }
])

// Sample workers/resources
const resources = ref<CalendarResource[]>([
  {
    id: 'emp-001',
    name: 'John Smith',
    color: '#3B82F6',
    metadata: {
      department: 'Operations',
      role: 'Shift Supervisor',
      email: 'john.smith@company.com'
    }
  },
  {
    id: 'emp-002',
    name: 'Sarah Johnson',
    color: '#10B981',
    metadata: {
      department: 'Customer Service',
      role: 'Team Lead',
      email: 'sarah.johnson@company.com'
    }
  }
])

// Configuration for weekly scheduling calendar
const config = ref<CalendarConfig>({
  timezone: 'America/New_York',
  locale: 'en-US',
  showWeekends: true,
  firstDayOfWeek: 1, // Monday
  showEventTitles: true // Show event titles for single-day events
})

// Theme configuration
const theme = ref<'light' | 'dark' | 'auto'>('auto')

const handleEventClick = (event: CalendarEvent) => {
  console.log('Event clicked:', event)
}

const handleEventCreate = (eventData: Partial<CalendarEvent>) => {
  console.log('Create event:', eventData)
}
</script>
```

## 🎨 Event Display Configuration

AtempoCal provides flexible event display options to customize how events appear in the calendar:

### Show/Hide Event Titles

Control whether single-day events display their titles or show only time information:

```vue
<template>
  <div>
    <!-- Toggle for event title display -->
    <label>
      <input v-model="showTitles" type="checkbox" />
      Show Event Titles
    </label>
    
    <!-- Calendar with configurable event display -->
    <AtempoCal
      :events="events"
      :resources="resources"
      :config="{
        showEventTitles: showTitles
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Control event title display
const showTitles = ref(true)
</script>
```

**Display Modes:**

- **`showEventTitles: true`** (default): Single-day events show both title and time
- **`showEventTitles: false`**: Single-day events show only time information
- **Multi-day events**: Always display title and date range regardless of this setting

**Use Cases:**

- **Time-only mode**: Perfect for dense schedules where you want to focus on time slots
- **Full display mode**: Ideal when event details are important for quick identification
- **Responsive design**: Switch modes based on screen size or user preference

## 📚 Documentation

### Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `events` | `CalendarEvent[]` | `[]` | Array of calendar events |
| `resources` | `CalendarResource[]` | `[]` | Array of calendar resources |
| `config` | `CalendarConfig` | `{}` | Calendar configuration options |
| `selectedDate` | `string` | `undefined` | Currently selected date (ISO string) |
| `eventActions` | `EventAction[]` | `[]` | Custom actions for events |
| `customFields` | `CustomField[]` | `[]` | Custom field definitions |
| `loading` | `boolean` | `false` | Loading state |
| `readonly` | `boolean` | `false` | Read-only mode |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | Theme configuration |

### Component Events

| Event | Payload | Description |
|-------|---------|-------------|
| `event-click` | `CalendarEvent` | Fired when an event is clicked |
| `event-create` | `Partial<CalendarEvent>` | Fired when creating a new event |
| `event-update` | `CalendarEvent` | Fired when updating an event |
| `event-delete` | `string` | Fired when deleting an event (event ID) |
| `date-change` | `string` | Fired when the selected date changes |
| `view-change` | `CalendarView` | Fired when the view changes |
| `slot-click` | `SlotClickInfo` | Fired when clicking on a time slot |

### Type Definitions

```typescript
interface CalendarEvent {
  id: string
  title: string
  description?: string
  startTime: string // ISO 8601 format
  endTime: string // ISO 8601 format
  resourceId?: string
  color?: string
  metadata?: Record<string, any>
  isAllDay?: boolean
}

interface CalendarResource {
  id: string
  name: string
  color?: string
  avatar?: string
  metadata?: Record<string, any>
}

interface CalendarConfig {
  timezone?: string
  locale?: string
  theme?: 'light' | 'dark' | 'auto'
  showWeekends?: boolean
  firstDayOfWeek?: number // 0-6, 0 = Sunday
  showEventTitles?: boolean // Show event titles for single-day events (default: true)
}
```

## 🔧 Framework Integration

### Vue 3 + Vite

```typescript
// main.ts
import { createApp } from 'vue'
import AtempoCal from 'atempo-cal'
import 'atempo-cal/dist/style.css'

const app = createApp(App)
app.use(AtempoCal)
app.mount('#app')
```

### Nuxt 3

```typescript
// plugins/atempo-cal.client.ts
import AtempoCal from 'atempo-cal'
import 'atempo-cal/dist/style.css'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(AtempoCal)
})
```

### Quasar Framework

AtempoCal is fully compatible with Quasar Framework. The component includes specific CSS fixes to ensure proper grid rendering and alignment:

**Step 1: Create Boot File**

```typescript
// src/boot/atempo-cal.ts
import { boot } from 'quasar/wrappers'
import AtempoCal from 'atempo-cal'
import 'atempo-cal/dist/style.css'

export default boot(({ app }) => {
  app.use(AtempoCal)
})
```

**Step 2: Register Boot File**


**Quasar Compatibility Features:**
- ✅ **Grid Lines**: Strengthened border declarations with `!important` to override Quasar's CSS reset
- ✅ **Proper Alignment**: Fixed flexbox and grid layouts to work correctly within Quasar components
- ✅ **Framework Isolation**: CSS box-sizing and display properties are protected from framework interference
- ✅ **Border Visibility**: All calendar borders are explicitly defined to ensure visibility
- ✅ **Responsive Design**: Maintains responsive behavior within Quasar's layout system

**Step 3: Usage in Quasar Pages**

```vue
<template>
  <q-page class="q-pa-md">
    <div class="row">
      <div class="col-12">
        <!-- AtempoCal works perfectly within Quasar layouts -->
        <AtempoCal
          :events="events"
          :resources="resources"
          :config="config"
        />
      </div>
    </div>
  </q-page>
</template>
```

**Alternative: Local Component Import**

If you prefer not to register globally, you can import the component locally:

```vue
<template>
  <q-page class="q-pa-md">
    <AtempoCal :events="events" :resources="resources" />
  </q-page>
</template>

<script setup lang="ts">
import AtempoCal from 'atempo-cal'
import 'atempo-cal/dist/style.css'

// Your component logic here
</script>
```

### Direct Component Import

```vue
<script setup lang="ts">
// Import only the component (smaller bundle)
import { AtempoCal } from 'atempo-cal'
import 'atempo-cal/dist/style.css'
</script>
```

## 🎨 Theming

AtempoCal supports both light and dark themes with automatic detection. Configure themes using the `theme` prop:

```vue
<template>
  <div>
    <!-- Theme buttons -->
    <div class="theme-controls">
      <button @click="theme = 'light'">Light</button>
      <button @click="theme = 'dark'">Dark</button>
      <button @click="theme = 'auto'">Auto</button>
    </div>
    
    <!-- Calendar with theme prop -->
    <AtempoCal
      :events="events"
      :resources="resources"
      :config="config"
      :theme="theme"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Theme configuration - controlled by parent component
const theme = ref<'light' | 'dark' | 'auto'>('auto')
</script>
```

### Theme Options

- **`'light'`**: Force light theme
- **`'dark'`**: Force dark theme  
- **`'auto'`**: Automatically detect system preference

### Custom Styling

The component uses CSS custom properties (CSS variables) for easy theme customization:

```css
/* Override theme colors */
:root {
  /* Light theme customization */
  --atempo-bg-primary: #ffffff;
  --atempo-bg-secondary: #f9fafb;
  --atempo-text-primary: #111827;
  --atempo-accent-primary: #3b82f6;
  --atempo-success: #10b981;
  --atempo-warning: #f59e0b;
  --atempo-error: #ef4444;
}

.dark {
  /* Dark theme customization */
  --atempo-bg-primary: #111827;
  --atempo-bg-secondary: #1f2937;
  --atempo-text-primary: #f9fafb;
  --atempo-accent-primary: #60a5fa;
}

/* Component-specific overrides */
.atempo-cal {
  /* Custom calendar styling */
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
```

#### Self-Contained Styling

AtempoCal comes with integrated border, shadow, and rounded corner styling built directly into the component. This means you can use the component without any wrapper divs and it will maintain its professional appearance:

```vue
<!-- ✅ Works perfectly - no wrapper needed -->
<template>
  <AtempoCal :events="events" :resources="resources" />
</template>

<!-- ❌ No longer necessary -->
<template>
  <div class="bg-white rounded-lg shadow border">
    <AtempoCal :events="events" :resources="resources" />
  </div>
</template>
```

The component automatically includes:
- **Border radius**: `0.5rem` rounded corners
- **Box shadow**: Subtle `0 1px 2px 0 rgba(0, 0, 0, 0.05)` shadow
- **Border**: Theme-aware border using `--atempo-border-primary`
- **Overflow**: Hidden to maintain clean rounded appearance
- **Background**: Theme-aware background using `--atempo-bg-primary`

### Available CSS Variables

| Variable | Description | Light Default | Dark Default |
|----------|-------------|---------------|---------------|
| `--atempo-bg-primary` | Primary background | `#ffffff` | `#111827` |
| `--atempo-bg-secondary` | Secondary background | `#f9fafb` | `#1f2937` |
| `--atempo-bg-tertiary` | Tertiary background | `#f3f4f6` | `#374151` |
| `--atempo-text-primary` | Primary text color | `#111827` | `#f9fafb` |
| `--atempo-text-secondary` | Secondary text color | `#6b7280` | `#d1d5db` |
| `--atempo-border-primary` | Primary border color | `#e5e7eb` | `#374151` |
| `--atempo-accent-primary` | Primary accent color | `#3b82f6` | `#60a5fa` |
| `--atempo-success` | Success color | `#10b981` | `#34d399` |
| `--atempo-warning` | Warning color | `#f59e0b` | `#fbbf24` |
| `--atempo-error` | Error color | `#ef4444` | `#f87171` |

## 🌍 Internationalization & Spanish Localization

AtempoCal features built-in Spanish localization with optimized performance:

### Spanish Date Formatting

The component includes native Spanish date formatting with memoized caching for optimal performance:

```vue
<template>
  <!-- Spanish localization is built-in and automatically used -->
  <AtempoCal
    :events="events"
    :resources="resources"
    :config="{
      locale: 'es-ES',
      timezone: 'Europe/Madrid'
    }"
  />
</template>
```

**Spanish Features:**
- **Date Format**: "22 sept" (day + Spanish month abbreviation)
- **Day Names**: "LUN", "MAR", "MIE", "JUE", "VIE", "SÁB", "DOM"
- **Month Abbreviations**: "ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"
- **Performance Optimized**: Memoized caching prevents redundant date calculations

### Performance Optimizations

The Spanish date helpers include several performance optimizations:

```typescript
// Memoization caches for performance
const spanishMonthCache = new Map<string, string>()
const spanishDayCache = new Map<string, string>()
const spanishDateCache = new Map<string, string>()

// Cached Spanish month formatting
export const getSpanishMonth = (date: Atemporal): string => {
  const cacheKey = `${date.year}-${date.month}`
  if (spanishMonthCache.has(cacheKey)) {
    return spanishMonthCache.get(cacheKey)!
  }
  // ... formatting logic with cache storage
}
```

### Other Locales

AtempoCal leverages the Atemporal library's built-in internationalization for other locales:

```vue
<template>
  <AtempoCal
    :config="{
      locale: 'en-US', // English
      timezone: 'America/New_York'
    }"
  />
</template>
```

Supported locales include all standard IETF language tags. The component automatically formats dates, times, and day names according to the specified locale.

## ⚡ Performance Optimizations

AtempoCal includes comprehensive performance optimizations for smooth, responsive user experience:

### Memoization & Caching

**Event Filtering Cache**: Expensive event filtering operations are memoized to prevent redundant calculations:

```typescript
// Cached event filtering for workers and dates
const eventFilterCache = new Map<string, CalendarEvent[]>()
const multiDayEventCache = new Map<string, CalendarEvent[]>()

// Cache invalidation on data changes
watch([() => props.events, () => props.resources], () => {
  eventFilterCache.clear()
  multiDayEventCache.clear()
}, { deep: true })
```

**Spanish Date Helpers**: All Spanish date formatting functions use memoization:
- `getSpanishMonth()` - Cached month abbreviations
- `getSpanishDay()` - Cached day names  
- `formatSpanishDate()` - Cached complete date strings

**Worker Row Heights**: Dynamic height calculations are cached to prevent layout thrashing:

```typescript
const workerRowHeightCache = new Map<string, number>()

const getWorkerRowHeight = (workerId: string): number => {
  if (workerRowHeightCache.has(workerId)) {
    return workerRowHeightCache.get(workerId)!
  }
  // Calculate and cache height
}
```

### Debounced Interactions

**Navigation Functions**: Navigation actions are debounced to prevent rapid-fire updates:

```typescript
const debouncedNavigatePrevious = debounce(() => {
  navigatePrevious()
}, 150)

const debouncedNavigateNext = debounce(() => {
  navigateNext()
}, 150)
```

### Vue.js Optimizations

**v-memo Directives**: Expensive list rendering uses `v-memo` for intelligent re-rendering:

```vue
<template>
  <!-- Day headers with memoization -->
  <div
    v-for="date in weekDates"
    :key="date.toString()"
    v-memo="[date.toString(), isToday(date), isWeekend(date)]"
    class="day-header"
  >
    <!-- content -->
  </div>
  
  <!-- Worker rows with memoization -->
  <div
    v-for="worker in displayWorkers"
    :key="worker.id"
    v-memo="[worker.id, worker.name, worker.color, getWorkerRowHeight(worker.id)]"
    class="resource-row"
  >
    <!-- content -->
  </div>
</template>
```

### CSS Hardware Acceleration

**Transform3D**: Critical animations use hardware acceleration:

```css
.atempo-cal {
  transform: translate3d(0, 0, 0);
  will-change: transform;
}

.resource-row {
  transform: translate3d(0, 0, 0);
  will-change: height;
}

.stacked-event {
  transform: translate3d(0, 0, 0);
  will-change: transform, opacity;
}
```

**Optimized Scrolling**: Smooth scrolling with momentum and hardware acceleration:

```css
.week-content {
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
  transform: translate3d(0, 0, 0);
}
```

### Memory Management

**Cache Invalidation**: Automatic cache clearing prevents memory leaks:

```typescript
// Clear caches when component unmounts
onUnmounted(() => {
  eventFilterCache.clear()
  multiDayEventCache.clear()
  workerRowHeightCache.clear()
  spanishMonthCache.clear()
  spanishDayCache.clear()
  spanishDateCache.clear()
})
```

**Shallow Reactivity**: Non-critical data uses `shallowRef` for better performance:

```typescript
const workerRowHeightCache = shallowRef(new Map<string, number>())
const eventFilterCache = shallowRef(new Map<string, CalendarEvent[]>())
```

### Performance Monitoring

For development and debugging, you can monitor cache performance:

```typescript
// Enable performance logging in development
if (import.meta.env.DEV) {
  console.log('Event filter cache size:', eventFilterCache.size)
  console.log('Spanish date cache size:', spanishDateCache.size)
  console.log('Worker height cache size:', workerRowHeightCache.size)
}
```

## 📱 Perfect Responsive Design

AtempoCal features a mobile-first responsive design that provides an optimal experience across all devices:

### Mobile-First Approach

**Horizontal Scrolling**: On mobile devices, the calendar enables smooth horizontal scrolling to view all days of the week:

```css
/* Automatic horizontal scrolling on mobile */
.weekly-view {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.week-header,
.week-content {
  min-width: 850px; /* Ensures all 7 days are visible */
}
```

**Vertical Navbar Stacking**: The navigation bar automatically reorganizes on mobile devices:

- **Desktop**: Horizontal layout (left | center | right)
- **Mobile**: Vertical stacking (center on top, left in middle, right at bottom)

```vue
<template>
  <!-- Desktop: horizontal layout -->
  <div class="nav-desktop-layout">
    <div class="nav-left"><!-- Navigation controls --></div>
    <div class="nav-center"><!-- Title display --></div>
    <div class="nav-right"><!-- Date picker --></div>
  </div>

  <!-- Mobile: vertical stacked layout -->
  <div class="nav-mobile-layout">
    <div class="nav-mobile-center"><!-- Title on top --></div>
    <div class="nav-mobile-left"><!-- Controls in middle --></div>
    <div class="nav-mobile-right"><!-- Date picker at bottom --></div>
  </div>
</template>
```

### Responsive Features

- **Touch-Optimized Scrolling**: Smooth momentum scrolling with `-webkit-overflow-scrolling: touch`
- **Grid Alignment**: Perfect alignment between header and content sections across all screen sizes
- **Flexible Widths**: Dynamic column widths that adapt to content while maintaining readability
- **Preserved Functionality**: All features work seamlessly on mobile, including fixed height and event interactions

### Breakpoints

```scss
// Mobile breakpoint
@media (max-width: 768px) {
  // Mobile-specific styles
}

// Desktop breakpoint
@media (min-width: 769px) {
  // Desktop-specific styles
}
```

### Configuration Options

The responsive behavior works automatically, but you can control scroll behavior:

```vue
<template>
  <AtempoCal
    :config="{
      maxWorkersBeforeScroll: 5,
      fixedHeight: '600px',
      enableAutoScroll: true
    }"
  />
</template>
```

## ⚡ Advanced Usage

### Resource Management

AtempoCal provides world-class resource management capabilities, perfect for scheduling workers, rooms, or equipment:

```vue
<template>
  <AtempoCal
    :events="events"
    :resources="resources"
    :config="config"
    @event-click="handleEventClick"
    @event-create="handleEventCreate"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { CalendarEvent, CalendarResource } from 'atempo-cal'

// Define resources (workers, rooms, equipment, etc.)
const resources = ref<CalendarResource[]>([
  {
    id: 'worker-1',
    name: 'John Smith',
    color: '#3B82F6',
    metadata: {
      role: 'Senior Developer',
      department: 'Engineering'
    }
  },
  {
    id: 'worker-2',
    name: 'Sarah Johnson',
    color: '#10B981',
    metadata: {
      role: 'UX Designer',
      department: 'Design'
    }
  }
])

// Events with resource assignments
const events = ref<CalendarEvent[]>([
  {
    id: '1',
    title: 'Project Planning',
    startTime: '2024-01-15T09:00:00Z',
    endTime: '2024-01-15T11:00:00Z',
    resourceId: 'worker-1', // Assigned to John Smith
    color: '#3B82F6'
  },
  {
    id: '2',
    title: 'Design Review',
    startTime: '2024-01-15T10:00:00Z',
    endTime: '2024-01-15T12:00:00Z',
    resourceId: 'worker-2', // Assigned to Sarah Johnson
    color: '#10B981'
  }
])
</script>
```

### Key Resource Management Features

- **No Visual Overlaps**: Advanced column-based positioning ensures events never visually overlap
- **Integrated Resource Display**: Resource information is shown within event cards for clear identification
- **Unified Daily View**: Daily view shows all events in a single column with resource badges
- **Intelligent Positioning**: Events are automatically positioned to prevent conflicts while maximizing space usage

### Custom Navbar Slots

AtempoCal provides three slots for customizing the navigation bar:

```vue
<template>
  <AtempoCal
    :events="events"
    :resources="resources"
  >
    <!-- Customize left section (navigation controls) -->
    <template #navbar-left="{ navigatePrevious, navigateNext, navigateToday, loading }">
      <div class="custom-nav-controls">
        <button @click="navigatePrevious" :disabled="loading">
          ← Previous
        </button>
        <button @click="navigateNext" :disabled="loading">
          Next →
        </button>
        <button @click="navigateToday" :disabled="loading">
          Today
        </button>
      </div>
    </template>

    <!-- Customize center section (title display) -->
    <template #navbar-center="{ displayTitle, currentDate }">
      <div class="custom-title">
        <h2>{{ displayTitle }}</h2>
        <p>Custom Calendar - {{ currentDate.format('YYYY') }}</p>
      </div>
    </template>

    <!-- Customize right section (date picker and controls) -->
    <template #navbar-right="{ currentDate, onDateChange, showDatePicker, toggleDatePicker }">
      <div class="custom-controls">
        <input
          type="date"
          :value="currentDate.format('YYYY-MM-DD')"
          @change="(e) => onDateChange(e.target.value)"
        />
        <button v-if="showDatePicker" @click="toggleDatePicker">
          📅
        </button>
      </div>
    </template>
  </AtempoCal>
</template>
```

#### Available Slot Props

**navbar-left slot:**
- `navigatePrevious()` - Function to navigate to previous week
- `navigateNext()` - Function to navigate to next week
- `navigateToday()` - Function to navigate to current week
- `loading` - Boolean indicating if navigation is in progress
- `previousTitle` - Tooltip text for previous button
- `nextTitle` - Tooltip text for next button

**navbar-center slot:**
- `displayTitle` - Formatted title string (e.g., "January 15 - 21, 2024")
- `currentDate` - Current Atemporal date object

**navbar-right slot:**
- `currentDate` - Current Atemporal date object
- `onDateChange(date: string)` - Function to change the current date
- `showDatePicker` - Boolean indicating if date picker should be shown
- `toggleDatePicker()` - Function to toggle date picker modal

### Custom Event Actions

```vue
<template>
  <AtempoCal
    :events="events"
    :event-actions="customActions"
  />
</template>

<script setup lang="ts">
const customActions = [
  {
    id: 'edit',
    label: 'Edit Event',
    icon: 'pencil',
    handler: (event) => editEvent(event)
  },
  {
    id: 'duplicate',
    label: 'Duplicate',
    icon: 'copy',
    handler: (event) => duplicateEvent(event),
    condition: (event) => event.metadata?.canDuplicate
  }
]
</script>
```

### Using Composables

```vue
<script setup lang="ts">
import { useCalendar, useEvents, useTheme } from 'atempo-cal'

// Calendar state management
const {
  currentDate,
  currentView,
  navigateToDate,
  navigateNext,
  navigatePrevious
} = useCalendar()

// Event management
const {
  events,
  createEvent,
  updateEvent,
  deleteEvent
} = useEvents()

// Theme management
const {
  currentTheme,
  toggleTheme
} = useTheme()
</script>
```

## 🛠️ Development

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Setup

```bash
# Clone the repository
git clone https://github.com/NaturalDevCR/AtempoCal.git
cd AtempoCal

# Install dependencies
npm install

# Start development server (demo)
npm run dev

# Build library
npm run build

# Run tests
npm run check
```

### Project Structure

```
atempo-cal/
├── src/                    # Library source code
│   ├── components/         # Vue components
│   ├── composables/        # Vue composables
│   ├── types/             # TypeScript definitions
│   ├── utils/             # Utility functions
│   └── index.ts           # Library entry point
├── demo/                  # Demo application
│   ├── src/
│   └── index.html
├── dist/                  # Built library
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Development Guidelines

1. **Code Quality**: Follow TypeScript best practices and maintain test coverage
2. **Atemporal Usage**: Use the Atemporal library exclusively for all date/time operations
3. **Accessibility**: Ensure components are accessible and keyboard navigable
4. **Performance**: Optimize for performance and bundle size
5. **Documentation**: Update documentation for any API changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Atemporal](https://github.com/NaturalDevCR/atemporal) - Modern date-time library with Temporal API
- [Vue 3](https://vuejs.org/) - Progressive JavaScript framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Heroicons](https://heroicons.com/) - Beautiful hand-crafted SVG icons

## 📞 Support

- 📖 [Documentation](https://github.com/NaturalDevCR/AtempoCal#readme)
- 🐛 [Issue Tracker](https://github.com/NaturalDevCR/AtempoCal/issues)
- 💬 [Discussions](https://github.com/NaturalDevCR/AtempoCal/discussions)

---

<p align="center">
  Made with ❤️ by the AtempoCal Team
</p>