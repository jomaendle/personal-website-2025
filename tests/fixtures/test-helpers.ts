import { Page } from '@playwright/test';

/**
 * Helper to wait for network to be idle
 */
export async function waitForNetworkIdle(page: Page, timeout = 5000) {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Helper to scroll to an element smoothly
 */
export async function scrollToElement(page: Page, selector: string) {
  await page.locator(selector).scrollIntoViewIfNeeded();
  await page.waitForTimeout(300); // Wait for smooth scroll to complete
}

/**
 * Helper to check if element is in viewport
 */
export async function isInViewport(page: Page, selector: string): Promise<boolean> {
  return await page.locator(selector).evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  });
}

/**
 * Helper to mock API responses
 */
export async function mockApiResponse(
  page: Page,
  endpoint: string,
  response: {
    status?: number;
    body: any;
    contentType?: string;
  }
) {
  await page.route(`**/${endpoint}`, (route) => {
    route.fulfill({
      status: response.status || 200,
      contentType: response.contentType || 'application/json',
      body: JSON.stringify(response.body),
    });
  });
}

/**
 * Helper to fill form fields
 */
export async function fillForm(
  page: Page,
  fields: { [key: string]: string }
) {
  for (const [label, value] of Object.entries(fields)) {
    const input = page.getByLabel(new RegExp(label, 'i'));
    await input.fill(value);
  }
}

/**
 * Helper to wait for element to be visible
 */
export async function waitForVisible(page: Page, selector: string, timeout = 5000) {
  await page.locator(selector).waitFor({ state: 'visible', timeout });
}

/**
 * Helper to check for console errors
 */
export function setupConsoleErrorTracking(page: Page): string[] {
  const errors: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  return errors;
}

/**
 * Helper to take screenshot with timestamp
 */
export async function takeTimestampedScreenshot(page: Page, name: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({
    path: `screenshots/${name}-${timestamp}.png`,
    fullPage: true
  });
}

/**
 * Helper to get computed styles
 */
export async function getComputedStyle(
  page: Page,
  selector: string,
  property: string
): Promise<string> {
  return await page.locator(selector).evaluate(
    (element, prop) => window.getComputedStyle(element).getPropertyValue(prop),
    property
  );
}

/**
 * Helper to wait for animations to complete
 */
export async function waitForAnimations(page: Page, selector: string) {
  await page.locator(selector).evaluate((element) => {
    return Promise.all(
      element.getAnimations().map((animation) => animation.finished)
    );
  });
}

/**
 * Helper to check if element has specific class
 */
export async function hasClass(
  page: Page,
  selector: string,
  className: string
): Promise<boolean> {
  const classes = await page.locator(selector).getAttribute('class');
  return classes?.includes(className) || false;
}
