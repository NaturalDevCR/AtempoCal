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
        <div class="flex items-center space-x-1">
          <div
            class="w-2 h-2 rounded-full flex-shrink-0"
            :style="{ backgroundColor: resourceColor }"
          />
          <span class="text-xs font-medium truncate">
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
        <component :is="getActionIcon(action.icon)" class="w-3 h-3" />
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
  
  const startTime = new Date(props.event.startTime)
  const endTime = new Date(props.event.endTime)
  
  const startFormatted = formatTime(startTime.getHours(), startTime.getMinutes())
  const endFormatted = formatTime(endTime.getHours(), endTime.getMinutes())
  
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
@reference "tailwindcss";

.atempo-cal-event {
  @apply absolute rounded-md shadow-sm border-l-4 px-2 py-1 cursor-pointer transition-all duration-200;
  @apply hover:shadow-md hover:z-10;
  min-height: 20px;
}

.atempo-cal-event.selected {
  @apply ring-2 ring-blue-500 ring-opacity-50;
}

.atempo-cal-event.readonly {
  @apply cursor-default;
}

.atempo-cal-event.dragging {
  @apply opacity-50 transform rotate-1 z-50;
}

.atempo-cal-event-content {
  @apply flex flex-col justify-start;
}

.atempo-cal-event-title {
  @apply font-medium text-xs leading-tight;
}

.atempo-cal-event-time {
  @apply text-xs opacity-75 mt-0.5;
}

.atempo-cal-event-resource {
  @apply text-xs text-gray-700 dark:text-gray-300 mt-1;
}

.atempo-cal-event-description {
  @apply text-xs opacity-60 mt-1 leading-tight;
}

.atempo-cal-event-actions {
  @apply absolute top-1 right-1 flex space-x-1;
}

.atempo-cal-event-action-btn {
  @apply w-5 h-5 rounded bg-white/80 dark:bg-gray-800/80 shadow-sm;
  @apply flex items-center justify-center text-gray-600 dark:text-gray-300;
  @apply hover:bg-white dark:hover:bg-gray-700 transition-colors;
}

.atempo-cal-event-resize-handle {
  @apply absolute left-0 right-0 cursor-ns-resize;
  height: 4px;
}

.atempo-cal-event-resize-top {
  @apply top-0;
}

.atempo-cal-event-resize-bottom {
  @apply bottom-0;
}

.atempo-cal-event-resize-handle:hover {
  @apply bg-blue-500 opacity-50;
}

/* Event color classes - expanded palette */
.atempo-cal-event.color-blue {
  @apply bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100;
}

.atempo-cal-event.color-emerald {
  @apply bg-emerald-100 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-100;
}

.atempo-cal-event.color-red {
  @apply bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-100;
}

.atempo-cal-event.color-amber {
  @apply bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100;
}

.atempo-cal-event.color-violet {
  @apply bg-violet-100 dark:bg-violet-900/30 text-violet-900 dark:text-violet-100;
}

.atempo-cal-event.color-indigo {
  @apply bg-indigo-100 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-100;
}

.atempo-cal-event.color-pink {
  @apply bg-pink-100 dark:bg-pink-900/30 text-pink-900 dark:text-pink-100;
}

.atempo-cal-event.color-gray {
  @apply bg-gray-100 dark:bg-gray-900/30 text-gray-900 dark:text-gray-100;
}

.atempo-cal-event.color-cyan {
  @apply bg-cyan-100 dark:bg-cyan-900/30 text-cyan-900 dark:text-cyan-100;
}

.atempo-cal-event.color-lime {
  @apply bg-lime-100 dark:bg-lime-900/30 text-lime-900 dark:text-lime-100;
}

.atempo-cal-event.color-orange {
  @apply bg-orange-100 dark:bg-orange-900/30 text-orange-900 dark:text-orange-100;
}

.atempo-cal-event.color-teal {
  @apply bg-teal-100 dark:bg-teal-900/30 text-teal-900 dark:text-teal-100;
}

.atempo-cal-event.color-rose {
  @apply bg-rose-100 dark:bg-rose-900/30 text-rose-900 dark:text-rose-100;
}

.atempo-cal-event.color-purple {
  @apply bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100;
}

.atempo-cal-event.color-green {
  @apply bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100;
}

.atempo-cal-event.color-yellow {
  @apply bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-100;
}

.atempo-cal-event.color-sky {
  @apply bg-sky-100 dark:bg-sky-900/30 text-sky-900 dark:text-sky-100;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .atempo-cal-event {
    @apply px-1 text-xs;
  }
  
  .atempo-cal-event-actions {
    @apply hidden;
  }
  
  .atempo-cal-event-resize-handle {
    @apply hidden;
  }
}
</style>