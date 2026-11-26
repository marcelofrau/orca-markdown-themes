export interface View {
  scale: number
  x: number
  y: number
}

export const MIN_SCALE = 0.1
export const MAX_SCALE = 10

/** Scales by `factor` around the point (cx, cy) of the viewport, so that point stays put. */
export function zoomAround(view: View, factor: number, cx: number, cy: number): View {
  const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, view.scale * factor))
  const f = scale / view.scale
  return { scale, x: cx - (cx - view.x) * f, y: cy - (cy - view.y) * f }
}

/** Scale and offset that fit a `w`×`h` drawing inside a `vw`×`vh` viewport, centred, scale at most `max`. */
export function fit(w: number, h: number, vw: number, vh: number, max = 1): View {
  const scale = Math.min(max, vw / w, vh / h)
  return { scale, x: (vw - w * scale) / 2, y: (vh - h * scale) / 2 }
}

/**
 * Pan by dragging, zoom with the wheel (with Ctrl only when `wheelNeedsCtrl`, so the page still
 * scrolls), on `content` inside `viewport`. Returns the controls the buttons call.
 */
export function zoomable(viewport: HTMLElement, content: HTMLElement, wheelNeedsCtrl: boolean) {
  let view: View = { scale: 1, x: 0, y: 0 }
  const apply = () => {
    content.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.scale})`
  }
  const centre = (factor: number) => {
    view = zoomAround(view, factor, viewport.clientWidth / 2, viewport.clientHeight / 2)
    apply()
  }
  content.style.transformOrigin = '0 0'

  viewport.addEventListener(
    'wheel',
    (event) => {
      if (wheelNeedsCtrl && !event.ctrlKey) return
      event.preventDefault()
      const box = viewport.getBoundingClientRect()
      view = zoomAround(view, Math.exp(-event.deltaY * 0.0015), event.clientX - box.left, event.clientY - box.top)
      apply()
    },
    { passive: false }
  )

  let drag: { id: number; x: number; y: number } | null = null
  viewport.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return
    drag = { id: event.pointerId, x: event.clientX - view.x, y: event.clientY - view.y }
    viewport.setPointerCapture(event.pointerId)
    viewport.classList.add('dragging')
  })
  viewport.addEventListener('pointermove', (event) => {
    if (!drag || drag.id !== event.pointerId) return
    view = { ...view, x: event.clientX - drag.x, y: event.clientY - drag.y }
    apply()
  })
  const end = (event: PointerEvent) => {
    if (drag?.id !== event.pointerId) return
    drag = null
    viewport.classList.remove('dragging')
  }
  viewport.addEventListener('pointerup', end)
  viewport.addEventListener('pointercancel', end)

  return {
    zoomIn: () => centre(1.25),
    zoomOut: () => centre(1 / 1.25),
    set(next: View) {
      view = next
      apply()
    }
  }
}
