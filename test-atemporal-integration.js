/**
 * Test script to verify AtempoCal works with different atemporal-compatible input types
 */

import atemporal from 'atemporal'
import { validateEvent, getEventDuration, sortEventsByStartTime } from './src/utils/eventHelpers.js'

// Test events with different input types
const testEvents = [
  // String format (existing format)
  {
    id: '1',
    title: 'String Event',
    startTime: '2024-01-15T10:00:00',
    endTime: '2024-01-15T11:00:00',
    description: 'Event with string dates'
  },
  // Date objects
  {
    id: '2', 
    title: 'Date Object Event',
    startTime: new Date('2024-01-15T14:00:00'),
    endTime: new Date('2024-01-15T15:30:00'),
    description: 'Event with Date objects'
  },
  // Atemporal objects
  {
    id: '3',
    title: 'Atemporal Event', 
    startTime: atemporal('2024-01-15T09:00:00'),
    endTime: atemporal('2024-01-15T10:30:00'),
    description: 'Event with atemporal objects'
  },
  // Timestamp (number)
  {
    id: '4',
    title: 'Timestamp Event',
    startTime: 1705312800000, // 2024-01-15T12:00:00Z
    endTime: 1705316400000,   // 2024-01-15T13:00:00Z
    description: 'Event with timestamp numbers'
  }
]

console.log('🧪 Testing AtempoCal with different input types...')

// Test 1: Event validation
console.log('\n1. Testing event validation:')
testEvents.forEach(event => {
  try {
    const isValid = validateEvent(event)
    console.log(`✅ Event "${event.title}" validation: ${isValid ? 'PASSED' : 'FAILED'}`)
  } catch (error) {
    console.log(`❌ Event "${event.title}" validation: ERROR - ${error.message}`)
  }
})

// Test 2: Event duration calculation
console.log('\n2. Testing event duration calculation:')
testEvents.forEach(event => {
  try {
    const duration = getEventDuration(event)
    console.log(`✅ Event "${event.title}" duration: ${duration} minutes`)
  } catch (error) {
    console.log(`❌ Event "${event.title}" duration: ERROR - ${error.message}`)
  }
})

// Test 3: Event sorting
console.log('\n3. Testing event sorting:')
try {
  const sortedEvents = sortEventsByStartTime(testEvents)
  console.log('✅ Events sorted successfully:')
  sortedEvents.forEach((event, index) => {
    const startTime = atemporal(event.startTime)
    console.log(`   ${index + 1}. ${event.title} - ${startTime.format('HH:mm')}`)
  })
} catch (error) {
  console.log(`❌ Event sorting: ERROR - ${error.message}`)
}

// Test 4: Atemporal conversion consistency
console.log('\n4. Testing atemporal conversion consistency:')
testEvents.forEach(event => {
  try {
    const startAtemporal = atemporal(event.startTime)
    const endAtemporal = atemporal(event.endTime)
    console.log(`✅ Event "${event.title}":`)
    console.log(`   Start: ${startAtemporal.format('YYYY-MM-DD HH:mm:ss')}`)
    console.log(`   End: ${endAtemporal.format('YYYY-MM-DD HH:mm:ss')}`)
  } catch (error) {
    console.log(`❌ Event "${event.title}" atemporal conversion: ERROR - ${error.message}`)
  }
})

console.log('\n🎉 AtempoCal atemporal integration test completed!')