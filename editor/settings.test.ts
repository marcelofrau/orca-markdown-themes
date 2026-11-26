import { assert, test } from 'orca/testing'
import { codeThemeWrites, resolveSettings } from './settings'

const ids = new Set(['github-dark', 'base16/ocean'])
const pages = new Set(['paper', 'nord'])

test('falls back to the defaults for missing or stale values', () => {
  assert.deepEqual(resolveSettings({}, ids, pages), { theme: 'paper', codeTheme: 'ayu-dark', diagramTheme: 'default' })
  assert.deepEqual(resolveSettings({ theme: 'gone', codeTheme: 'gone', diagramTheme: 'gone' }, ids, pages), {
    theme: 'paper',
    codeTheme: 'ayu-dark',
    diagramTheme: 'default'
  })
})

test('keeps a known page theme', () => {
  assert.equal(resolveSettings({ theme: 'nord' }, ids, pages).theme, 'nord')
})

test('a known custom code theme wins over the picker', () => {
  assert.equal(resolveSettings({ codeTheme: 'github-dark', codeThemeCustom: ' base16/ocean ' }, ids, pages).codeTheme, 'base16/ocean')
  assert.equal(resolveSettings({ codeTheme: 'github-dark', codeThemeCustom: 'typo' }, ids, pages).codeTheme, 'github-dark')
  assert.equal(resolveSettings({ codeTheme: 'page' }, ids, pages).codeTheme, 'page')
})

test('writes picker ids to the picker and the rest to the free-text setting', () => {
  const picker = new Set(['ayu-dark', 'page', 'github-dark'])
  assert.deepEqual(codeThemeWrites('github-dark', picker), [['codeTheme', 'github-dark'], ['codeThemeCustom', '']])
  assert.deepEqual(codeThemeWrites('base16/ocean', picker), [['codeThemeCustom', 'base16/ocean']])
})
