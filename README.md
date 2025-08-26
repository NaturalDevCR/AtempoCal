# AtempoCal

A flexible and resource-centric calendar component for Vue 3, designed for planning and scheduling tasks. AtempoCal is built with TypeScript and leverages the power of the `atemporal` library for robust date and time handling.

## Features

- **Resource-based View**: Organizes events by resources (e.g., people, rooms, equipment).
- **Multiple Views**: Switch between a full week view and a detailed day view.
- **Enhanced Event Creation & Editing**: Modern modal-based interface with multiple interaction methods.
- **Drag-to-Create Events**: Drag on empty cells to create events with specific time ranges.
- **Multiple Interaction Patterns**: Click, double-click, drag, and right-click for intuitive event management.
- **Smart Add Button**: Intelligent positioning that automatically avoids overlapping with existing events.
- **Inline Event Actions**: Quick edit buttons that appear on hover for seamless event management.
- **Modern UI/UX**: Beautiful animations, visual feedback, and contemporary design patterns.
- **Form Validation**: Comprehensive validation with helpful error messages and real-time feedback.
- **Customizable Event Display**: Show time, title, description, location, or any custom field in week view events.
- **Autonomous Operation**: Works without external state management while still supporting controlled mode.
- **Configurable Dimensions**: Set custom height and width through styleOptions.
- **Performance Optimized**: Memoized calculations and optimized rendering for better performance.
- **Timezone Aware**: Built on `atemporal` for reliable date/time logic.
- **Customizable**: Use slots to customize rendering and CSS variables for theming.
- **TypeScript Support**: Fully typed for a better development experience.
- **Lightweight**: No heavy dependencies, just Vue and `atemporal`.

## Installation

```bash
npm install atempo-cal atemporal vue
```

## Smart Positioning & Enhanced Features

### Smart Add Button Positioning

The add event button now features intelligent positioning that automatically detects existing events and positions itself to avoid overlaps. The `addButtonPosition` prop offers several options:

- **`'smart'` (default)**: Automatically finds the best position to avoid overlapping with events
- **`'center'`**: Always positions the button in the center of the time slot
- **`'top-left'`, `'top-right'`, `'bottom-left'`, `'bottom-right'`**: Fixed corner positions

When events are present, the button automatically becomes smaller and less intrusive while maintaining full functionality.

### Customizable Event Display

Control what information is displayed in week view events using the `eventDisplayField` prop:

- **`'time'` (default)**: Shows the event time range
- **`'title'`**: Shows the event title
- **`'description'`**: Shows the event description
- **`'location'`**: Shows the event location
- **Custom field name**: Display any field from your event objects

If the specified field is empty, it gracefully falls back to showing the time.

### Enhanced Event Creation & Editing

AtempoCal now features a completely redesigned event creation and editing system with modern UI/UX patterns:

#### Multiple Interaction Methods

- **Click + Add Button**: Hover over any cell to reveal the smart add button, then click to create events
- **Double-Click**: Double-click any empty cell for instant event creation with default time ranges
- **Drag-to-Create**: Click and drag on empty cells to create events with custom time ranges
- **Inline Editing**: Hover over existing events to reveal quick edit buttons
- **Right-Click**: Right-click events for quick access to editing options

#### Modern Event Form Modal

- **Comprehensive Form**: Title, time range, description, location, and event type fields
- **Real-time Validation**: Instant feedback with helpful error messages
- **Duration Calculator**: Automatically calculates and displays event duration
- **Smart Defaults**: Intelligent default values based on interaction context
- **Responsive Design**: Optimized for both desktop and mobile devices

#### Enhanced Visual Design

- **Smooth Animations**: Fluid transitions and hover effects for better user experience
- **Visual Feedback**: Clear indicators for drag operations and interactive states
- **Modern Styling**: Contemporary design with gradients, shadows, and backdrop filters
- **Event Type Styling**: Different visual styles for meeting, focus, training, urgent, and break events
- **Dark Mode Support**: Full dark mode compatibility for all new features

### Performance Optimizations

- **Memoized Calculations**: Expensive computations are cached to improve rendering performance
- **Optimized Event Positioning**: Enhanced algorithms for better event layout calculations
- **Efficient Re-rendering**: Smart updates that only re-render when necessary

## Usage

You can register AtempoCal as a global plugin or import it directly into your components.

### As a Plugin

Register the component globally in your main application file.

```typescript
import { AtempoCalPlugin } from 'atempo-cal';
import 'atempo-cal/style.css';

const app = createApp(App);
app.use(AtempoCalPlugin);
app.mount('#app');
```

### As a Component

Import it directly where you need it.

```vue
<script setup lang="ts">
import { AtempoCal } from 'atempo-cal';
import 'atempo-cal/dist/style.css';
import { ref } from 'vue';
import type { Resource } from 'atempo-cal'; // Import types

const resources = ref<Resource[]>([
  // ... your resource and event data
]);
</script>

<template>
  <AtempoCal :resources="resources" />
</template>
```

### Advanced Usage Examples

#### Smart Positioning with Custom Event Display

```vue
<template>
  <!-- Show event titles instead of time with smart button positioning -->
  <AtempoCal 
    :resources="resources" 
    event-display-field="title"
    add-button-position="smart"
  />
  
  <!-- Show event locations with fixed button position -->
  <AtempoCal 
    :resources="resources" 
    event-display-field="location"
    add-button-position="top-right"
  />
  
  <!-- Hide add button completely -->
  <AtempoCal 
    :resources="resources" 
    :show-add-button="false"
  />
  
  <!-- Custom field display with fallback to time -->
  <AtempoCal 
    :resources="resources" 
    event-display-field="priority"
    add-button-position="bottom-left"
  />
</template>
```

#### Complete Configuration Example

```vue
<script setup lang="ts">
import { AtempoCal } from 'atempo-cal';
import 'atempo-cal/dist/style.css';
import { ref } from 'vue';
import type { Resource } from 'atempo-cal';

const resources = ref<Resource[]>([
  {
    id: 1,
    name: 'Conference Room A',
    color: '#3B82F6',
    events: [
      {
        id: 1,
        title: 'Team Meeting',
        from: '2024-01-15T09:00:00',
        to: '2024-01-15T10:30:00',
        description: 'Weekly team sync',
        location: 'Room A',
        priority: 'High'
      }
    ]
  }
]);

const handleEventClick = (event) => {
  console.log('Event clicked:', event);
};

const handleAddEvent = (timeSlot) => {
  console.log('Add event at:', timeSlot);
};
</script>

<template>
  <AtempoCal 
    :resources="resources"
    title="Resource Planner"
    event-display-field="title"
    add-button-position="smart"
    :show-add-button="true"
    :dark-mode="false"
    @event-click="handleEventClick"
    @add-event="handleAddEvent"
  />
</template>
```

## API

### Props

| Prop                      | Type                      | Default                       | Description                                                                 |
| ------------------------- | ------------------------- | ----------------------------- | --------------------------------------------------------------------------- |
| `title`                   | `string`                  | `'Internal Resource Planner'` | The main title displayed in the calendar header.                            |
| `resources`               | `Resource[]`              | `[]`                          | An array of resource objects, each containing its events. Required.         |
| `startDate`               | `Date \| string`          | `atemporal().toDate()`        | The initial date the calendar will display. Defaults to current date.       |
| `resourceHeaderText`      | `string`                  | `'Resources'`                 | The text for the header of the resource column.                             |
| `view`                    | `'week' \| 'day'`         | `'week'`                      | The current view of the calendar. If not provided, managed internally.      |
| `styleOptions`            | `object`                  | See below                     | Styling options for the calendar component.                                 |
| `darkMode`                | `boolean`                 | `false`                       | Enables dark mode styling for the calendar.                                 |
| `addButtonPosition`       | `AddButtonPosition`       | `'smart'`                     | Position of the add event button. Options: 'smart', 'center', 'top-left', 'top-right', 'bottom-left', 'bottom-right'. |
| `eventDisplayField`       | `string`                  | `'time'`                      | Field to display in week view events. Options: 'time', 'title', 'description', 'location', or any custom field name. |
| `showAddButton`           | `boolean`                 | `true`                        | Controls visibility of the add event button.                                |

#### styleOptions Object

```typescript
interface StyleOptions {
  height?: string;            // Default: 'auto' (min height for 3 resources)
  width?: string;            // Default: '100%'
  dayViewItemWidthPercent?: number; // Default: 95
}
```

### Events

| Event               | Payload                               | Description                                                              |
| ------------------- | ------------------------------------- | ------------------------------------------------------------------------ |
| `view-change`       | `(view: 'week' \| 'day')`             | Emitted when the user changes the view (e.g., clicks 'Week' or 'Day'). **Always emitted** regardless of whether the `view` prop is provided (controlled vs uncontrolled mode). |
| `date-change`       | `(dateInfo: DateChangeEvent)`         | Emitted when the user navigates to a new date period (next/prev/today). Includes current date, view, and date range information. |
| `time-format-change`| `(format: '12h' \| '24h')`            | Emitted when the user toggles between 12-hour and 24-hour time format using the time format button. |
| `event-click`       | `(event: CalendarEvent)`              | Emitted when a user clicks on an event chip. The payload is the full event object. |
| `add-event`         | `(timeSlot: AddEventPayload)`         | Emitted when the user clicks the add event button. Includes resource and time slot information. **Legacy event** - use `event-create` for new implementations. |
| `event-create`      | `(eventData: Partial<CalendarEvent>)` | **New**: Emitted when a user creates a new event through any interaction method (add button, double-click, drag-to-create). Contains the new event data. |
| `event-update`      | `(eventData: CalendarEvent)`          | **New**: Emitted when a user updates an existing event through the edit modal or inline actions. Contains the updated event data. |
| `event-delete`      | `(eventData: CalendarEvent)`          | **New**: Emitted when a user deletes an event through the edit modal or context actions. Contains the deleted event data. |

#### Event Payload Types

```typescript
// Date change event payload
interface DateChangeEvent {
  currentDate: Date;           // The current selected date
  view: 'week' | 'day';       // Current view mode
  range: {
    start: Date;              // Start of the visible date range
    end: Date;                // End of the visible date range
  };
}

// Add event payload
interface AddEventPayload {
  resourceId: string | number;
  resourceName: string;
  date: Date;
  hour: number;               // 24-hour format (0-23)
}
```

#### Event Usage Examples

```vue
<template>
  <AtempoCal 
    :resources="resources"
    @view-change="handleViewChange"
    @date-change="handleDateChange"
    @time-format-change="handleTimeFormatChange"
    @event-click="handleEventClick"
    @add-event="handleAddEvent"
    @event-create="handleEventCreate"
    @event-update="handleEventUpdate"
    @event-delete="handleEventDelete"
  />
</template>

<script setup lang="ts">
import type { CalendarEvent, DateChangeEvent, AddEventPayload } from 'atempo-cal';

// Handle view changes (week/day)
const handleViewChange = (view: 'week' | 'day') => {
  console.log('View changed to:', view);
  // Update your local state if needed
};

// Handle date navigation
const handleDateChange = (dateInfo: DateChangeEvent) => {
  console.log('Date changed:', {
    currentDate: dateInfo.currentDate,
    view: dateInfo.view,
    weekStart: dateInfo.range.start,
    weekEnd: dateInfo.range.end
  });
};

// Handle time format toggle
const handleTimeFormatChange = (format: '12h' | '24h') => {
  console.log('Time format changed to:', format);
  // Save user preference to localStorage or state
  localStorage.setItem('timeFormat', format);
};

// Handle event clicks
const handleEventClick = (event: CalendarEvent) => {
  console.log('Event clicked:', event);
  // Open event details modal, etc.
};

// Handle add event button clicks (legacy)
const handleAddEvent = (timeSlot: AddEventPayload) => {
  console.log('Add event at:', timeSlot);
  // Open create event modal with pre-filled data
};

// Handle new event creation (recommended)
const handleEventCreate = (eventData: Partial<CalendarEvent>) => {
  console.log('Creating new event:', eventData);
  // Add the event to your data store
  // Example: await api.createEvent(eventData);
};

// Handle event updates
const handleEventUpdate = (eventData: CalendarEvent) => {
  console.log('Updating event:', eventData);
  // Update the event in your data store
  // Example: await api.updateEvent(eventData.id, eventData);
};

// Handle event deletion
const handleEventDelete = (eventData: CalendarEvent) => {
  console.log('Deleting event:', eventData);
  // Remove the event from your data store
  // Example: await api.deleteEvent(eventData.id);
};
</script>
```

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
  from: Date | string;        // Start time (replaces startTime)
  to: Date | string;          // End time (replaces endTime)
  description?: string;       // Event description
  location?: string;          // Event location
  type?: string;              // For custom styling via classes
  // The following are added internally:
  resourceId?: string | number;
  resourceName?: string;
  color?: string;
  start?: Date;               // Processed start date
  end?: Date;                 // Processed end date
  layout?: any;               // Layout information
}
```

**AddButtonPosition**
```typescript
type AddButtonPosition = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'smart';
```

## Performance

AtempoCal v0.1.7+ includes several performance optimizations:

### Memoization
- **Event Processing**: Expensive event calculations are memoized to prevent unnecessary re-computation
- **Position Calculations**: Smart positioning algorithms cache results for better performance
- **Resource Processing**: Resource consolidation and color assignment are optimized

### Optimized Rendering
- **Selective Updates**: Components only re-render when their specific data changes
- **Efficient Event Layout**: Improved algorithms for calculating event positions and overlaps
- **Smart Button Positioning**: Collision detection is optimized to run only when necessary

### Memory Management
- **Computed Properties**: Better use of Vue's reactivity system for automatic dependency tracking
- **Event Listeners**: Optimized event handling to prevent memory leaks
- **DOM Updates**: Minimized DOM manipulations through efficient virtual DOM usage

### Best Practices for Performance

```vue
<script setup lang="ts">
// ✅ Good: Use reactive refs for data that changes
const resources = ref<Resource[]>([]);

// ✅ Good: Memoize expensive computations
const processedEvents = computed(() => {
  return resources.value.flatMap(r => r.events);
});

// ❌ Avoid: Creating new objects in template
// <AtempoCal :style-options="{ height: '500px' }" />

// ✅ Better: Define style options outside template
const styleOptions = { height: '500px' };
</script>

<template>
  <AtempoCal 
    :resources="resources"
    :style-options="styleOptions"
  />
</template>
```

## Styling

The component comes with a default stylesheet that you should import.

```javascript
import 'atempo-cal/dist/style.css';
```

You can override the default styles using standard CSS. The component uses BEM-like class names (e.g., `.atempo-cal`, `.atempo-cal__header`). For more targeted overrides, you can use more specific selectors.

## Changelog

### v0.2.1 (Latest)

**🐛 Bug Fixes:**
- **Fixed View Change Event**: `view-change` event is now always emitted regardless of controlled/uncontrolled mode
- **Fixed Time Format Toggle**: Time format changes now properly emit `time-format-change` event
- **Enhanced Event Consistency**: Both view and time format changes work correctly in all usage scenarios

**📚 Documentation:**
- **Updated Event Documentation**: Comprehensive documentation for all events with TypeScript examples
- **Enhanced API Reference**: Detailed payload types and usage examples for better developer experience
- **Clarified Event Behavior**: Clear explanation of controlled vs uncontrolled component behavior

### v0.2.0

**🚀 Enhanced Events:**
- **Improved Date Change Event**: Now includes comprehensive date range information and current view
- **New Time Format Event**: Added `time-format-change` event for tracking time format preferences
- **Enhanced Event Payloads**: More detailed information in event emissions for better integration

### v0.1.7

**🚀 New Features:**
- **Smart Add Button Positioning**: Intelligent button placement that avoids overlapping with events
- **Customizable Event Display**: Show title, description, location, or any custom field in week view
- **Enhanced Button Control**: New `showAddButton` prop to control button visibility
- **Multiple Positioning Options**: Choose from 6 different button positions including smart mode

**⚡ Performance Improvements:**
- Memoized expensive calculations for better rendering performance
- Optimized event positioning algorithms
- Enhanced memory management and DOM updates
- Selective component re-rendering

**🎨 Visual Enhancements:**
- Better contrast and accessibility
- Smoother animations and transitions
- Improved responsive design
- Enhanced hover states and interactions

**🔧 Technical:**
- Full backward compatibility maintained
- Enhanced TypeScript support
- Improved prop validation
- Better error handling

### Previous Versions
- **v0.1.6**: Bug fixes and stability improvements
- **v0.1.5**: Initial scrollable resources support
- **v0.1.0**: Initial release with basic calendar functionality

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on our [GitHub repository](https://github.com/your-username/atempo-cal).

## License

[MIT](https://github.com/your-username/atempo-cal/blob/main/LICENSE)
