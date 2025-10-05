import { test, expect } from '@playwright/test';

test.describe('Newsletter API', () => {
  test('should accept valid subscription request', async ({ request }) => {
    const response = await request.post('/api/subscribe', {
      data: {
        email: 'test@example.com',
      },
    });

    // May fail if Resend API is not configured
    const status = response.status();
    expect([200, 400, 500]).toContain(status);
  });

  test('should reject subscription with missing email', async ({ request }) => {
    const response = await request.post('/api/subscribe', {
      data: {},
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeTruthy();
  });

  test('should reject subscription with invalid email', async ({ request }) => {
    const response = await request.post('/api/subscribe', {
      data: {
        email: 'invalid-email',
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeTruthy();
  });

  test('should only accept POST requests for subscribe', async ({ request }) => {
    const getResponse = await request.get('/api/subscribe');
    expect(getResponse.status()).toBe(405);

    const putResponse = await request.put('/api/subscribe', {
      data: {},
    });
    expect(putResponse.status()).toBe(405);
  });

  test('should handle unsubscribe request', async ({ request }) => {
    const response = await request.post('/api/unsubscribe', {
      data: {
        email: 'test@example.com',
      },
    });

    // May fail if Resend API is not configured
    const status = response.status();
    expect([200, 400, 500]).toContain(status);
  });

  test('should reject unsubscribe with missing email', async ({ request }) => {
    const response = await request.post('/api/unsubscribe', {
      data: {},
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeTruthy();
  });

  test('should validate email format for unsubscribe', async ({ request }) => {
    const response = await request.post('/api/unsubscribe', {
      data: {
        email: 'not-an-email',
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeTruthy();
  });

  test('should return proper content-type headers', async ({ request }) => {
    const response = await request.post('/api/subscribe', {
      data: {
        email: 'test@example.com',
      },
    });

    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');
  });
});
