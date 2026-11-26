import { assert, test } from 'orca/testing'
import { codeThemeWrites, resolveSettings } from './settings'

const ids = new Set(['github-dark', 'base16/ocean'])

test('falls back to the defaults for missing or stale values', () => {
  assert.deepEqual(resolveSettings({}, ids), { theme: 'paper', codeTheme: 'ayu-dark', diagramTheme: 'default' })
  assert.deepEqual(resolveSettings({ theme: 'gone', codeTheme: 'gone', diagramTheme: 'gone' }, ids), {
    theme: 'paper',
    codeTheme: 'ayu-dark',
    diagramTheme: 'default'
  })
})

test('a known custom code theme wins over the picker', () => {
  assert.equal(resolveSettings({ codeTheme: 'github-dark', codeThemeCustom: ' base16/ocean ' }, ids).codeTheme, 'base16/ocean')
  assert.equal(resolveSettings({ codeTheme: 'github-dark', codeThemeCustom: 'typo' }, ids).codeTheme, 'github-dark')
  assert.equal(resolveSettings({ codeTheme: 'page' }, ids).codeTheme, 'page')
})

test('writes picker ids to the picker and the rest to the free-text setting', () => {
  const picker = new Set(['ayu-dark', 'page', 'github-dark'])
  assert.deepEqual(codeThemeWrites('github-dark', picker), [['codeTheme', 'github-dark'], ['codeThemeCustom', '']])
  assert.deepEqual(codeThemeWrites('base16/ocean', picker), [['codeThemeCustom', 'base16/ocean']])
})
