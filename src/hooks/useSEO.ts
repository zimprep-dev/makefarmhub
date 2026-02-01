/**
 * useSEO Hook - React hook for managing SEO meta tags
 */

import { useEffect } from 'react';
import { seoService, type MetaConfig, type ProductSchema, type BreadcrumbItem } from '../services/seo';

/**
 * Hook to set page meta tags
 */
export function useSEO(config: MetaConfig, deps: unknown[] = []) {
  useEffect(() => {
    seoService.updateMeta(config);

    return () => {
      seoService.resetMeta();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Hook for product pages
 */
export function useProductSEO(product: ProductSchema | null, deps: unknown[] = []) {
  useEffect(() => {
    if (!product) return;

    // Update meta tags
    seoService.updateMeta({
      title: product.name,
      description: product.description,
      image: product.image[0],
      type: 'product',
    });

    // Add product schema
    seoService.addProductSchema(product);

    return () => {
      seoService.resetMeta();
      seoService.removeJsonLd('product-schema');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Hook for breadcrumbs
 */
export function useBreadcrumbs(items: BreadcrumbItem[], deps: unknown[] = []) {
  useEffect(() => {
    if (items.length === 0) return;

    seoService.addBreadcrumbSchema(items);

    return () => {
      seoService.removeJsonLd('breadcrumb-schema');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Hook for page title only
 */
export function usePageTitle(title: string, deps: unknown[] = []) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} | MAKEFARMHUB` : 'MAKEFARMHUB';

    return () => {
      document.title = previousTitle;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export default useSEO;
