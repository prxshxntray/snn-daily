export function normalizeAnswer(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\$/g, '')
    .replace(/[–—−]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/[.,;:]+$/g, '')
}

export function shortAnswerMatches(input: string, acceptable: readonly string[]): boolean {
  const normalized = normalizeAnswer(input)
  if (!normalized) return false
  return acceptable.some((candidate) => {
    const expected = normalizeAnswer(candidate)
    if (!expected) return false
    if (expected === normalized) return true
    const given = Number(normalized)
    const target = Number(expected)
    if (Number.isFinite(given) && Number.isFinite(target)) {
      const tolerance = Math.max(0.015, Math.abs(target) * 0.02)
      return Math.abs(given - target) <= tolerance
    }
    return false
  })
}
