/**
 * E2E Tests - Listing Creation Flow
 */

import { test, expect } from '@playwright/test';

test.describe('Listing Creation', () => {
  test.beforeEach(async ({ page }) => {
    // Login as farmer
    await page.goto('/login');
    await page.fill('input[type="tel"]', '+263 77 123 4567');
    await page.click('button:has-text("Send OTP")');
    await page.waitForSelector('input[placeholder*="OTP"]');
    await page.fill('input[placeholder*="OTP"]', '1234');
    await page.click('button:has-text("Verify")');
    
    // Navigate to create listing
    await page.goto('/listings/create');
  });

  test('should display create listing form', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Create Listing');
    await expect(page.locator('form')).toBeVisible();
  });

  test('should create a crop listing', async ({ page }) => {
    // Select category
    await page.click('text=Crops');
    await page.click('button:has-text("Next")');
    
    // Fill in details
    await page.fill('input[name="title"]', 'Test Tomatoes');
    await page.fill('textarea[name="description"]', 'Fresh organic tomatoes for sale');
    await page.selectOption('select[name="subcategory"]', 'Vegetables');
    await page.fill('input[name="quantity"]', '100');
    await page.selectOption('select[name="unit"]', 'kg');
    await page.fill('input[name="price"]', '50');
    await page.fill('input[name="location"]', 'Harare, Zimbabwe');
    
    // Submit
    await page.click('button:has-text("Create Listing")');
    
    // Should redirect to listing detail
    await expect(page).toHaveURL(/.*listing\/.*/);
    await expect(page.locator('h1')).toContainText('Test Tomatoes');
  });

  test('should create a livestock listing', async ({ page }) => {
    // Select category
    await page.click('text=Livestock');
    await page.click('button:has-text("Next")');
    
    // Fill in details
    await page.fill('input[name="title"]', 'Test Chickens');
    await page.fill('textarea[name="description"]', 'Healthy broiler chickens');
    await page.selectOption('select[name="subcategory"]', 'Poultry');
    await page.fill('input[name="quantity"]', '50');
    await page.selectOption('select[name="unit"]', 'bird');
    await page.fill('input[name="price"]', '8');
    await page.fill('input[name="location"]', 'Bulawayo, Zimbabwe');
    
    // Additional livestock fields
    await page.fill('input[name="breed"]', 'Broiler');
    await page.fill('input[name="age"]', '6 weeks');
    
    // Submit
    await page.click('button:has-text("Create Listing")');
    
    // Should redirect to listing detail
    await expect(page).toHaveURL(/.*listing\/.*/);
  });

  test('should show validation errors', async ({ page }) => {
    // Select category
    await page.click('text=Crops');
    await page.click('button:has-text("Next")');
    
    // Try to submit without filling required fields
    await page.click('button:has-text("Create Listing")');
    
    // Should show validation errors
    await expect(page.locator('text=required')).toBeVisible();
  });

  test('should save as draft', async ({ page }) => {
    // Select category
    await page.click('text=Crops');
    await page.click('button:has-text("Next")');
    
    // Fill in partial details
    await page.fill('input[name="title"]', 'Draft Listing');
    
    // Save as draft
    await page.click('button:has-text("Save Draft")');
    
    // Should show success message
    await expect(page.locator('text=Draft saved')).toBeVisible();
  });
});
