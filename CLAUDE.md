# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

`prompt.md` is the single source of truth for every product, data-model, parsing, UI, and design decision. When something is ambiguous, follow what is written in `prompt.md` rather than inventing an alternative — the doc says so explicitly.

Stack: **Svelte 5 + Vite + TypeScript**, chosen for the lightest possible bundle (compiles away the framework runtime), matching the §4 requirement of a fast first load on bad 3G. Persistence is **IndexedDB via `idb`** (§4's required thin wrapper) — the whole library/setlist dataset is small (40–200 songs) so it's loaded into memory once at boot and filtered/sorted in JS rather than through IndexedDB indexes; see `src/lib/data/musicasStore.svelte.ts` and `setlistsStore.svelte.ts` for the write-through reactive-state pattern used throughout (a `.svelte.ts` module exporting a `$state` array plus mutator functions). Setlist reordering uses `svelte-dnd-action`. Fonts are self-hosted via `@fontsource/*` packages (no runtime font fetches). Offline installability is `vite-plugin-pwa` (workbox precache, generated in production builds only — `npm run dev` has no service worker). The three themes (`src/app.css` token blocks under `[data-tema="..."]`, chosen in `src/theme.svelte.ts`) apply globally via a `data-tema` attribute on `<html>`, not scoped per-screen.

All 5 fatias of the §10 build order are implemented — this is a complete MVP per `prompt.md`. `LyricsView.svelte` is the most involved component: it owns verse-paged navigation, chord (cifra) rendering + zoom ceiling, autoscroll, per-song preferences, keyboard/pedal shortcuts, and the settings panel trigger — read it fully before touching any one concern, since several of these interact (e.g. the zoom ceiling clamps `fontIndex`, which is itself a persisted-per-song preference).

`Musica`'s `cifrada` field is asymmetric by design: `musicasStore.create` always auto-derives it via `detectarCifra`, but `musicasStore.update` requires it explicit in the patch — callers decide whether to redetect (reimport/substituir) or preserve a manual correction (`MusicaForm`'s toggle). Don't add an auto-detect default back into `update`; that would silently clobber the user's manual fix (prompt.md §7).

Per-song display preferences (font size, autoscroll speed) live in a separate IndexedDB store (`src/lib/data/preferenciasStore.svelte.ts`, keyed by `musicaId`), not as fields on `Musica` — §5 closes that model explicitly ("mantenha exatamente estes campos"). Follow the same pattern for any future per-song UI state instead of extending `Musica`.

Any `.ts`/`.js` module that calls a Svelte 5 rune (`$state`, `$derived`, `$effect`) outside a `.svelte` file must be named `*.svelte.ts` — the compiler only looks for runes in files with that extension. All the reactive stores in this repo (`musicasStore.svelte.ts`, `setlistsStore.svelte.ts`, `lotesStore.svelte.ts`, `preferenciasStore.svelte.ts`, `theme.svelte.ts`, `pwa/installPrompt.svelte.ts`) follow this naming.

### Deployment

Live at **https://alyssonmsa.github.io/rep-ia/**, deployed by `.github/workflows/deploy.yml` (GitHub Actions → GitHub Pages, `build_type: workflow` — set once via `gh api -X PUT repos/alyssonmsa/rep-ia/pages -f build_type=workflow`; the repo previously had Pages misconfigured in legacy branch-serving mode, which would have served the raw repo instead of the Vite build). Runs `check` + `test` before `build`, uploads `dist/` as the Pages artifact. A `.gitlab-ci.yml` also exists (GitLab Pages was the original ask before the user picked GitHub Pages instead) — it's unused unless this repo is ever pushed/mirrored to an actual GitLab project; keep it in sync with `package.json` scripts if those change, but it's not part of the live deploy path.

`vite.config.ts` sets `base: './'` on purpose — a Pages project site (GitHub or GitLab) serves from a subpath (`usuario.github.io/rep-ia/`), not the domain root, and a relative base makes the build work at any subpath without hardcoding the project name. `index.html`'s icon links use `%BASE_URL%` for the same reason; don't reintroduce a root-absolute (`/...`) href/src anywhere in `index.html` or the PWA manifest config, or the build will 404 under a subpath. `npm run build` locally is the way to check this — inspect `dist/index.html` and `dist/manifest.webmanifest` for stray `/`-rooted paths if something changes here.

If the GitLab path is ever revisited: `.gitlab-ci.yml` uses the classic `pages` job name + `artifacts: paths: [public]` convention (not the newer `pages: true`/`pages.publish` keyword) so it works on any GitLab version. The build step does `mv dist public` — **never** run that by hand in this repo without first confirming you're not clobbering the tracked `public/icons/` source directory (that directory holds the real PWA icon source files, not build output; `rm -rf public` deletes them). Simulate the pipeline in a scratch directory, not in-place. Also, GitLab Pages doesn't support per-project custom HTTP response headers (only a global server-level admin setting) — moot in practice since the Service Worker spec caps browser-side staleness for the SW script at 24h regardless of server headers, and `registerType: 'autoUpdate'` already re-checks on every load.

Parser fixtures live as real files under `tests/fixtures/`, generated byte-exact (BOM/CRLF/nbsp) by `tests/fixtures/gerar-fixtures.mjs` — regenerate with `node tests/fixtures/gerar-fixtures.mjs` rather than hand-editing them if a fixture needs to change, since those bytes are easy to corrupt through a text editor.

### Real-data seed (deliberate deviation from §10's "repertório de exemplo")

`src/lib/onboarding/dados/letras-reais.txt` and `repertorio-real.txt` are the repo owner's actual lyrics/setlist (not placeholder content), imported via `?raw` and auto-seeded unconditionally in `App.svelte`'s `onMount` whenever `musicasStore` is empty at boot — no onboarding tap required, unlike the opt-in "Ver repertório de exemplo" pattern §10 describes and this repo originally implemented. This is a one-time explicit decision, not a general precedent: `letras-reais.txt` contains full lyrics of commercially copyrighted songs, committed to a **public** repo and served by a **public** URL with the owner's explicit informed consent (the risk — public redistribution of third-party lyrics, exactly what §13 says the product avoids — was raised and accepted). Don't extend this pattern to other people's deployments or reintroduce it if this seed data is ever removed; go back to the opt-in placeholder-content pattern (`git log` has the original `repertorioExemplo.ts` if it's needed again) unless the repo owner gives the same explicit go-ahead for whatever new content replaces it.

`repertorio-real.txt` uses a different, simpler grammar than the app's `/END` format: a line is a setlist marker if it's entirely uppercase (`ehLinhaDeMarcador` in `src/lib/onboarding/parseSetlistTexto.ts`), everything else is an item. Seeding relies entirely on the existing late-linking mechanism (`setlistsStore.tentarVincularTodas`) to connect setlist items to songs — no custom fuzzy matching was added, so items whose text includes chord annotations outside parentheses (the majority, in this real data) stay intentionally unlinked, exactly as a real user's messy setlist would.

### Commands

```
npm run dev      # dev server
npm run build    # production build
npm run preview  # preview the production build
npm run check    # svelte-check + tsc, no emit
npm run test     # vitest, run once
```

There's no separate lint script yet; `npm run check` is the correctness gate. Run a single test file with `npx vitest run tests/verses.test.ts` (or drop `run` for watch mode).

## What is being built

A teleprompter PWA for solo bar musicians (voice + guitar). Repertoire of 40–200 songs, read on a phone/tablet propped ~1m away, hands-free, on stage, often with no usable internet. Full context: `prompt.md` §1–3.

Non-negotiable product principles (violating these is a design bug, not a style choice):
- **Stage mode must never make a network request.** Zero network calls while stage mode is active.
- **No stage action requires more than one tap.**
- **Predictable rules beat clever algorithms** (e.g. the `/END` parser, chord detection) — a 100%-correct rule inside a stated contract beats an 85%-correct heuristic.
- **Never silently discard user data.**
- **No login, no server, no remote DB.** Everything lives on-device (IndexedDB).
- **Export must be available from day one** as the user's way out.

## Stack constraints (§4)

- Static PWA, no backend/auth/remote DB.
- Persistence via IndexedDB, through a thin layer (e.g. `idb`) — do not hand-write the raw IndexedDB API.
- Service worker precaches the full app shell (including fonts) so the app opens 100% offline.
- Web app manifest with `display: standalone` and icons.
- Any frontend framework is fine as long as the bundle is light and first load is fast on bad 3G.
- Fonts must be bundled into the precache — no runtime font fetches, or stage mode breaks offline.

Two platform traps that must be handled explicitly:
- **Wake Lock**: the Screen Wake Lock API releases automatically when the tab loses visibility — must be re-acquired on `visibilitychange`. If the API is unavailable, warn the user to disable screen lock manually; never fail silently.
- **iOS Safari fullscreen**: `requestFullscreen` does not work in iOS Safari. Hiding the browser chrome requires the PWA to be installed to the home screen (standalone mode) — Safari also clears storage for non-installed sites after inactivity. Onboarding must push installation clearly, and export exists as the safety net for this.

## Data model (§5)

Exact fields only — do not add tone, BPM, capo, or arrangement annotations in the MVP:

```ts
type Musica = { id, titulo, letra, cifrada, criadoEm, atualizadoEm }
type ItemSetlist = { id, ordem, texto, musicaId: string | null, tipo: 'musica' | 'marcador' }
type Setlist = { id, nome, itens: ItemSetlist[], criadoEm, atualizadoEm }
type LotesImportacao = { id, musicaIds: string[], importadoEm }
```

Key rules that are easy to get wrong:
- `titulo` is one opaque string — never split "Song - Live" into artist/title.
- `ItemSetlist.texto` is always present and is **always what's rendered on stage**, even when `musicaId` is linked — never substitute the linked song's title. A null `musicaId` is the normal case (user typed a setlist item that isn't in the library yet), not an error state.
- Deleting a song from the library does not cascade-delete setlist items — it only nulls out `musicaId` on items that referenced it. The item keeps its `texto`.
- Markers (`tipo: 'marcador'`) are unlinked items used to organize the show into blocks (e.g. `BLOCO 1`, `INTERVALO`).
- `LotesImportacao` exists only to support bulk-undo of an import; at minimum the most recent one must be kept.

## Text format contract (§6) — the parser

One format is used for paste, file import, and export. `splitBlocks` is **the only place in the system that knows about `/END`** — nothing else (editor, data model) should be aware the terminator exists.

```ts
normalizar(texto: string): string
splitBlocks(texto: string): string[]          // no /END present → array of 1
parseBlock(bloco: string): { titulo: string, letra: string }
```

Grammar: text is a sequence of blocks; a block ends on a line containing *only* `/END` (case-insensitive, trimmed) or at end-of-text; the first non-empty line of a block is the title; everything else is the lyrics body.

Preservation rules (critical, frequently violated by naive implementations):
- Blank lines *inside* the lyrics body are data (they delimit verses, the navigation unit in stage mode) — never collapse or trim them.
- The only blank lines discarded are the ones between the title and the start of the body.
- Leading whitespace is preserved (aligns chords to syllables in chord sheets).

Normalization order (apply once, before parsing): strip UTF-8 BOM → normalize `\r\n`/`\r` to `\n` → replace ` ` (nbsp) with a regular space. The nbsp step matters because Google Docs/Word exports scatter nbsp into lines that look blank but aren't — this breaks both title detection and verse splitting if skipped. Do not touch `…` or accents; no other normalization is allowed.

See the boundary-case table in `prompt.md` §6 before touching the parser — it enumerates exact expected behavior for malformed input (double `/END`, missing `/END`, empty blocks, etc.).

Export produces both a canonical `.txt` (interchange) and a `.json` (faithful backup including `cifrada`, setlists, ids). The `cifrada` flag is allowed to be lost on `.txt` round-trip since it's re-derived on reimport.

**Round-trip test is the highest-value test**: import `.txt` → export → import again → compare. Must be exactly equal since the format carries no metadata.

Test fixtures required before writing the parser (§11): `uma-musica.txt`, `tres-musicas.txt`, `sem-end-no-ultimo.txt`, `estrofes.txt`, `com-cifra.txt`, `falso-positivo-cifra.txt`, `baguncado.txt`, `legado.txt`, `google-docs.txt`.

## Chord (`cifrada`) detection (§7)

`cifrada` is always derived at import time, never asked of the user (manually correctable via a toggle). The signal is **alignment (runs of 2+ spaces between tokens), not capitalization** — this matters because several Portuguese words (`Em`, `A`, `E`, `Dó`, `Lá`, `Ré`, `Si`) are also valid chord names. A line is a chord-line candidate only if: non-empty, every space-separated token matches the chord pattern, has 2+ tokens or a chord-suffix token, and contains a run of 2+ consecutive spaces. A song is `cifrada: true` at 2+ candidate lines. Bias toward `false` on uncertainty — misclassifying lyrics as chords breaks layout much more visibly than the reverse.

`cifrada` controls, in stage mode: font family (proportional vs. monospace), whether lines may wrap (chord lines must never wrap — wrapping breaks chord/syllable alignment), whether leading whitespace is preserved, and zoom ceiling (chord sheets cap zoom at whatever fits the longest line on screen).

## Screens (§8)

Exactly five screens, no more in the MVP: **Acervo** (library — search must be accent-insensitive and match mid-word, via NFD + diacritic stripping), **Colar letra** (paste — 1 block saves directly, 2+ blocks routes to review), **Revisão de importação** (import review — duplicate detection defaults to *skip*, shows an undo-this-import affordance after confirming, and has a legacy-file fallback when a file has 80+ lines and zero `/END`), **Setlist** (drag-to-reorder; add-item autocomplete's first option must always be "use what I typed"; late-linking re-matches unlinked items to library songs by normalized title when the library changes), **Modo palco** (stage mode — the core screen, with a queue view and a lyrics view; brightness, not iconography, distinguishes linked vs. unlinked items; verse navigation by blank-line boundaries; keyboard `ArrowRight`/`Space`/`ArrowLeft` handling doubles as page-turn-pedal support since Bluetooth pedals announce as HID keyboards — this is a headline feature, not an afterthought).

## Design system (§9)

Visual direction is stage gear (anodized black, valve-amber glow), not a dark-themed productivity app. Minimal iconography — text labels preferred; the chevron for "lyrics available" is the only recurring icon. Three themes (Escuro/Claro/Teleprompter clássico) with token values given in `prompt.md` — the "clássico" theme is deliberately flat (pure black/white, no elevated surface, no border, no shadow) and must stay visually distinct from Escuro. Three type roles: Archivo (UI), Barlow Semi Condensed (lyrics — condensation is a content decision, not aesthetic, to fit more characters per line on a phone), IBM Plex Mono (chords — monospacing is required for chord/syllable alignment). All three must be in the service worker precache.

## Build order (§10)

Build by risk slice, not by epic — hardest/most uncertain first:
1. **Prove the hard part**: stage mode with 3 hardcoded songs, no DB, no editing, no import. Ship criterion: use it at a real gig.
2. **Make it real**: IndexedDB, library CRUD/search, setlist CRUD/autocomplete/reorder.
3. **The format**: parser (`normalizar`/`splitBlocks`/`parseBlock`), paste/import/review flows, duplicate detection, bulk undo, export, legacy fallback, round-trip test.
4. **Bar-proof**: in-stage quick search, chord detection + rendering, zoom ceiling, service worker/manifest/installability, late-linking, the three themes.
5. **Shareable**: keyboard/pedal shortcuts, pedal test screen, example repertoire, autoscroll, install-focused onboarding.

## Out of scope (§12)

Do not build or leave hooks for: login/accounts/cloud sync/collaboration, key/BPM metadata, transposition, chord editing, PDF/sheet music export, metronome, backing tracks, internet lyric lookup, a shared public library, or `.doc`/`.docx` import (paste covers this instead — deliberately avoids pulling in `mammoth.js` and its formatting-cleanup surface).
