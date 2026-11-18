import seed from '../seed/default-progress.json'
import type { StudyState } from './progress.ts'

export const RESTORE_CODE = 'NOV17-220'

export const seededProgress = seed as StudyState

export function progressFromCode(code: string): StudyState | null {
  if (code.trim().toUpperCase() === RESTORE_CODE) {
    return structuredClone(seededProgress)
  }
  return null
}
