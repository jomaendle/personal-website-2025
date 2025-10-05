# Testing Guide

This document provides comprehensive information about the testing setup for the personal website.

## 📋 Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [CI/CD](#cicd)
- [Troubleshooting](#troubleshooting)

## Overview

The testing suite includes:
- **E2E Tests** (Playwright): Browser-based tests for user flows
- **Unit Tests** (Vitest): Component and utility testing
- **Accessibility Tests** (axe-core): WCAG compliance checking
- **API Tests** (Playwright): API route validation

## Test Structure

```
tests/
├── e2e/                    # End-to-end tests
│   ├── homepage.spec.ts    # Homepage tests
│   ├── blog.spec.ts        # Blog functionality
│   ├── forms.spec.ts       # Contact & newsletter forms
│   └── accessibility.spec.ts # Accessibility tests
├── api/                    # API route tests
│   ├── contact.spec.ts     # Contact API
│   ├── newsletter.spec.ts  # Newsletter API
│   └── view-tracking.spec.ts # View counter API
├── fixtures/               # Test fixtures and helpers
│   └── test-helpers.ts     # Reusable test utilities
├── utils/                  # Test utilities
│   └── test-data.ts        # Test data and mocks
└── setup.ts               # Global test setup
```

## Running Tests

### All Tests
```bash
npm test                    # Run all tests (E2E + Unit)
```

### E2E Tests
```bash
npm run test:e2e           # Run all E2E tests (headless)
npm run test:e2e:ui        # Open Playwright UI
npm run test:e2e:headed    # Run with browser visible
npm run test:e2e:debug     # Run in debug mode
```

### Browser-Specific Tests
```bash
npm run test:e2e:chromium  # Chromium only
npm run test:e2e:firefox   # Firefox only
npm run test:e2e:webkit    # WebKit only
```

### Unit Tests
```bash
npm run test:unit          # Run unit tests
npm run test:unit:watch    # Watch mode
npm run test:unit:ui       # Open Vitest UI
npm run test:unit:coverage # Generate coverage report
```

### Specific Test Suites
```bash
npm run test:api           # API tests only
npm run test:accessibility # Accessibility tests only
```

## Writing Tests

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/');

    // Your test logic
    await expect(page.getByRole('heading')).toBeVisible();
  });
});
```

### Using Test Helpers

```typescript
import { fillForm, mockApiResponse } from '../fixtures/test-helpers';

test('should submit form', async ({ page }) => {
  await page.goto('/contact');

  // Use helper to fill form
  await fillForm(page, {
    name: 'Test User',
    email: 'test@example.com',
    message: 'Test message'
  });

  // Mock API response
  await mockApiResponse(page, 'api/contact', {
    status: 200,
    body: { success: true }
  });
});
```

### Accessibility Testing

```typescript
import AxeBuilder from '@axe-core/playwright';

test('should be accessible', async ({ page }) => {
  await page.goto('/');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();

  expect(results.violations).toEqual([]);
});
```

## CI/CD

Tests run automatically on:
- Push to `main` branch
- Pull requests to `main`

### GitHub Actions Workflow

The CI pipeline includes:
1. **E2E Tests** - Parallel execution across browsers
2. **Unit Tests** - With coverage reporting
3. **Accessibility Tests** - WCAG compliance checks
4. **Lint** - Code quality checks
5. **Build** - Production build validation

### Viewing Test Results

- Test reports are uploaded as artifacts in GitHub Actions
- Coverage reports are available in the `coverage/` directory
- Playwright reports are available in the `playwright-report/` directory

## Environment Variables

### Local Testing
Tests use `.env.test` for mock environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Mock Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Mock API key
- `RESEND_API_KEY` - Mock Resend key

### CI Testing
GitHub Actions uses repository secrets (or mock values for testing)

## Test Coverage Goals

- **E2E Coverage**: All critical user flows
- **Unit Coverage**: >80% for utilities and components
- **Accessibility**: 100% WCAG 2.1 AA compliance
- **API Coverage**: All endpoints with error cases

## Troubleshooting

### Tests Failing Locally

1. **Ensure dev server is running**
   ```bash
   npm run dev
   ```

2. **Update Playwright browsers**
   ```bash
   npx playwright install
   ```

3. **Clear test artifacts**
   ```bash
   rm -rf test-results playwright-report
   ```

### CI Failures

1. Check GitHub Actions logs for specific errors
2. Download test artifacts for detailed reports
3. Verify environment variables are set correctly

### Accessibility Issues

1. Use Playwright UI to inspect violations:
   ```bash
   npm run test:e2e:ui
   ```

2. Review axe-core violations in test output
3. Refer to [WCAG guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Slow Tests

1. Use selective test execution:
   ```bash
   npx playwright test tests/e2e/homepage.spec.ts
   ```

2. Reduce browser count in `playwright.config.ts`
3. Use `test.only()` for debugging specific tests

## Best Practices

1. **Keep tests independent** - Each test should run in isolation
2. **Use data-testid sparingly** - Prefer accessible selectors (roles, labels)
3. **Mock external services** - Don't rely on real APIs in tests
4. **Test user behavior** - Focus on what users do, not implementation
5. **Keep tests maintainable** - Use helpers and fixtures for reusability

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Vitest Documentation](https://vitest.dev)
- [axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [Testing Library](https://testing-library.com)

## Contributing

When adding new features:
1. Write tests for new functionality
2. Ensure accessibility compliance
3. Update this documentation if needed
4. Run full test suite before submitting PR

---

For questions or issues with testing, please open an issue on GitHub.
