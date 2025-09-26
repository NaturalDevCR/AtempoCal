import type { Atemporal } from '../types'

/**
 * Spanish month abbreviations mapping
 */
const SPANISH_MONTHS: Record<number, string> = {
  1: 'ene',
  2: 'feb',
  3: 'mar',
  4: 'abr',
  5: 'may',
  6: 'jun',
  7: 'jul',
  8: 'ago',
  9: 'sept',
  10: 'oct',
  11: 'nov',
  12: 'dic'
}

/**
 * Spanish day abbreviations mapping
 */
const SPANISH_DAYS: Record<number, string> = {
  1: 'LUN', // Monday
  2: 'MAR', // Tuesday
  3: 'MIE', // Wednesday
  4: 'JUE', // Thursday
  5: 'VIE', // Friday
  6: 'SÁB', // Saturday
  0: 'DOM'  // Sunday
}

/**
 * Memoization caches for performance optimization
 */
const spanishMonthCache = new Map<string, string>()
const spanishDayCache = new Map<string, string>()
const spanishDateCache = new Map<string, string>()

/**
 * Get Spanish month abbreviation from date (memoized)
 * @param date - Atemporal date object
 * @returns Spanish month abbreviation (e.g., "sept")
 */
export const getSpanishMonth = (date: Atemporal): string => {
  const cacheKey = `${date.year}-${date.month}`
  
  if (spanishMonthCache.has(cacheKey)) {
    return spanishMonthCache.get(cacheKey)!
  }
  
  const month = date.month
  const result = SPANISH_MONTHS[month] || 'ene'
  spanishMonthCache.set(cacheKey, result)
  return result
}

/**
 * Get Spanish day abbreviation from date (memoized)
 * @param date - Atemporal date object
 * @returns Spanish day abbreviation (e.g., "LUN")
 */
export const getSpanishDay = (date: Atemporal): string => {
  const cacheKey = date.format('YYYY-MM-DD')
  
  if (spanishDayCache.has(cacheKey)) {
    return spanishDayCache.get(cacheKey)!
  }
  
  const dayOfWeek = typeof date.dayOfWeek === 'function' ? date.dayOfWeek() : date.dayOfWeek
  const dayIndex = typeof dayOfWeek === 'number' ? dayOfWeek : 1
  const result = SPANISH_DAYS[dayIndex] || 'LUN'
  spanishDayCache.set(cacheKey, result)
  return result
}

/**
 * Format date in Spanish format: "22 sept" (memoized)
 * @param date - Atemporal date object
 * @returns Formatted date string (e.g., "22 sept")
 */
export const formatSpanishDate = (date: Atemporal): string => {
  const cacheKey = date.format('YYYY-MM-DD')
  
  if (spanishDateCache.has(cacheKey)) {
    return spanishDateCache.get(cacheKey)!
  }
  
  const day = date.day
  const month = getSpanishMonth(date)
  const result = `${day} ${month}`
  spanishDateCache.set(cacheKey, result)
  return result
}