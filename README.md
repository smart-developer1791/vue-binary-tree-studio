<div align="center">

# 🌳 Binary Tree Studio

**Give every number a place.**

![Vue](https://img.shields.io/badge/Vue-3-42b883?style=for-the-badge&logo=vuedotjs&logoColor=ffffff)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6?style=for-the-badge&logo=typescript&logoColor=ffffff)
![Vite](https://img.shields.io/badge/Vite-8-646cff?style=for-the-badge&logo=vite&logoColor=ffffff)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?style=for-the-badge&logo=tailwindcss&logoColor=ffffff)
![License](https://img.shields.io/badge/License-MIT-777777?style=for-the-badge)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

_Vue binary-search-tree notebook with recursive typed selection and branch state, insertion-order editing, complete traversals, and SVG/CSV/TXT/JSON exports._

</div>

---

## ✨ Highlights

- **Order shapes the tree:** Insert zero through fifteen distinct whole numbers and move them earlier/later.
- **An ordinary search tree:** Smaller values follow left, larger values right, without automatic balancing.
- **Recursive Vue components:** Each TreeNode owns its local collapse state and propagates a typed named selected-number model.
- **Keep branch state:** v-show view switching preserves the actual outline DOM and collapsed branches.
- **A complete search path:** Highlight visited nodes and report found/not found independently from selected-node inspection.
- **Three full traversals:** Compare inorder, preorder, and postorder for every saved number.
- **Portable tree reports:** Download the entire diagram as SVG, every node/link as CSV, full traversal TXT, or editable BT JSON.

## 🧱 Project Structure

```text
public/
├── favicon.svg                         # Original project emblem
├── og.svg                              # Original social artwork
├── font-licenses.txt                   # Font copyright and OFL licenses
└── sample-workspace.json               # Complete importable workspace
src/
├── components/
│   ├── TreeNode.vue
│   ├── TreePreview.vue
│   ├── DataTools.vue                   # Workspace actions and restoration
│   ├── AppDialog.vue                   # Native Teleport modal and focus lifecycle
│   ├── AppIcon.vue                     # Original inline SVG icons
│   ├── DataExchange.vue                # Validated workspace import dialog
│   └── StudioHeader.vue                # Workspace branding and actions
├── domain/
│   ├── tree.ts                        # Pure validation, calculations, and exports
│   ├── shared.ts                       # Text, number, and provenance helpers
│   └── validation.ts                   # Strict unknown-input guards
├── services/
│   ├── draft.ts                        # Validated device-local persistence
│   └── files.ts                        # Downloads and deterministic identities
├── App.vue                             # Workspace and editor state
├── base.css                            # Tailwind, local fonts, and control defaults
├── style.css                           # Project theme tokens
└── main.ts                             # Vue application entry
tests/
├── *.test.ts                           # Native domain/composable/export tests
└── e2e/                                # Production browser workflows
```

Root files include Vite, TypeScript, Playwright, and Prettier configuration, an npm lockfile, the MIT license, and explicit `vercel.json`. The official scaffold’s default artwork and empty `src/assets` directory are removed. The shared generic development container stays unchanged.

## 🛠 Tech Stack

| Tool                          | Role                                                                        |
| ----------------------------- | --------------------------------------------------------------------------- |
| Vue 3.5                       | Typed SFCs, component contracts, reactive state, and lifecycle management   |
| TypeScript 6                  | Checked domain structures and component/composable inputs                   |
| Vite 8                        | Development server and static production bundles                            |
| Tailwind CSS 4                | Vite plugin, theme tokens, template utilities, and responsive/state styling |
| DM Sans + Bricolage Grotesque | Locally bundled Latin variable fonts                                        |
| Node.js 24+                   | Local CLI tools and native TypeScript tests                                 |
| Playwright                    | Chromium workflows against the production build                             |

The app requires no account, backend, remote data source, or extra UI library. All dependencies and CLI tools are installed locally inside this independent project.

## 🎨 Tailwind Styling

The Vite config enables `@tailwindcss/vite`. `base.css` imports Tailwind, defines font tokens, and uses `@apply` for small native control defaults. `style.css` defines project colors through `@theme`. Actual application templates use Tailwind utilities for grid/flex layouts, spacing, typography, borders, colors, responsive behavior, focus, and visible states.

`data-ui`, `data-project`, and domain identity attributes are explicit browser hooks. There are no orphan semantic styling classes. Reserved preview/list containers and internal overflow keep neighboring panels stable when modes, selected details, or results change. All application layout and visible-state classes use Tailwind utilities. SVG attributes describe domain artwork geometry; standalone vector artifacts carry their own presentation. Reduced-motion preferences shorten transitions.

Two Fontsource variable font files are bundled as hashed local assets. Their copyright and OFL text are in [font-licenses.txt](./public/font-licenses.txt). Favicon/social artwork and SVG interface icons are original project assets.

## 📦 Included Demo Data

The original **A balanced little number grove** inserts 40, 20, 60, 10, 30, 50, 70, 25, and 35 in that order. Its height is four nodes. Searching for 35 visits 40 → 20 → 30 → 35. The initially balanced appearance comes from that supplied order; the implementation does not rebalance later insertions.

The complete [sample-workspace.json](./public/sample-workspace.json) includes valid provenance and is served as a public static file. The application imports this same JSON sample for first use and confirmed restoration.

## 🚀 Local Development

Use Node.js **24 or later**:

```bash
npm ci
npm run dev
```

Vite prints the local URL and binds to `0.0.0.0` for the shared container. Inspect a production bundle with:

```bash
npm run build
npm run preview
```

## 🧩 Vue Implementation

TreeNode recursively references its own inferred Vue SFC name. Its node prop supplies the current left/right structure, and a required named defineModel<number|null> propagates selected identity through each recursive level. Each component owns an open ref for its branch. v-show hides children without destroying descendant DOM/state, while a revision prop resets open state on explicit import/restoration.

The outline and traversal view also switch with v-show inside one reserved notebook frame. Existing recursive nodes and private collapse controls remain mounted between views. A query-only workspace replacement keeps keyed node instances and branch state. Structural edits can relocate or replace nodes as their ancestry changes. Explicit imports increment the revision even for equivalent data, reopening all mounted branches. Browser checks inspect actual child DOM identity, not only displayed text.

The pure builder inserts numbers in saved order. It compares at each node and follows left for smaller values or right for larger values until finding an empty slot. Unique integers prevent equal-key insertion. This is an ordinary unbalanced binary search tree, so sorted input produces a chain with height equal to node count. Empty height is zero; nonempty height counts nodes on the longest root-to-leaf path.

Search records each visited value and stops on equality or an empty child. The saved query controls the highlighted SVG/outline path and found status. Selected-number inspection is separate and shows that node’s immediate children. Inorder visits left/node/right; preorder node/left/right; postorder left/right/node. Inorder is sorted for every valid tree.

Move earlier/later swaps a selected entry with its neighbor and rebuilds from the new order. Confirmed removal filters the entry, preserves the remaining relative order, and rebuilds from scratch. It does not perform the classic successor-based in-place BST deletion algorithm. Pending name/query settings survive unrelated insertion/order actions, invalid duplicate/bounded input retains the valid tree, and zero saved numbers remains a usable state.

Diagram x positions follow inorder rank at 46-unit spacing; depth gives y positions 64 units apart. Uniform node circles and numeric labels fit an explicit standalone viewport, including the fifteen-level chain. Wide/tall diagrams scroll internally on both axes with safe automatic margins, keeping their start and end reachable. The recursive outline also has its own bounded scroll area; all full reports ignore collapsed/private view state.

The shared modal uses `Teleport`, a unique `useId` heading, and a post-flush watcher to synchronize Vue state with native `showModal`/`close`. Escape and focus return remain native. A queued close event cannot reset a modal that has already reopened.

## 💾 Local Drafts & Data Exchange

Validated workspace data is stored under `vue-binary-tree-studio:v1`. First-use and restored data are validated before use. Invalid saved JSON/schema falls back to the sample without immediately overwriting the damaged entry. A later valid change writes a new draft. Blocked storage leaves editing and downloads usable and shows a status message.

Import parses a detached candidate and replaces the workspace only after complete validation. Failure keeps current work and the saved draft intact. Workspace JSON is limited to **120,000 characters**. Known fields are rebuilt in canonical order; unknown fields and supplied provenance are not trusted or carried into the editable domain. Project markers are recomputed from validated data. Name, ordered unique integer values, and search query are persisted. Calculated tree nodes/links/layout, traversals, search path/result, selected inspection, recursive collapse refs, active notebook view, import revision, pending fields, validation messages, and dialogs are derived or transient.

| Field         | Accepted values                                            |
| ------------- | ---------------------------------------------------------- |
| version, name | 1; nonblank single-line title up to 80 UTF-16 units        |
| values        | Ordered array of 0–15 distinct actual whole numbers −99–99 |
| query         | Actual whole number −99–99; need not exist in the tree     |

Wrong primitives, fractional/out-of-range values, duplicate keys, excessive collections, unsupported versions and invalid names reject candidates. Insertion order is authoritative; imported nodes, links, traversals, selected values and collapse flags are rebuilt or ignored.

Tree SVG contains the complete white diagram, all parent edges and numeric nodes, search-path highlighting, escaped title, query outcome, and BT attribution. Node CSV includes every value, parent or blank root, zero-based depth, immediate left/right values or blanks, zero-based inorder index, search-path flag, and marker. All CSV cells are generated numeric/boolean identities rather than arbitrary user formula text. Tree TXT includes insertion order, count/height, complete search path/result, and all three full traversals. JSON retains ordered source values and query with recomputed provenance.

Download Blob URLs are revoked after download. Destructive collection removal and sample restoration use native confirmation dialogs.

## ◈ Project Markers

- `BT` appears in the wordmark, project metadata, and workspace identity; original favicon/social artwork use a matching emblem.
- `BT-XXXXXXXX` is a deterministic 32-bit content stamp calculated with FNV-1a over UTF-8 canonical workspace JSON, excluding supplied provenance.
- JSON provenance includes the project slug, `CodeSculptor`, and the marker. Downloaded artifacts carry the appropriate identity in filenames and/or metadata/content.
- Markers help identify configurations and artifacts; they are not cryptographic signatures or tamper-proof authorship claims.
- Author metadata and the MIT license retain CodeSculptor attribution.

## 🧭 Extension Notes & Nuances

- One ordinary unbalanced integer-key binary search tree, without AVL/red-black rotations, heaps, weights, duplicate counts, or multiset support.
- Values are distinct whole integers −99–99, with at most fifteen nodes.
- Tree shape depends on insertion order; the sample’s balanced shape is not a balancing guarantee.
- Move actions swap neighboring source entries rather than dragging diagram nodes.
- Removal rebuilds from remaining insertion order; it is deliberately different from successor-based in-place deletion.
- Height counts nodes, so an empty tree has height zero and a one-node tree height one.
- Search highlights visited comparisons only; selected-node inspection does not change the query.
- Collapsed descendants remain mounted; structural ancestry changes can recreate recursive instances.
- Imports explicitly reopen all branches; reload begins on Outline with the first inserted value selected.
- Diagram positions use sorted rank and depth, without a dynamic graph-layout dependency.
- Exports always include hidden/collapsed nodes and all traversals.
- Extend strict bounds, BST invariants, rebuild semantics, recursive model/state behavior, viewport access, and full reports together.

The application and documentation are English. At 320 px panels stack, while larger screens use the shared grid. Scrollable data regions, named native controls, visible focus styles, and a single main landmark remain available across layouts.

## ✅ Build & Checks

```bash
npm run build
npm run format:check
npm test
npx playwright install chromium
npm run test:e2e
```

`build` runs `vue-tsc` before Vite. Native tests use Node’s built-in runner. Playwright starts the current production bundle with the local preview command and does not reuse another server. Build before browser tests so they inspect current output. `npm run format` formats maintained source; dependencies, generated output, lockfiles, and browser artifacts are excluded.

Six native tests verify independent sample shape/traversals/search, sorted-chain and empty behavior, 100 varied input permutations with BST/traversal invariants, remove-and-rebuild order/reference repair, strict guards, maximum complete fitted diagrams/reports, XML escaping, and UTF-8 stamps. Four browser workflows verify deep recursive model propagation, independent query/inspection, actual DOM and collapse preservation across v-show/query edits, import revisions, pending/duplicate/order/removal/empty actions, stable frames, and complete SVG/CSV/TXT/JSON.

Shared browser workflows check valid/failed imports, persistence after reload, provenance downloads, blocked/corrupt storage, confirmed sample restoration, native modal reopening/Escape/focus, real Tailwind grid behavior, named visible controls, and overflow at 320–1440 px. A separate maximum-content case downloads and re-imports the complete escaped JSON workspace at 320 px. These are local production checks, not a deployed Vercel smoke test.

## ▲ Vercel Deployment

1. Import the repository and select this project folder as the Root Directory when deploying from the shared workspace.
2. Use the committed config: `npm ci`, `npm run build`, and output folder `dist`.
3. Check the root page, public sample/artwork, and main editor after deployment.

The explicit `vercel.json` rewrites only `/` to `/index.html` and permanently redirects `/index.html` to `/`. There are no client routes requiring a catch-all rewrite. Declared routes preserve missing-resource behavior. HTML and unhashed public files revalidate; Vite’s hashed JS/CSS/font assets receive one-year immutable caching. All responses include `X-Content-Type-Options: nosniff` and `Referrer-Policy: strict-origin-when-cross-origin`. The dev command accepts Vercel’s `$PORT` with `--strictPort`.

Used fields, route compilation, and generated asset/cache behavior are checked locally against the [official Vercel configuration schema](https://openapi.vercel.sh/vercel.json). Vite preview does not emulate deployment headers. SVG social artwork is included as an editable source; platforms requiring raster cards need a rendered image and an absolute deployed image URL.

## 📄 License

[MIT](./LICENSE) · Copyright (c) 2026 **CodeSculptor**. Bundled fonts retain separate OFL licenses.
