# Implementation Plan: Umami Analytics Integration

## Overview

This implementation plan integrates Umami analytics into the Next.js application by modifying the root layout component to include the Umami tracking script. The implementation is minimal, requiring changes to only one file, and uses the existing environment variables for configuration.

## Tasks

- [x] 1. Modify root layout to integrate Umami analytics script
  - Import Next.js Script component
  - Add conditional rendering logic to check for environment variables
  - Insert Script component with correct configuration (afterInteractive strategy, src, data-website-id)
  - Ensure Script component is placed in the body section
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3_

- [ ]* 2. Write unit tests for root layout analytics integration
  - [ ]* 2.1 Test script renders with valid environment variables
    - Mock both NEXT_PUBLIC_UMAMI_WEBSITE_ID and NEXT_PUBLIC_UMAMI_SCRIPT_URL
    - Render root layout component
    - Assert Script component is present with correct props
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [ ]* 2.2 Test script does not render when website ID is missing
    - Mock only NEXT_PUBLIC_UMAMI_SCRIPT_URL
    - Render root layout component
    - Assert Script component is not in the output
    - _Requirements: 2.3_
  
  - [ ]* 2.3 Test script does not render when script URL is missing
    - Mock only NEXT_PUBLIC_UMAMI_WEBSITE_ID
    - Render root layout component
    - Assert Script component is not in the output
    - _Requirements: 2.3_
  
  - [ ]* 2.4 Test script does not render when both env vars are missing
    - Don't mock any environment variables
    - Render root layout component
    - Assert Script component is not in the output
    - _Requirements: 2.3_

- [ ]* 3. Write property-based tests for analytics integration
  - [ ]* 3.1 Property test for environment variable propagation
    - **Property 1: Environment Variable Propagation**
    - **Validates: Requirements 1.2**
    - Use fast-check to generate random website IDs and script URLs
    - For each generated pair, set env vars and render layout
    - Assert Script component src and data-website-id match generated values
    - Configure test to run minimum 100 iterations
  
  - [ ]* 3.2 Property test for conditional script loading
    - **Property 2: Conditional Script Loading**
    - **Validates: Requirements 2.3**
    - Use fast-check to generate combinations with at least one undefined env var
    - For each combination, render layout
    - Assert Script component is not rendered
    - Configure test to run minimum 100 iterations

- [ ] 4. Checkpoint - Verify implementation and run tests
  - Ensure all tests pass, ask the user if questions arise.
  - Manually verify script loads in browser DevTools
  - Check that page views are tracked in Umami dashboard

## Notes

- Tasks marked with `*` are optional and can be skipped for faster deployment
- The core implementation (Task 1) is minimal and production-ready
- Property tests provide comprehensive validation across many input combinations
- Manual verification in Task 4 ensures end-to-end functionality
