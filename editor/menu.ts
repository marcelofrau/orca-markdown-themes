export interface Option {
  value: string
  label: string
  group?: string
}

export interface Field {
  key: string
  label: string
  options: Option[]
  value: () => string
  onChange: (value: string) => void
}

function select(field: Field) {
  const el = document.createElement('select')
  el.setAttribute('aria-label', field.label)
  const groups = new Map<string, HTMLElement>()
  for (const option of field.options) {
    const item = document.createElement('option')
    item.value = option.value
    item.textContent = option.label
    let parent: HTMLElement = el
    if (option.group) {
      parent = groups.get(option.group) ?? el.appendChild(Object.assign(document.createElement('optgroup'), { label: option.group }))
      groups.set(option.group, parent)
    }
    parent.append(item)
  }
  el.addEventListener('change', () => field.onChange(el.value))
  return el
}

/**
 * A quiet gear in the top-right corner that opens the viewer's theme pickers. Choices are saved
 * to the plugin's Orca settings, so Settings and every open viewer follow.
 */
export function mountMenu(fields: Field[]) {
  const gear = document.createElement('button')
  gear.type = 'button'
  gear.className = 'mt-gear'
  gear.textContent = '⚙'
  gear.title = 'Themes'
  gear.setAttribute('aria-label', 'Themes')
  gear.setAttribute('aria-expanded', 'false')

  const panel = document.createElement('div')
  panel.className = 'mt-panel'
  panel.hidden = true
  const selects = fields.map((field) => {
    const label = document.createElement('label')
    const name = document.createElement('span')
    name.textContent = field.label
    const el = select(field)
    label.append(name, el)
    panel.append(label)
    return { field, el }
  })
  const note = document.createElement('p')
  note.className = 'mt-note'
  note.textContent = 'Saved to Settings → Plugins → Markdown Themes.'
  panel.append(note)

  const show = (open: boolean) => {
    panel.hidden = !open
    gear.setAttribute('aria-expanded', String(open))
    if (open) for (const { field, el } of selects) el.value = field.value()
  }
  gear.addEventListener('click', () => show(panel.hidden))
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) show(false)
  })
  document.addEventListener('pointerdown', (event) => {
    const target = event.target as Node
    if (!panel.hidden && !panel.contains(target) && !gear.contains(target)) show(false)
  })
  document.body.append(gear, panel)
  return { refresh: () => !panel.hidden && show(true) }
}
