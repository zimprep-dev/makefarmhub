/**
 * E2E Tests - Authentication Flow
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display landing page', async ({ page }) => {
    await expect(page).toHaveTitle(/MAKEFARMHUB/);
    await expect(page.locator('h1')).toContainText('MAKEFARMHUB');
  });

  test('should navigate to login page', async ({ page }) => {
    await page.click('text=Login');
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('h2')).toContainText('Login');
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in phone number
    await page.fill('input[type="tel"]', '+263 77 123 4567');
    await page.click('button:has-text("Send OTP")');
    
    // Wait for OTP input
    await page.waitForSelector('input[placeholder*="OTP"]');
    
    // Enter OTP (demo code: 1234)
    await page.fill('input[placeholder*="OTP"]', '1234');
    await page.click('button:has-text("Verify")');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.click('text=Sign Up');
    await expect(page).toHaveURL(/.*signup/);
    await expect(page.locator('h2')).toContainText('Sign Up');
  });

  test('should signup with valid data', async ({ page }) => {
    await page.goto('/signup');
    
    // Fill in signup form
    await page.fill('input[placeholder*="name"]', 'Test User');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="tel"]', '+263 77 999 8888');
    
    // Select role
    await page.click('text=Farmer');
    
    // Fill location
    await page.fill('input[placeholder*="location"]', 'Harare, Zimbabwe');
    
    // Submit
    await page.click('button:has-text("Create Account")');
    
    // Should show OTP verification
    await expect(page.locator('input[placeholder*="OTP"]')).toBeVisible();
  });

  test('should show error for invalid OTP', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="tel"]', '+263 77 123 4567');
    await page.click('button:has-text("Send OTP")');
    
    await page.waitForSelector('input[placeholder*="OTP"]');
    await page.fill('input[placeholder*="OTP"]', '0000');
    await page.click('button:has-text("Verify")');
    
    // Should show error
    await expect(page.locator('text=Invalid OTP')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="tel"]', '+263 77 123 4567');
    await page.click('button:has-text("Send OTP")');
    await page.waitForSelector('input[placeholder*="OTP"]');
    await page.fill('input[placeholder*="OTP"]', '1234');
    await page.click('button:has-text("Verify")');
    
    // Wait for dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Logout
    await page.click('[aria-label="User menu"]');
    await page.click('text=Logout');
    
    // Should redirect to landing
    await expect(page).toHaveURL('/');
  });
});
