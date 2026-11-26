/** Drops a leading YAML front matter block, which Markdown would show as a rule and a paragraph. */
export function stripFrontmatter(text: string): string {
  return text.replace(/^---\r?\n[\s\S]*?\r?\n---[ \t]*(\r?\n|$)/, '')
}

/** GitHub-style heading anchor: lower case, punctuation dropped, spaces to dashes. */
export function slug(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/\s/g, '-')
}

const ALERTS = ['note', 'tip', 'important', 'warning', 'caution'] as const

/** The GitHub alert a quote opens with (`> [!NOTE]`), or null. */
export function alertKind(firstLine: string): (typeof ALERTS)[number] | null {
  const kind = /^\s*\[!(\w+)\]/.exec(firstLine)?.[1]?.toLowerCase()
  return (ALERTS as readonly string[]).includes(kind ?? '') ? (kind as (typeof ALERTS)[number]) : null
}

/** Highlight.js classes to the Prism-style `.token` classes Tinta's themes colour. */
const TOKENS: [string, string][] = [
  ['hljs-keyword', 'keyword'],
  ['hljs-selector-tag', 'keyword'],
  ['hljs-built_in', 'keyword'],
  ['hljs-string', 'string'],
  ['hljs-symbol', 'string'],
  ['hljs-addition', 'string'],
  ['hljs-comment', 'comment'],
  ['hljs-quote', 'comment'],
  ['hljs-number', 'number'],
  ['hljs-literal', 'number'],
  ['hljs-title', 'function'],
  ['hljs-section', 'function'],
  ['hljs-attr', 'class-name'],
  ['hljs-attribute', 'class-name'],
  ['hljs-type', 'class-name'],
  ['hljs-name', 'class-name']
]

export function tokenClasses(hljsClasses: readonly string[]): string[] {
  if (hljsClasses.includes('class_')) return ['token', 'class-name']
  const match = TOKENS.find(([from]) => hljsClasses.includes(from))
  return match ? ['token', match[1]] : []
}

/** Parses rendered Markdown without running it and removes what could run code. */
export function cleanHtml(html: string): DocumentFragment {
  const template = document.createElement('template')
  template.innerHTML = html
  const content = template.content
  content.querySelectorAll('script, iframe, object, embed, style, link, meta, base, form').forEach((el) => el.remove())
  for (const el of content.querySelectorAll('*')) {
    for (const attr of [...el.attributes]) {
      const value = attr.value.trim().toLowerCase()
      if (attr.name.startsWith('on') || ((attr.name === 'href' || attr.name === 'src') && value.startsWith('javascript:'))) {
        el.removeAttribute(attr.name)
      }
    }
  }
  const seen = new Map<string, number>()
  for (const heading of content.querySelectorAll('h1, h2, h3, h4, h5, h6')) {
    const base = slug(heading.textContent ?? '')
    const count = seen.get(base) ?? 0
    seen.set(base, count + 1)
    heading.id = count ? `${base}-${count}` : base
  }
  for (const quote of content.querySelectorAll('blockquote')) {
    const first = quote.querySelector(':scope > p')
    const kind = first ? alertKind(first.textContent ?? '') : null
    if (!first || !kind) continue
    quote.classList.add(`alert-${kind}`)
    // drop the "[!NOTE]" marker (and the line break after it) from the first paragraph
    const marker = first.firstChild
    if (marker?.nodeType === Node.TEXT_NODE) marker.textContent = (marker.textContent ?? '').replace(/^\s*\[!\w+\]\s*/, '')
    if (first.firstChild?.nodeName === 'BR') first.firstChild.remove()
    if (!first.textContent?.trim() && !first.querySelector('img')) first.remove()
    const title = document.createElement('p')
    title.className = 'alert-title'
    title.textContent = kind[0].toUpperCase() + kind.slice(1)
    quote.prepend(title)
  }
  return content
}
