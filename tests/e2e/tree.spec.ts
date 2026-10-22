import { test, expect, type Page } from '@playwright/test'
import { readFile } from 'node:fs/promises'
const fixture = JSON.parse(
  await readFile(new URL('../../public/sample-workspace.json', import.meta.url), 'utf8'),
)
async function importData(page: Page, value: unknown) {
  await page.getByRole('button', { name: 'Import', exact: true }).click()
  await page.getByLabel('Workspace JSON', { exact: true }).fill(JSON.stringify(value))
  await page.getByRole('button', { name: 'Import workspace', exact: true }).click()
  await expect(page.locator('dialog[open]')).toHaveCount(0)
}
async function deliver(page: Page, label: string) {
  const pending = page.waitForEvent('download')
  await page.getByRole('button', { name: label, exact: true }).click()
  const file = await pending
  return { name: file.suggestedFilename(), buffer: await readFile((await file.path())!) }
}

test('recursive typed selection propagates through deep children while search highlight and source query remain independent', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.locator('[data-count]')).toHaveText(['9', '4', '4'])
  await expect(page.locator('[data-tree-value][data-on-path="true"]')).toHaveCount(4)
  await page.getByRole('button', { name: 'Inspect number 35', exact: true }).click()
  await expect(page.locator('[data-ui="node-detail"]')).toContainText('Inspecting 35')
  await expect(page.locator('[data-ui="node-detail"]')).toContainText('Left empty · Right empty')
  await page.getByRole('button', { name: 'Inspect number 20', exact: true }).click()
  await expect(page.locator('[data-ui="node-detail"]')).toContainText('Left 10 · Right 30')
  await expect(page.getByRole('spinbutton', { name: 'Search value', exact: true })).toHaveValue(
    '35',
  )
  await expect(page.locator('[data-ui="search-result"]')).toContainText('40 → 20 → 30 → 35')
  await page.reload()
  await expect(page.locator('[data-ui="node-detail"]')).toContainText('Inspecting 40')
})
test('recursive collapse state and actual DOM survive v-show view changes and query edits while imports reset branches', async ({
  page,
}) => {
  await page.goto('/')
  const child = page.locator('[data-outline-value="35"]')
  await child.evaluate((e) => {
    ;(window as any).__node = e
  })
  const panel = page.locator('[data-ui="preview-panel"]'),
    height = await panel.evaluate((e) => e.getBoundingClientRect().height)
  await page.getByRole('button', { name: 'Collapse subtree 40', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Inspect number 35', exact: true })).toBeHidden()
  await page.getByRole('button', { name: 'Traversals', exact: true }).click()
  await expect(page.locator('[data-traversal="inorder"]')).toHaveText(
    '10, 20, 25, 30, 35, 40, 50, 60, 70',
  )
  await page.getByRole('button', { name: 'Outline', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Expand subtree 40', exact: true }),
  ).toHaveAttribute('aria-expanded', 'false')
  expect(await child.evaluate((e) => e === (window as any).__node)).toBe(true)
  await page.getByRole('spinbutton', { name: 'Search value', exact: true }).fill('10')
  await page.getByRole('button', { name: 'Apply search settings', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Expand subtree 40', exact: true })).toBeVisible()
  await importData(page, fixture)
  await expect(
    page.getByRole('button', { name: 'Collapse subtree 40', exact: true }),
  ).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByRole('button', { name: 'Inspect number 35', exact: true })).toBeVisible()
  expect(await panel.evaluate((e) => e.getBoundingClientRect().height)).toBe(height)
})
test('insertion/reordering preserve pending settings, duplicates fail atomically and confirmed removal rebuilds through the empty tree', async ({
  page,
}) => {
  await page.goto('/')
  await page
    .getByRole('textbox', { name: 'Workspace name', exact: true })
    .fill('Pending tree title')
  await page.getByRole('button', { name: 'Insert number', exact: true }).click()
  await expect(page.getByRole('textbox', { name: 'Workspace name', exact: true })).toHaveValue(
    'Pending tree title',
  )
  await expect(page.locator('[data-order-value]')).toHaveCount(10)
  const marker = await page.locator('[data-ui="marker"]').innerText()
  await page.getByRole('button', { name: 'Insert number', exact: true }).click()
  await expect(page.locator('[data-ui="insert-form"]').getByRole('alert')).toContainText('unique')
  await expect(page.locator('[data-ui="marker"]')).toHaveText(marker)
  await page.getByRole('spinbutton', { name: 'Search value', exact: true }).fill('99')
  await page.getByRole('button', { name: 'Move earlier', exact: true }).click()
  await expect(page.getByRole('spinbutton', { name: 'Search value', exact: true })).toHaveValue(
    '99',
  )
  await page.locator('[data-order-value="40"]').click()
  await page.getByRole('button', { name: 'Remove and rebuild', exact: true }).click()
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(page.locator('[data-order-value="40"]')).toHaveCount(1)
  await page.getByRole('button', { name: 'Remove and rebuild', exact: true }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Remove number', exact: true }).click()
  await expect(page.locator('[data-order-value="40"]')).toHaveCount(0)
  await expect(page.locator('[data-ui="tree-outline"] > li')).toHaveAttribute(
    'data-outline-value',
    '20',
  )
  await importData(page, { ...fixture, values: [] })
  await expect(page.locator('[data-count]')).toHaveText(['0', '0', '0'])
  await expect(page.getByRole('button', { name: 'Remove and rebuild', exact: true })).toBeDisabled()
  await page.getByRole('spinbutton', { name: 'New number', exact: true }).fill('0')
  await page.getByRole('button', { name: 'Insert number', exact: true }).click()
  await expect(page.locator('[data-ui="node-detail"]')).toContainText('Inspecting 0')
})
test('actual SVG/CSV/TXT retain complete tree links, escaped labels, search paths and traversals without private state', async ({
  page,
}) => {
  await page.goto('/')
  await importData(page, { ...fixture, name: '<script> & "Tree"' })
  const svg = await deliver(page, 'Tree SVG'),
    csv = await deliver(page, 'Nodes CSV'),
    txt = await deliver(page, 'Tree TXT')
  expect(svg.name).toMatch(/^BT-[A-F0-9]{8}\.svg$/)
  const facts = await page.evaluate((source) => {
    const d = new DOMParser().parseFromString(source, 'image/svg+xml')
    return {
      bad: d.querySelectorAll('parsererror,script').length,
      title: d.querySelector('title')!.textContent,
      nodes: d.querySelectorAll('[data-value]').length,
      edges: d.querySelectorAll('path').length,
      highlighted: d.querySelectorAll('circle[fill="#537e90"]').length,
    }
  }, svg.buffer.toString('utf8'))
  expect(facts).toEqual({ bad: 0, title: '<script> & "Tree"', nodes: 9, edges: 8, highlighted: 4 })
  expect(csv.buffer.toString('utf8').trim().split('\r\n')).toHaveLength(10)
  expect(csv.buffer.toString('utf8')).toContain('40,,0,20,60,5,true,')
  expect(txt.buffer.toString('utf8')).toContain('Search path: 40 -> 20 -> 30 -> 35')
  expect(txt.buffer.toString('utf8')).toContain('postorder: 10, 25, 35, 30, 20, 50, 70, 60, 40')
  const json = JSON.parse((await deliver(page, 'JSON')).buffer.toString('utf8'))
  expect(json.root).toBeUndefined()
  expect(json.selected).toBeUndefined()
  expect(json.collapsed).toBeUndefined()
  expect(json.values).toEqual(fixture.values)
})
