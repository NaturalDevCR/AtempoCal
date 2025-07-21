# AtempoCal

A flexible and resource-centric calendar component for Vue 3, designed for planning and scheduling tasks. AtempoCal is built with TypeScript and leverages the power of the `atemporal` library for robust date and time handling.

## Features

- **Resource-based View**: Organizes events by resources (e.g., people, rooms, equipment).
- **Multiple Views**: Switch between a full week view and a detailed day view.
- **Timezone Aware**: Built on `atemporal` for reliable date/time logic.
- **Customizable**: Use slots to customize rendering and CSS variables for theming.
- **TypeScript Support**: Fully typed for a better development experience.
- **Lightweight**: No heavy dependencies, just Vue and `atemporal`.

## Installation

```bash
npm install atempo-cal atemporal vue
```

## Usage

You can register AtempoCal as a global plugin or import it directly into your components.

### As a Plugin

Register the component globally in your main application file.

```typescript
import { createApp } from 'vue';
import App from './App.vue';
import { AtempoCalPlugin } from 'atempo-cal'; // ✅ Corrección aquí
import 'atempo-cal/dist/style.css'; // Import the CSS

const app = createApp(App);
app.use(AtempoCalPlugin);
app.mount('#app');
```

### As a Component

Import it directly where you need it.

```vue
&lt;script setup lang="ts"&gt;
import { AtempoCal } from 'atempo-cal';
import 'atempo-cal/dist/style.css';
import { ref } from 'vue';
import type { Resource } from 'atempo-cal'; // Import types

const resources = ref&lt;Resource[]&gt;([
  // ... your resource and event data
]);
&lt;/script&gt;

&lt;template&gt;
  &lt;AtempoCal :resources="resources" /&gt;
&lt;/template&gt;
```

## API

### Props

| Prop                      | Type                      | Default                       | Description                                                                 |
| ------------------------- | ------------------------- | ----------------------------- | --------------------------------------------------------------------------- |
| `title`                   | `string`                  | `'Internal Resource Planner'` | The main title displayed in the calendar header.                            |
| `resources`               | `Resource[]`              | `[]`                          | An array of resource objects, each containing its events. Required.         |
| `startDate`               | `Date \| string`          | `new Date()`                  | The initial date the calendar will display.                                 |
| `resourceHeaderText`      | `string`                  | `'Resources'`                 | The text for the header of the resource column.                             |
| `view`                    | `'week' \| 'day'`         | `'week'`                      | The current view of the calendar. Can be controlled externally.             |
| `dayViewItemWidthPercent` | `number`                  | `95`                          | The width percentage for overlapping events in the day view.                |

### Events

| Event           | Payload                               | Description                                                              |
| --------------- | ------------------------------------- | ------------------------------------------------------------------------ |
| `view-change`   | `(view: 'week' \| 'day')`             | Emitted when the user changes the view (e.g., clicks 'Week' or 'Day').   |
| `date-change`   | `(date: Date)`                        | Emitted when the user navigates to a new date period (next/prev/today).  |
| `event-click`   | `(event: CalendarEvent)`              | Emitted when a user clicks on an event chip. The payload is the full event object. |

### Slots

| Name               | Scope (`{ resource }`) | Description                                                              |
| ------------------ | ---------------------- | ------------------------------------------------------------------------ |
| `header-title`     | -                      | Replaces the entire title section in the header.                         |
| `header-controls`  | -                      | Replaces the entire control section (navigation and view switcher).      |
| `resource-label`   | `Resource`             | Customizes the rendering of a resource's name in the resource column.    |

### Data Structures

Here are the primary data structures you'll work with.

**Resource**
```typescript
interface Resource {
  id: string | number;
  name: string;
  color?: string; // Optional: will be assigned a color if not provided
  events: Omit<CalendarEvent, 'resourceId' | 'resourceName' | 'color'>[];
}
```

**CalendarEvent**
```typescript
interface CalendarEvent {
  id: string | number;
  title: string;
  startTime?: Date | string;
  endTime?: Date | string;
  type?: string; // For custom styling via classes
  // The following are added internally:
  resourceId?: string | number;
  resourceName?: string;
  color?: string;
}
```

## Styling

The component comes with a default stylesheet that you should import.

```javascript
import 'atempo-cal/dist/style.css';
```

You can override the default styles using standard CSS. The component uses BEM-like class names (e.g., `.atempo-cal`, `.atempo-cal__header`). For more targeted overrides, you can use more specific selectors.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on our [GitHub repository](https://github.com/your-username/atempo-cal).

## License

[MIT](https://github.com/your-username/atempo-cal/blob/main/LICENSE)
