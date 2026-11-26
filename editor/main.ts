import { marked } from '../vendor/marked/marked.esm.js'
import mermaid from '../vendor/mermaid/mermaid.esm.min.mjs'
import hljs from '../vendor/highlight/highlight.min.js'
import http from '../vendor/highlight/languages/http.min.js'
import powershell from '../vendor/highlight/languages/powershell.min.js'
import dockerfile from '../vendor/highlight/languages/dockerfile.min.js'
import { start } from './sync'
import { cleanHtml, stripFrontmatter, tokenClasses } from './render'
import { ayuCss, baseCss, hljsLayoutCss } from './theme'
import { pageThemes } from './page-themes'
import { codeThemes } from './code-themes'
import { codeThemeWrites, resolveSettings, type Settings } from './settings'
import { mountMenu } from './menu'
import { fit, zoomable } from './zoom'

// Read-only Markdown preview in one of Tinta's themes, whatever theme Orca uses, with its own
// theme for code blocks (Ayu Dark, the page's, or any highlight.js/base16 one) and for Mermaid
// diagrams. Pick them in Settings → Plugins → Markdown Themes or the gear in the top-right corner.
hljs.registerLanguage('http', http)
hljs.registerLanguage('powershell', powershell)
hljs.registerLanguage('dockerfile', dockerfile)

const codeThemeIds = new Set(codeThemes.map((t) => t.id))
const pickerIds = new Set(['ayu-dark', 'page', ...codeThemes.filter((t) => t.group === 'Popular').map((t) => t.id)])
const SHEETS: Record<Settings['diagramTheme'], string> = {
  default: '#ffffff',
  neutral: '#ffffff',
  forest: '#ffffff',
  dark: '#333333', // Mermaid's dark background
  page: 'var(--page)'
}
const pageThemeIds = new Set(pageThemes.map((t) => t.id))
let settings: Settings = resolveSettings({}, codeThemeIds, pageThemeIds)

const base = document.createElement('style')
base.textContent = baseCss
const page = document.createElement('style') // the Tinta theme, after the layout so its rules win
const code = document.createElement('style') // the code theme over the page theme's code colours
document.head.append(base, page, code)
const root = document.createElement('main')
document.body.append(root)

async function applySettings() {
  const raw = await orca.settings.get().catch(() => ({}) as Record<string, unknown>)
  settings = resolveSettings(raw as Record<string, unknown>, codeThemeIds, pageThemeIds)
  const theme = pageThemes.find((t) => t.id === settings.theme)!
  page.textContent = theme.css
  const hljsTheme = codeThemes.find((t) => t.id === settings.codeTheme)
  code.textContent = settings.codeTheme === 'page' ? '' : hljsLayoutCss + (hljsTheme ? hljsTheme.css : ayuCss)
  document.documentElement.classList.toggle('theme-dark', theme.dark)
  document.documentElement.style.setProperty('--sheet', SHEETS[settings.diagramTheme])
}

/** Mermaid's config for the chosen diagram theme; 'page' derives one from the page theme's colours. */
function mermaidConfig(): Record<string, unknown> {
  const common = { startOnLoad: false, securityLevel: 'strict' }
  if (settings.diagramTheme !== 'page') return { ...common, theme: settings.diagramTheme }
  const css = getComputedStyle(document.documentElement)
  const v = (name: string) => css.getPropertyValue(name).trim()
  return {
    ...common,
    theme: 'base',
    themeVariables: {
      darkMode: document.documentElement.classList.contains('theme-dark'),
      background: v('--page'),
      primaryColor: v('--surface'),
      primaryTextColor: v('--ink'),
      primaryBorderColor: v('--line-firm'),
      secondaryColor: v('--surface-edge'),
      tertiaryColor: v('--page'),
      mainBkg: v('--surface'),
      nodeBorder: v('--line-firm'),
      clusterBkg: v('--page'),
      clusterBorder: v('--line-firm'),
      lineColor: v('--ink-soft'),
      textColor: v('--ink'),
      titleColor: v('--ink-strong'),
      edgeLabelBackground: v('--page'),
      noteBkgColor: v('--surface-edge'),
      noteTextColor: v('--ink'),
      actorBkg: v('--surface'),
      actorBorder: v('--line-firm'),
      actorTextColor: v('--ink'),
      signalColor: v('--ink-soft'),
      signalTextColor: v('--ink')
    }
  }
}

let renderId = 0
let pending = ''

function highlight(block: Element) {
  block.classList.add('hljs') // every code block takes the code theme, highlighted or not
  const language = [...block.classList].find((c) => c.startsWith('language-'))?.slice(9) ?? ''
  if (!language || !hljs.getLanguage(language)) return
  block.innerHTML = hljs.highlight(block.textContent ?? '', { language, ignoreIllegals: true }).value
  if (settings.codeTheme !== 'page') return
  for (const span of block.querySelectorAll('span[class]')) span.classList.add(...tokenClasses([...span.classList]))
}

const save = (writes: [string, string][]) => {
  for (const [key, value] of writes) void orca.settings.set(key, value).catch(() => {})
}
const menu = mountMenu([
  {
    key: 'theme',
    label: 'Page',
    options: pageThemes.map((t) => ({ value: t.id, label: t.name, group: `${t.group}, ${t.dark ? 'dark' : 'light'}` })),
    value: () => settings.theme,
    onChange: (value) => save([['theme', value]])
  },
  {
    key: 'codeTheme',
    label: 'Code blocks',
    options: [
      { value: 'ayu-dark', label: 'Ayu Dark', group: 'Plugin' },
      { value: 'page', label: 'Same as the page theme', group: 'Plugin' },
      ...codeThemes.map((t) => ({ value: t.id, label: t.name.replace(/ \(base16\)$/, ''), group: t.group }))
    ],
    value: () => settings.codeTheme,
    onChange: (value) => save(codeThemeWrites(value, pickerIds))
  },
  {
    key: 'diagramTheme',
    label: 'Diagrams',
    options: [
      { value: 'default', label: 'Mermaid Default (light)' },
      { value: 'neutral', label: 'Mermaid Neutral (light, grey)' },
      { value: 'forest', label: 'Mermaid Forest (light, green)' },
      { value: 'dark', label: 'Mermaid Dark' },
      { value: 'page', label: 'Same as the page theme' }
    ],
    value: () => settings.diagramTheme,
    onChange: (value) => save([['diagramTheme', value]])
  }
])

function button(label: string, title: string, onClick: () => void) {
  const b = document.createElement('button')
  b.type = 'button'
  b.textContent = label
  b.title = title
  b.setAttribute('aria-label', title)
  b.addEventListener('click', onClick)
  return b
}

function toolbar(...buttons: HTMLButtonElement[]) {
  const bar = document.createElement('div')
  bar.className = 'mmd-tools'
  bar.append(...buttons)
  return bar
}

function viewportWith(svg: string) {
  const viewport = document.createElement('div')
  viewport.className = 'mmd-view'
  const content = document.createElement('div')
  content.className = 'mmd-content'
  content.innerHTML = svg
  viewport.append(content)
  return { viewport, content }
}

/** Full-window view of one diagram: wheel zooms, drag pans, Esc or a click outside closes. */
function openOverlay(svg: string) {
  const overlay = document.createElement('div')
  overlay.className = 'mmd-overlay'
  const sheet = document.createElement('div')
  sheet.className = 'mmd-sheet'
  const { viewport, content } = viewportWith(svg)
  const el = content.querySelector('svg')
  const box = el?.viewBox.baseVal
  const w = box?.width || el?.getBoundingClientRect().width || 800
  const h = box?.height || el?.getBoundingClientRect().height || 600
  if (el) {
    el.style.maxWidth = 'none'
    el.setAttribute('width', String(w))
    el.setAttribute('height', String(h))
  }
  const zoom = zoomable(viewport, content, false)
  const fitView = () => zoom.set(fit(w, h, viewport.clientWidth, viewport.clientHeight, 2))
  const close = () => {
    overlay.remove()
    document.removeEventListener('keydown', onKey)
  }
  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') close()
    else if (event.key === '+' || event.key === '=') zoom.zoomIn()
    else if (event.key === '-') zoom.zoomOut()
    else if (event.key === '0') fitView()
  }
  sheet.append(
    toolbar(button('+', 'Zoom in (+)', zoom.zoomIn), button('−', 'Zoom out (-)', zoom.zoomOut), button('Fit', 'Fit to window (0)', fitView), button('✕', 'Close (Esc)', close)),
    viewport
  )
  overlay.append(sheet)
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close()
  })
  document.addEventListener('keydown', onKey)
  document.body.append(overlay)
  requestAnimationFrame(fitView)
}

/** A diagram in the page: drag pans, Ctrl+wheel zooms, buttons zoom, reset and expand. */
function mountDiagram(card: HTMLElement, svg: string) {
  const { viewport, content } = viewportWith(svg)
  const zoom = zoomable(viewport, content, true)
  const reset = () => zoom.set({ scale: 1, x: 0, y: 0 })
  viewport.addEventListener('dblclick', () => openOverlay(svg))
  card.replaceChildren(
    toolbar(button('+', 'Zoom in (or Ctrl+wheel)', zoom.zoomIn), button('−', 'Zoom out', zoom.zoomOut), button('Reset', 'Reset zoom and position', reset), button('⛶', 'Expand (or double-click)', () => openOverlay(svg))),
    viewport
  )
}

async function render(text: string) {
  // C4 measures text while drawing; a hidden frame measures zero, so wait until it is shown.
  if (document.hidden) {
    pending = text
    return
  }
  const run = ++renderId
  const html = await marked.parse(stripFrontmatter(text), { gfm: true })
  if (run !== renderId) return
  const scroll = window.scrollY
  root.replaceChildren(cleanHtml(html))
  for (const code of root.querySelectorAll('pre > code:not(.language-mermaid)')) highlight(code)
  for (const table of root.querySelectorAll('table')) {
    const wrap = document.createElement('div') // full width, and a scroll bar when a table is wider still
    wrap.className = 'table-wrap'
    table.replaceWith(wrap)
    wrap.append(table)
  }
  const blocks = [...root.querySelectorAll('pre > code.language-mermaid')]
  if (blocks.length) mermaid.initialize(mermaidConfig())
  for (const [i, code] of blocks.entries()) {
    const source = code.textContent ?? ''
    const card = document.createElement('div')
    card.className = 'mmd'
    code.parentElement!.replaceWith(card)
    try {
      const { svg } = await mermaid.render(`mmd-${run}-${i}`, source)
      if (run !== renderId) return
      mountDiagram(card, svg)
    } catch (error) {
      document.getElementById(`dmmd-${run}-${i}`)?.remove() // mermaid leaves its scratch node on errors
      card.classList.add('mmd-error')
      const pre = document.createElement('pre')
      pre.textContent = source
      card.replaceChildren(`Diagram error: ${error instanceof Error ? error.message : String(error)}`, pre)
    }
  }
  window.scrollTo(0, scroll)
}

document.addEventListener('visibilitychange', () => {
  if (!document.hidden && pending) {
    const text = pending
    pending = ''
    void render(text)
  }
})

// External links open in the browser; in-page anchors scroll; other links have nowhere to go.
document.addEventListener('click', (event) => {
  const link = (event.target as Element | null)?.closest?.('a')
  if (!link) return
  const href = link.getAttribute('href') ?? ''
  event.preventDefault()
  if (/^(https?:|mailto:)/i.test(href)) {
    void orca.host.call('shell.openExternal', { url: href }).catch(() => {})
  } else if (href.startsWith('#')) {
    document.getElementById(decodeURIComponent(href.slice(1)))?.scrollIntoView()
  }
})

let timer: ReturnType<typeof setTimeout> | undefined
const doc = await start()
await applySettings()
let text = doc.value
void render(text)
doc.onReplace((value) => {
  text = value
  clearTimeout(timer)
  timer = setTimeout(() => void render(text), 300)
})
// A change in Settings (or the gear) restyles at once; the page re-renders for code tokens and diagrams.
orca.settings.onDidChange(() => {
  void applySettings().then(() => {
    menu.refresh()
    return render(text)
  })
})
