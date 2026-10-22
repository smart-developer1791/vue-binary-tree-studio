<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Node } from '../domain/tree.ts'
const props = defineProps<{
    node: Node
    side: string
    revision: number
    path: readonly number[]
  }>(),
  selected = defineModel<number | null>('selected', { required: true }),
  open = ref(true)
watch(
  () => props.revision,
  () => {
    open.value = true
  },
)
</script>
<template>
  <li class="min-w-max" :data-outline-value="node.value">
    <div class="flex items-center gap-2 py-1">
      <button
        @click="selected = node.value"
        :aria-label="'Inspect number ' + node.value"
        :aria-pressed="selected === node.value"
        class="min-w-16 bg-background font-mono text-xs hover:bg-soft"
        :class="
          selected === node.value
            ? 'border-accent! text-accent'
            : path.includes(node.value)
              ? 'bg-accent/15'
              : 'text-muted'
        "
      >
        {{ node.value }}</button
      ><span class="text-[10px] text-muted">{{ side }}</span
      ><button
        v-if="node.left || node.right"
        @click="open = !open"
        :aria-expanded="open"
        :aria-label="(open ? 'Collapse' : 'Expand') + ' subtree ' + node.value"
        class="border-0! bg-transparent px-2! text-xs text-muted hover:text-accent"
      >
        {{ open ? '−' : '+' }}
      </button>
    </div>
    <ul
      v-show="open"
      v-if="node.left || node.right"
      class="ml-4 space-y-1 border-l border-line pl-4"
    >
      <TreeNode
        v-if="node.left"
        :key="node.left.value"
        :node="node.left"
        side="left"
        :revision="revision"
        :path="path"
        v-model:selected="selected"
      /><TreeNode
        v-if="node.right"
        :key="node.right.value"
        :node="node.right"
        side="right"
        :revision="revision"
        :path="path"
        v-model:selected="selected"
      />
    </ul>
  </li>
</template>
