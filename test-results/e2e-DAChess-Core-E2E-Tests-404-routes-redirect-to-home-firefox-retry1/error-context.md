# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.ts >> DAChess Core E2E Tests >> 404 routes redirect to home
- Location: tests\e2e.spec.ts:60:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('h1').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('h1').first()

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('DAChess Core E2E Tests', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/', { waitUntil: 'domcontentloaded' });
  6  |   });
  7  | 
  8  |   test('Homepage loads and Hero Section renders', async ({ page }) => {
  9  |     // Check page title
  10 |     await expect(page).toHaveTitle(/DAChess/i);
  11 | 
  12 |     // Check if Hero Section heading exists
  13 |     const heroHeading = page.locator('h1').first();
  14 |     await expect(heroHeading).toBeVisible();
  15 |     await expect(heroHeading).toContainText('Build the Future of');
  16 |   });
  17 | 
  18 |   test('Engine Playground renders correctly', async ({ page }) => {
  19 |     // Scroll to the engine playground section
  20 |     const playground = page.locator('#engine-playground');
  21 |     await playground.scrollIntoViewIfNeeded();
  22 | 
  23 |     // The engine playground has a difficulty selector
  24 |     const difficultyText = page.getByText(/Difficulty/i).first();
  25 |     await expect(difficultyText).toBeVisible();
  26 | 
  27 |     // Verify the "Reset" button exists
  28 |     const resetButton = page.getByRole('button', { name: /Reset/i }).first();
  29 |     await expect(resetButton).toBeVisible();
  30 |   });
  31 | 
  32 |   test('Navigation bar is visible', async ({ page }) => {
  33 |     await expect(page.locator('nav').first()).toBeVisible();
  34 |   });
  35 | 
  36 |   test('Footer renders with correct content', async ({ page }) => {
  37 |     // Scroll to footer
  38 |     const footer = page.locator('footer');
  39 |     await footer.scrollIntoViewIfNeeded();
  40 | 
  41 |     // Verify footer brand text (use exact: true to match only the brand span, not copyright)
  42 |     await expect(footer.getByText('DACHESS', { exact: true })).toBeVisible();
  43 | 
  44 |     // Verify footer links
  45 |     await expect(footer.getByText('Live Demo')).toBeVisible();
  46 |     await expect(footer.getByText('Practice Puzzles')).toBeVisible();
  47 |   });
  48 | 
  49 |   test('Puzzles page loads correctly', async ({ page }) => {
  50 |     await page.goto('/puzzles', { waitUntil: 'domcontentloaded' });
  51 | 
  52 |     // Verify puzzle content renders
  53 |     await expect(page).toHaveTitle(/Puzzles|DAChess/i);
  54 | 
  55 |     // Verify the puzzle board renders
  56 |     const puzzleBoard = page.locator('[class*="grid"]').first();
  57 |     await expect(puzzleBoard).toBeVisible();
  58 |   });
  59 | 
  60 |   test('404 routes redirect to home', async ({ page }) => {
  61 |     await page.goto('/nonexistent-page', { waitUntil: 'domcontentloaded' });
  62 | 
  63 |     // Should redirect to home — hero heading should be visible
  64 |     const heroHeading = page.locator('h1').first();
> 65 |     await expect(heroHeading).toBeVisible();
     |                               ^ Error: expect(locator).toBeVisible() failed
  66 |     await expect(heroHeading).toContainText('Build the Future of');
  67 |   });
  68 | });
  69 | 
```