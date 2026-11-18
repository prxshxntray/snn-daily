import { seededProgress } from './seed.ts'
import { emptyState, type StudyState } from './progress.ts'

const KEY = 'first-spike.v4'

export type BackupFile = {
  app: 'first-spike'
  version: 2
  exportedAt: string
  state: StudyState
}

export function loadState(): StudyState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return structuredClone(seededProgress)
    const parsed = JSON.parse(raw) as unknown
    return sanitizeState(parsed) ?? emptyState()
  } catch {
    return emptyState()
  }
}

export function saveState(state: StudyState): void {
  localStorage.setItem(KEY, JSON.stringify(state))
}

export function exportBackup(state: StudyState, now = new Date()): string {
  const file: BackupFile = {
    app: 'first-spike',
    version: 2,
    exportedAt: now.toISOString(),
    state,
  }
  return JSON.stringify(file, null, 2)
}

export function parseBackup(raw: string): { ok: true; state: StudyState } | { ok: false; error: string } {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw) as unknown
  } catch {
    return { ok: false, error: 'That file is not JSON.' }
  }
  const candidate =
    parsed && typeof parsed === 'object' && 'state' in parsed
      ? (parsed as { state?: unknown }).state
      : parsed
  const state = sanitizeState(candidate)
  if (!state) return { ok: false, error: 'That backup is not from this version of First Spike.' }
  return { ok: true, state }
}

function sanitizeState(value: unknown): StudyState | null {
  if (!value || typeof value !== 'object') return null
  const record = value as Partial<StudyState>
  if (record.version !== 2) return null
  const blank = emptyState()
  return {
    ...blank,
    courseId: typeof record.courseId === 'string' ? record.courseId : blank.courseId,
    startDateOverride: typeof record.startDateOverride === 'string' ? record.startDateOverride : null,
    readAheadAll: Boolean(record.readAheadAll),
    readAheadIds: stringArray(record.readAheadIds),
    muted: Boolean(record.muted),
    xp: typeof record.xp === 'number' ? record.xp : 0,
    concepts: isRecord(record.concepts) ? (record.concepts as StudyState['concepts']) : {},
    levelClears: isRecord(record.levelClears) ? (record.levelClears as StudyState['levelClears']) : {},
    activity: isRecord(record.activity) ? (record.activity as StudyState['activity']) : {},
    installHintDismissed: Boolean(record.installHintDismissed),
    resume:
      record.resume &&
      typeof record.resume === 'object' &&
      typeof (record.resume as { levelId?: unknown }).levelId === 'string'
        ? {
            levelId: (record.resume as { levelId: string }).levelId,
            cardIndex: Number((record.resume as { cardIndex?: number }).cardIndex) || 0,
          }
        : null,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}
