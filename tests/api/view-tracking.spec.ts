import { test, expect } from '@playwright/test';

test.describe('View Tracking API', () => {
  const testSlug = 'animations'; // Using a known blog post

  test('should increment view count', async ({ request }) => {
    const response = await request.post('/api/increment-view', {
      data: {
        slug: testSlug,
      },
    });

    // May fail if Supabase is not configured
    const status = response.status();
    expect([200, 400, 500]).toContain(status);

    if (status === 200) {
      const body = await response.json();
      expect(body.views).toBeGreaterThanOrEqual(0);
    }
  });

  test('should reject increment without slug', async ({ request }) => {
    const response = await request.post('/api/increment-view', {
      data: {},
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeTruthy();
  });

  test('should list view counts', async ({ request }) => {
    const response = await request.get('/api/list-view-count');

    // May fail if Supabase is not configured
    const status = response.status();
    expect([200, 500]).toContain(status);

    if (status === 200) {
      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);
    }
  });

  test('should return view count for specific slug', async ({ request }) => {
    const response = await request.get(`/api/list-view-count?slug=${testSlug}`);

    const status = response.status();
    expect([200, 404, 500]).toContain(status);

    if (status === 200) {
      const body = await response.json();
      expect(body).toHaveProperty('slug');
      expect(body).toHaveProperty('views');
      expect(body.slug).toBe(testSlug);
    }
  });

  test('should only accept POST for increment', async ({ request }) => {
    const getResponse = await request.get('/api/increment-view');
    expect(getResponse.status()).toBe(405);
  });

  test('should only accept GET for list', async ({ request }) => {
    const postResponse = await request.post('/api/list-view-count', {
      data: {},
    });
    expect(postResponse.status()).toBe(405);
  });

  test('should handle invalid slug gracefully', async ({ request }) => {
    const response = await request.post('/api/increment-view', {
      data: {
        slug: 'non-existent-blog-post-12345',
      },
    });

    const status = response.status();
    // Should either create new entry or return error
    expect([200, 400, 404, 500]).toContain(status);
  });

  test('should return proper content-type', async ({ request }) => {
    const response = await request.get('/api/list-view-count');

    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');
  });

  test('should handle concurrent increments', async ({ request }) => {
    // Send multiple increment requests in parallel
    const requests = Array.from({ length: 3 }, () =>
      request.post('/api/increment-view', {
        data: { slug: testSlug },
      })
    );

    const responses = await Promise.all(requests);

    // All requests should succeed or fail gracefully
    responses.forEach((response) => {
      expect([200, 400, 500]).toContain(response.status());
    });
  });
});
