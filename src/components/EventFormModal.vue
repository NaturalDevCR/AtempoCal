<template>
  <transition name="ac-modal-fade">
    <div v-if="visible" class="ac-modal-overlay" @click.self="close">
      <div class="ac-event-form-modal" role="dialog" aria-modal="true" :aria-labelledby="modalTitleId">
        <!-- Header -->
        <header class="ac-modal-header">
          <div class="ac-modal-header-content">
            <h3 :id="modalTitleId" class="ac-modal-title">
              {{ isEditing ? 'Edit Event' : 'Create New Event' }}
            </h3>
            <p class="ac-modal-subtitle" v-if="resourceName">
              {{ resourceName }} • {{ formattedDate }}
            </p>
          </div>
          <button @click="close" class="ac-modal-close-btn" aria-label="Close dialog">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </header>

        <!-- Form Body -->
        <main class="ac-modal-body">
          <form @submit.prevent="handleSubmit" class="ac-event-form">
            <!-- Title Field -->
            <div class="ac-form-group">
              <label for="event-title" class="ac-form-label required">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
                Event Title
              </label>
              <input
                id="event-title"
                ref="titleInput"
                v-model="formData.title"
                type="text"
                class="ac-form-input"
                :class="{ 'ac-form-input--error': errors.title }"
                placeholder="Enter event title..."
                maxlength="100"
                required
              />
              <div v-if="errors.title" class="ac-form-error">{{ errors.title }}</div>
            </div>

            <!-- Time Fields -->
            <div class="ac-form-row">
              <div class="ac-form-group">
                <label for="start-time" class="ac-form-label required">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12,6 12,12 16,14"></polyline>
                  </svg>
                  Start Time
                </label>
                <input
                  id="start-time"
                  v-model="formData.startTime"
                  type="time"
                  class="ac-form-input"
                  :class="{ 'ac-form-input--error': errors.startTime }"
                  required
                />
                <div v-if="errors.startTime" class="ac-form-error">{{ errors.startTime }}</div>
              </div>
              
              <div class="ac-form-group">
                <label for="end-time" class="ac-form-label required">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12,6 12,12 16,14"></polyline>
                  </svg>
                  End Time
                </label>
                <input
                  id="end-time"
                  v-model="formData.endTime"
                  type="time"
                  class="ac-form-input"
                  :class="{ 'ac-form-input--error': errors.endTime }"
                  required
                />
                <div v-if="errors.endTime" class="ac-form-error">{{ errors.endTime }}</div>
              </div>
            </div>

            <!-- Duration Display -->
            <div v-if="calculatedDuration" class="ac-duration-display">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 6v6l4 2"></path>
              </svg>
              Duration: {{ calculatedDuration }}
            </div>

            <!-- Description Field -->
            <div class="ac-form-group">
              <label for="event-description" class="ac-form-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14,2 14,8 20,8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10,9 9,9 8,9"></polyline>
                </svg>
                Description
              </label>
              <textarea
                id="event-description"
                v-model="formData.description"
                class="ac-form-textarea"
                placeholder="Add event description (optional)..."
                rows="3"
                maxlength="500"
              ></textarea>
              <div class="ac-form-hint">{{ formData.description?.length || 0 }}/500 characters</div>
            </div>

            <!-- Location Field -->
            <div class="ac-form-group">
              <label for="event-location" class="ac-form-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                Location
              </label>
              <input
                id="event-location"
                v-model="formData.location"
                type="text"
                class="ac-form-input"
                placeholder="Add location (optional)..."
                maxlength="100"
              />
            </div>

            <!-- Event Type -->
            <div class="ac-form-group">
              <label for="event-type" class="ac-form-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M7 7h.01"></path>
                  <path d="M17 7h.01"></path>
                  <path d="M7 17h.01"></path>
                  <path d="M17 17h.01"></path>
                  <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                </svg>
                Event Type
              </label>
              <select
                id="event-type"
                v-model="formData.type"
                class="ac-form-select"
              >
                <option value="">Select type (optional)</option>
                <option value="meeting">Meeting</option>
                <option value="focus">Focus Time</option>
                <option value="training">Training</option>
                <option value="urgent">Urgent</option>
                <option value="break">Break</option>
              </select>
            </div>
          </form>
        </main>

        <!-- Footer -->
        <footer class="ac-modal-footer">
          <div class="ac-modal-actions">
            <button
              v-if="isEditing"
              @click="handleDelete"
              type="button"
              class="ac-btn ac-btn--danger ac-btn--outline"
              :disabled="isSubmitting"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3,6 5,6 21,6"></polyline>
                <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
              Delete
            </button>
            
            <div class="ac-modal-primary-actions">
              <button
                @click="close"
                type="button"
                class="ac-btn ac-btn--secondary"
                :disabled="isSubmitting"
              >
                Cancel
              </button>
              <button
                @click="handleSubmit"
                type="submit"
                class="ac-btn ac-btn--primary"
                :disabled="isSubmitting || !isFormValid"
              >
                <svg v-if="isSubmitting" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="ac-spinner">
                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
                {{ isEditing ? 'Update Event' : 'Create Event' }}
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted } from 'vue';
import atemporal from 'atemporal';
import type { CalendarEvent } from '../types';

interface EventFormData {
  title: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  type: string;
}

interface FormErrors {
  title?: string;
  startTime?: string;
  endTime?: string;
}

const props = defineProps<{
  visible: boolean;
  event?: CalendarEvent;
  resourceId?: string;
  resourceName?: string;
  date?: string;
  initialStartTime?: string;
  initialEndTime?: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', event: Partial<CalendarEvent>): void;
  (e: 'delete', event: CalendarEvent): void;
}>();

// Refs
const titleInput = ref<HTMLInputElement>();
const isSubmitting = ref(false);

// Computed properties
const isEditing = computed(() => !!props.event);
const modalTitleId = computed(() => `modal-title-${Date.now()}`);

const formattedDate = computed(() => {
  if (!props.date) return '';
  return atemporal(props.date).format('MMMM D, YYYY');
});

// Form data
const formData = ref<EventFormData>({
  title: '',
  startTime: '',
  endTime: '',
  description: '',
  location: '',
  type: ''
});

// Form errors
const errors = ref<FormErrors>({});

/**
 * Calculate duration between start and end times
 */
const calculatedDuration = computed(() => {
  if (!formData.value.startTime || !formData.value.endTime) return '';
  
  const start = new Date(`2000-01-01T${formData.value.startTime}:00`);
  const end = new Date(`2000-01-01T${formData.value.endTime}:00`);
  
  if (end <= start) return '';
  
  const diffMs = end.getTime() - start.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
});

/**
 * Check if form is valid
 */
const isFormValid = computed(() => {
  return formData.value.title.trim() && 
         formData.value.startTime && 
         formData.value.endTime && 
         Object.keys(errors.value).length === 0;
});

/**
 * Initialize form data when modal opens or event changes
 */
const initializeForm = () => {
  if (props.event) {
    // Editing existing event
    formData.value = {
      title: props.event.title || '',
      startTime: props.event.from ? atemporal(props.event.from).format('HH:mm') : '',
      endTime: props.event.to ? atemporal(props.event.to).format('HH:mm') : '',
      description: props.event.description || '',
      location: props.event.location || '',
      type: props.event.type || ''
    };
  } else {
    // Creating new event
    formData.value = {
      title: '',
      startTime: props.initialStartTime || '09:00',
      endTime: props.initialEndTime || '10:00',
      description: '',
      location: '',
      type: ''
    };
  }
  
  // Clear errors
  errors.value = {};
};

/**
 * Validate form fields
 */
const validateForm = (): boolean => {
  const newErrors: FormErrors = {};
  
  // Title validation
  if (!formData.value.title.trim()) {
    newErrors.title = 'Event title is required';
  } else if (formData.value.title.length > 100) {
    newErrors.title = 'Title must be 100 characters or less';
  }
  
  // Time validation
  if (!formData.value.startTime) {
    newErrors.startTime = 'Start time is required';
  }
  
  if (!formData.value.endTime) {
    newErrors.endTime = 'End time is required';
  }
  
  // Check if end time is after start time
  if (formData.value.startTime && formData.value.endTime) {
    const start = new Date(`2000-01-01T${formData.value.startTime}:00`);
    const end = new Date(`2000-01-01T${formData.value.endTime}:00`);
    
    if (end <= start) {
      newErrors.endTime = 'End time must be after start time';
    }
  }
  
  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
};

/**
 * Handle form submission
 */
const handleSubmit = async () => {
  if (!validateForm()) return;
  
  isSubmitting.value = true;
  
  try {
    const eventData: Partial<CalendarEvent> = {
      title: formData.value.title.trim(),
      description: formData.value.description.trim() || undefined,
      location: formData.value.location.trim() || undefined,
      type: formData.value.type || undefined
    };
    
    // Create date objects for from/to times
    if (props.date) {
      const baseDate = atemporal(props.date);
      const [startHour, startMinute] = formData.value.startTime.split(':').map(Number);
      const [endHour, endMinute] = formData.value.endTime.split(':').map(Number);
      
      eventData.from = atemporal({
        year: baseDate.year,
        month: baseDate.month,
        day: baseDate.day,
        hour: startHour,
        minute: startMinute,
        second: 0,
        timeZone: baseDate.timeZone
      }).toDate();
      
      eventData.to = atemporal({
        year: baseDate.year,
        month: baseDate.month,
        day: baseDate.day,
        hour: endHour,
        minute: endMinute,
        second: 0,
        timeZone: baseDate.timeZone
      }).toDate();
    }
    
    // Add ID if editing
    if (props.event) {
      eventData.id = props.event.id;
    }
    
    emit('save', eventData);
    close();
  } catch (error) {
    console.error('Error saving event:', error);
  } finally {
    isSubmitting.value = false;
  }
};

/**
 * Handle event deletion
 */
const handleDelete = () => {
  if (props.event && confirm('Are you sure you want to delete this event?')) {
    emit('delete', props.event);
    close();
  }
};

/**
 * Close modal
 */
const close = () => {
  emit('close');
};

// Watch for modal visibility changes
watch(() => props.visible, (visible) => {
  if (visible) {
    initializeForm();
    nextTick(() => {
      titleInput.value?.focus();
    });
  }
});

// Watch for event changes
watch(() => props.event, () => {
  if (props.visible) {
    initializeForm();
  }
});

// Initialize on mount
onMounted(() => {
  if (props.visible) {
    initializeForm();
  }
});
</script>