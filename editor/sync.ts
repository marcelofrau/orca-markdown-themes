/** A stand-in merge for plain text: take the side that changed; when both did, keep theirs and
 *  then yours. Replace it with your format's merge (by element id, never by array position). */
export function mergeText(base: string, outside: string, mine: string): string {
  if (mine === base) {
    return outside
  }
  if (outside === base) {
    return mine
  }
  return `${outside}\n${mine}`
}

/** The only code that talks to Orca: sends edits, keeps unsaved typing, merges outside writes. */
export function start() {
  const document = orca.document
  if (!document) {
    throw new Error('this file runs as a custom editor')
  }
  return document.session<string>({ merge: mergeText })
}
