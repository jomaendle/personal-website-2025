# Code Review Report

**Date:** 2026-01-17
**Reviewer:** Claude Code
**Project:** Personal Website (Next.js 15)

---

## Executive Summary

Comprehensive review identified **45+ issues** across security, code quality, and configuration. Critical and high-severity issues have been resolved. The application now passes all security audits and builds successfully.

---

## Completed Fixes

### Critical Security

| Status | Issue | File | Action Taken |
|--------|-------|------|--------------|
| ✅ | Next.js DoS vulnerability (CVSS 7.5) | `package.json` | Updated 15.5.7 → 15.5.9 |
| ✅ | HTML injection in contact form | `pages/api/contact.ts` | Added `escapeHtml()` function |
| ✅ | Exposed secrets in repository | `.gitignore` | Verified files not tracked |

### High Severity Security

| Status | Issue | File | Action Taken |
|--------|-------|------|--------------|
| ✅ | Missing rate limiting (increment-view) | `pages/api/increment-view.ts` | Added `withRateLimit` (30 req/min) |
| ✅ | Missing rate limiting (list-view-count) | `pages/api/list-view-count.ts` | Added `withRateLimit` (60 req/min) |
| ✅ | No slug validation | `pages/api/increment-view.ts` | Added `isValidSlug()` validator |
| ✅ | Database errors leaked to client | `pages/api/increment-view.ts` | Generic error messages |
| ✅ | Database errors leaked to client | `pages/api/list-view-count.ts` | Generic error messages |

### Code Quality

| Status | Issue | File | Action Taken |
|--------|-------|------|--------------|
| ✅ | Unused `onHover` prop | `components/component-preview.tsx` | Removed unused prop |
| ✅ | Using `<a>` instead of `<Link>` | `components/read-more-articles.tsx` | Replaced with `Link` |
| ✅ | Unused `@react-email/components` | `next.config.mjs` | Removed from optimizePackageImports |
| ✅ | HTML injection in unsubscribe | `pages/api/unsubscribe.ts` | Added `escapeHtml()` function |
| ✅ | Copy button not keyboard accessible | `components/ui/heading-with-anchor.tsx` | Removed `tabIndex={-1}`, added focus styles |
| ✅ | Deprecated clipboard API fallback | `components/ui/heading-with-anchor.tsx` | Removed deprecated `execCommand("copy")` |
| ✅ | O(n²) complexity in sidebar | `components/sidebar-navigation.tsx` | Changed to use `index` from map callback |

---

## Remaining Issues (Lower Priority)

### Medium Severity

| Priority | Issue | File | Lines | Recommendation |
|----------|-------|------|-------|----------------|
| Medium | Email exposed in unsubscribe URL | `pages/api/subscribe.ts` | 58 | Use signed tokens instead |
| Medium | Missing CSRF protection | All POST endpoints | - | Implement CSRF tokens |
| Medium | Weak email validation regex | Multiple API files | - | Use robust validation library |

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
pages/api/contact.ts         - Added HTML escaping
pages/api/increment-view.ts  - Added rate limiting, slug validation, generic errors
pages/api/list-view-count.ts - Added rate limiting, generic errors
pages/api/unsubscribe.ts     - Added HTML escaping for email display
components/component-preview.tsx - Removed unused prop
components/read-more-articles.tsx - Replaced <a> with <Link>
components/ui/heading-with-anchor.tsx - Fixed keyboard accessibility, removed deprecated API
components/sidebar-navigation.tsx - Fixed O(n²) complexity in TOC animation
next.config.mjs              - Removed unused import
package.json                 - Updated dependencies (npm audit fix)
package-lock.json            - Updated lockfile
```

---

## Next Steps

### Phase 1: Security Hardening (Recommended)
1. Implement CSRF protection on all POST endpoints
2. Use signed tokens for unsubscribe links
3. Use a robust email validation library

### Phase 2: Scalability
4. Migrate rate limiting to Redis or Vercel Edge Middleware
5. Plan ESLint migration before Next.js 16

### Phase 3: Low Priority Polish
6. Restrict CORS on giscus-theme endpoint
7. Add CSS fallback for `content-visibility`
8. Add error handling for video autoplay failures

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
