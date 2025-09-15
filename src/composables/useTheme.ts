import { ref, computed, watch, onMounted, type Ref } from 'vue'
import type { UseThemeReturn } from '../types'

/**
 * Theme management composable
 * Handles light/dark theme switching with system preference detection
 * @param initialTheme - Initial theme setting ('light', 'dark', or 'auto')
 * @returns Theme state and management methods
 */
export function useTheme(initialTheme: 'light' | 'dark' | 'auto' = 'auto'): UseThemeReturn {
  // Reactive state
  const themePreference: Ref<'light' | 'dark' | 'auto'> = ref(initialTheme)
  const systemPrefersDark = ref(false)
  
  /**
   * Computed current theme based on preference and system settings
   */
  const currentTheme = computed(() => {
    if (themePreference.value === 'auto') {
      return systemPrefersDark.value ? 'dark' : 'light'
    }
    return themePreference.value
  })
  
  /**
   * Update system preference detection
   */
  const updateSystemPreference = (): void => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      systemPrefersDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
  }
  
  /**
   * Apply theme to document
   * @param theme - Theme to apply
   */
  const applyTheme = (theme: 'light' | 'dark'): void => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      
      if (theme === 'dark') {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
      
      // Store preference in localStorage
      try {
        localStorage.setItem('atempo-cal-theme', themePreference.value)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('Failed to save theme preference:', error)
      }
    }
  }
  
  /**
   * Load theme preference from localStorage
   */
  const loadThemePreference = (): void => {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('atempo-cal-theme')
        if (saved && ['light', 'dark', 'auto'].includes(saved)) {
          themePreference.value = saved as 'light' | 'dark' | 'auto'
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('Failed to load theme preference:', error)
      }
    }
  }
  
  /**
   * Toggle between light and dark themes
   * If currently auto, switches to opposite of current system preference
   */
  const toggleTheme = (): void => {
    if (themePreference.value === 'auto') {
      // If auto, switch to opposite of current system preference
      themePreference.value = systemPrefersDark.value ? 'light' : 'dark'
    } else {
      // Toggle between light and dark
      themePreference.value = themePreference.value === 'light' ? 'dark' : 'light'
    }
  }
  
  /**
   * Set specific theme
   * @param theme - Theme to set
   */
  const setTheme = (theme: 'light' | 'dark' | 'auto'): void => {
    themePreference.value = theme
  }
  
  /**
   * Get theme icon name for UI
   * @returns Icon name string
   */
  const getThemeIcon = (): string => {
    switch (themePreference.value) {
      case 'light':
        return 'sun'
      case 'dark':
        return 'moon'
      case 'auto':
        return 'monitor'
      default:
        return 'monitor'
    }
  }
  
  /**
   * Get theme display name for UI
   * @returns Display name string
   */
  const getThemeDisplayName = (): string => {
    switch (themePreference.value) {
      case 'light':
        return 'Light'
      case 'dark':
        return 'Dark'
      case 'auto':
        return 'System'
      default:
        return 'System'
    }
  }
  
  /**
   * Check if current theme is dark
   * @returns True if current theme is dark
   */
  const isDark = computed(() => currentTheme.value === 'dark')
  
  /**
   * Check if current theme is light
   * @returns True if current theme is light
   */
  const isLight = computed(() => currentTheme.value === 'light')
  
  /**
   * Check if theme is set to auto
   * @returns True if theme preference is auto
   */
  const isAuto = computed(() => themePreference.value === 'auto')
  
  // Watch for theme changes and apply them
  watch(currentTheme, (newTheme) => {
    applyTheme(newTheme)
  }, { immediate: true })
  
  // Watch for system preference changes
  watch(systemPrefersDark, () => {
    if (themePreference.value === 'auto') {
      applyTheme(currentTheme.value)
    }
  })
  
  // Setup system preference listener
  onMounted(() => {
    // Load saved preference
    loadThemePreference()
    
    // Update system preference
    updateSystemPreference()
    
    // Listen for system theme changes
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      const handleChange = (e: MediaQueryListEvent) => {
        systemPrefersDark.value = e.matches
      }
      
      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange)
      } else {
        // Fallback for older browsers
        mediaQuery.addListener(handleChange)
      }
      
      // Cleanup function would be returned if this was a full composable
      // For now, we'll rely on component unmounting to clean up
    }
  })
  
  return {
    currentTheme,
    toggleTheme,
    setTheme,
    getThemeIcon,
    getThemeDisplayName,
    isDark,
    isLight,
    isAuto,
    themePreference: computed(() => themePreference.value),
    systemPrefersDark: computed(() => systemPrefersDark.value)
  }
}