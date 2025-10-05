import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the homepage with all sections', async ({ page }) => {
    // Check for main heading
    await expect(page.getByRole('heading', { name: /Jo Maendle/i })).toBeVisible();

    // Check for all major sections
    await expect(page.getByRole('heading', { name: /Today/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Selected Work/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Crafts/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Articles/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Experience/i })).toBeVisible();
  });

  test('should display framework icons', async ({ page }) => {
    // Check that framework icons are visible (React, Vue, Angular, etc.)
    const todaySection = page.locator('section').filter({ hasText: 'Today' });
    await expect(todaySection).toBeVisible();

    // Icons are decorative SVGs with aria-hidden="true", check for their presence
    const frameworkIcons = todaySection.locator('svg[aria-hidden="true"]');
    await expect(frameworkIcons.first()).toBeVisible();
    // Should have multiple framework icons (React, Vue, Angular, JS, Astro)
    expect(await frameworkIcons.count()).toBeGreaterThanOrEqual(5);
  });

  test('should have LinkedIn link', async ({ page }) => {
    const linkedInLink = page.getByRole('link', { name: /linkedin/i }).first();
    await expect(linkedInLink).toBeVisible();
    await expect(linkedInLink).toHaveAttribute('href', /linkedin\.com/);
    await expect(linkedInLink).toHaveAttribute('target', '_blank');
  });

  test('should display newsletter subscription form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Newsletter/i })).toBeVisible();
    await expect(page.getByPlaceholder(/your\.email@example\.com/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Subscribe/i })).toBeVisible();
  });

  test('should have footer', async ({ page }) => {
    // Scroll to bottom to ensure footer is in viewport
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page, isMobile }) => {
    if (isMobile) {
      // Check that main content is visible on mobile
      await expect(page.getByRole('heading', { name: /Jo Maendle/i })).toBeVisible();

      // Verify layout doesn't overflow
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = page.viewportSize()?.width || 0;

      // Allow some tolerance for scrollbar
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20);
    }
  });

  test('should have correct meta tags', async ({ page }) => {
    // Check title (note: name has umlaut ä)
    await expect(page).toHaveTitle(/Jo M[äa]ndle/i);

    // Check viewport meta tag
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');
  });

});
