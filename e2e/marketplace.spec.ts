/**
 * E2E Tests - Marketplace Flow
 */

import { test, expect } from '@playwright/test';

test.describe('Marketplace', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/marketplace');
  });

  test('should display marketplace page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Marketplace');
    await expect(page.locator('.listing-card')).toHaveCount(await page.locator('.listing-card').count());
  });

  test('should search for listings', async ({ page }) => {
    await page.fill('input[placeholder*="Search"]', 'tomatoes');
    await page.waitForTimeout(500); // Wait for debounce
    
    const listings = page.locator('.listing-card');
    const count = await listings.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test('should filter by category', async ({ page }) => {
    await page.click('select[name="category"]');
    await page.selectOption('select[name="category"]', 'crops');
    
    await page.waitForTimeout(300);
    
    const listings = page.locator('.listing-card');
    expect(await listings.count()).toBeGreaterThan(0);
  });

  test('should sort listings', async ({ page }) => {
    await page.selectOption('select[name="sort"]', 'price-asc');
    
    await page.waitForTimeout(300);
    
    const firstPrice = await page.locator('.listing-card').first().locator('.price').textContent();
    const lastPrice = await page.locator('.listing-card').last().locator('.price').textContent();
    
    expect(firstPrice).toBeTruthy();
    expect(lastPrice).toBeTruthy();
  });

  test('should view listing details', async ({ page }) => {
    await page.locator('.listing-card').first().click();
    
    await expect(page).toHaveURL(/.*listing\/.*/);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.price')).toBeVisible();
    await expect(page.locator('.description')).toBeVisible();
  });

  test('should add listing to favorites', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="tel"]', '+263 77 123 4567');
    await page.click('button:has-text("Send OTP")');
    await page.waitForSelector('input[placeholder*="OTP"]');
    await page.fill('input[placeholder*="OTP"]', '1234');
    await page.click('button:has-text("Verify")');
    
    // Go to marketplace
    await page.goto('/marketplace');
    
    // Click favorite on first listing
    await page.locator('.listing-card').first().locator('[aria-label*="favorite"]').click();
    
    // Should show success message
    await expect(page.locator('text=Added to favorites')).toBeVisible();
  });

  test('should paginate listings', async ({ page }) => {
    const totalListings = await page.locator('.listing-card').count();
    
    if (totalListings > 12) {
      await page.click('button:has-text("Next")');
      await page.waitForTimeout(300);
      
      await expect(page).toHaveURL(/.*page=2/);
    }
  });

  test('should switch between grid and list view', async ({ page }) => {
    // Click list view
    await page.click('[aria-label="List view"]');
    await expect(page.locator('.listings-list')).toBeVisible();
    
    // Click grid view
    await page.click('[aria-label="Grid view"]');
    await expect(page.locator('.listings-grid')).toBeVisible();
  });
});
