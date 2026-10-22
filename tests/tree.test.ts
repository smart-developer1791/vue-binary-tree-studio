import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const fixture = JSON.parse(
  readFileSync(new URL('../public/sample-workspace.json', import.meta.url), 'utf8'),
)

import {
  parse,
  serialize,
  build,
  traverse,
  search,
  height,
  layout,
  svgExport,
  csvExport,
  textExport,
} from '../src/domain/tree.ts'
test('canonical sample has independently checked shape, height, three traversals and search path', () => {
  const w = parse(fixture),
    root = build(w.values)
  assert.deepEqual(serialize(w), fixture)
  assert.equal(height(root), 4)
  assert.deepEqual(traverse(root, 'inorder'), [10, 20, 25, 30, 35, 40, 50, 60, 70])
  assert.deepEqual(traverse(root, 'preorder'), [40, 20, 10, 30, 25, 35, 60, 50, 70])
  assert.deepEqual(traverse(root, 'postorder'), [10, 25, 35, 30, 20, 50, 70, 60, 40])
  assert.deepEqual(search(root, 35), { path: [40, 20, 30, 35], found: true })
  assert.deepEqual(search(root, 34), { path: [40, 20, 30, 35], found: false })
})
test('insertion order determines shape, ordinary sorted trees stay skewed and empty trees remain valid', () => {
  const ascending = Array.from({ length: 15 }, (_, i) => i - 7),
    root = build(ascending)
  assert.equal(height(root), 15)
  assert.deepEqual(search(root, 7).path, ascending)
  assert.equal(search(root, -8).found, false)
  assert.equal(height(build([])), 0)
  assert.deepEqual(traverse(null, 'inorder'), [])
  assert.deepEqual(search(null, 0), { path: [], found: false })
  assert.equal(build([2, 1, 3])!.value, 2)
  assert.equal(build([1, 2, 3])!.value, 1)
  assert.equal(parse({ ...fixture, values: [] }).values.length, 0)
})
test('varied input permutations retain the BST invariant and include every value once in all traversals', () => {
  function check(node: ReturnType<typeof build>, lo = -Infinity, hi = Infinity): void {
    if (!node) return
    assert.ok(node.value > lo && node.value < hi)
    check(node.left, lo, node.value)
    check(node.right, node.value, hi)
  }
  for (let seed = 0; seed < 100; seed++) {
    const values = Array.from({ length: 15 }, (_, i) => i - 7).sort(
        (a, b) => (((a + 10) * 37 + seed * 13) % 97) - (((b + 10) * 37 + seed * 13) % 97),
      ),
      root = build(values)
    check(root)
    const sorted = values.slice().sort((a, b) => a - b)
    for (const mode of ['inorder', 'preorder', 'postorder'] as const)
      assert.deepEqual(
        traverse(root, mode)
          .slice()
          .sort((a, b) => a - b),
        sorted,
      )
    assert.deepEqual(traverse(root, 'inorder'), sorted)
    for (const v of values) assert.equal(search(root, v).found, true)
  }
})
test('remove-and-rebuild semantics retain order and all references point to actual remaining nodes', () => {
  const w = parse(fixture),
    values = w.values.filter((n) => n !== 40),
    g = layout(parse({ ...w, values }))
  assert.equal(g.root!.value, 20)
  assert.deepEqual(traverse(g.root, 'preorder'), [20, 10, 60, 30, 25, 50, 35, 70])
  assert.equal(g.nodes.length, 8)
  for (const n of g.nodes) {
    assert.ok(n.x >= 22 && n.x + 18 <= g.width)
    assert.ok(n.y >= 18 && n.y + 18 <= g.height)
    if (n.parent !== null) assert.ok(g.nodes.some((p) => p.value === n.parent))
  }
})
test('strict schemas reject duplicate values, wrong primitives, fractions, bounds and excessive arrays', () => {
  for (const change of [
    (w: any) => (w.values = [0, 0]),
    (w: any) => (w.values = ['1']),
    (w: any) => (w.values = [1.5]),
    (w: any) => (w.values = [100]),
    (w: any) => (w.values = Array.from({ length: 16 }, (_, i) => i)),
    (w: any) => (w.query = '35'),
    (w: any) => (w.query = -100),
    (w: any) => (w.values = {}),
    (w: any) => (w.version = 2),
  ]) {
    const w = structuredClone(fixture)
    change(w)
    assert.throws(() => parse(w))
  }
})
test('maximum and empty SVG/CSV/TXT artifacts are complete, escaped, fitted and canonically stamped', () => {
  const w = parse({
      ...fixture,
      name: '<script> & "Tree"',
      values: Array.from({ length: 15 }, (_, i) => i),
      query: 14,
    }),
    g = layout(w),
    svg = svgExport(w)
  assert.equal(g.height, 1036)
  assert.equal((svg.match(/data-value=/g) || []).length, 15)
  assert.equal((svg.match(/<path /g) || []).length, 14)
  assert.ok(svg.includes('&lt;script&gt; &amp; &quot;Tree&quot;'))
  assert.ok(!svg.includes('<script>'))
  assert.equal(csvExport(w).trim().split('\r\n').length, 16)
  assert.ok(textExport(w).includes('height in nodes: 15'))
  assert.equal((svgExport({ ...w, values: [] }).match(/data-value=/g) || []).length, 0)
  assert.deepEqual(parse(serialize(w)), w)
  assert.notEqual(
    serialize({ ...w, name: '🙂' }).provenance.marker,
    serialize({ ...w, name: '🙃' }).provenance.marker,
  )
})
