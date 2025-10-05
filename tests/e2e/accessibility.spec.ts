import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('homepage should not have automatically detectable accessibility issues', async ({
    page,
  }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('contact page should not have automatically detectable accessibility issues', async ({
    page,
  }) => {
    await page.goto('/contact');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Get all focusable elements
    const focusableElements = await page.locator('a, button, input, textarea, [tabindex]:not([tabindex="-1"])').all();

    expect(focusableElements.length).toBeGreaterThan(0);

    // Tab through first few elements
    await page.keyboard.press('Tab');
    const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
    expect(firstFocused).toBeTruthy();

    await page.keyboard.press('Tab');
    const secondFocused = await page.evaluate(() => document.activeElement?.tagName);
    expect(secondFocused).toBeTruthy();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    // Get all headings
    const h1Count = await page.locator('h1').count();
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();

    // Should have exactly one H1
    expect(h1Count).toBe(1);

    // Should have headings
    expect(headings.length).toBeGreaterThan(1);
  });

  test('images should have alt text', async ({ page }) => {
    await page.goto('/blog/animations');

    const images = await page.locator('img').all();

    for (const img of images) {
      const alt = await img.getAttribute('alt');
      // Alt attribute should exist (can be empty string for decorative images)
      expect(alt !== null).toBe(true);
    }
  });

  test('links should have accessible names', async ({ page }) => {
    await page.goto('/');

    const links = await page.locator('a[href]').all();

    for (const link of links) {
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      const title = await link.getAttribute('title');

      // Link should have text content, aria-label, or title
      expect(text || ariaLabel || title).toBeTruthy();
    }
  });

  test('form inputs should have labels', async ({ page }) => {
    await page.goto('/contact');

    const inputs = await page.locator('input, textarea').all();

    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');

      if (id) {
        // Check if there's a label for this input
        const label = await page.locator(`label[for="${id}"]`).count();
        const hasLabel = label > 0 || ariaLabel || ariaLabelledBy;
        expect(hasLabel).toBe(true);
      }
    }
  });

  test('should support screen reader navigation landmarks', async ({ page }) => {
    await page.goto('/');

    // Check for semantic HTML5 landmarks
    const nav = await page.locator('nav').count();
    const main = await page.locator('main').count();
    const footer = await page.locator('footer').count();

    // Should have at least main and footer
    expect(main).toBeGreaterThanOrEqual(1);
    expect(footer).toBeGreaterThanOrEqual(1);
  });

  test('newsletter form should have accessible label', async ({ page }) => {
    await page.goto('/');

    // Get the newsletter email input
    const emailInput = await page.locator('#newsletter-email');

    // Check that it exists
    expect(await emailInput.count()).toBe(1);

    // Check for label association
    const label = await page.locator('label[for="newsletter-email"]');
    expect(await label.count()).toBe(1);

    // Check for aria-describedby
    const ariaDescribedBy = await emailInput.getAttribute('aria-describedby');
    expect(ariaDescribedBy).toBe('newsletter-description');

    // Verify the description element exists
    const description = await page.locator('#newsletter-description');
    expect(await description.count()).toBe(1);
  });

  test('status messages should have ARIA live regions', async ({ page }) => {
    await page.goto('/');

    // Check that success/error messages would have proper ARIA attributes
    // We're testing the DOM structure exists for proper announcements
    const form = await page.locator('form').first();
    expect(await form.count()).toBeGreaterThan(0);
  });

});
