export const DIAGRAM_THEMES = ['default', 'neutral', 'forest', 'dark', 'page'] as const
/** Code themes of the plugin itself, besides the highlight.js ones. */
export const OWN_CODE_THEMES = ['ayu-dark', 'page'] as const

export interface Settings {
  theme: string
  /** 'ayu-dark', 'page' or a highlight.js theme id such as 'github-dark' or 'base16/ocean'. */
  codeTheme: string
  diagramTheme: (typeof DIAGRAM_THEMES)[number]
}

const pick = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
  allowed.includes(value as T) ? (value as T) : fallback

/** Settings as stored (anything may be missing or stale) to what the viewer draws. */
export function resolveSettings(raw: Record<string, unknown>, codeThemeIds: ReadonlySet<string>, pageThemeIds: ReadonlySet<string>): Settings {
  const known = (id: unknown) => typeof id === 'string' && (codeThemeIds.has(id) || (OWN_CODE_THEMES as readonly string[]).includes(id))
  const custom = typeof raw.codeThemeCustom === 'string' ? raw.codeThemeCustom.trim() : ''
  return {
    theme: typeof raw.theme === 'string' && pageThemeIds.has(raw.theme) ? raw.theme : 'paper',
    codeTheme: known(custom) ? custom : known(raw.codeTheme) ? (raw.codeTheme as string) : 'ayu-dark',
    diagramTheme: pick(raw.diagramTheme, DIAGRAM_THEMES, 'default')
  }
}

/**
 * The settings writes that choose `id` as the code theme: the Settings picker holds only
 * `pickerIds` (Orca caps a picker at 64 values), every other id goes to the free-text setting.
 */
export function codeThemeWrites(id: string, pickerIds: ReadonlySet<string>): [string, string][] {
  return pickerIds.has(id) ? [['codeTheme', id], ['codeThemeCustom', '']] : [['codeThemeCustom', id]]
}
