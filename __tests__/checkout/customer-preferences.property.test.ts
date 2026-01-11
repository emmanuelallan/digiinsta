/**
 * Property-Based Tests for Customer Preferences Persistence
 *
 * Feature: comprehensive-site-optimization
 * Property 15: Customer preferences persist correctly
 * Validates: Requirements 14.3
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as fc from "fast-check";

// Mock localStorage for testing
const createLocalStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
};

const localStorageMock = createLocalStorageMock();

// Mock window object with localStorage
Object.defineProperty(global, "window", {
  value: {
    localStorage: localStorageMock,
  },
  writable: true,
});

Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// Import after mocking
import {
  loadCustomerPreferences,
  saveCustomerPreferences,
  getSavedEmail,
  saveCustomerEmail,
  clearCustomerPreferences,
} from "@/lib/checkout/express";

describe("Customer Preferences Persistence", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  /**
   * Property 15: Customer preferences persist correctly
   * For any preference saved to localStorage, retrieving the preference
   * SHALL return the same value, and preferences SHALL survive page reload.
   */
  describe("Property 15: Customer preferences persist correctly", () => {
    // Arbitrary for valid email addresses using emailAddress()
    const emailArb = fc.emailAddress();

    // Arbitrary for customer preferences
    const preferencesArb = fc.record({
      email: fc.option(emailArb, { nil: undefined }),
      lastCheckoutAt: fc.option(
        fc
          .integer({ min: 1577836800000, max: 1893456000000 }) // 2020-01-01 to 2030-01-01 in ms
          .map((ms) => new Date(ms).toISOString()),
        { nil: undefined }
      ),
    });

    it("should round-trip customer preferences through localStorage", () => {
      fc.assert(
        fc.property(preferencesArb, (prefs) => {
          // Clear any existing data
          clearCustomerPreferences();

          // Save preferences
          saveCustomerPreferences(prefs);

          // Load preferences
          const loaded = loadCustomerPreferences();

          // Verify round-trip
          expect(loaded).not.toBeNull();
          expect(loaded?.version).toBe(1);

          if (prefs.email !== undefined) {
            expect(loaded?.email).toBe(prefs.email);
          }

          if (prefs.lastCheckoutAt !== undefined) {
            expect(loaded?.lastCheckoutAt).toBe(prefs.lastCheckoutAt);
          }
        }),
        { numRuns: 100 }
      );
    });

    it("should persist email and retrieve it with getSavedEmail", () => {
      fc.assert(
        fc.property(emailArb, (email) => {
          // Clear any existing data
          clearCustomerPreferences();

          // Save email
          saveCustomerEmail(email);

          // Retrieve email
          const savedEmail = getSavedEmail();

          // Verify persistence
          expect(savedEmail).toBe(email);
        }),
        { numRuns: 100 }
      );
    });

    it("should return null when no preferences exist", () => {
      clearCustomerPreferences();
      const prefs = loadCustomerPreferences();
      expect(prefs).toBeNull();
    });

    it("should return undefined email when no email is saved", () => {
      clearCustomerPreferences();
      const email = getSavedEmail();
      expect(email).toBeUndefined();
    });

    it("should clear all preferences when clearCustomerPreferences is called", () => {
      fc.assert(
        fc.property(preferencesArb, (prefs) => {
          // Save preferences
          saveCustomerPreferences(prefs);

          // Verify saved
          expect(loadCustomerPreferences()).not.toBeNull();

          // Clear preferences
          clearCustomerPreferences();

          // Verify cleared
          expect(loadCustomerPreferences()).toBeNull();
          expect(getSavedEmail()).toBeUndefined();
        }),
        { numRuns: 50 }
      );
    });

    it("should merge new preferences with existing ones", () => {
      fc.assert(
        fc.property(emailArb, emailArb, (email1, email2) => {
          // Clear any existing data
          clearCustomerPreferences();

          // Save first email
          saveCustomerEmail(email1);
          expect(getSavedEmail()).toBe(email1);

          // Save second email (should overwrite)
          saveCustomerEmail(email2);
          expect(getSavedEmail()).toBe(email2);

          // Verify lastCheckoutAt is also set
          const prefs = loadCustomerPreferences();
          expect(prefs?.lastCheckoutAt).toBeDefined();
        }),
        { numRuns: 50 }
      );
    });
  });
});
