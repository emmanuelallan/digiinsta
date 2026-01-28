# Design Document: Umami Analytics Integration

## Overview

This design describes the integration of Umami analytics into a Next.js application using the App Router architecture. The implementation leverages Next.js's built-in Script component to load the Umami tracking script efficiently and non-blocking. The solution is minimal, production-ready, and requires only a single modification to the root layout file.

The integration uses environment variables that are already configured:
- `NEXT_PUBLIC_UMAMI_WEBSITE_ID`: Identifies the website in Umami
- `NEXT_PUBLIC_UMAMI_SCRIPT_URL`: The URL to load the Umami script from

## Architecture

The architecture follows Next.js best practices for third-party script integration:

```
┌─────────────────────────────────────┐
│      Root Layout (app/layout.tsx)   │
│  ┌───────────────────────────────┐  │
│  │   Next.js Script Component    │  │
│  │  - strategy: afterInteractive │  │
│  │  - src: UMAMI_SCRIPT_URL      │  │
│  │  - data-website-id: UMAMI_ID  │  │
│  └───────────────────────────────┘  │
│              │                       │
│              ▼                       │
│      {children} (All Pages)         │
└─────────────────────────────────────┘
              │
              ▼
    ┌─────────────────────┐
    │   Umami Cloud       │
    │   Analytics Server  │
    └─────────────────────┘
```

**Key Design Decisions:**

1. **Single Point of Integration**: The script is added only to the root layout, ensuring it loads on every page without duplication
2. **Next.js Script Component**: Uses Next.js's optimized Script component instead of raw HTML script tags for better performance
3. **afterInteractive Strategy**: Loads the script after the page becomes interactive, preventing any blocking of initial render
4. **Environment-Based Configuration**: Uses Next.js environment variables for configuration, keeping credentials secure
5. **Graceful Degradation**: If environment variables are missing, the script simply doesn't load - no errors thrown

## Components and Interfaces

### Modified Component: Root Layout

**File**: `app/layout.tsx`

The root layout component will be modified to include the Umami analytics script. The modification is minimal and non-invasive.

**Changes Required**:
1. Import the Next.js Script component
2. Add conditional rendering logic to check for environment variables
3. Insert the Script component in the HTML body

**Script Component Configuration**:
```typescript
<Script
  strategy="afterInteractive"
  src={process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL}
  data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
/>
```

**Attributes Explained**:
- `strategy="afterInteractive"`: Loads script after page becomes interactive (non-blocking)
- `src`: The URL to the Umami tracking script (from environment variable)
- `data-website-id`: The unique identifier for this website in Umami (from environment variable)

### Environment Variables Interface

**Type Definition**:
```typescript
interface UmamiEnvVars {
  NEXT_PUBLIC_UMAMI_WEBSITE_ID: string | undefined;
  NEXT_PUBLIC_UMAMI_SCRIPT_URL: string | undefined;
}
```

**Access Pattern**:
```typescript
const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
const scriptUrl = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL;
```

**Validation Logic**:
The script should only render if both environment variables are present:
```typescript
const shouldLoadAnalytics = websiteId && scriptUrl;
```

## Data Models

No custom data models are required for this integration. The Umami script handles all data collection and transmission internally.

**Data Flow**:
1. User navigates to a page
2. Next.js renders the root layout
3. Script component loads Umami script (if env vars present)
4. Umami script automatically tracks page view
5. Umami script sends data to Umami Cloud server
6. On subsequent navigation, Umami script tracks new page view

**Data Collected by Umami** (handled automatically):
- Page URL
- Referrer
- Browser information
- Screen size
- Country (from IP, anonymized)
- Timestamp

Note: Umami does not use cookies and does not collect PII.


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Environment Variable Propagation

*For any* valid pair of NEXT_PUBLIC_UMAMI_WEBSITE_ID and NEXT_PUBLIC_UMAMI_SCRIPT_URL environment variables, when the root layout renders, the Script component should have a `src` attribute matching the script URL and a `data-website-id` attribute matching the website ID.

**Validates: Requirements 1.2**

### Property 2: Conditional Script Loading

*For any* combination of environment variables where at least one of NEXT_PUBLIC_UMAMI_WEBSITE_ID or NEXT_PUBLIC_UMAMI_SCRIPT_URL is undefined, the Script component should not be rendered in the output.

**Validates: Requirements 2.3**

### Example Test: Script Configuration

Verify that when both environment variables are present, the root layout renders a Script component with:
- `strategy` prop set to "afterInteractive"
- `src` prop set to the NEXT_PUBLIC_UMAMI_SCRIPT_URL value
- `data-website-id` prop set to the NEXT_PUBLIC_UMAMI_WEBSITE_ID value
- The Script component is placed within the root layout component

**Validates: Requirements 1.1, 1.3, 1.4**

## Error Handling

The integration follows a graceful degradation approach:

1. **Missing Environment Variables**: If either `NEXT_PUBLIC_UMAMI_WEBSITE_ID` or `NEXT_PUBLIC_UMAMI_SCRIPT_URL` is undefined, the Script component is not rendered. The application continues to function normally without analytics.

2. **Script Loading Failure**: If the Umami script fails to load from the remote URL (network error, server down, etc.), Next.js Script component handles this gracefully. The page continues to function normally, and no JavaScript errors are thrown.

3. **No User-Facing Errors**: Analytics failures are silent from the user's perspective. No error messages, warnings, or broken functionality should be visible to end users.

**Error Handling Pattern**:
```typescript
// Conditional rendering prevents errors
{websiteId && scriptUrl && (
  <Script
    strategy="afterInteractive"
    src={scriptUrl}
    data-website-id={websiteId}
  />
)}
```

## Testing Strategy

The testing approach combines unit tests for component rendering and integration verification.

### Unit Tests

Unit tests will verify the root layout component's behavior with different environment variable configurations:

1. **Test: Script renders with valid environment variables**
   - Set both env vars to valid values
   - Render the root layout
   - Assert Script component is present with correct props

2. **Test: Script does not render when website ID is missing**
   - Set NEXT_PUBLIC_UMAMI_SCRIPT_URL but not NEXT_PUBLIC_UMAMI_WEBSITE_ID
   - Render the root layout
   - Assert Script component is not present

3. **Test: Script does not render when script URL is missing**
   - Set NEXT_PUBLIC_UMAMI_WEBSITE_ID but not NEXT_PUBLIC_UMAMI_SCRIPT_URL
   - Render the root layout
   - Assert Script component is not present

4. **Test: Script does not render when both env vars are missing**
   - Don't set either env var
   - Render the root layout
   - Assert Script component is not present

### Property-Based Tests

Property-based tests will verify the correctness properties across many generated inputs:

1. **Property Test: Environment variable propagation (Property 1)**
   - Generate random valid website IDs and script URLs
   - Set environment variables to generated values
   - Render root layout
   - Assert Script component has matching src and data-website-id attributes
   - Run 100+ iterations with different values
   - **Tag: Feature: umami-analytics, Property 1: Environment Variable Propagation**

2. **Property Test: Conditional script loading (Property 2)**
   - Generate combinations where at least one env var is undefined
   - Render root layout for each combination
   - Assert Script component is not rendered
   - Run 100+ iterations with different combinations
   - **Tag: Feature: umami-analytics, Property 2: Conditional Script Loading**

### Testing Library

For React component testing, we'll use **React Testing Library** with **Jest** (or **Vitest** if preferred). For property-based testing, we'll use **fast-check** (JavaScript/TypeScript property-based testing library).

**Test Configuration**:
- Minimum 100 iterations per property test
- Each property test references its design document property number
- Tests run in both development and CI environments

### Manual Verification

After implementation, manually verify:
1. Open the application in a browser
2. Open browser DevTools → Network tab
3. Verify the Umami script loads from the configured URL
4. Navigate between pages and verify page views are tracked in Umami dashboard
5. Check that page load performance is not negatively impacted
