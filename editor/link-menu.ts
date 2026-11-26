// A small menu at a clicked link: Open in browser and Copy link. The frame cannot reach Orca's own
// browser or other plugins, so these are the two things a link can do from here.

/** Copies `text`; true when the clipboard took it. Tries the async API, then the legacy command. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.cssText = 'position:fixed;top:-1000px;opacity:0'
    document.body.append(area)
    area.select()
    let ok = false
    try {
      ok = document.execCommand('copy')
    } catch {
      ok = false
    }
    area.remove()
    return ok
  }
}

let open: { close: () => void } | null = null

export function closeLinkMenu(): void {
  open?.close()
}

/** Shows the menu under `anchor` for `href`; `openExternal` opens it in the system browser. */
export function showLinkMenu(anchor: Element, href: string, openExternal: (url: string) => Promise<unknown>): void {
  closeLinkMenu()
  const menu = document.createElement('div')
  menu.className = 'link-menu'
  menu.setAttribute('role', 'menu')
  const url = document.createElement('div')
  url.className = 'link-menu-url'
  url.textContent = href
  url.title = href

  const status = document.createElement('div')
  status.className = 'link-menu-status'

  const item = (label: string, run: () => Promise<void> | void) => {
    const b = document.createElement('button')
    b.type = 'button'
    b.setAttribute('role', 'menuitem')
    b.textContent = label
    b.addEventListener('click', () => void run())
    return b
  }

  const close = () => {
    menu.remove()
    document.removeEventListener('pointerdown', onOutside, true)
    document.removeEventListener('keydown', onKey, true)
    window.removeEventListener('scroll', close, true)
    if (open?.close === close) open = null
  }
  const onOutside = (event: Event) => {
    if (!menu.contains(event.target as Node)) close()
  }
  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') close()
  }

  menu.append(
    url,
    item('Open in browser', async () => {
      close()
      await openExternal(href).catch(() => {})
    }),
    item('Copy link', async () => {
      if (await copyText(href)) {
        status.textContent = 'Copied.'
        setTimeout(close, 700)
        return
      }
      // No clipboard in this frame: leave the address selected for Ctrl+C.
      status.textContent = 'Press Ctrl+C to copy.'
      const range = document.createRange()
      range.selectNodeContents(url)
      const selection = window.getSelection()
      selection?.removeAllRanges()
      selection?.addRange(range)
    }),
    status
  )

  document.body.append(menu)
  const box = anchor.getBoundingClientRect()
  const width = menu.offsetWidth
  const height = menu.offsetHeight
  const left = Math.max(8, Math.min(box.left, window.innerWidth - width - 8))
  const below = box.bottom + 4
  const top = below + height > window.innerHeight - 8 ? Math.max(8, box.top - height - 4) : below
  menu.style.left = `${left}px`
  menu.style.top = `${top}px`
  ;(menu.querySelector('button') as HTMLButtonElement | null)?.focus()

  // Listen after this click has finished, so the click that opened the menu does not close it.
  setTimeout(() => {
    document.addEventListener('pointerdown', onOutside, true)
    document.addEventListener('keydown', onKey, true)
    window.addEventListener('scroll', close, true)
  })
  open = { close }
}
