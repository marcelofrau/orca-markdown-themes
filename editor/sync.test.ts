import { assert, mockEditorHost, test } from 'orca/testing'
import { start } from './sync'

test('merges an outside write that lands while an edit waits', async () => {
  const host = mockEditorHost({ text: 'first' })
  const doc = await start()
  doc.change('first\nmine')
  host.replace('theirs') // an agent writes the file first
  await host.flush() // as a save: conflict, merge, resend
  assert.equal(host.text, 'theirs\nfirst\nmine')
  doc.dispose()
  host.dispose()
})
