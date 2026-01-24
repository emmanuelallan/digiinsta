# Digital Love Storefront Components

This directory contains React components for the Digital Love Storefront.

## Directory Structure

```
storefront/
├── homepage/       # Homepage-specific components
├── collections/    # Collection page components
├── products/       # Product detail page components
└── shared/         # Shared components across pages
```

## Component Organization

### Homepage Components
- HeroSection
- CollectionCards
- ValentineHighlight
- HowItWorks
- BestSellers
- WhyPeopleLove
- EmailCapture

### Collection Components
- CollectionHero
- ProductGrid
- FilterSort

### Product Components
- ImageCarousel
- ProductInfo
- BuyNowButton
- WhatsIncluded
- WhyItWorks
- HowToUse
- RelatedProducts
- FAQ
- VariantSelector

### Shared Components
- Header
- Footer
- ProductCard
- Badge

## Usage

```typescript
import { HeroSection } from '@/components/storefront/homepage/HeroSection';
import { ProductCard } from '@/components/storefront/shared/ProductCard';
```
