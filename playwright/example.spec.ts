import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("should load the homepage", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/DigiInsta Store/i);
  });

  test("should have proper SEO metadata", async ({ page }) => {
    await page.goto("/");
    
    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute("content", /.+/);
    
    // Check Open Graph tags
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute("content", /.+/);
  });
});

test.describe("Navigation", () => {
  test("should navigate to products page", async ({ page }) => {
    await page.goto("/");
    // Add navigation test when components are implemented
  });
});
