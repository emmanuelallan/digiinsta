# Design Document: DigiInsta Storefront Homepage

## Overview

This design document outlines the implementation of the DigiInsta customer-facing storefront homepage. The storefront features a mega-menu navigation system, hero section, persona-based shopping cards, curated product trays, bundle promotions, and dynamic search. The design follows mobile-first principles using shadcn/ui components and HugeIcons.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js App Router                            │
│                  (Server Components Default)                     │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
    ┌───▼───┐           ┌─────▼─────┐         ┌────▼────┐
    │Layout │           │  Homepage │         │ Product │
    │Header │           │   Page    │         │  Pages  │
    │Footer │           │           │         │         │
    └───┬───┘           └─────┬─────┘         └────┬────┘
        │                     │                    │
        └─────────────────────┼────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   Payload CMS     │
                    │   (Products,      │
                    │   Categories,     │
                    │   Bundles)        │
                    └───────────────────┘
```

### Component Architecture

```
app/(frontend)/
├── layout.tsx                    # Main storefront layout
├── page.tsx                      # Homepage
├── products/
│   └── [slug]/page.tsx          # Product detail page
├── categories/
│   └── [slug]/page.tsx          # Category listing page
├── bundles/
│   └── [slug]/page.tsx          # Bundle detail page
└── search/page.tsx              # Search results page

components/
├── storefront/
│   ├── layout/
│   │   ├── Header.tsx           # Main header with mega menu
│   │   ├── MegaMenu.tsx         # Mega menu dropdown
│   │   ├── MobileNav.tsx        # Mobile navigation drawer
│   │   ├── SearchBar.tsx        # Dynamic search component
│   │   └── Footer.tsx           # Site footer
│   ├── home/
│   │   ├── HeroSection.tsx      # Hero with video/image
│   │   ├── PersonaCards.tsx     # Shop by persona section
│   │   ├── ProductTray.tsx      # Reusable product carousel
│   │   ├── NewArrivals.tsx      # New arrivals section
│   │   ├── EditorsPick.tsx      # Editor's pick section
│   │   ├── BestSellers.tsx      # Best sellers section
│   │   ├── BundleBanner.tsx     # Bundle promotion banner
│   │   └── CategoryShowcase.tsx # Category highlights
│   ├── product/
│   │   ├── ProductCard.tsx      # Product card component
│   │   ├── ProductGrid.tsx      # Product grid layout
│   │   ├── QuickView.tsx        # Quick view modal
│   │   └── AddToCart.tsx        # Add to cart button
│   └── shared/
│       ├── SectionHeader.tsx    # Section title component
│       ├── ScrollArea.tsx       # Horizontal scroll wrapper
│       └── Badge.tsx            # Product badges
└── ui/                          # shadcn/ui components
```

## Components and Interfaces

### Data Types

```typescript
// types/storefront.ts

export interface Category {
  id: string;
  title: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: Media;
  subcategories?: Category[];
  parent?: Category;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: Media[];
  category: Category;
  status: "active" | "draft" | "archived";
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Bundle {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number;
  products: Product[];
  image?: Media;
  savings: number;
}

export interface Persona {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: React.ReactNode;
  image: string;
  categories: string[];
}

export interface SearchResult {
  products: Product[];
  categories: Category[];
  bundles: Bundle[];
}
```

### Component Props

```typescript
// Header Component
interface HeaderProps {
  categories: Category[];
}

// MegaMenu Component
interface MegaMenuProps {
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
}

// HeroSection Component
interface HeroSectionProps {
  headline: string;
  subheadline: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  backgroundImage?: string;
  backgroundVideo?: string;
}

// PersonaCards Component
interface PersonaCardsProps {
  personas: Persona[];
}

// ProductTray Component
interface ProductTrayProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllHref?: string;
}

// ProductCard Component
interface ProductCardProps {
  product: Product;
  showQuickView?: boolean;
  variant?: "default" | "compact" | "featured";
}

// BundleBanner Component
interface BundleBannerProps {
  bundle: Bundle;
  variant?: "full" | "compact";
}

// SearchBar Component
interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  results?: SearchResult;
  isLoading?: boolean;
}
```

## Data Models

### Category Taxonomy

```
Academic & Bio-Med
├── Med-School Prep
├── Lab Report Templates
├── Study Systems
└── Scientific Posters

Wealth & Finance
├── Budgeting
├── Investment Tracking
├── Tax Prep
└── Freelance Tools

Life & Legacy
├── Spiritual Journals
├── Wedding Planning
├── Goal Setting
└── Vision Boards

Digital Aesthetic
├── Device Customization
├── Presets
├── Branding
└── Wallpapers

Work & Flow
├── Career Growth
├── Data Viz
├── Resume Systems
└── Project Management
```

### Persona Definitions

```typescript
const personas: Persona[] = [
  {
    id: 'student',
    title: 'The Student',
    slug: 'student',
    description: 'Academic success tools for ambitious learners',
    icon: <GraduationCapIcon />,
    image: '/images/personas/student.jpg',
    categories: ['academic-bio-med', 'work-flow'],
  },
  {
    id: 'professional',
    title: 'The Professional',
    slug: 'professional',
    description: 'Wealth & efficiency tools for career growth',
    icon: <BriefcaseIcon />,
    image: '/images/personas/professional.jpg',
    categories: ['wealth-finance', 'work-flow'],
  },
  {
    id: 'couple',
    title: 'The Couple',
    slug: 'couple',
    description: 'Connection & planning tools for your journey together',
    icon: <HeartIcon />,
    image: '/images/personas/couple.jpg',
    categories: ['life-legacy', 'wealth-finance'],
  },
];
```

## UI Component Specifications

### Mega Menu Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  Logo    │ Shop ▼ │ Personas ▼ │ Bundles │ Blog │   🔍  │ 🛒   │
├──────────┴────────┴────────────┴─────────┴──────┴───────┴──────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │  Categories          │  Featured          │  Trending       │ │
│ │  ─────────────       │  ─────────         │  ─────────      │ │
│ │  📚 Academic         │  [Product Card]    │  • Product 1    │ │
│ │  💰 Wealth           │  [Product Card]    │  • Product 2    │ │
│ │  ❤️ Life & Legacy    │                    │  • Product 3    │ │
│ │  🎨 Digital          │  [View All →]      │                 │ │
│ │  💼 Work & Flow      │                    │                 │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Homepage Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                         HEADER + MEGA MENU                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                      HERO SECTION                          │  │
│  │   "Elevate Your Digital Life"                             │  │
│  │   Premium templates & tools for students, professionals   │  │
│  │   [Shop Now]  [Browse Categories]                         │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  STUDENT    │  │ PROFESSIONAL│  │   COUPLE    │             │
│  │  [Image]    │  │  [Image]    │  │  [Image]    │             │
│  │  Academic   │  │  Wealth &   │  │  Connection │             │
│  │  Success    │  │  Efficiency │  │  & Planning │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                  │
│  ── NEW ARRIVALS ─────────────────────────────── [View All →]   │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                            │
│  │    │ │    │ │    │ │    │ │    │  ← Horizontal Scroll       │
│  └────┘ └────┘ └────┘ └────┘ └────┘                            │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              BUNDLE & SAVE BANNER                          │  │
│  │   Save 40% on the Student Life Bundle                     │  │
│  │   [Shop Bundles]                                          │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ── EDITOR'S PICK ────────────────────────────── [View All →]   │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                            │
│  │    │ │    │ │    │ │    │ │    │                            │
│  └────┘ └────┘ └────┘ └────┘ └────┘                            │
│                                                                  │
│  ── BEST SELLERS ─────────────────────────────── [View All →]   │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                            │
│  │    │ │    │ │    │ │    │ │    │                            │
│  └────┘ └────┘ └────┘ └────┘ └────┘                            │
│                                                                  │
│  ── SHOP BY CATEGORY ────────────────────────────────────────   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Academic │ │  Wealth  │ │   Life   │ │  Digital │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                           FOOTER                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Styling Approach

### shadcn/ui Components to Install

```bash
bunx --bun shadcn@latest add button
bunx --bun shadcn@latest add card
bunx --bun shadcn@latest add badge
bunx --bun shadcn@latest add input
bunx --bun shadcn@latest add dialog
bunx --bun shadcn@latest add sheet
bunx --bun shadcn@latest add navigation-menu
bunx --bun shadcn@latest add command
bunx --bun shadcn@latest add scroll-area
bunx --bun shadcn@latest add skeleton
bunx --bun shadcn@latest add separator
bunx --bun shadcn@latest add aspect-ratio
bunx --bun shadcn@latest add carousel
```

### Responsive Breakpoints

```css
/* Mobile First */
/* Default: 0-639px (mobile) */
/* sm: 640px+ (large mobile) */
/* md: 768px+ (tablet) */
/* lg: 1024px+ (desktop) */
/* xl: 1280px+ (large desktop) */
/* 2xl: 1536px+ (extra large) */
```

### Color Palette Usage

- Primary actions: `bg-primary text-primary-foreground`
- Secondary elements: `bg-secondary text-secondary-foreground`
- Muted text: `text-muted-foreground`
- Borders: `border-border`
- Cards: `bg-card text-card-foreground`
- Accents: `bg-accent text-accent-foreground`

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Navigation accessibility

_For any_ navigation element in the mega menu, it SHALL be reachable via keyboard navigation (Tab, Enter, Escape keys).
**Validates: Requirements 1.5, 1.6**

### Property 2: Product card data integrity

_For any_ product displayed in a ProductCard, the displayed price SHALL match the product's actual price from the database.
**Validates: Requirements 4.5**

### Property 3: Search result relevance

_For any_ search query, all returned products SHALL contain the search term in their title, description, or category name.
**Validates: Requirements 6.1, 6.2**

### Property 4: Responsive layout consistency

_For any_ viewport width, the layout SHALL not have horizontal overflow or broken layouts.
**Validates: Requirements 8.1, 8.4**

### Property 5: Image optimization

_For any_ image rendered on the storefront, it SHALL use Next.js Image component with appropriate sizing.
**Validates: Requirements 9.5**

## Error Handling

### Data Fetching Errors

- Display skeleton loaders during data fetching
- Show "Unable to load" message with retry button on failure
- Log errors to Sentry for monitoring

### Empty States

- "No products found" for empty search results
- "Coming soon" for empty categories
- Placeholder images for missing product images

### Navigation Errors

- 404 page for invalid product/category slugs
- Redirect to homepage for deprecated URLs

## Testing Strategy

### Unit Tests

- Test ProductCard renders correct data
- Test price formatting functions
- Test search filtering logic
- Test responsive breakpoint utilities

### Integration Tests

- Test mega menu opens/closes correctly
- Test search suggestions appear on typing
- Test product tray scrolling behavior
- Test mobile navigation drawer

### E2E Tests

- Test complete navigation flow
- Test search to product page flow
- Test add to cart from product card

### Accessibility Tests

- Test keyboard navigation
- Test screen reader compatibility
- Test color contrast ratios
- Test focus indicators

## Implementation Notes

### Server vs Client Components

- **Server Components (default)**: ProductTray, CategoryShowcase, Footer
- **Client Components**: MegaMenu, SearchBar, MobileNav, QuickView modal

### Data Fetching Strategy

- Use Server Components for initial data fetch
- Use React Server Actions for search
- Implement ISR for product pages (revalidate: 60)

### Performance Optimizations

- Lazy load below-fold sections
- Use `loading="lazy"` for images below fold
- Implement virtual scrolling for large product lists
- Preload critical fonts and images

### SEO Considerations

- Dynamic meta tags per page
- JSON-LD structured data for products
- Semantic HTML structure
- Proper heading hierarchy
