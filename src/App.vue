<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import sample from '../public/sample-workspace.json'
import StudioHeader from './components/StudioHeader.vue'
import DataTools from './components/DataTools.vue'
import AppDialog from './components/AppDialog.vue'
import TreeNode from './components/TreeNode.vue'
import TreePreview from './components/TreePreview.vue'
import {
  parse,
  serialize,
  build,
  traverse,
  search,
  height,
  svgExport,
  csvExport,
  textExport,
  type Node,
} from './domain/tree.ts'
import { useDraft } from './services/draft.ts'
import { download } from './services/files.ts'
const { draft, storageStatus } = useDraft('vue-binary-tree-studio:v1', parse(sample), parse),
  root = computed(() => build(draft.value.values)),
  trail = computed(() => search(root.value, draft.value.query)),
  treeHeight = computed(() => height(root.value)),
  identity = computed(() => serialize(draft.value).provenance.marker),
  selected = ref<number | null>(draft.value.values[0] ?? null),
  title = ref(draft.value.name),
  query = ref<string | number>(draft.value.query),
  addValue = ref<string | number>(45),
  error = ref(''),
  addError = ref(''),
  remove = ref(false),
  about = ref(false),
  revision = ref(0),
  view = ref<'outline' | 'traversals'>('outline'),
  modes = ['inorder', 'preorder', 'postorder'] as const
const chosen = computed(() => {
    let current: Node | null = root.value
    while (current && current.value !== selected.value)
      current = selected.value! < current.value ? current.left : current.right
    return current
  }),
  position = computed(() =>
    selected.value === null ? -1 : draft.value.values.indexOf(selected.value),
  )
function sync() {
  title.value = draft.value.name
  query.value = draft.value.query
  error.value = ''
}
watch(() => JSON.stringify([draft.value.name, draft.value.query]), sync)
function replace(value: unknown) {
  draft.value = parse(value)
  selected.value = draft.value.values[0] ?? null
  revision.value++
  sync()
  addError.value = ''
  remove.value = false
}
function number(value: string | number) {
  return typeof value === 'number' ? value : value.trim() ? Number(value) : NaN
}
function apply() {
  try {
    draft.value = parse({ ...draft.value, name: title.value, query: number(query.value) })
    sync()
  } catch (e) {
    error.value = (e as Error).message
  }
}
function insert() {
  try {
    const n = number(addValue.value)
    draft.value = parse({ ...draft.value, values: [...draft.value.values, n] })
    selected.value = n
    addError.value = ''
  } catch (e) {
    addError.value = (e as Error).message
  }
}
function move(delta: number) {
  const i = position.value,
    j = i + delta
  if (i < 0 || j < 0 || j >= draft.value.values.length) return
  const values = [...draft.value.values]
  ;[values[i], values[j]] = [values[j]!, values[i]!]
  draft.value = parse({ ...draft.value, values })
}
function deleteValue() {
  draft.value = parse({
    ...draft.value,
    values: draft.value.values.filter((n) => n !== selected.value),
  })
  selected.value = draft.value.values[0] ?? null
  remove.value = false
}
function exportSvg() {
  download(identity.value + '.svg', svgExport(draft.value), 'image/svg+xml')
}
function exportCsv() {
  download(identity.value + '-nodes.csv', csvExport(draft.value), 'text/csv;charset=utf-8')
}
function exportText() {
  download(identity.value + '-tree.txt', textExport(draft.value), 'text/plain;charset=utf-8')
}
</script>
<template>
  <div data-project="vue-binary-tree-studio" class="min-h-screen">
    <StudioHeader title="Binary Tree Studio" subtitle="Give every number a place" code="BT"
      ><DataTools
        :workspace="draft"
        :sample="sample"
        :parse="parse"
        :serialize="serialize"
        @replace="replace"
      /><button class="bg-surface hover:bg-soft" @click="about = true">About</button></StudioHeader
    >
    <main class="mx-auto max-w-[1480px] px-4 py-7 sm:px-6 lg:px-8">
      <section class="mb-7 flex flex-wrap items-end justify-between gap-5">
        <div class="min-w-0 max-w-2xl">
          <p class="mb-2 text-xs font-bold uppercase tracking-[.18em] text-accent">
            SMALLER LEFT, LARGER RIGHT
          </p>
          <h1 class="break-words font-display text-3xl font-semibold leading-tight sm:text-4xl">
            {{ draft.name }}
          </h1>
          <p class="mt-3 max-w-xl leading-relaxed text-muted">
            Build a number tree one insertion at a time. Change the order, follow a search, and
            compare the three ways to walk through every node.
          </p>
        </div>
        <div class="rounded-xl border border-line bg-surface px-4 py-3 text-right">
          <span class="block font-mono text-xs text-accent" data-ui="marker">{{ identity }}</span
          ><span class="mt-1 block text-xs text-muted" role="status">{{ storageStatus }}</span>
        </div>
      </section>
      <div
        data-ui="workspace"
        class="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)]"
      >
        <section
          class="flex h-[1260px] min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-surface"
          data-ui="editor-panel"
        >
          <div class="border-b border-line p-5">
            <h2 class="text-lg font-semibold">Order gives the tree its shape</h2>
            <p class="mt-1 text-xs text-muted">0–15 distinct whole numbers · −99 through 99</p>
          </div>
          <div class="min-h-0 flex-1 space-y-5 overflow-auto p-5">
            <form @submit.prevent="apply" novalidate data-ui="settings-form">
              <label>Workspace name<input v-model="title" maxlength="80" /></label
              ><label class="mt-4"
                >Search value<input v-model="query" type="number" min="-99" max="99" step="1"
              /></label>
              <p role="alert" class="mt-3 min-h-14 text-xs leading-relaxed text-danger">
                {{ error }}
              </p>
              <button class="w-full border-accent! bg-accent text-on-accent hover:brightness-110">
                Apply search settings
              </button>
            </form>
            <div>
              <h3 class="font-semibold">Insertion order</h3>
              <ol
                class="mt-3 flex h-40 flex-wrap content-start gap-2 overflow-auto rounded-xl border border-line p-3"
                data-ui="insertion-list"
              >
                <li v-for="(value, i) in draft.values" :key="value">
                  <button
                    @click="selected = value"
                    :aria-label="'Select insertion ' + (i + 1) + ': ' + value"
                    :aria-pressed="selected === value"
                    class="bg-background font-mono text-xs hover:bg-soft"
                    :class="selected === value ? 'border-accent! text-accent' : 'text-muted'"
                    :data-order-value="value"
                  >
                    <span class="text-[10px] opacity-60">{{ i + 1 }}</span
                    >{{ value }}
                  </button>
                </li>
                <li v-if="!draft.values.length" class="text-xs text-muted">No numbers yet.</li>
              </ol>
              <div class="mt-3 grid grid-cols-2 gap-2">
                <button
                  @click="move(-1)"
                  :disabled="position <= 0"
                  class="bg-background text-xs hover:bg-soft"
                >
                  Move earlier</button
                ><button
                  @click="move(1)"
                  :disabled="position < 0 || position >= draft.values.length - 1"
                  class="bg-background text-xs hover:bg-soft"
                >
                  Move later
                </button>
              </div>
              <button
                @click="remove = true"
                :disabled="selected === null"
                class="mt-3 w-full bg-background text-xs text-danger hover:bg-soft"
              >
                Remove and rebuild
              </button>
            </div>
            <form
              @submit.prevent="insert"
              novalidate
              class="border-t border-line pt-5"
              data-ui="insert-form"
            >
              <label
                >New number<input v-model="addValue" type="number" min="-99" max="99" step="1"
              /></label>
              <p role="alert" class="mt-3 min-h-12 text-xs text-danger">{{ addError }}</p>
              <button
                :disabled="draft.values.length >= 15"
                class="w-full bg-background text-accent hover:bg-soft"
              >
                Insert number
              </button>
            </form>
            <div class="rounded-xl border border-line bg-soft p-4">
              <h3 class="font-semibold">Smaller left, larger right</h3>
              <p class="mt-3 text-xs leading-relaxed text-muted">
                Each insertion starts at the root. Compare and follow left or right until an empty
                child slot is found. Equal numbers are rejected. This is an ordinary unbalanced
                binary search tree.
              </p>
              <p class="mt-3 text-xs leading-relaxed text-muted">
                Moving an entry changes insertion order and rebuilds the tree. Removal also rebuilds
                from the remaining order; it does not use a successor-based deletion algorithm. An
                empty tree is valid.
              </p>
            </div>
          </div>
        </section>
        <section
          class="flex h-[1260px] min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-surface"
          data-ui="preview-panel"
        >
          <div class="border-b border-line p-5">
            <h2 class="text-lg font-semibold">Follow the comparisons</h2>
            <p class="mt-1 text-xs text-muted">
              Search, inspect a branch, or read a full traversal
            </p>
          </div>
          <div class="min-h-0 flex-1 space-y-5 overflow-auto p-5">
            <div class="grid grid-cols-3 gap-2">
              <div
                v-for="(metric, i) in [
                  { name: 'Numbers', value: draft.values.length },
                  { name: 'Height', value: treeHeight },
                  { name: 'Comparisons', value: trail.path.length },
                ]"
                :key="metric.name"
                class="h-24 rounded-xl border border-line p-3"
              >
                <p class="text-[10px] uppercase text-muted">{{ metric.name }}</p>
                <p class="mt-2 font-mono text-xl" :data-count="i">{{ metric.value }}</p>
              </div>
            </div>
            <TreePreview :workspace="draft" />
            <div
              class="h-24 overflow-auto rounded-xl border border-line bg-soft p-4"
              data-ui="search-result"
            >
              <p class="text-xs font-semibold">
                {{ draft.query }} · {{ trail.found ? 'found' : 'not found' }}
              </p>
              <p class="mt-3 break-words font-mono text-xs">
                {{ trail.path.join(' → ') || 'No comparisons in an empty tree.' }}
              </p>
            </div>
            <div class="flex flex-wrap items-center justify-between gap-3">
              <h3 class="font-semibold">The tree notebook</h3>
              <div class="flex gap-1 rounded-lg bg-background p-1">
                <button
                  @click="view = 'outline'"
                  :aria-pressed="view === 'outline'"
                  class="border-0! text-xs"
                  :class="
                    view === 'outline'
                      ? 'bg-white text-accent shadow-sm'
                      : 'bg-transparent text-muted'
                  "
                >
                  Outline</button
                ><button
                  @click="view = 'traversals'"
                  :aria-pressed="view === 'traversals'"
                  class="border-0! text-xs"
                  :class="
                    view === 'traversals'
                      ? 'bg-white text-accent shadow-sm'
                      : 'bg-transparent text-muted'
                  "
                >
                  Traversals
                </button>
              </div>
            </div>
            <div
              class="h-60 overflow-auto rounded-xl border border-line p-3"
              data-ui="notebook-frame"
            >
              <ul v-show="view === 'outline'" class="min-w-max space-y-1" data-ui="tree-outline">
                <TreeNode
                  v-if="root"
                  :key="root.value"
                  :node="root"
                  side="root"
                  :revision="revision"
                  :path="trail.path"
                  v-model:selected="selected"
                />
                <li v-else class="text-xs text-muted">Insert a number to begin.</li>
              </ul>
              <dl v-show="view === 'traversals'" class="space-y-4" data-ui="traversals">
                <div v-for="mode in modes" :key="mode">
                  <dt class="text-xs font-semibold capitalize">{{ mode }}</dt>
                  <dd
                    class="mt-2 break-words font-mono text-xs leading-relaxed"
                    :data-traversal="mode"
                  >
                    {{ traverse(root, mode).join(', ') || '(empty)' }}
                  </dd>
                </div>
              </dl>
            </div>
            <div
              class="h-20 overflow-auto rounded-xl border border-line bg-background p-4"
              data-ui="node-detail"
            >
              <p class="text-xs font-semibold">
                {{ chosen ? 'Inspecting ' + chosen.value : 'No number selected' }}
              </p>
              <p v-if="chosen" class="mt-3 font-mono text-xs">
                Left {{ chosen.left?.value ?? 'empty' }} · Right
                {{ chosen.right?.value ?? 'empty' }}
              </p>
            </div>
            <p class="text-xs leading-relaxed text-muted">
              Recursive Vue components own each subtree’s collapse state. Switching notebook views
              keeps the same outline DOM mounted. Imports reopen all branches; search and inspection
              remain separate. Height counts nodes, with an empty height of zero.
            </p>
          </div>
          <div class="grid grid-cols-3 gap-2 border-t border-line p-4">
            <button @click="exportSvg" class="bg-background text-xs hover:bg-soft">Tree SVG</button
            ><button @click="exportCsv" class="bg-background text-xs hover:bg-soft">
              Nodes CSV</button
            ><button @click="exportText" class="bg-background text-xs hover:bg-soft">
              Tree TXT
            </button>
          </div>
        </section>
      </div>
      <footer
        class="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4 text-xs text-muted"
      >
        <span>Made with Vue · Stored on this device</span><span>CodeSculptor · MIT · 2026</span>
      </footer>
    </main>
    <AppDialog v-model="remove" title="Remove this number and rebuild?"
      ><p class="leading-relaxed text-muted">
        The remaining numbers keep their relative insertion order. The tree is rebuilt from that
        order, and may change shape.
      </p>
      <div class="mt-6 flex justify-end gap-2">
        <button @click="remove = false" class="hover:bg-soft">Cancel</button
        ><button @click="deleteValue" class="border-danger! bg-danger text-white">
          Remove number
        </button>
      </div></AppDialog
    ><AppDialog v-model="about" title="About Binary Tree Studio"
      ><div class="space-y-4 leading-relaxed text-muted">
        <p>
          An ordinary binary search tree built from a saved insertion order. Recursive Vue
          components provide local branch state and a typed selected-number model; all reports
          include the complete tree.
        </p>
        <p>
          JSON keeps the editable workspace. Local storage stays on this browser; exports let you
          keep a copy elsewhere.
        </p>
        <a href="/sample-workspace.json" class="font-semibold text-accent underline" download
          >Download the complete sample</a
        >
      </div></AppDialog
    >
  </div>
</template>
