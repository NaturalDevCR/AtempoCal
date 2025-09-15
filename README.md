# AtempoCal

> A highly customizable Vue 3 calendar component built with TypeScript, Tailwind CSS, and the Atemporal library.

[![npm version](https://badge.fury.io/js/atempo-cal.svg)](https://badge.fury.io/js/atempo-cal)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-green.svg)](https://vuejs.org/)

## ✨ Features

- 📅 **Multiple Views**: Weekly and daily calendar views
- 🎨 **Highly Customizable**: Configurable fields, actions, and styling
- 🌍 **Internationalization**: Built-in i18n support using Atemporal's localization
- 🕐 **Timezone Support**: Global timezone configuration with Atemporal integration
- 🌙 **Dark/Light Theme**: Automatic theme switching with smooth transitions
- 📱 **Responsive Design**: Mobile-adaptive with touch-friendly interactions
- ⚡ **Performance Optimized**: Efficient rendering and state management
- 🔧 **TypeScript**: Full type safety and excellent developer experience
- 🎯 **Framework Agnostic**: Easy integration with Vue 3, Nuxt, Quasar, and more

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
| `view` | `'week' \| 'day'` | `'week'` | Current calendar view |
| `selectedDate` | `string` | `undefined` | Currently selected date (ISO string) |
| `eventActions` | `EventAction[]` | `[]` | Custom actions for events |
| `customFields` | `CustomField[]` | `[]` | Custom field definitions |
| `loading` | `boolean` | `false` | Loading state |
| `readonly` | `boolean` | `false` | Read-only mode |

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

AtempoCal supports both light and dark themes with automatic detection:

```vue
<template>
  <AtempoCal
    :config="{
      theme: 'auto', // 'light' | 'dark' | 'auto'
    }"
  />
</template>
```

### Custom Styling

The component uses Tailwind CSS classes and CSS custom properties for easy customization:

```css
/* Override default colors */
.atempo-cal {
  --primary-color: #your-color;
  --background-color: #your-bg-color;
}
```

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