import { assert, test } from 'orca/testing'
import { fit, zoomAround } from './zoom'

test('zooming keeps the point under the cursor in place', () => {
  const view = { scale: 1, x: 10, y: 20 }
  const next = zoomAround(view, 2, 110, 120)
  // the drawing point under (110, 120) was (100, 100); it must still map to (110, 120)
  assert.equal(next.scale, 2)
  assert.equal(next.x + 100 * next.scale, 110)
  assert.equal(next.y + 100 * next.scale, 120)
})

test('zoom is clamped', () => {
  assert.equal(zoomAround({ scale: 8, x: 0, y: 0 }, 4, 0, 0).scale, 10)
  assert.equal(zoomAround({ scale: 0.2, x: 0, y: 0 }, 0.1, 0, 0).scale, 0.1)
})

test('fit centres and never upscales past max', () => {
  assert.deepEqual(fit(200, 100, 400, 400), { scale: 1, x: 100, y: 150 })
  assert.deepEqual(fit(800, 400, 400, 400), { scale: 0.5, x: 0, y: 100 })
  assert.equal(fit(100, 100, 400, 400, 3).scale, 3)
})
