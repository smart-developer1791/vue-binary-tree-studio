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

test('maximum escaped workspace downloads and reimports losslessly at 320 px with complete artifacts', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 1000 })
  await page.goto('/')
  let value: any = { ...fixture, name: '<script>' + '"'.repeat(64) }
  value = { ...value, values: Array.from({ length: 15 }, (_, i) => i - 7), query: 7 }

  await importData(page, value)
  const file = await deliver(page, 'JSON'),
    json = JSON.parse(file.buffer.toString('utf8'))
  for (const k of Object.keys(value).filter((k) => k !== 'provenance'))
    expect(json[k]).toEqual(value[k])
  await importData(page, json)
  expect((await deliver(page, 'JSON')).buffer.toString('utf8')).toBe(file.buffer.toString('utf8'))
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)

  await expect(page.locator('[data-count]')).toHaveText(['15', '15', '15'])
  await expect(page.getByRole('button', { name: 'Insert number', exact: true })).toBeDisabled()
  await page.getByRole('button', { name: 'Inspect number 7', exact: true }).click()
  await expect(page.locator('[data-ui="node-detail"]')).toContainText('Inspecting 7')
  const frame = page.locator('[data-ui="tree-frame"]'),
    start = await frame.evaluate((e) => {
      const a = e.getBoundingClientRect(),
        b = e.querySelector('svg')!.getBoundingClientRect()
      return { left: b.left - a.left, top: b.top - a.top, width: b.width, height: b.height }
    })
  expect(start.left).toBeGreaterThanOrEqual(0)
  expect(start.top).toBeGreaterThanOrEqual(0)
  expect(start.height).toBe(1036)
  await frame.evaluate((e) => {
    e.scrollLeft = e.scrollWidth
    e.scrollTop = e.scrollHeight
  })
  const end = await frame.evaluate((e) => {
    const a = e.getBoundingClientRect(),
      b = e.querySelector('svg')!.getBoundingClientRect()
    return { right: b.right - a.right, bottom: b.bottom - a.bottom }
  })
  expect(end.right).toBeLessThanOrEqual(0)
  expect(end.bottom).toBeLessThanOrEqual(0)
  expect(
    (await deliver(page, 'Nodes CSV')).buffer.toString('utf8').trim().split('\r\n'),
  ).toHaveLength(16)
  expect((await deliver(page, 'Tree TXT')).buffer.toString('utf8')).toContain('height in nodes: 15')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
