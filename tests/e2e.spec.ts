import { test, expect } from '@playwright/test';

test.describe('DAChess Core E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('Homepage loads and Hero Section renders', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/DAChess/i);

    // Check if Hero Section heading exists
    const heroHeading = page.locator('h1').first();
    await expect(heroHeading).toBeVisible();
    await expect(heroHeading).toContainText('Build the Future of');
  });

  test('Engine Playground renders correctly', async ({ page }) => {
    // Scroll to the engine playground section
    const playground = page.locator('#engine-playground');
    await playground.scrollIntoViewIfNeeded();

    // The engine playground has a difficulty selector
    const difficultyText = page.getByText(/Difficulty/i).first();
    await expect(difficultyText).toBeVisible();

    // Verify the "Reset" button exists
    const resetButton = page.getByRole('button', { name: /Reset/i }).first();
    await expect(resetButton).toBeVisible();
  });

  test('Navigation bar is visible', async ({ page }) => {
    await expect(page.locator('nav').first()).toBeVisible();
  });

  test('Footer renders with correct content', async ({ page }) => {
    // Scroll to footer
    const footer = page.locator('footer');
    await footer.scrollIntoViewIfNeeded();

    // Verify footer brand text (use exact: true to match only the brand span, not copyright)
    await expect(footer.getByText('DACHESS', { exact: true })).toBeVisible();

    // Verify footer links
    await expect(footer.getByText('Live Demo')).toBeVisible();
    await expect(footer.getByText('Practice Puzzles')).toBeVisible();
  });

  test('Puzzles page loads correctly', async ({ page }) => {
    await page.goto('/puzzles', { waitUntil: 'domcontentloaded' });

    // Verify puzzle content renders
    await expect(page).toHaveTitle(/Puzzles|DAChess/i);

    // Verify the puzzle board renders
    const puzzleBoard = page.locator('[class*="grid"]').first();
    await expect(puzzleBoard).toBeVisible();
  });

  test('404 routes redirect to home', async ({ page }) => {
    await page.goto('/nonexistent-page', { waitUntil: 'domcontentloaded' });

    // Wait for the redirect to complete
    await page.waitForURL('/', { timeout: 15_000 });

    // Should redirect to home — hero heading should be visible
    const heroHeading = page.locator('h1').first();
    await expect(heroHeading).toBeVisible({ timeout: 10_000 });
  });
});
