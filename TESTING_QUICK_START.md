# Testing Quick Start Guide

Get started with testing in under 5 minutes!

## 🚀 Quick Setup

### 1. Prerequisites
- Node.js 20+ installed
- Dependencies installed (`npm install` already done)
- Playwright browsers installed (`npx playwright install` already done)

### 2. Start Development Server
```bash
npm run dev
```
Keep this running in a separate terminal.

### 3. Run Your First Test

**Option A: Run all E2E tests**
```bash
npm run test:e2e
```

**Option B: Open Playwright UI (Recommended for beginners)**
```bash
npm run test:e2e:ui
```
This opens an interactive UI where you can:
- See all tests
- Run tests individually
- Watch tests execute in slow motion
- Inspect each step

**Option C: Run with visible browser**
```bash
npm run test:e2e:headed
```

## 📊 What Tests Are Included?

### ✅ Homepage Tests
- Verifies all sections are visible
- Checks navigation links
- Tests responsive design
- Validates newsletter form

### ✅ Blog Tests
- Blog post navigation
- Content rendering
- View counter functionality
- SEO metadata

### ✅ Forms Tests
- Contact form validation
- Newsletter subscription
- Error handling
- Success states

### ✅ Accessibility Tests
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Color contrast

### ✅ API Tests
- Contact endpoint
- Newsletter subscription/unsubscribe
- View tracking

## 🎯 Common Commands

```bash
# Run all tests
npm test

# Run only E2E tests
npm run test:e2e

# Run only Unit tests
npm run test:unit

# Run only Accessibility tests
npm run test:accessibility

# Run only API tests
npm run test:api

# Debug a specific test
npm run test:e2e:debug

# Run in specific browser
npm run test:e2e:chromium
npm run test:e2e:firefox
npm run test:e2e:webkit
```

## 🔍 Debugging Tests

### Method 1: Playwright UI (Easiest)
```bash
npm run test:e2e:ui
```
- Click on any test to run it
- Use the inspector to see each step
- View screenshots and traces

### Method 2: Debug Mode
```bash
npm run test:e2e:debug
```
- Opens browser with debugger
- Step through each action
- Inspect page at any point

### Method 3: Run Single Test
```bash
npx playwright test tests/e2e/homepage.spec.ts
```

## 📝 Test Results

### Local Reports
After running tests:
- HTML Report: Open `playwright-report/index.html` in browser
- Coverage Report: Open `coverage/index.html` in browser

### View Reports
```bash
npx playwright show-report
```

## ⚠️ Troubleshooting

### Issue: Tests failing with "Cannot connect to dev server"
**Solution:** Make sure `npm run dev` is running in another terminal

### Issue: Browser not opening
**Solution:** Reinstall Playwright browsers
```bash
npx playwright install
```

### Issue: Tests are slow
**Solution:** Run specific tests instead of all
```bash
npx playwright test tests/e2e/homepage.spec.ts
```

### Issue: API tests failing
**Solution:** This is expected if Supabase/Resend are not configured. The tests check for graceful error handling.

## 🎨 Writing Your First Test

1. Create a new file in `tests/e2e/`
2. Use this template:

```typescript
import { test, expect } from '@playwright/test';

test.describe('My Feature', () => {
  test('should do something', async ({ page }) => {
    // Navigate to page
    await page.goto('/');

    // Interact with page
    await page.click('button');

    // Assert result
    await expect(page.getByText('Success')).toBeVisible();
  });
});
```

3. Run it:
```bash
npm run test:e2e:ui
```

## 📚 Next Steps

1. **Read the full guide**: Check `README.testing.md` for detailed documentation
2. **Explore test helpers**: See `tests/fixtures/test-helpers.ts` for utilities
3. **Check CI setup**: Review `.github/workflows/test.yml` for CI/CD
4. **Write more tests**: Add tests for new features you build

## 🎉 Success Indicators

You'll know testing is working when:
- ✅ All tests pass locally
- ✅ You can open Playwright UI
- ✅ Tests run in CI (GitHub Actions)
- ✅ Coverage reports are generated

## 💡 Pro Tips

1. **Use Playwright UI for development** - It's the fastest way to write and debug tests
2. **Start dev server first** - Always have `npm run dev` running
3. **Use test helpers** - Don't repeat code, use the helpers in `tests/fixtures/`
4. **Test user flows** - Focus on what users do, not implementation details
5. **Check accessibility** - Run accessibility tests regularly

## 🆘 Getting Help

- Check `README.testing.md` for detailed docs
- Review example tests in `tests/e2e/`
- See Playwright docs: https://playwright.dev
- Open an issue on GitHub

---

Happy Testing! 🧪
