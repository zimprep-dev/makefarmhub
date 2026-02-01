/**
 * Image Optimization Utilities
 * Handles lazy loading, responsive images, and performance optimization
 */

export interface ImageConfig {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  srcSet?: string;
}

/**
 * Generate srcSet for responsive images
 */
export function generateSrcSet(baseUrl: string, widths: number[]): string {
  return widths
    .map(width => {
      const url = baseUrl.includes('unsplash.com')
        ? `${baseUrl}&w=${width}`
        : baseUrl;
      return `${url} ${width}w`;
    })
    .join(', ');
}

/**
 * Generate sizes attribute for responsive images
 */
export function generateSizes(breakpoints: { maxWidth: string; size: string }[]): string {
  return breakpoints
    .map(bp => `(max-width: ${bp.maxWidth}) ${bp.size}`)
    .join(', ');
}

/**
 * Optimize image URL (for external services like Unsplash)
 */
export function optimizeImageUrl(url: string, width?: number, quality: number = 80): string {
  if (!url) return '';
  
  // Unsplash optimization
  if (url.includes('unsplash.com')) {
    const params = new URLSearchParams();
    if (width) params.set('w', width.toString());
    params.set('q', quality.toString());
    params.set('auto', 'format');
    params.set('fit', 'crop');
    
    return `${url.split('?')[0]}?${params.toString()}`;
  }
  
  return url;
}

/**
 * Preload critical images
 */
export function preloadImage(url: string, as: 'image' | 'fetch' = 'image'): void {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = as;
  link.href = url;
  document.head.appendChild(link);
}

/**
 * Lazy load images with Intersection Observer
 */
export class LazyImageLoader {
  private observer: IntersectionObserver | null = null;
  
  constructor(options?: IntersectionObserverInit) {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        {
          rootMargin: '50px',
          threshold: 0.01,
          ...options,
        }
      );
    }
  }
  
  private handleIntersection(entries: IntersectionObserverEntry[]): void {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.dataset.src;
        const srcset = img.dataset.srcset;
        
        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
        }
        
        if (srcset) {
          img.srcset = srcset;
          img.removeAttribute('data-srcset');
        }
        
        img.classList.add('loaded');
        this.observer?.unobserve(img);
      }
    });
  }
  
  observe(element: HTMLElement): void {
    this.observer?.observe(element);
  }
  
  unobserve(element: HTMLElement): void {
    this.observer?.unobserve(element);
  }
  
  disconnect(): void {
    this.observer?.disconnect();
  }
}

/**
 * Convert image to WebP if supported
 */
export function supportsWebP(): Promise<boolean> {
  return new Promise(resolve => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
}

/**
 * Get optimized image format
 */
export async function getOptimizedFormat(url: string): Promise<string> {
  const webpSupported = await supportsWebP();
  
  if (webpSupported && url.includes('unsplash.com')) {
    return `${url}&fm=webp`;
  }
  
  return url;
}

/**
 * Image placeholder for loading states
 */
export function generatePlaceholder(width: number, height: number, color: string = '#f0f0f0'): string {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'%3E%3Crect width='${width}' height='${height}' fill='${color}'/%3E%3C/svg%3E`;
}

/**
 * Blur hash placeholder (simplified version)
 */
export function generateBlurPlaceholder(width: number = 40, height: number = 40): string {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'%3E%3Cfilter id='b'%3E%3CfeGaussianBlur stdDeviation='12'/%3E%3C/filter%3E%3Crect width='${width}' height='${height}' fill='%23e5e7eb' filter='url(%23b)'/%3E%3C/svg%3E`;
}

export default {
  generateSrcSet,
  generateSizes,
  optimizeImageUrl,
  preloadImage,
  LazyImageLoader,
  supportsWebP,
  getOptimizedFormat,
  generatePlaceholder,
  generateBlurPlaceholder,
};
