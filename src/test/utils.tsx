/**
 * Test Utilities - Helper functions for testing
 */

import React, { type ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../context/ThemeContext';
import { ToastProvider } from '../components/UI/Toast';

// All providers wrapper
interface AllProvidersProps {
  children: React.ReactNode;
}

function AllProviders({ children }: AllProvidersProps) {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

// Custom render with providers
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Mock data helpers
export const mockUser = {
  id: 'test-user-1',
  name: 'Test User',
  email: 'test@example.com',
  phone: '+263 77 123 4567',
  role: 'farmer' as const,
  location: 'Harare, Zimbabwe',
  verified: true,
  createdAt: '2024-01-01',
};

export const mockListing = {
  id: 'test-listing-1',
  sellerId: 'test-user-1',
  sellerName: 'Test User',
  sellerRating: 4.5,
  sellerVerified: true,
  title: 'Test Product',
  description: 'Test description',
  category: 'crops' as const,
  subcategory: 'Vegetables',
  price: 100,
  unit: 'kg',
  quantity: 50,
  location: 'Harare, Zimbabwe',
  images: ['https://example.com/image.jpg'],
  status: 'active' as const,
  featured: false,
  createdAt: '2024-01-01',
  views: 10,
};

export const mockOrder = {
  id: 'test-order-1',
  listingId: 'test-listing-1',
  listingTitle: 'Test Product',
  listingImage: 'https://example.com/image.jpg',
  buyerId: 'test-buyer-1',
  buyerName: 'Test Buyer',
  sellerId: 'test-user-1',
  sellerName: 'Test User',
  quantity: 10,
  unitPrice: 100,
  totalPrice: 1000,
  escrowAmount: 1000,
  status: 'pending' as const,
  createdAt: '2024-01-01',
  deliveryAddress: '123 Test Street',
};

// Wait helper
export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Create mock function with type
export function createMockFn<T extends (...args: unknown[]) => unknown>() {
  return (() => {}) as unknown as T;
}
