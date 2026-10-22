import { record } from './validation.ts'
import { single, integer, provenance } from './shared.ts'
export interface Workspace {
  version: 1
  name: string
  values: number[]
  query: number
}
export interface Node {
  value: number
  left: Node | null
  right: Node | null
}
export function parse(value: unknown): Workspace {
  const w = record(value, 'Workspace')
  if (w.version !== 1) throw new Error('Workspace version must be 1.')
  if (!Array.isArray(w.values) || w.values.length > 15)
    throw new Error('Insertion order needs 0–15 values.')
  const values = w.values.map((v) => integer(v, 'Tree value', -99, 99))
  if (new Set(values).size !== values.length) throw new Error('Tree values must be unique.')
  return {
    version: 1,
    name: single(w.name, 'Workspace name', 80),
    values,
    query: integer(w.query, 'Search value', -99, 99),
  }
}
export function serialize(value: unknown) {
  const w = parse(value)
  return { ...w, provenance: provenance('BT', 'vue-binary-tree-studio', w) }
}
export function build(values: readonly number[]): Node | null {
  let root: Node | null = null
  for (const value of values) {
    if (!root) {
      root = { value, left: null, right: null }
      continue
    }
    let current = root
    while (true) {
      const side = value < current.value ? 'left' : 'right'
      if (!current[side]) {
        current[side] = { value, left: null, right: null }
        break
      }
      current = current[side]!
    }
  }
  return root
}
export function traverse(root: Node | null, mode: 'inorder' | 'preorder' | 'postorder'): number[] {
  if (!root) return []
  const left = traverse(root.left, mode),
    right = traverse(root.right, mode)
  return mode === 'inorder'
    ? [...left, root.value, ...right]
    : mode === 'preorder'
      ? [root.value, ...left, ...right]
      : [...left, ...right, root.value]
}
export function search(root: Node | null, value: number) {
  const path: number[] = []
  let current = root
  while (current) {
    path.push(current.value)
    if (current.value === value) return { path, found: true }
    current = value < current.value ? current.left : current.right
  }
  return { path, found: false }
}
export function height(root: Node | null): number {
  return root ? 1 + Math.max(height(root.left), height(root.right)) : 0
}
export function layout(value: Workspace) {
  const w = parse(value),
    root = build(w.values),
    ordered = traverse(root, 'inorder'),
    nodes: { value: number; x: number; y: number; depth: number; parent: number | null }[] = []
  function visit(node: Node | null, depth: number, parent: number | null) {
    if (!node) return
    nodes.push({
      value: node.value,
      x: 40 + ordered.indexOf(node.value) * 46,
      y: 60 + depth * 64,
      depth,
      parent,
    })
    visit(node.left, depth + 1, node.value)
    visit(node.right, depth + 1, node.value)
  }
  visit(root, 0, null)
  return {
    root,
    nodes,
    width: Math.max(240, ordered.length * 46 + 34),
    height: Math.max(180, height(root) * 64 + 76),
  }
}
const escape = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]!,
  )
export function svgExport(value: Workspace) {
  const w = parse(value),
    g = layout(w),
    r = search(g.root, w.query)
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" width="' +
    g.width +
    '" height="' +
    g.height +
    '" viewBox="0 0 ' +
    g.width +
    ' ' +
    g.height +
    '"><title>' +
    escape(w.name) +
    '</title><desc>' +
    serialize(w).provenance.marker +
    ' · query ' +
    w.query +
    ' · ' +
    (r.found ? 'found' : 'not found') +
    ' · CodeSculptor</desc><rect width="100%" height="100%" fill="white"/><g stroke="#a8bec7" stroke-width="2">' +
    g.nodes
      .filter((n) => n.parent !== null)
      .map((n) => {
        const p = g.nodes.find((p) => p.value === n.parent)!
        return '<path d="M' + p.x + ' ' + p.y + 'L' + n.x + ' ' + n.y + '"/>'
      })
      .join('') +
    '</g>' +
    g.nodes
      .map(
        (n) =>
          '<g data-value="' +
          n.value +
          '"><circle cx="' +
          n.x +
          '" cy="' +
          n.y +
          '" r="18" fill="' +
          (r.path.includes(n.value) ? '#537e90' : '#eef5f8') +
          '" stroke="#537e90"/><text x="' +
          n.x +
          '" y="' +
          (n.y + 4) +
          '" text-anchor="middle" font-family="sans-serif" font-size="12" fill="' +
          (r.path.includes(n.value) ? 'white' : '#292632') +
          '">' +
          n.value +
          '</text></g>',
      )
      .join('') +
    '<text x="16" y="' +
    (g.height - 16) +
    '" font-family="sans-serif" font-size="10" fill="#596c77">' +
    serialize(w).provenance.marker +
    ' · CodeSculptor</text></svg>'
  )
}
export function csvExport(value: Workspace) {
  const w = parse(value),
    g = layout(w),
    marker = serialize(w).provenance.marker
  return (
    'value,parent,depth,left,right,inorder_index,on_search_path,marker\r\n' +
    g.nodes
      .map((n) => {
        const node = (() => {
          let current = g.root!
          while (current.value !== n.value)
            current = (n.value < current.value ? current.left : current.right)!
          return current
        })()
        return [
          n.value,
          n.parent ?? '',
          n.depth,
          node.left?.value ?? '',
          node.right?.value ?? '',
          traverse(g.root, 'inorder').indexOf(n.value),
          search(g.root, w.query).path.includes(n.value),
          marker,
        ].join(',')
      })
      .join('\r\n') +
    '\r\n'
  )
}
export function textExport(value: Workspace) {
  const w = parse(value),
    root = build(w.values),
    r = search(root, w.query)
  return (
    w.name +
    '\n' +
    serialize(w).provenance.marker +
    ' · CodeSculptor\nInsertion order: ' +
    w.values.join(', ') +
    '\nNodes: ' +
    w.values.length +
    '; height in nodes: ' +
    height(root) +
    '\nSearch: ' +
    w.query +
    '; ' +
    (r.found ? 'found' : 'not found') +
    '\nSearch path: ' +
    r.path.join(' -> ') +
    '\n' +
    (['inorder', 'preorder', 'postorder'] as const)
      .map((mode) => mode + ': ' + traverse(root, mode).join(', '))
      .join('\n') +
    '\n'
  )
}
