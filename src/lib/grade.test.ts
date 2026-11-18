import { describe, expect, it } from 'vitest'
import { shortAnswerMatches } from './grade.ts'

describe('shortAnswerMatches', () => {
  it('accepts numeric equivalents and trims prose', () => {
    expect(shortAnswerMatches(' 0.20 ', ['0.2'])).toBe(true)
    expect(shortAnswerMatches('0.25', ['0.2'])).toBe(false)
    expect(shortAnswerMatches('Subtract', ['subtract'])).toBe(true)
    expect(shortAnswerMatches('snn.Leaky', ['snn.Leaky', 'Leaky'])).toBe(true)
    expect(shortAnswerMatches('', ['0'])).toBe(false)
  })
})
