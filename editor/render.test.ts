import { assert, test } from 'orca/testing'
import { alertKind, slug, stripFrontmatter, tokenClasses } from './render'

test('drops front matter only at the top', () => {
  assert.equal(stripFrontmatter('---\ntitle: x\n---\n# Hi\n'), '# Hi\n')
  assert.equal(stripFrontmatter('---\r\na: 1\r\n---\r\nbody'), 'body')
  assert.equal(stripFrontmatter('# Hi\n---\na\n---\n'), '# Hi\n---\na\n---\n')
})

test('slugs headings like GitHub', () => {
  assert.equal(slug('Size of the job (counted)'), 'size-of-the-job-counted')
  assert.equal(slug('Status / Sources'), 'status--sources')
})

test('recognises GitHub alerts only', () => {
  assert.equal(alertKind('[!NOTE]'), 'note')
  assert.equal(alertKind(' [!Warning] be careful'), 'warning')
  assert.equal(alertKind('[!FOO]'), null)
  assert.equal(alertKind('Status: draft'), null)
})

test('maps highlight.js classes to Tinta tokens', () => {
  assert.deepEqual(tokenClasses(['hljs-keyword']), ['token', 'keyword'])
  assert.deepEqual(tokenClasses(['hljs-title', 'class_']), ['token', 'class-name'])
  assert.deepEqual(tokenClasses(['hljs-title', 'function_']), ['token', 'function'])
  assert.deepEqual(tokenClasses(['hljs-punctuation']), [])
})
