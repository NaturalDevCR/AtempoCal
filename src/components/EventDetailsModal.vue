<template>
  <transition name="ac-modal-fade">
    <div v-if="visible" class="ac-modal-overlay" @click.self="close">
      <div class="ac-modal-content" role="dialog" aria-modal="true" :aria-labelledby="`modal-title-${event.id}`">
        <!-- Header -->
        <header class="ac-modal-header">
          <h3 :id="`modal-title-${event.id}`" class="ac-modal-title">{{ event.resourceName }}</h3>
          <button @click="close" class="ac-modal-close-btn" aria-label="Close dialog">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </header>

        <!-- Body -->
        <main class="ac-modal-body">
          <div class="ac-modal-detail-item">
            <strong class="ac-detail-label">Event:</strong>
            <span class="ac-detail-value">{{ event.title }}</span>
          </div>
          <div class="ac-modal-detail-item">
            <strong class="ac-detail-label">Time:</strong>
            <div class="ac-detail-value ac-time-detail-value">
              <span>{{ formattedTimeRange }}</span>
              <strong>({{ duration }})</strong>
            </div>
          </div>
          <div v-if="event.description" class="ac-modal-detail-item is-block">
            <strong class="ac-detail-label">Description:</strong>
            <p class="ac-detail-value">{{ event.description }}</p>
          </div>
          <div v-if="event.location" class="ac-modal-detail-item">
            <strong class="ac-detail-label">Location:</strong>
            <span class="ac-detail-value">{{ event.location }}</span>
          </div>
        </main>

        <!-- Footer -->
        <footer class="ac-modal-footer">
          <button @click="emit('delete', event)" class="ac-modal-btn ac-btn-delete">Delete</button>
          <button @click="emit('edit', event)" class="ac-modal-btn ac-btn-edit">Edit</button>
        </footer>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { CalendarEvent, TimeFormat } from '../types';
import { formatTime, getEventDurationText } from '../helpers';

const props = defineProps<{
  event: CalendarEvent;
  visible: boolean;
  timeFormat: TimeFormat;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'edit', event: CalendarEvent): void;
  (e: 'delete', event: CalendarEvent): void;
}>();

const close = () => emit('close');

const formattedTimeRange = computed(() => {
  if (!props.event.startTime || !props.event.endTime) return '';
  const start = formatTime(props.event.startTime, props.timeFormat);
  const end = formatTime(props.event.endTime, props.timeFormat);
  return `${start} - ${end}`;
});

const duration = computed(() => getEventDurationText(props.event));
</script>
