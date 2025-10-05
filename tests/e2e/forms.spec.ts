import { test, expect } from '@playwright/test';

test.describe('Newsletter Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('heading', { name: /Newsletter/i }).scrollIntoViewIfNeeded();
  });

  test('should display newsletter form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Newsletter/i })).toBeVisible();
    await expect(page.getByPlaceholder(/your\.email@example\.com/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Subscribe/i })).toBeVisible();
  });

  test('should validate email input', async ({ page }) => {
    const emailInput = page.getByPlaceholder(/your\.email@example\.com/i);
    const submitButton = page.getByRole('button', { name: /Subscribe/i });

    // Try to submit with invalid email
    await emailInput.fill('invalid-email');
    await submitButton.click();

    // HTML5 validation should prevent submission
    const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toBeTruthy();
  });

  test('should require email input', async ({ page }) => {
    const emailInput = page.getByPlaceholder(/your\.email@example\.com/i);
    const submitButton = page.getByRole('button', { name: /Subscribe/i });

    // Try to submit without email
    await submitButton.click();

    // HTML5 validation should prevent submission
    const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toBeTruthy();
  });

  test('should handle subscription error gracefully', async ({ page }) => {
    // Mock API route to return error
    await page.route('**/api/subscribe', (route) => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Subscription failed' }),
      });
    });

    const emailInput = page.getByPlaceholder(/your\.email@example\.com/i);
    const submitButton = page.getByRole('button', { name: /Subscribe/i });

    await emailInput.fill('test@example.com');
    await submitButton.click();

    // Should show error message
    await expect(page.getByText(/failed|error/i)).toBeVisible({ timeout: 5000 });
  });

  test('should handle successful subscription', async ({ page }) => {
    // Mock successful API response
    await page.route('**/api/subscribe', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    const emailInput = page.getByPlaceholder(/your\.email@example\.com/i);
    const submitButton = page.getByRole('button', { name: /Subscribe/i });

    await emailInput.fill('test@example.com');
    await submitButton.click();

    // Should show success message
    await expect(page.getByText(/thanks|success|subscribed/i)).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
  });

  test('should display contact form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Get in touch/i })).toBeVisible();
    await expect(page.getByLabel(/name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/message/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Send Message/i })).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: /Send Message/i });

    await submitButton.click();

    // Check HTML5 validation
    const nameInput = page.getByLabel(/name/i);
    const validationMessage = await nameInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toBeTruthy();
  });

  test('should validate email format', async ({ page }) => {
    const nameInput = page.getByLabel(/name/i);
    const emailInput = page.getByLabel(/email/i);
    const messageInput = page.getByLabel(/message/i);
    const submitButton = page.getByRole('button', { name: /Send Message/i });

    await nameInput.fill('Test User');
    await emailInput.fill('invalid-email');
    await messageInput.fill('This is a test message for validation');
    await submitButton.click();

    // HTML5 validation should catch invalid email
    const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toBeTruthy();
  });

  test('should enforce minimum message length', async ({ page }) => {
    const nameInput = page.getByLabel(/name/i);
    const emailInput = page.getByLabel(/email/i);
    const messageInput = page.getByLabel(/message/i);
    const submitButton = page.getByRole('button', { name: /Send Message/i });

    await nameInput.fill('Test User');
    await emailInput.fill('test@example.com');
    await messageInput.fill('short'); // Less than minimum (10 chars)
    await submitButton.click();

    // Check for validation - either client-side (most browsers) or server-side (Mobile Safari)
    // Try to check client-side validation first
    const messageStillVisible = await messageInput.isVisible({ timeout: 1000 }).catch(() => false);

    if (messageStillVisible) {
      // Client-side validation prevented submission - check validity state
      const isInvalid = await messageInput.evaluate((el: HTMLTextAreaElement) => {
        return el.validity.tooShort || !el.checkValidity();
      });
      expect(isInvalid).toBeTruthy();
    } else {
      // Mobile Safari: form submitted and API rejected it - check for error message
      await expect(page.getByText(/Please enter at least 10 characters/i)).toBeVisible();
    }
  });

  test('should show character count for message', async ({ page }) => {
    const messageInput = page.getByLabel(/message/i);

    await messageInput.fill('This is a test message');

    // Check for character counter
    const charCount = page.getByText(/\/1000 characters/i);
    await expect(charCount).toBeVisible();
  });

  test('should handle form submission success', async ({ page }) => {
    // Mock successful API response
    await page.route('**/api/contact', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    const nameInput = page.getByLabel(/name/i);
    const emailInput = page.getByLabel(/email/i);
    const messageInput = page.getByLabel(/message/i);
    const submitButton = page.getByRole('button', { name: /Send Message/i });

    await nameInput.fill('Test User');
    await emailInput.fill('test@example.com');
    await messageInput.fill('This is a test message for the contact form');
    await submitButton.click();

    // Should show success message
    await expect(page.getByText(/thank you|message has been sent/i)).toBeVisible({ timeout: 5000 });
  });

  test('should handle form submission error', async ({ page }) => {
    // Mock error API response
    await page.route('**/api/contact', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Failed to send message' }),
      });
    });

    const nameInput = page.getByLabel(/name/i);
    const emailInput = page.getByLabel(/email/i);
    const messageInput = page.getByLabel(/message/i);
    const submitButton = page.getByRole('button', { name: /Send Message/i });

    await nameInput.fill('Test User');
    await emailInput.fill('test@example.com');
    await messageInput.fill('This is a test message');
    await submitButton.click();

    // Should show error message
    await expect(page.getByText(/something went wrong|failed/i)).toBeVisible({ timeout: 5000 });
  });
});
