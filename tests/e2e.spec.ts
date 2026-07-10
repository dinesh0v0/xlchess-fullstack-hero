import { test, expect } from '@playwright/test';

test.describe('DAChess Core E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the local development server (or built preview)
    await page.goto('/');
  });

  test('Homepage loads and Hero Section renders', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/DAChess/i);
    
    // Check if Hero Section text exists
    const heroHeading = page.locator('h1').first();
    await expect(heroHeading).toBeVisible();
    await expect(heroHeading).toContainText('Build the Future of');

  });

  test('Engine Playground renders correctly', async ({ page }) => {
    // The engine playground has a difficulty selector
    const difficultyText = page.getByText(/Difficulty/i).first();
    await expect(difficultyText).toBeVisible();

    // Verify the "Reset" button exists
    const resetButton = page.getByRole('button', { name: /Reset/i }).first();
    await expect(resetButton).toBeVisible();
  });
});
