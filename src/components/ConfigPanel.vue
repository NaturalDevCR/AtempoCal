<template>
  <div class="atempo-cal-config-panel">
    <!-- Panel header -->
    <div class="atempo-cal-config-header">
      <h3 class="atempo-cal-config-title">
        Calendar Settings
      </h3>
      <button
        class="atempo-cal-config-close"
        @click="$emit('close')"
        title="Close settings"
      >
        <XMarkIcon class="w-5 h-5" />
      </button>
    </div>

    <!-- Panel content -->
    <div class="atempo-cal-config-content">
      <!-- Theme Settings -->
      <div class="atempo-cal-config-section">
        <h4 class="atempo-cal-config-section-title">
          <SunIcon class="w-4 h-4" />
          Appearance
        </h4>
        
        <div class="atempo-cal-config-field">
          <label class="atempo-cal-config-label">
            Theme
          </label>
          <div class="atempo-cal-theme-options">
            <button
              v-for="themeOption in themeOptions"
              :key="themeOption.value"
              class="atempo-cal-theme-option"
              :class="{ 'active': localConfig.theme === themeOption.value }"
              @click="updateTheme(themeOption.value)"
            >
              <component :is="themeOption.icon" class="w-4 h-4" />
              <span>{{ themeOption.label }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Time Settings -->
      <div class="atempo-cal-config-section">
        <h4 class="atempo-cal-config-section-title">
          <ClockIcon class="w-4 h-4" />
          Time & Display
        </h4>
        
        <div class="atempo-cal-config-field">
          <label class="atempo-cal-config-label" for="start-hour">
            Start Hour
          </label>
          <select
            id="start-hour"
            v-model="localConfig.startHour"
            class="atempo-cal-config-select"
            @change="emitConfigChange"
          >
            <option v-for="hour in 24" :key="hour - 1" :value="hour - 1">
              {{ formatHour(hour - 1) }}
            </option>
          </select>
        </div>
        
        <div class="atempo-cal-config-field">
          <label class="atempo-cal-config-label" for="end-hour">
            End Hour
          </label>
          <select
            id="end-hour"
            v-model="localConfig.endHour"
            class="atempo-cal-config-select"
            @change="emitConfigChange"
          >
            <option v-for="hour in 24" :key="hour" :value="hour">
              {{ formatHour(hour) }}
            </option>
          </select>
        </div>
        
        <div class="atempo-cal-config-field">
          <label class="atempo-cal-config-label" for="slot-duration">
            Time Slot Duration
          </label>
          <select
            id="slot-duration"
            v-model="localConfig.slotDuration"
            class="atempo-cal-config-select"
            @change="emitConfigChange"
          >
            <option :value="15">15 minutes</option>
            <option :value="30">30 minutes</option>
            <option :value="60">1 hour</option>
            <option :value="120">2 hours</option>
          </select>
        </div>
      </div>

      <!-- Week Settings -->
      <div class="atempo-cal-config-section">
        <h4 class="atempo-cal-config-section-title">
          <CalendarDaysIcon class="w-4 h-4" />
          Week Settings
        </h4>
        
        <div class="atempo-cal-config-field">
          <label class="atempo-cal-config-label" for="first-day">
            First Day of Week
          </label>
          <select
            id="first-day"
            v-model="localConfig.firstDayOfWeek"
            class="atempo-cal-config-select"
            @change="emitConfigChange"
          >
            <option :value="0">Sunday</option>
            <option :value="1">Monday</option>
            <option :value="2">Tuesday</option>
            <option :value="3">Wednesday</option>
            <option :value="4">Thursday</option>
            <option :value="5">Friday</option>
            <option :value="6">Saturday</option>
          </select>
        </div>
        
        <div class="atempo-cal-config-field">
          <label class="atempo-cal-config-checkbox">
            <input
              type="checkbox"
              v-model="localConfig.showWeekends"
              @change="emitConfigChange"
            />
            <span class="atempo-cal-config-checkbox-label">
              Show Weekends
            </span>
          </label>
        </div>
      </div>

      <!-- Localization Settings -->
      <div class="atempo-cal-config-section">
        <h4 class="atempo-cal-config-section-title">
          <GlobeAltIcon class="w-4 h-4" />
          Localization
        </h4>
        
        <div class="atempo-cal-config-field">
          <label class="atempo-cal-config-label" for="locale">
            Language
          </label>
          <select
            id="locale"
            v-model="localConfig.locale"
            class="atempo-cal-config-select"
            @change="emitConfigChange"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="it">Italiano</option>
            <option value="pt">Português</option>
            <option value="ja">日本語</option>
            <option value="ko">한국어</option>
            <option value="zh">中文</option>
          </select>
        </div>
        
        <div class="atempo-cal-config-field">
          <label class="atempo-cal-config-label" for="timezone">
            Timezone
          </label>
          <select
            id="timezone"
            v-model="localConfig.timezone"
            class="atempo-cal-config-select"
            @change="emitConfigChange"
          >
            <option v-for="tz in commonTimezones" :key="tz.value" :value="tz.value">
              {{ tz.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- Advanced Settings -->
      <div class="atempo-cal-config-section">
        <h4 class="atempo-cal-config-section-title">
          <CogIcon class="w-4 h-4" />
          Advanced
        </h4>
        
        <div class="atempo-cal-config-field">
          <button
            class="atempo-cal-config-button secondary"
            @click="resetToDefaults"
          >
            Reset to Defaults
          </button>
        </div>
        
        <div class="atempo-cal-config-field">
          <button
            class="atempo-cal-config-button secondary"
            @click="exportConfig"
          >
            Export Settings
          </button>
        </div>
      </div>
    </div>

    <!-- Panel footer -->
    <div class="atempo-cal-config-footer">
      <button
        class="atempo-cal-config-button primary"
        @click="$emit('close')"
      >
        Done
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { CalendarConfig } from '../types'
import {
  XMarkIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  ClockIcon,
  CalendarDaysIcon,
  GlobeAltIcon,
  CogIcon
} from '@heroicons/vue/24/outline'

/**
 * ConfigPanel component
 * Provides settings and configuration options for the calendar
 */

interface Props {
  config: CalendarConfig
  theme: 'light' | 'dark'
}

const props = defineProps<Props>()

interface Emits {
  'config-change': [config: Partial<CalendarConfig>]
  'theme-change': [theme: 'light' | 'dark' | 'auto']
  'close': []
}

const emit = defineEmits<Emits>()

// Local config state
const localConfig = ref<CalendarConfig>({ ...props.config })

// Theme options
const themeOptions = [
  {
    value: 'light' as const,
    label: 'Light',
    icon: SunIcon
  },
  {
    value: 'dark' as const,
    label: 'Dark',
    icon: MoonIcon
  },
  {
    value: 'auto' as const,
    label: 'System',
    icon: ComputerDesktopIcon
  }
]

// Common timezones
const commonTimezones = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (US)' },
  { value: 'America/Chicago', label: 'Central Time (US)' },
  { value: 'America/Denver', label: 'Mountain Time (US)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US)' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Europe/Berlin', label: 'Berlin' },
  { value: 'Europe/Rome', label: 'Rome' },
  { value: 'Europe/Madrid', label: 'Madrid' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Asia/Shanghai', label: 'Shanghai' },
  { value: 'Asia/Seoul', label: 'Seoul' },
  { value: 'Asia/Kolkata', label: 'Mumbai' },
  { value: 'Australia/Sydney', label: 'Sydney' },
  { value: 'Pacific/Auckland', label: 'Auckland' }
]

// Watch for prop changes
watch(() => props.config, (newConfig) => {
  localConfig.value = { ...newConfig }
}, { deep: true })

/**
 * Format hour for display
 */
const formatHour = (hour: number): string => {
  if (hour === 0) return '12:00 AM'
  if (hour < 12) return `${hour}:00 AM`
  if (hour === 12) return '12:00 PM'
  return `${hour - 12}:00 PM`
}

/**
 * Update theme setting
 */
const updateTheme = (theme: 'light' | 'dark' | 'auto'): void => {
  localConfig.value.theme = theme
  emit('theme-change', theme)
}

/**
 * Emit config change
 */
const emitConfigChange = (): void => {
  emit('config-change', { ...localConfig.value })
}

/**
 * Reset to default configuration
 */
const resetToDefaults = (): void => {
  const defaultConfig: CalendarConfig = {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    locale: 'en',
    theme: 'auto',
    startHour: 0,
    endHour: 24,
    slotDuration: 60,
    showWeekends: true,
    firstDayOfWeek: 1
  }
  
  localConfig.value = { ...defaultConfig }
  emit('config-change', defaultConfig)
  emit('theme-change', 'auto')
}

/**
 * Export configuration as JSON
 */
const exportConfig = (): void => {
  const configJson = JSON.stringify(localConfig.value, null, 2)
  const blob = new Blob([configJson], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = 'atempo-cal-config.json'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.atempo-cal-config-panel {
  @apply fixed right-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-800 shadow-xl z-50;
  @apply border-l border-gray-200 dark:border-gray-700 flex flex-col;
}

.atempo-cal-config-header {
  @apply flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700;
}

.atempo-cal-config-title {
  @apply text-lg font-semibold text-gray-900 dark:text-gray-100;
}

.atempo-cal-config-close {
  @apply p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300;
  @apply hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors;
}

.atempo-cal-config-content {
  @apply flex-1 overflow-y-auto p-4 space-y-6;
}

.atempo-cal-config-section {
  @apply space-y-4;
}

.atempo-cal-config-section-title {
  @apply flex items-center space-x-2 text-sm font-medium text-gray-900 dark:text-gray-100;
  @apply border-b border-gray-200 dark:border-gray-700 pb-2;
}

.atempo-cal-config-field {
  @apply space-y-2;
}

.atempo-cal-config-label {
  @apply block text-sm font-medium text-gray-700 dark:text-gray-300;
}

.atempo-cal-config-select {
  @apply w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md;
  @apply bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100;
  @apply focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
  @apply transition-colors;
}

.atempo-cal-config-checkbox {
  @apply flex items-center space-x-2 cursor-pointer;
}

.atempo-cal-config-checkbox input[type="checkbox"] {
  @apply w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded;
  @apply focus:ring-2 focus:ring-blue-500;
}

.atempo-cal-config-checkbox-label {
  @apply text-sm text-gray-700 dark:text-gray-300;
}

.atempo-cal-theme-options {
  @apply grid grid-cols-3 gap-2;
}

.atempo-cal-theme-option {
  @apply flex flex-col items-center space-y-1 p-3 border border-gray-300 dark:border-gray-600 rounded-md;
  @apply text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700;
  @apply transition-colors cursor-pointer;
}

.atempo-cal-theme-option.active {
  @apply border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300;
}

.atempo-cal-theme-option span {
  @apply text-xs font-medium;
}

.atempo-cal-config-button {
  @apply px-4 py-2 rounded-md font-medium transition-colors;
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.atempo-cal-config-button.primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
  @apply focus:ring-blue-500;
}

.atempo-cal-config-button.secondary {
  @apply bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100;
  @apply hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-gray-500;
}

.atempo-cal-config-footer {
  @apply p-4 border-t border-gray-200 dark:border-gray-700;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .atempo-cal-config-panel {
    @apply w-full;
  }
}
</style>