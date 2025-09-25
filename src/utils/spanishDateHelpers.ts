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
 * Get Spanish month abbreviation from date
 * @param date - Atemporal date object
 * @returns Spanish month abbreviation (e.g., "sept")
 */
export const getSpanishMonth = (date: Atemporal): string => {
  const month = date.month()
  return SPANISH_MONTHS[month] || 'ene'
}

/**
 * Get Spanish day abbreviation from date
 * @param date - Atemporal date object
 * @returns Spanish day abbreviation (e.g., "LUN")
 */
export const getSpanishDay = (date: Atemporal): string => {
  const dayOfWeek = date.dayOfWeek() as number
  return SPANISH_DAYS[dayOfWeek] || 'LUN'
}

/**
 * Format date in Spanish format: "22 sept"
 * @param date - Atemporal date object
 * @returns Formatted date string (e.g., "22 sept")
 */
export const formatSpanishDate = (date: Atemporal): string => {
  const day = date.day
  const month = getSpanishMonth(date)
  return `${day} ${month}`
}