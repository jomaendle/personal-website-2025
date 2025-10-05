import { test, expect } from '@playwright/test';

test.describe('Blog', () => {
  test('should display blog posts on homepage', async ({ page }) => {
    await page.goto('/');

    // Check for Articles heading
    const articlesHeading = page.getByRole('heading', { name: /Articles/i });
    await expect(articlesHeading).toBeVisible();

    // Check that blog posts are visible
    const blogLinks = page.locator('a[href^="/blog/"]').first();
    await expect(blogLinks).toBeVisible();
  });

  test('should navigate to a blog post', async ({ page }) => {
    await page.goto('/');

    // Click on the first blog post
    const firstBlogLink = page.locator('a[href^="/blog/"]').first();
    const blogUrl = await firstBlogLink.getAttribute('href');

    await firstBlogLink.click();

    // Wait for navigation
    await page.waitForURL(`**${blogUrl}`);

    // Check that we're on a blog post page
    expect(page.url()).toContain('/blog/');
  });

  test('should display blog post content', async ({ page }) => {
    // Visit a known blog post
    await page.goto('/blog/animations');

    // Check for MDX content rendering
    const article = page.locator('article').first();
    await expect(article).toBeVisible();

    // Check for heading in the blog post
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });

  test('should have proper metadata for SEO', async ({ page }) => {
    await page.goto('/blog/animations');

    // Check title is set
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    expect(title).not.toBe('');

    // Check meta description
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toBeTruthy();
  });

  test('should have Open Graph tags', async ({ page }) => {
    await page.goto('/blog/animations');

    // Check OG tags
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');

    expect(ogTitle).toBeTruthy();
    expect(ogImage).toBeTruthy();
  });

  test('should handle non-existent blog posts gracefully', async ({ page }) => {
    const response = await page.goto('/blog/non-existent-post-12345');

    // Should get a 404 or redirect
    expect(response?.status()).toBeGreaterThanOrEqual(400);
  });

  test('should be responsive on mobile', async ({ page, isMobile }) => {
    if (isMobile) {
      await page.goto('/blog/animations');

      // Check that content is readable on mobile
      const article = page.locator('article').first();
      await expect(article).toBeVisible();

      // Verify no horizontal overflow
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = page.viewportSize()?.width || 0;

      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20);
    }
  });

});
