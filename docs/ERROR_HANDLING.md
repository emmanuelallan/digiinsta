# Error Handling Documentation

This document describes the error handling implementation for the Digital Love Storefront.

## Overview

The storefront implements comprehensive error handling at multiple levels:
- **Page-level error boundaries** for catching component errors
- **Global error boundary** for application-wide errors
- **404 pages** for missing resources
- **Image loading fallbacks** for failed images
- **Checkout error handling** with retry logic

## Error Boundaries

### Storefront Error Boundary
**Location**: `app/(storefront)/error.tsx`

Catches errors within the storefront section of the application. Displays a user-friendly error page with:
- Error icon and message
- "Try Again" button to reset the error boundary
- "Back to Homepage" link for navigation
- Support contact information

### Global Error Boundary
**Location**: `app/global-error.tsx`

Catches errors at the root level that aren't caught by other error boundaries. This is the last line of defense for unhandled errors.

### Reusable Error Boundary Component
**Location**: `components/error-boundary-wrapper.tsx`

A class-based error boundary component that can be wrapped around any component tree:

```tsx
import { ErrorBoundary } from "@/components/error-boundary-wrapper";

<ErrorBoundary
  fallback={<CustomErrorUI />}
  onError={(error, errorInfo) => {
    // Log to error reporting service
  }}
>
  <YourComponent />
</ErrorBoundary>
```

## 404 Pages

### Not Found Page
**Location**: `app/(storefront)/not-found.tsx`

Displays when a page or resource is not found. Features:
- Decorative icon
- Clear messaging
- Navigation options (Homepage, Collections)
- Consistent brand styling

### Usage in Pages

Pages automatically trigger the not-found page using Next.js's `notFound()` function:

```tsx
import { notFound } from "next/navigation";

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug(params.slug);
  
  if (!product) {
    notFound(); // Triggers 404 page
  }
  
  return <ProductDetails product={product} />;
}
```

## Image Error Handling

### Image Carousel
**Location**: `components/storefront/products/image-carousel.tsx`

Handles image loading failures with:
- Per-image error tracking
- Fallback placeholder UI with icon
- Graceful degradation for thumbnails
- No disruption to carousel functionality

```tsx
const [imageErrors, setImageErrors] = React.useState<Set<number>>(new Set());

const handleImageError = (index: number) => {
  setImageErrors((prev) => new Set(prev).add(index));
};

// In render:
{imageErrors.has(currentIndex) ? (
  <FallbackUI />
) : (
  <Image onError={() => handleImageError(currentIndex)} />
)}
```

### Product Card
**Location**: `components/storefront/shared/product-card.tsx`

Handles missing or failed product images:
- Single error state per card
- Fallback placeholder with icon
- Maintains card layout and styling

```tsx
const [imageError, setImageError] = React.useState(false);

{primaryImage && !imageError ? (
  <Image onError={() => setImageError(true)} />
) : (
  <FallbackUI />
)}
```

## Checkout Error Handling

### Buy Now Button
**Location**: `components/storefront/products/buy-now-button.tsx`

Comprehensive error handling for checkout flow:
- Input validation (product ID)
- URL generation error handling
- Retry mechanism (up to 3 attempts)
- User-friendly error messages
- Support contact information

```tsx
const [error, setError] = React.useState<string | null>(null);
const [retryCount, setRetryCount] = React.useState(0);

try {
  if (!productId) {
    throw new Error("Product ID is missing");
  }
  
  const checkoutUrl = generateCheckoutUrl({ productId, variantId });
  openCheckoutOverlay(checkoutUrl);
  
  setRetryCount(0); // Reset on success
} catch (err) {
  setError(
    retryCount < 2
      ? "Unable to open checkout. Please try again."
      : "We're having trouble opening checkout. Please contact support."
  );
  setRetryCount((prev) => prev + 1);
}
```

### Checkout Functions
**Location**: `lib/lemon-squeezy/checkout.ts`

Enhanced with validation and error handling:

**generateCheckoutUrl**:
- Validates product ID is non-empty string
- Catches URL construction errors
- Throws descriptive errors

**openCheckoutOverlay**:
- Validates browser environment
- Validates checkout URL format
- Throws errors for invalid inputs

**createCheckoutHandler**:
- Wraps errors from generation and opening
- Suitable for button onClick handlers

## Error Logging

All error handlers log errors to the console for debugging:

```tsx
console.error("Error context:", error);
```

In production, these should be replaced with calls to an error reporting service (e.g., Sentry, LogRocket).

## Best Practices

### 1. Always Provide Fallback UI
Never leave users with a blank screen. Always show:
- What went wrong (in user-friendly terms)
- What they can do next (retry, go home, contact support)

### 2. Preserve User Context
When errors occur:
- Keep user input in forms
- Maintain navigation state
- Don't force full page reloads unless necessary

### 3. Progressive Enhancement
Handle errors gracefully:
- Images fail → show placeholder
- Checkout fails → show retry button
- Component fails → show error boundary

### 4. Provide Support Options
Always include:
- Support email link
- Clear call-to-action
- Alternative navigation paths

### 5. Log for Debugging
Log errors with context:
- Error message and stack trace
- User action that triggered error
- Component/page where error occurred
- Timestamp and user session info

## Testing Error Handling

### Manual Testing

1. **404 Pages**: Navigate to non-existent URLs
   - `/products/invalid-slug`
   - `/collections/invalid-slug`

2. **Image Errors**: Use invalid image URLs in database

3. **Checkout Errors**: 
   - Remove product ID
   - Use invalid product ID
   - Simulate network failure

4. **Component Errors**: Throw errors in components to test boundaries

### Automated Testing

```tsx
// Test error boundary
it('should display error UI when child throws', () => {
  const ThrowError = () => {
    throw new Error('Test error');
  };
  
  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );
  
  expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
});

// Test image error handling
it('should show fallback when image fails to load', () => {
  render(<ProductCard product={mockProduct} />);
  
  const image = screen.getByRole('img');
  fireEvent.error(image);
  
  expect(screen.getByText(/image unavailable/i)).toBeInTheDocument();
});
```

## Future Enhancements

1. **Error Reporting Service**: Integrate Sentry or similar
2. **Retry Logic**: Add exponential backoff for transient failures
3. **Offline Support**: Handle network errors gracefully
4. **Error Analytics**: Track error rates and patterns
5. **User Feedback**: Allow users to report errors with context
