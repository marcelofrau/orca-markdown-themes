<div align="center">

# Markdown Themes for Orca

**Read your Markdown in beautiful themes inside [Orca](https://github.com/stablyai/orca), whatever theme Orca itself uses.**

[![Release](https://img.shields.io/github/v/release/marcelofrau/orca-markdown-themes?sort=semver&color=b85a3c)](https://github.com/marcelofrau/orca-markdown-themes/releases)
[![License: GPL v3](https://img.shields.io/badge/license-GPL--3.0-blue.svg)](LICENSE)
[![Orca](https://img.shields.io/badge/Orca-%E2%89%A5%201.4.248-6d645b)](https://github.com/stablyai/orca)
[![Page themes](https://img.shields.io/badge/page%20themes-10-aa5337)](#page-themes)
[![Code themes](https://img.shields.io/badge/code%20themes-260-39bae6)](#code-block-themes)
[![Mermaid](https://img.shields.io/badge/Mermaid-11.17-ff3670)](https://mermaid.js.org)

</div>

Markdown Themes is a read-only Markdown viewer for Orca. It renders `.md` files with the ten
hand-tuned themes of the [Tinta](https://github.com/oipoistar/tinta) Markdown reader, gives code
blocks and Mermaid diagrams a theme of their own, and lets you zoom, pan and expand every diagram.
Read in a warm sepia page while Orca stays dark, or the other way round.

## Features

- **10 page themes** from Tinta, with their colours, fonts, type scale, tables, quotes and GitHub
  alerts (`> [!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`, `[!CAUTION]`).
- **260 code block themes**: Ayu Dark, the page theme's own colours, every highlight.js theme
  (GitHub, Atom One, Monokai, Nord, Night Owl, Tokyo Night, Rosé Pine...) and all base16 schemes
  (Dracula, Gruvbox, Solarized, Material...).
- **Mermaid diagrams in their own theme**: Mermaid Default, Neutral, Forest or Dark, or colours
  derived from the page theme. Each diagram sits on its own sheet, so `style`/`classDef` colours
  and C4 diagrams stay readable on dark pages.
- **Zoom, pan and expand diagrams**: drag to pan, Ctrl+wheel or the buttons to zoom,
  double-click or ⛶ to open a diagram full-window.
- **Switch themes from the viewer**: a quiet gear in the top-right corner, kept in sync with
  Orca's Settings.
- Live updates while the file changes, front matter hidden, heading anchors, syntax highlighting
  for 40+ languages.

## Install

You need the Orca desktop app, version 1.4.248 or newer, and its `orca` CLI.

```sh
orca plugin install marcelofrau/orca-markdown-themes
```

The plugin shows its own code in an editor frame and reads its own settings, so Orca asks you to
approve it first. The command prints what the plugin gets and the exact command to approve it:

```sh
orca plugin install marcelofrau/orca-markdown-themes --approve <fingerprint>
```

Update with `orca plugin update`, remove with `orca plugin uninstall`.

## Use

1. Open any `.md` file in Orca.
2. Switch the view toggle beside **Source** to **Markdown Themes**. Orca always opens Markdown in
   its own viewer first, and a plugin cannot change that.
3. Pick the themes with the **⚙** gear in the top-right corner of the viewer, or in
   **Settings → Plugins → Markdown Themes**.

| Diagram controls | In the page | Full-window |
| --- | --- | --- |
| Pan | drag | drag |
| Zoom | Ctrl+wheel, **+** / **−** | wheel, `+` / `-` |
| Reset / fit | **Reset** | **Fit**, `0` |
| Open / close | double-click, **⛶** | Esc, click outside |

### Settings

| Setting | Values | Default |
| --- | --- | --- |
| Page theme | the 10 Tinta themes | Paper |
| Code blocks | Ayu Dark, Same as the page theme, 30 popular themes | Ayu Dark |
| Code blocks: any other theme | any highlight.js or base16 id, such as `kimbie-dark` or `base16/ocean` (overrides Code blocks) | empty |
| Diagrams | Mermaid Default, Neutral, Forest, Dark, Same as the page theme | Mermaid Default |

Orca caps a settings picker at 64 values, so the full list of code themes lives in the viewer's
gear menu, which fills in the free-text setting for you.

## Themes

### Page themes

| Light | Dark |
| --- | --- |
| **Paper**: warm sepia, a page from a manuscript | **Midnight**: deep navy, quiet and cool |
| **Arctic**: cool blue, crisp air | **Dracula**: the Dracula palette |
| **Dusk**: warm amber, last light | **Ember**: warm dark, coals and amber |
| **Meadow**: fresh green, morning grass | **Forest**: deep green, under the canopy |
| **Sakura**: soft pink, cherry blossom | **Abyss**: pure black for OLED, neon on top |

### Code block themes

- **Plugin:** Ayu Dark, Same as the page theme.
- **Popular:** GitHub, GitHub Dark, GitHub Dark Dimmed, Atom One Dark/Light, Monokai, Monokai
  Sublime, Nord, Night Owl, Tokyo Night Dark/Light, VS 2015, VS, Xcode, IntelliJ Light, Android
  Studio, Stack Overflow Dark/Light, Rosé Pine (Moon, Dawn), Panda, Shades of Purple, Dracula,
  Gruvbox Dark/Light, Solarized Dark/Light, Material, One Light.
- **More highlight.js:** the other 59 highlight.js themes.
- **Base16:** the other 169 base16 schemes.

## Limits

- Read-only: switch back to **Source** to edit.
- Links to other files do nothing, because an editor frame never learns file paths. `http(s)`
  links open in your browser after Orca asks, and `#anchor` links scroll.
- Desktop app only (the editor runs in Orca's isolated frame).

## Develop

```sh
git clone https://github.com/marcelofrau/orca-markdown-themes
cd orca-markdown-themes
orca plugin dev load .   # loads the folder; prints the approval fingerprint the first time
orca plugin test .       # unit tests (Node)
orca plugin check .      # static check of every file the editor loads
```

Orca reloads a development folder when its files change. The code lives in `editor/`:
`main.ts` (rendering), `theme.ts` (layout and Ayu), `menu.ts` (gear menu), `settings.ts`,
`render.ts`, `zoom.ts`. There is no build step: Orca transpiles TypeScript itself.

Generated theme modules, from upstream files:

```sh
# Tinta themes: copy resources/themes/*.css from Tinta into themes/tinta/, then
python -I scripts/import-tinta-themes.py
# highlight.js themes: npm pack @highlightjs/cdn-assets@11, unpack it, then
python -I scripts/import-code-themes.py <unpacked>/package/styles
```

## Credits

- Page themes by [Tinta](https://github.com/oipoistar/tinta) (MIT).
- Diagrams by [Mermaid](https://mermaid.js.org) (MIT), Markdown by [marked](https://marked.js.org)
  (MIT), highlighting and code themes by [highlight.js](https://highlightjs.org) (BSD-3-Clause;
  base16 schemes MIT or more permissive), Ayu colours from [ayu](https://github.com/ayu-theme/ayu-colors) (MIT).

Details in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## License

[GPL-3.0](LICENSE) © Marcelo Frau. The bundled third-party code keeps its own licenses.
