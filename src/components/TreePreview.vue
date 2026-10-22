<script setup lang="ts">
import { computed, useId } from 'vue'
import { layout, search, type Workspace } from '../domain/tree.ts'
const props = defineProps<{ workspace: Workspace }>(),
  graph = computed(() => layout(props.workspace)),
  trail = computed(() => search(graph.value.root, props.workspace.query)),
  titleId = useId()
</script>
<template>
  <div
    class="flex h-[340px] overflow-auto rounded-xl border border-line bg-background p-4"
    data-ui="tree-frame"
  >
    <svg
      :viewBox="'0 0 ' + graph.width + ' ' + graph.height"
      :width="graph.width"
      :height="graph.height"
      class="m-auto block shrink-0"
      role="img"
      :aria-labelledby="titleId"
      data-ui="tree-svg"
    >
      <title :id="titleId">
        Binary search tree with {{ graph.nodes.length }} numbers; search for {{ workspace.query }}
        {{ trail.found ? 'found' : 'not found' }}
      </title>
      <rect width="100%" height="100%" fill="white" />
      <g stroke="#a8bec7" stroke-width="2">
        <path
          v-for="node in graph.nodes.filter((n) => n.parent !== null)"
          :key="node.value"
          :d="
            'M' +
            graph.nodes.find((n) => n.value === node.parent)!.x +
            ' ' +
            graph.nodes.find((n) => n.value === node.parent)!.y +
            'L' +
            node.x +
            ' ' +
            node.y
          "
        />
      </g>
      <g
        v-for="node in graph.nodes"
        :key="node.value"
        :data-tree-value="node.value"
        :data-on-path="trail.path.includes(node.value)"
      >
        <circle
          :cx="node.x"
          :cy="node.y"
          r="18"
          stroke="#537e90"
          :fill="trail.path.includes(node.value) ? '#537e90' : '#eef5f8'"
        />
        <text
          :x="node.x"
          :y="node.y + 4"
          text-anchor="middle"
          font-family="sans-serif"
          font-size="12"
          :fill="trail.path.includes(node.value) ? 'white' : '#292632'"
        >
          {{ node.value }}
        </text>
      </g>
      <text
        v-if="!graph.nodes.length"
        x="120"
        y="90"
        text-anchor="middle"
        font-family="sans-serif"
        font-size="12"
        fill="#596c77"
      >
        An empty tree
      </text>
    </svg>
  </div>
</template>
