# AtempoCal

> A highly customizable Vue 3 calendar component built with TypeScript, Tailwind CSS, and the Atemporal library.

[![npm version](https://badge.fury.io/js/atempo-cal.svg)](https://badge.fury.io/js/atempo-cal)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-green.svg)](https://vuejs.org/)

## ✨ Features

- 📅 **Multiple Views**: Weekly and daily calendar views with intelligent event positioning
- 🎨 **Highly Customizable**: Configurable fields, actions, and styling
- 🌍 **Internationalization**: Built-in i18n support using Atemporal's localization
- 🕐 **Timezone Support**: Global timezone configuration with Atemporal integration
- 🌙 **Dark/Light Theme**: Automatic theme switching with smooth transitions
- 📱 **Responsive Design**: Mobile-adaptive with touch-friendly interactions
- ⚡ **Performance Optimized**: Efficient rendering and state management
- 🔧 **TypeScript**: Full type safety and excellent developer experience
- 🎯 **Framework Agnostic**: Easy integration with Vue 3, Nuxt, Quasar, and more
- 👥 **Advanced Resource Management**: World-class resource scheduling with overlap prevention
- 🚫 **No Event Overlaps**: Intelligent column-based positioning prevents visual conflicts
- 🏷️ **Integrated Resource Display**: Resources shown within events for clear identification

## 🚀 Quick Start

### Installation

```bash
npm install atempo-cal
# or
yarn add atempo-cal
# or
pnpm add atempo-cal
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

// Sample events
const events = ref<CalendarEvent[]>([
  {
    id: '1',
    title: 'Team Meeting',
    startTime: '2024-01-15T09:00:00Z',
    endTime: '2024-01-15T10:00:00Z',
    resourceId: 'room-a',
    color: '#3B82F6'
  }
])

// Sample resources
const resources = ref<CalendarResource[]>([
  {
    id: 'room-a',
    name: 'Conference Room A',
    color: '#3B82F6'
  }
])

// Configuration
const config = ref<CalendarConfig>({
  timezone: 'America/New_York',
  locale: 'en-US',
  startHour: 8,
  endHour: 18,
  slotDuration: 30
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
  startHour?: number
  endHour?: number
  slotDuration?: number // minutes
  showWeekends?: boolean
  firstDayOfWeek?: number // 0-6, 0 = Sunday
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

### Quasar

```typescript
// quasar.config.js
module.exports = {
  framework: {
    plugins: ['AtempoCal']
  }
}

// boot/atempo-cal.ts
import { boot } from 'quasar/wrappers'
import AtempoCal from 'atempo-cal'
import 'atempo-cal/dist/style.css'

export default boot(({ app }) => {
  app.use(AtempoCal)
})
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

## 🌍 Internationalization

AtempoCal leverages the Atemporal library's built-in internationalization:

```vue
<template>
  <AtempoCal
    :config="{
      locale: 'es-ES', // Spanish
      timezone: 'Europe/Madrid'
    }"
  />
</template>
```

Supported locales include all standard IETF language tags. The component automatically formats dates, times, and day names according to the specified locale.

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
git clone https://github.com/your-org/atempo-cal.git
cd atempo-cal

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

- 📖 [Documentation](https://github.com/your-org/atempo-cal#readme)
- 🐛 [Issue Tracker](https://github.com/your-org/atempo-cal/issues)
- 💬 [Discussions](https://github.com/your-org/atempo-cal/discussions)

---

<p align="center">
  Made with ❤️ by the AtempoCal Team
</p>