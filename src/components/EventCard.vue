<template>
  <div
    class="atempo-cal-event group"
    :class="[
      getEventColorClass(),
      {
        'selected': isSelected,
        'readonly': readonly,
        'dragging': isDragging
      }
    ]"
    :style="eventStyle"
    @click="handleClick"
    @mousedown="handleMouseDown"
    @contextmenu="handleContextMenu"
  >
    <!-- Event content -->
    <div class="atempo-cal-event-content flex-1 min-w-0">
      <!-- Event title -->
      <div class="atempo-cal-event-title">
        {{ truncatedTitle }}
      </div>
      
      <!-- Event time -->
      <div v-if="showTime" class="atempo-cal-event-time">
        {{ formatEventTime() }}
      </div>
      
      <!-- Resource information -->
      <div v-if="showResource && (resourceName || event.resourceId)" class="atempo-cal-event-resource">
        <div class="resource-info-container">
          <div
            class="resource-indicator"
            :style="{ backgroundColor: resourceColor }"
          />
          <span class="resource-name">
            {{ resourceName || event.resourceId }}
          </span>
        </div>
      </div>
      
      <!-- Event description -->
      <div v-if="event.description && showDescription" class="atempo-cal-event-description">
        {{ truncatedDescription }}
      </div>
    </div>

    <!-- Event actions (on hover) -->
    <div
      v-if="!readonly && (actions.length > 0 || showDefaultActions)"
      class="atempo-cal-event-actions opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <button
        v-for="action in visibleActions"
        :key="action.id"
        class="atempo-cal-event-action-btn"
        :title="action.label"
        @click.stop="handleActionClick(action)"
      >
        <component :is="getActionIcon(action.icon)" class="action-icon" />
      </button>
    </div>

    <!-- Resize handles (if not readonly) -->
    <div
      v-if="!readonly && allowResize"
      class="atempo-cal-event-resize-handle atempo-cal-event-resize-top"
      @mousedown.stop="handleResizeStart('top', $event)"
    />
    <div
      v-if="!readonly && allowResize"
      class="atempo-cal-event-resize-handle atempo-cal-event-resize-bottom"
      @mousedown.stop="handleResizeStart('bottom', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CalendarEvent, EventPosition, EventAction, CalendarResource, SpecialEventColors } from '../types'
import { truncateEventTitle, isAllDayEvent } from '../utils/eventHelpers'
import { formatTime } from '../utils/dateHelpers'
import { getEventColor } from '../utils/colorHelpers'
import atemporal from 'atemporal'
import {
  PencilIcon,
  TrashIcon,
  ClipboardDocumentIcon,
  EyeIcon
} from '@heroicons/vue/24/outline'

/**
 * EventCard component
 * Renders individual calendar events with actions and interactions
 */

interface Props {
  event: CalendarEvent
  position: EventPosition
  actions?: EventAction[]
  readonly?: boolean
  selected?: boolean
  showTime?: boolean
  showDescription?: boolean
  showResource?: boolean
  resourceName?: string
  resourceColor?: string
  allowResize?: boolean
  allowDrag?: boolean
  maxTitleLength?: number
  maxDescriptionLength?: number
  resources?: CalendarResource[] // Available resources for color calculation
  customSpecialColors?: Partial<SpecialEventColors> // Custom special event colors
}

const props = withDefaults(defineProps<Props>(), {
  actions: () => [],
  readonly: false,
  selected: false,
  showTime: true,
  showDescription: true,
  showResource: false,
  resourceName: '',
  resourceColor: '#3b82f6',
  allowResize: true,
  allowDrag: true,
  maxTitleLength: 30,
  maxDescriptionLength: 50
})

interface Emits {
  'click': [event: CalendarEvent]
  'update': [event: CalendarEvent]
  'delete': [event: CalendarEvent]
  'resize-start': [event: CalendarEvent, direction: 'top' | 'bottom']
  'drag-start': [event: CalendarEvent]
  'context-menu': [event: CalendarEvent, mouseEvent: MouseEvent]
}

const emit = defineEmits<Emits>()

// Local state
const isDragging = ref(false)
const isSelected = computed(() => props.selected)

// Default actions - only delete action that emits event data
const defaultActions: EventAction[] = [
  {
    id: 'delete',
    label: 'Delete Event',
    icon: 'trash',
    handler: (event) => emit('delete', event)
  }
]

const showDefaultActions = computed(() => props.actions.length === 0)

/**
 * Visible actions based on conditions
 */
const visibleActions = computed(() => {
  const actionsToShow = props.actions.length > 0 ? props.actions : defaultActions
  
  return actionsToShow.filter(action => {
    if (action.condition) {
      return action.condition(props.event)
    }
    return true
  })
})

/**
 * Get the computed event color using the new color system
 */
const computedEventColor = computed(() => {
  return getEventColor(props.event, props.resources, props.customSpecialColors)
})

/**
 * Event style based on position
 */
const eventStyle = computed(() => ({
  top: `${props.position.top}px`,
  height: `${props.position.height}px`,
  left: `${props.position.left}%`,
  width: `${props.position.width}%`,
  zIndex: props.position.zIndex,
  borderLeftColor: computedEventColor.value
}))

/**
 * Truncated event title
 */
const truncatedTitle = computed(() => {
  return truncateEventTitle(props.event.title, props.maxTitleLength)
})

/**
 * Truncated event description
 */
const truncatedDescription = computed(() => {
  if (!props.event.description) return ''
  
  if (props.event.description.length <= props.maxDescriptionLength) {
    return props.event.description
  }
  
  return props.event.description.substring(0, props.maxDescriptionLength - 3) + '...'
})

/**
 * Get event color CSS class based on the computed color
 */
const getEventColorClass = (): string => {
  const color = computedEventColor.value
  
  // Map colors to CSS classes - expanded to support our full palette
  const colorMap: Record<string, string> = {
    '#3b82f6': 'color-blue',
    '#10b981': 'color-emerald',
    '#ef4444': 'color-red',
    '#f59e0b': 'color-amber',
    '#8b5cf6': 'color-violet',
    '#6366f1': 'color-indigo',
    '#ec4899': 'color-pink',
    '#6b7280': 'color-gray',
    '#06b6d4': 'color-cyan',
    '#84cc16': 'color-lime',
    '#f97316': 'color-orange',
    '#14b8a6': 'color-teal',
    '#f43f5e': 'color-rose',
    '#a855f7': 'color-purple',
    '#22c55e': 'color-green',
    '#eab308': 'color-yellow',
    '#0ea5e9': 'color-sky'
  }
  
  return colorMap[color] || 'color-blue'
}

/**
 * Format event time for display
 */
const formatEventTime = (): string => {
  if (isAllDayEvent(props.event)) {
    return 'All day'
  }
  
  const startTime = atemporal(props.event.startTime)
  const endTime = atemporal(props.event.endTime)
  
  const startFormatted = formatTime(startTime.hour(), startTime.minute())
  const endFormatted = formatTime(endTime.hour(), endTime.minute())
  
  return `${startFormatted} - ${endFormatted}`
}

/**
 * Get action icon component
 */
const getActionIcon = (iconName?: string) => {
  const iconMap: Record<string, any> = {
    'pencil': PencilIcon,
    'trash': TrashIcon,
    'copy': ClipboardDocumentIcon,
    'view': EyeIcon
  }
  
  return iconMap[iconName || 'pencil'] || PencilIcon
}

/**
 * Handle event click
 */
const handleClick = (event: MouseEvent): void => {
  event.stopPropagation()
  emit('click', props.event)
}

/**
 * Handle mouse down for drag start
 */
const handleMouseDown = (event: MouseEvent): void => {
  if (props.readonly || !props.allowDrag) return
  
  // Only start drag on left mouse button
  if (event.button === 0) {
    isDragging.value = true
    emit('drag-start', props.event)
  }
}

/**
 * Handle context menu
 */
const handleContextMenu = (event: MouseEvent): void => {
  event.preventDefault()
  emit('context-menu', props.event, event)
}

/**
 * Handle action click
 */
const handleActionClick = (action: EventAction): void => {
  action.handler(props.event)
}

/**
 * Handle resize start
 */
const handleResizeStart = (direction: 'top' | 'bottom', event: MouseEvent): void => {
  if (props.readonly) return
  
  event.stopPropagation()
  emit('resize-start', props.event, direction)
}
</script>

<style scoped>

.atempo-cal-event {
  position: absolute;
  border-radius: $border-radius-md;
  box-shadow: $shadow-sm;
  border-left: 4px solid;
  padding: $spacing-xs $spacing-sm;
  cursor: pointer;
  transition: $transition-all;
  min-height: 20px;

  &:hover {
    box-shadow: $shadow-md;
    z-index: 10;
  }

  &.selected {
    box-shadow: 0 0 0 2px rgba($primary-500, 0.5);
  }

  &.readonly {
    cursor: default;
  }

  &.dragging {
    opacity: 0.5;
    transform: rotate(1deg);
    z-index: 50;
  }
}

.atempo-cal-event-content {
  @include flex-column;
  justify-content: flex-start;
  flex: 1;
  min-width: 0;
}

.atempo-cal-event-title {
  font-weight: $font-weight-medium;
  font-size: $font-size-xs;
  line-height: $line-height-tight;
}

.atempo-cal-event-time {
  font-size: $font-size-xs;
  opacity: 0.75;
  margin-top: $spacing-xs * 0.5;
}

.atempo-cal-event-resource {
  font-size: $font-size-xs;
  margin-top: $spacing-xs;
  
  @include theme-aware('color', (
    light: $gray-700,
    dark: $gray-300
  ));
}

.atempo-cal-event-description {
  font-size: $font-size-xs;
  opacity: 0.6;
  margin-top: $spacing-xs;
  line-height: $line-height-tight;
}

.resource-info-container {
  @include flex-center;
  gap: $spacing-xs;
}

.resource-indicator {
  width: $spacing-sm;
  height: $spacing-sm;
  border-radius: 50%;
  flex-shrink: 0;
}

.resource-name {
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;
  @include truncate;
}

.atempo-cal-event-actions {
  position: absolute;
  top: $spacing-xs;
  right: $spacing-xs;
  display: flex;
  gap: $spacing-xs;
}

.atempo-cal-event-action-btn {
  width: $spacing-lg * 0.83;
  height: $spacing-lg * 0.83;
  border-radius: $border-radius-sm;
  box-shadow: $shadow-sm;
  @include flex-center;
  transition: $transition-colors;
  
  @include theme-aware('background-color', (
    light: rgba(255, 255, 255, 0.8),
    dark: rgba($gray-800, 0.8)
  ));
  
  @include theme-aware('color', (
    light: $gray-600,
    dark: $gray-300
  ));
  
  &:hover {
    @include theme-aware('background-color', (
      light: white,
      dark: $gray-700
    ));
  }
}

.action-icon {
  width: $spacing-xs * 1.5;
  height: $spacing-xs * 1.5;
}

.atempo-cal-event-resize-handle {
  position: absolute;
  left: 0;
  right: 0;
  cursor: ns-resize;
  height: 4px;
  
  &:hover {
    background-color: $primary-500;
    opacity: 0.5;
  }
}

.atempo-cal-event-resize-top {
  top: 0;
}

.atempo-cal-event-resize-bottom {
  bottom: 0;
}

// Event color classes - using SCSS mixins for efficiency
.atempo-cal-event {
  &.color-blue { @include event-color-theme($event-blue); }
  &.color-emerald { @include event-color-theme($event-emerald); }
  &.color-red { @include event-color-theme($event-red); }
  &.color-amber { @include event-color-theme($event-amber); }
  &.color-violet { @include event-color-theme($event-violet); }
  &.color-indigo { @include event-color-theme($event-indigo); }
  &.color-pink { @include event-color-theme($event-pink); }
  &.color-gray { @include event-color-theme($event-gray); }
  &.color-cyan { @include event-color-theme($event-cyan); }
  &.color-lime { @include event-color-theme($event-lime); }
  &.color-orange { @include event-color-theme($event-orange); }
  &.color-teal { @include event-color-theme($event-teal); }
  &.color-rose { @include event-color-theme($event-rose); }
  &.color-purple { @include event-color-theme($event-purple); }
  &.color-green { @include event-color-theme($event-green); }
  &.color-yellow { @include event-color-theme($event-yellow); }
  &.color-sky { @include event-color-theme($event-sky); }
}

// Responsive adjustments
@include mobile {
  .atempo-cal-event {
    padding: $spacing-xs;
    font-size: $font-size-xs;
  }
  
  .atempo-cal-event-actions {
    display: none;
  }
  
  .atempo-cal-event-resize-handle {
    display: none;
  }
}
</style>