# Layout Fixes - Collections Grid & Navigation Dropdown

## Changes Made

### 1. Collections Grid - Homepage
**File**: `components/storefront/homepage/collection-cards.tsx`

**Change**: Updated grid layout from 6 columns to 5 columns
- **Before**: `grid-cols-2 md:grid-cols-3 lg:grid-cols-6`
- **After**: `grid-cols-2 md:grid-cols-3 lg:grid-cols-5`

**Reason**: Since there are only 5 collections, using a 5-column grid prevents extra empty space and creates a more balanced layout.

**Responsive Behavior**:
- Mobile (< 768px): 2 columns
- Tablet (768px - 1024px): 3 columns
- Desktop (> 1024px): 5 columns

---

### 2. Shop Dropdown Navigation - Header
**File**: `components/storefront/shared/header.tsx`

**Change**: Made dropdown width responsive
- **Before**: Fixed `w-[800px]`
- **After**: `w-[min(800px,calc(100vw-3rem))]`

**Reason**: Prevents horizontal scroll on smaller screens by limiting the dropdown width to viewport width minus padding.

---

### 3. Navigation Menu Positioning - Global CSS
**File**: `app/globals.css`

**Added CSS**:
```css
/* Navigation Menu Positioning Fix */
[data-slot="navigation-menu-viewport"] {
  left: 50% !important;
  transform: translateX(-50%);
  max-width: calc(100vw - 3rem);
}

/* Prevent horizontal scroll from navigation menu */
body {
  overflow-x: hidden;
}

nav {
  overflow: visible;
}
```

**Reason**: 
- Centers the navigation dropdown viewport
- Prevents it from extending beyond the viewport
- Eliminates horizontal scroll issues
- Ensures dropdown is always visible and properly positioned

---

## Testing Checklist

- [ ] Homepage collections display in 5 columns on desktop
- [ ] Collections grid is responsive (2 cols mobile, 3 cols tablet, 5 cols desktop)
- [ ] Shop dropdown doesn't cause horizontal scroll
- [ ] Shop dropdown is centered and visible on all screen sizes
- [ ] Navigation menu works properly on mobile devices
- [ ] No layout shift when dropdown opens/closes

---

## Browser Compatibility

These changes use standard CSS properties and should work across all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Notes

- The `!important` flag is used in the viewport positioning to override Radix UI's default positioning
- The `calc(100vw - 3rem)` ensures 1.5rem padding on each side (3rem total)
- `overflow-x: hidden` on body prevents any accidental horizontal scroll
- The dropdown maintains its 4-column grid layout (Shop All + 3 collections)
