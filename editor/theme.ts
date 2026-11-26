// Layout only: colours, faces and type sizes come from the chosen page theme (page-themes.ts),
// which every rule here reads through its variables. Tinta draws body size and column width itself,
// so those are ours.
export const baseCss = `
html, body { margin: 0; background-color: var(--page); }
body { font-size: 16px; line-height: 1.65; }
/* Width (Settings > Width, or the gear): a centred reading column, a third of its side margins, or edge to edge */
main { box-sizing: border-box; padding: 32px 40px 80px; }
:root.width-comfortable main { max-width: calc(46em + 80px); margin: 0 auto; }
:root.width-wide main { padding-inline: calc(max(0px, 100vw - 46em - 80px) / 6 + 14px); }
:root.width-full main { padding-inline: 24px; }
::selection { background: color-mix(in srgb, var(--link) 22%, transparent); }

h1, h2, h3, h4, h5, h6 { line-height: 1.25; margin: 1.5em 0 0.6em; }
code, pre { font-size: 14px; }
:not(pre) > code { background-color: var(--surface); color: var(--code); padding: 0.1em 0.4em; }
pre { padding: 14px 16px; overflow: auto; line-height: 1.5; }
pre code { background: none; padding: 0; color: inherit; }

blockquote { margin: 1em 0; padding: 0 1em; border-left: 3px solid var(--quote); }
.alert-title { font-weight: 600; margin-bottom: 0.25em; }
blockquote.alert-note .alert-title { color: #0969da; }
blockquote.alert-tip .alert-title { color: #1a7f37; }
blockquote.alert-important .alert-title { color: #8250df; }
blockquote.alert-warning .alert-title { color: #9a6700; }
blockquote.alert-caution .alert-title { color: #cf222e; }
:root.theme-dark blockquote.alert-note .alert-title { color: #4493f8; }
:root.theme-dark blockquote.alert-tip .alert-title { color: #3fb950; }
:root.theme-dark blockquote.alert-important .alert-title { color: #ab7df8; }
:root.theme-dark blockquote.alert-warning .alert-title { color: #d29922; }
:root.theme-dark blockquote.alert-caution .alert-title { color: #f85149; }

.table-wrap { overflow-x: auto; margin: 1em 0; }
table { border-collapse: collapse; width: 100%; }
th, td { text-align: left; vertical-align: top; }
hr { border: 0; border-top: 1px solid var(--line); }
img { max-width: 100%; }

/* Mermaid: each diagram on its own sheet, coloured for the diagram theme (--sheet, set by main.ts) */
.mmd { position: relative; background: var(--sheet, #ffffff); border: 1px solid var(--surface-edge); border-radius: 10px; padding: 16px; margin: 1em 0; text-align: center; }
.mmd svg { max-width: 100%; height: auto; }
.mmd-error { background: #fff4f0; color: #8b2500; text-align: left; }
.mmd-view { overflow: hidden; cursor: grab; touch-action: none; user-select: none; }
.mmd-view.dragging { cursor: grabbing; }
.mmd-tools { position: absolute; top: 8px; right: 8px; z-index: 1; display: flex; gap: 4px; opacity: 0; transition: opacity .15s; }
.mmd:hover .mmd-tools, .mmd-tools:focus-within, .mmd-sheet .mmd-tools { opacity: 1; }
.mmd-tools button {
  font: 13px "Segoe UI", sans-serif; min-width: 28px; height: 28px; padding: 0 8px; cursor: pointer;
  color: #3d3329; background: #f5f1e8; border: 1px solid #c1bcb3; border-radius: 6px;
}
.mmd-tools button:hover { background: #ece5d8; }
.mmd-overlay { position: fixed; inset: 0; z-index: 100; background: rgba(0, 0, 0, 0.55); display: flex; padding: 24px; box-sizing: border-box; }
.mmd-sheet { position: relative; flex: 1; background: var(--sheet, #ffffff); border-radius: 12px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.35); overflow: hidden; display: flex; }
.mmd-sheet .mmd-view { flex: 1; }
.mmd-sheet .mmd-content { display: inline-block; text-align: left; }
/* The gear and its theme pickers */
.mt-gear {
  position: fixed; top: 10px; right: 12px; z-index: 50; width: 30px; height: 30px; padding: 0;
  font-size: 16px; line-height: 28px; cursor: pointer; border-radius: 50%;
  color: var(--ink-soft); background: var(--page); border: 1px solid var(--line);
  opacity: 0.45; transition: opacity .15s;
}
.mt-gear:hover, .mt-gear:focus-visible, .mt-gear[aria-expanded="true"] { opacity: 1; }
.mt-panel {
  position: fixed; top: 46px; right: 12px; z-index: 50; width: 300px; padding: 14px 16px 10px;
  display: grid; gap: 10px; font: 13px "Segoe UI", sans-serif;
  color: var(--ink); background: var(--page); border: 1px solid var(--line-firm); border-radius: 10px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
}
.mt-panel[hidden] { display: none; }
.mt-panel label { display: grid; gap: 4px; }
.mt-panel span { color: var(--ink-soft); font-weight: 600; }
.mt-panel select {
  font: inherit; padding: 5px 6px; border-radius: 6px;
  color: var(--ink); background: var(--surface); border: 1px solid var(--line-firm);
}
.mt-note { margin: 2px 0 0; color: var(--ink-soft); font-size: 12px; }
`

// Code blocks in a highlight.js theme (or Ayu Dark): the block takes the theme's background, the
// page theme's own pre styling steps aside.
export const hljsLayoutCss = `
pre { background: none; border: 0; padding: 0; border-radius: 10px; overflow: hidden; }
pre > code.hljs {
  display: block; padding: 14px 16px; overflow-x: auto; border-radius: 10px;
  border: 1px solid color-mix(in srgb, currentColor 14%, transparent);
}
`

// Ayu Dark (colours from Orca's bundled Ayu theme).
export const ayuCss = `
.hljs { background-color: #10141c; color: #bfbdb6; }
.hljs-comment, .hljs-quote { color: #5a6673; font-style: italic; }
.hljs-keyword, .hljs-selector-tag, .hljs-meta .hljs-keyword { color: #ff8f40; }
.hljs-string, .hljs-symbol, .hljs-template-tag, .hljs-addition { color: #aad94c; }
.hljs-regexp, .hljs-char.escape_, .hljs-link { color: #95e6cb; }
.hljs-number, .hljs-literal, .hljs-params { color: #d2a6ff; }
.hljs-operator, .hljs-built_in { color: #f29668; }
.hljs-attr, .hljs-attribute, .hljs-property, .hljs-name, .hljs-tag, .hljs-type, .hljs-title.class_ { color: #39bae6; }
.hljs-title, .hljs-title.function_, .hljs-section { color: #ffb454; }
.hljs-variable, .hljs-template-variable, .hljs-subst { color: #bfbdb6; }
.hljs-variable.language_, .hljs-meta { color: #e6c08a; }
.hljs-punctuation { color: #8b8b88; }
.hljs-deletion { color: #f26d78; }
.hljs-emphasis { font-style: italic; }
.hljs-strong { font-weight: bold; }
`
