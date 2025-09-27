import { describe, it, expect } from 'vitest'
import { computeLongWeekendsPHT, toPHTMidnightISO, monthsInRange } from '../src/lib/longweekend'
import type { Holiday } from '../src/lib/types'

const h = (dateISO: string, name: string): Holiday => ({
  dateISO,
  name,
  type: 'regular',
  status: 'official',
})

describe('Long Weekend Algorithm (PHT)', () => {
  describe('Natural long weekends (Fri/Mon)', () => {
    it('Friday holiday creates Fri–Sun (3-day weekend)', () => {
      const input: Holiday[] = [h('2025-08-29', 'National Heroes Day (Observed)')] // Fri
      const out = computeLongWeekendsPHT(input)
      expect(out).toHaveLength(1)
      expect(out[0]).toMatchObject({
        type: 'natural',
        title: 'National Heroes Day (Observed)',
        startISO: toPHTMidnightISO('2025-08-29'),
        endISO: toPHTMidnightISO('2025-08-31'),
        durationLabel: '3-day weekend',
      })
    })

    it('Monday holiday creates Sat–Mon (3-day weekend)', () => {
      const input: Holiday[] = [h('2025-06-16', 'Eid al-Adha')] // Mon
      const out = computeLongWeekendsPHT(input)
      expect(out).toHaveLength(1)
      expect(out[0]).toMatchObject({
        type: 'natural',
        title: 'Eid al-Adha',
        startISO: toPHTMidnightISO('2025-06-14'),
        endISO: toPHTMidnightISO('2025-06-16'),
        durationLabel: '3-day weekend',
      })
    })
  })

  describe('Suggested long weekends (Tue/Thu) full 4-day span', () => {
    it('Tuesday holiday → Mon leave → Sat–Tue', () => {
      const input: Holiday[] = [h('2025-12-30', 'Rizal Day')] // Tue
      const out = computeLongWeekendsPHT(input)
      expect(out).toHaveLength(1)
      expect(out[0]).toMatchObject({
        type: 'suggested',
        title: 'Rizal Day',
        startISO: toPHTMidnightISO('2025-12-27'), // Sat
        endISO: toPHTMidnightISO('2025-12-30'),   // Tue
        durationLabel: '4-day weekend',
      })
      expect(out[0].suggestedLeaveISO).toBe(toPHTMidnightISO('2025-12-29')) // Mon
    })

    it('Thursday holiday → Fri leave → Thu–Sun', () => {
      const input: Holiday[] = [h('2025-12-25', 'Christmas Day')] // Thu
      const out = computeLongWeekendsPHT(input)
      expect(out).toHaveLength(1)
      expect(out[0]).toMatchObject({
        type: 'suggested',
        title: 'Christmas Day',
        startISO: toPHTMidnightISO('2025-12-25'), // Thu
        endISO: toPHTMidnightISO('2025-12-28'),   // Sun
        durationLabel: '4-day weekend',
      })
      expect(out[0].suggestedLeaveISO).toBe(toPHTMidnightISO('2025-12-26')) // Fri
    })
  })

  describe('Month/year boundaries', () => {
    it('Tuesday holiday on Jan 2 includes prior year weekend (Sat–Tue across years)', () => {
      const input: Holiday[] = [h('2024-01-02', 'Special Holiday')] // Tue
      const out = computeLongWeekendsPHT(input)
      expect(out).toHaveLength(1)
      expect(out[0]).toMatchObject({
        startISO: toPHTMidnightISO('2023-12-30'), // Sat
        endISO: toPHTMidnightISO('2024-01-02'),   // Tue
      })
      const months = monthsInRange(out[0].startISO, out[0].endISO)
      expect(months).toEqual([
        { year: 2023, month: 11 }, // December
        { year: 2024, month: 0 },  // January
      ])
    })
  })

  describe('Sorting and de-duplication', () => {
    it('Results are sorted ascending by start date', () => {
      const input: Holiday[] = [
        h('2025-12-30', 'Rizal Day'),     // Tue → start 2025-12-27
        h('2025-12-25', 'Christmas Day'), // Thu → start 2025-12-25
      ]
      const out = computeLongWeekendsPHT(input)
      expect(out).toHaveLength(2)
      expect(out[0].startISO < out[1].startISO).toBe(true)
      expect(out[0].title).toBe('Christmas Day')
      expect(out[1].title).toBe('Rizal Day')
    })

    it('Identical duplicates are removed', () => {
      const input: Holiday[] = [h('2025-12-25', 'Christmas Day'), h('2025-12-25', 'Christmas Day')]
      const out = computeLongWeekendsPHT(input)
      // only one result for identical duplicates
      expect(out).toHaveLength(1)
    })
  })
})
