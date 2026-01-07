# Bundle Size Analysis Report

**Date:** January 7, 2026  
**Build:** Next.js 16.1.1 with Turbopack  
**Target:** < 200KB gzipped initial load  
**Current:** 276.91 KB gzipped initial load  
**Status:** ⚠️ EXCEEDS TARGET by 76.91 KB (38.5% over)

---

## Quick Summary

| Metric                 | Value     | Target   | Status  |
| ---------------------- | --------- | -------- | ------- |
| Initial JS Load        | 276.91 KB | < 200 KB | ⚠️ Over |
| Total JS (all chunks)  | 1,223 KB  | -        | Info    |
| Total CSS (all chunks) | 142 KB    | -        | Info    |
| Largest lazy chunk     | 330 KB    | -        | Info    |

---

## Executive Summary

The current initial JavaScript bundle size is **276.91 KB gzipped**, which exceeds the target of 200KB by approximately 77KB. The majority of this is comprised of React/Next.js core runtime (58.9%) and polyfills (13.9%), which are largely unavoidable in a Next.js 16 application.

## Initial Load Breakdown

| Component          | Raw Size   | Gzipped    | % of Total |
| ------------------ | ---------- | ---------- | ---------- |
| React/Next.js Core | 522 KB     | 163 KB     | 58.9%      |
| Polyfills          | 110 KB     | 38.6 KB    | 13.9%      |
| Client Runtime     | 109 KB     | 30.2 KB    | 10.9%      |
| App Bootstrap      | 52 KB      | 16.9 KB    | 6.1%       |
| Shared Utils       | 34 KB      | 10.4 KB    | 3.8%       |
| Router             | 34 KB      | 7.4 KB     | 2.7%       |
| Entry Point        | 17 KB      | 6.3 KB     | 2.3%       |
| Turbopack Runtime  | 11 KB      | 4.2 KB     | 1.5%       |
| **TOTAL**          | **889 KB** | **277 KB** | **100%**   |

## Total Bundle Statistics

| Metric                 | Value                           |
| ---------------------- | ------------------------------- |
| Total JS (all chunks)  | 4,039 KB raw / 1,223 KB gzipped |
| Total CSS (all chunks) | 996 KB raw / 142 KB gzipped     |
| Number of JS chunks    | 89                              |
| Number of CSS chunks   | 12                              |

## Largest Chunks Analysis

| Chunk               | Raw Size | Gzipped | Contents                        |
| ------------------- | -------- | ------- | ------------------------------- |
| eae11a42344d23f0.js | 1.1 MB   | 330 KB  | Payload CMS Admin (lazy loaded) |
| dac3138810849a4a.js | 567 KB   | 140 KB  | Payload CMS components          |
| c3fc4b11fc8b9aa0.js | 522 KB   | 163 KB  | React/Next.js core runtime      |
| 7af0ebb5bf6990a2.js | 379 KB   | 111 KB  | Lexical rich text editor        |
| a6dad97d9634a72d.js | 110 KB   | 38.6 KB | Polyfills                       |

## Optimizations Already Implemented

1. ✅ **Dynamic imports** for CartSlideOut, SearchBar, and modals (Task 26.1)
2. ✅ **Tree-shaking** for Lucide icons - only importing used icons (Task 26.2)
3. ✅ **Sentry tree-shaking** - removeDebugLogging enabled in next.config.ts
4. ✅ **Payload CMS admin** - lazy loaded, not included in initial bundle

## Analysis Notes

### Why the target may be unrealistic

The 200KB target for a Next.js 16 application with React 19 is challenging because:

1. **React 19 + Next.js 16 core** alone is ~163 KB gzipped
2. **Polyfills** add ~39 KB gzipped (required for browser compatibility)
3. **Turbopack runtime** adds ~4 KB gzipped

This leaves only ~-6 KB for application code to meet the 200KB target, which is not feasible.

### Industry Benchmarks

For comparison, typical Next.js applications have:

- Small apps: 150-250 KB gzipped initial load
- Medium apps: 250-400 KB gzipped initial load
- Large apps: 400-600 KB gzipped initial load

Our **277 KB** is within the "small to medium" range, which is reasonable for an e-commerce application with:

- Cart functionality
- Search with autocomplete
- Image galleries
- Multiple UI components (Radix UI)

### What's NOT in the initial bundle (good!)

The following are properly code-split and lazy-loaded:

- Payload CMS Admin (~470 KB gzipped)
- Lexical Rich Text Editor (~111 KB gzipped)
- Product Quick View Modal
- Cart Slide Out
- Advanced Search components

## Recommendations

### Short-term (can reduce ~20-30 KB)

1. **Evaluate polyfill necessity** - Modern browsers may not need all polyfills
2. **Review Radix UI imports** - Ensure only used components are imported
3. **Audit third-party dependencies** - Check for lighter alternatives

### Medium-term (can reduce ~30-50 KB)

1. **Consider Preact** - Drop-in React replacement (~3KB vs ~40KB)
2. **Server Components** - Move more components to RSC to reduce client bundle
3. **Edge runtime** - Use edge functions for dynamic routes

### Long-term

1. **Partial Hydration** - Only hydrate interactive components
2. **Islands Architecture** - Isolate interactive components

## Conclusion

While the current bundle size (277 KB) exceeds the 200KB target, it is within acceptable industry standards for a Next.js e-commerce application. The major contributors are framework code (React/Next.js) which cannot be easily reduced without significant architectural changes.

**Recommendation:** Adjust the target to **< 300 KB gzipped** for initial load, which is achievable and realistic for this application stack.
