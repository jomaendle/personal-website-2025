# Code Review Report

**Date:** 2026-01-17
**Reviewer:** Claude Code
**Project:** Personal Website (Next.js 15)

---

## Executive Summary

Comprehensive review identified **45+ issues** across security, code quality, and configuration. **All critical, high, and medium-severity issues have been resolved.** Phase 1 security hardening and Phase 2 additional hardening are complete. Only low-priority items remain.

---

## Completed Fixes

### Critical Security

| Status | Issue | File | Action Taken |
|--------|-------|------|--------------|
| ✅ | Next.js DoS vulnerability (CVSS 7.5) | `package.json` | Updated 15.5.7 → 15.5.9 |
| ✅ | HTML injection in contact form | `pages/api/contact.ts` | Added `escapeHtml()` function |
| ✅ | Exposed secrets in repository | `.gitignore` | Verified files not tracked |
| ✅ | Timing attack in token verification | `lib/unsubscribe-token.ts` | Added buffer length check before `timingSafeEqual()` |

### High Severity Security

| Status | Issue | File | Action Taken |
|--------|-------|------|--------------|
| ✅ | Missing rate limiting (increment-view) | `pages/api/increment-view.ts` | Added `withRateLimit` (30 req/min) |
| ✅ | Missing rate limiting (list-view-count) | `pages/api/list-view-count.ts` | Added `withRateLimit` (60 req/min) |
| ✅ | No slug validation | `pages/api/increment-view.ts` | Added `isValidSlug()` validator |
| ✅ | Database errors leaked to client | `pages/api/increment-view.ts` | Generic error messages |
| ✅ | Database errors leaked to client | `pages/api/list-view-count.ts` | Generic error messages |
| ✅ | IP header injection bypass | `lib/rate-limit.ts` | Proper extraction of rightmost trusted IP from `x-forwarded-for` |

### Medium Severity Security (Phase 1 & 2 Complete)

| Status | Issue | File | Action Taken |
|--------|-------|------|--------------|
| ✅ | Email exposed in unsubscribe URL | `pages/api/subscribe.ts` | Implemented signed HMAC-SHA256 tokens |
| ✅ | Missing CSRF protection | All POST endpoints | Added Origin/Referer validation middleware |
| ✅ | Weak email validation regex | Multiple API files | Created robust `lib/email-validation.ts` |
| ✅ | XSS in notification email | `pages/api/subscribe.ts` | Added `escapeHtml()` for email content |
| ✅ | XSS in unsubscribe URL | `pages/api/subscribe.ts` | Added `escapeHtmlAttribute()` for href |
| ✅ | No length limits on OG params | `pages/api/og-image.tsx` | Added `sanitizeOgParam()` (100/200 char limits) |

### Code Quality

| Status | Issue | File | Action Taken |
|--------|-------|------|--------------|
| ✅ | Unused `onHover` prop | `components/component-preview.tsx` | Removed unused prop |
| ✅ | Non-standard prop naming | `components/component-preview.tsx` | Renamed `classList` → `className` |
| ✅ | Using `<a>` instead of `<Link>` | `components/read-more-articles.tsx` | Replaced with `Link` |
| ✅ | Unused `@react-email/components` | `next.config.mjs` | Removed from optimizePackageImports |
| ✅ | HTML injection in unsubscribe | `pages/api/unsubscribe.ts` | Uses shared `escapeHtml()` from lib |
| ✅ | Copy button not keyboard accessible | `components/ui/heading-with-anchor.tsx` | Removed `tabIndex={-1}`, added focus styles |
| ✅ | Deprecated clipboard API fallback | `components/ui/heading-with-anchor.tsx` | Removed deprecated `execCommand("copy")` |
| ✅ | O(n²) complexity in sidebar | `components/sidebar-navigation.tsx` | Changed to use `index` from map callback |
| ✅ | Duplicated `escapeHtml()` function | Multiple API files | Extracted to shared `lib/html-utils.ts` |
| ✅ | Duplicated HTML templates | `pages/api/unsubscribe.ts` | Extracted `renderHtmlPage()` helper (-100 lines) |
| ✅ | Unused `skipPaths` option | `lib/csrf-protection.ts` | Removed from interface |

---

## Remaining Issues (Lower Priority)

### Low Severity

| Priority | Issue | File | Recommendation |
|----------|-------|------|----------------|
| Low | ESLint deprecation warning | `.eslintrc.json` | Migrate before Next.js 16 |
| Low | In-memory rate limiting won't scale | `lib/rate-limit.ts` | Consider Redis for production |
| Low | Overly permissive CORS (`*`) | `app/api/giscus-theme/route.ts` | Restrict to known domains |
| Low | `content-visibility` lacks fallback | `components/crafts/CraftsContainer.tsx` | Add browser fallback |
| Low | Video autoplay failure silent | `components/crafts/crafts-overview.tsx` | Add user feedback |

### Configuration

| Priority | Issue | Current | Recommended |
|----------|-------|---------|-------------|
| Low | Outdated resend | 4.8.0 | 6.7.0 |
| Low | Outdated framer-motion | 11.18.2 | 12.26.2 |
| Low | Outdated lucide-react | 0.473.0 | 0.562.0 |
| Low | Outdated tailwind-merge | 2.6.0 | 3.4.0 |

---

## Verification Results

```
npm audit:     0 vulnerabilities
npm run lint:  No warnings or errors
npm run build: Success (17 static pages generated)
```

---

## Positive Findings

- TypeScript strict mode fully enabled with excellent configuration
- Security headers properly configured in `next.config.mjs`
- CSS respects `prefers-reduced-motion` preferences
- `BlogPostItem` component is properly memoized
- Tailwind configuration is comprehensive and well-organized
- No unused dependencies detected
- Environment files properly excluded from git

---

## Files Modified

```
pages/api/contact.ts         - Uses shared escapeHtml, CSRF protection, centralized email validation
pages/api/increment-view.ts  - Added rate limiting, slug validation, generic errors, CSRF protection
pages/api/list-view-count.ts - Added rate limiting, generic errors
pages/api/subscribe.ts       - Signed tokens, CSRF, email validation, XSS fixes with escapeHtml
pages/api/unsubscribe.ts     - Refactored with renderHtmlPage() template, shared escapeHtml
pages/api/og-image.tsx       - Added sanitizeOgParam() for length limits
components/component-preview.tsx - Removed unused prop, renamed classList → className
components/read-more-articles.tsx - Replaced <a> with <Link>
components/ui/heading-with-anchor.tsx - Fixed keyboard accessibility, removed deprecated API
components/sidebar-navigation.tsx - Fixed O(n²) complexity in TOC animation
app/blog/focus-zoom-at-property/focus-zoom.tsx - Updated to use className prop
next.config.mjs              - Removed unused import
package.json                 - Updated dependencies (npm audit fix)
package-lock.json            - Updated lockfile
lib/unsubscribe-token.ts     - NEW: Signed token generation/verification (with timing attack fix)
lib/csrf-protection.ts       - NEW: Origin/Referer CSRF protection middleware
lib/email-validation.ts      - NEW: Robust email validation utility
lib/html-utils.ts            - NEW: Shared escapeHtml/escapeHtmlAttribute utilities
lib/rate-limit.ts            - Fixed IP header extraction for x-forwarded-for
```

---

## Next Steps

### Phase 1: Security Hardening ✅ COMPLETE
- ~~Implement CSRF protection on all POST endpoints~~ ✅
- ~~Use signed tokens for unsubscribe links~~ ✅
- ~~Use a robust email validation library~~ ✅

### Phase 2: Additional Security Hardening ✅ COMPLETE
- ~~Fix timing attack vulnerability in token verification~~ ✅
- ~~Fix IP header injection bypass in rate limiting~~ ✅
- ~~Add XSS protection to notification emails~~ ✅
- ~~Add length limits to OG image parameters~~ ✅
- ~~Extract shared HTML utilities~~ ✅

### Phase 3: Scalability (Next Priority)
1. Migrate rate limiting to Redis or Vercel Edge Middleware
2. Plan ESLint migration before Next.js 16
3. Add `UNSUBSCRIBE_TOKEN_SECRET` environment variable (optional, currently uses derived key)

### Phase 4: Low Priority Polish
4. Restrict CORS on giscus-theme endpoint
5. Add CSS fallback for `content-visibility`
6. Add error handling for video autoplay failures

---

## Commands Reference

```bash
# Check for vulnerabilities
npm audit

# Run linting
npm run lint

# Build for production
npm run build

# Start development server
npm run dev

# Migrate ESLint (before Next.js 16)
npx @next/codemod@canary next-lint-to-eslint-cli .
```
