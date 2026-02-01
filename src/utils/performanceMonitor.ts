/**
 * Performance Monitoring Utilities
 * Track page load times, resource loading, and user interactions
 */

export interface PerformanceMetrics {
  pageLoadTime: number;
  domContentLoaded: number;
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint?: number;
  firstInputDelay?: number;
  cumulativeLayoutShift?: number;
  timeToInteractive?: number;
}

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: PerformanceObserver[] = [];

  /**
   * Initialize performance monitoring
   */
  init(): void {
    if (typeof window === 'undefined') return;

    // Basic timing metrics
    this.collectBasicMetrics();

    // Web Vitals
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
  }

  /**
   * Collect basic performance metrics
   */
  private collectBasicMetrics(): void {
    if (!window.performance) return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = window.performance.timing;
        const navigationStart = perfData.navigationStart;

        this.metrics.pageLoadTime = perfData.loadEventEnd - navigationStart;
        this.metrics.domContentLoaded = perfData.domContentLoadedEventEnd - navigationStart;

        // Paint timing
        const paintEntries = performance.getEntriesByType('paint');
        paintEntries.forEach((entry) => {
          if (entry.name === 'first-paint') {
            this.metrics.firstPaint = entry.startTime;
          } else if (entry.name === 'first-contentful-paint') {
            this.metrics.firstContentfulPaint = entry.startTime;
          }
        });
      }, 0);
    });
  }

  /**
   * Observe Largest Contentful Paint (LCP)
   */
  private observeLCP(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number };
        this.metrics.largestContentfulPaint = lastEntry.renderTime || lastEntry.loadTime || 0;
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(observer);
    } catch (e) {
      console.warn('LCP observation not supported');
    }
  }

  /**
   * Observe First Input Delay (FID)
   */
  private observeFID(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (entry.processingStart && entry.startTime) {
            this.metrics.firstInputDelay = entry.processingStart - entry.startTime;
          }
        });
      });

      observer.observe({ entryTypes: ['first-input'] });
      this.observers.push(observer);
    } catch (e) {
      console.warn('FID observation not supported');
    }
  }

  /**
   * Observe Cumulative Layout Shift (CLS)
   */
  private observeCLS(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.metrics.cumulativeLayoutShift = clsValue;
          }
        }
      });

      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);
    } catch (e) {
      console.warn('CLS observation not supported');
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  /**
   * Log metrics to console (dev only)
   */
  logMetrics(): void {
    if (import.meta.env.MODE !== 'development') return;

    console.group('📊 Performance Metrics');
    console.table(this.metrics);
    console.groupEnd();
  }

  /**
   * Send metrics to analytics (placeholder)
   */
  sendToAnalytics(): void {
    // In production, send to your analytics service
    // Example: analytics.track('performance', this.metrics);
    if (import.meta.env.PROD) {
      // TODO: Implement analytics integration
    }
  }

  /**
   * Measure custom timing
   */
  measureTiming(name: string, startMark: string, endMark: string): number | null {
    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name)[0];
      return measure ? measure.duration : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Mark a custom timing point
   */
  mark(name: string): void {
    try {
      performance.mark(name);
    } catch (e) {
      console.warn(`Failed to mark: ${name}`);
    }
  }

  /**
   * Clear all marks and measures
   */
  clearMarks(): void {
    try {
      performance.clearMarks();
      performance.clearMeasures();
    } catch (e) {
      console.warn('Failed to clear marks');
    }
  }

  /**
   * Get resource timing data
   */
  getResourceTiming(): PerformanceResourceTiming[] {
    return performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  }

  /**
   * Analyze slow resources
   */
  getSlowResources(threshold: number = 1000): PerformanceResourceTiming[] {
    return this.getResourceTiming().filter(
      (resource) => resource.duration > threshold
    );
  }

  /**
   * Cleanup observers
   */
  disconnect(): void {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Auto-initialize in browser
if (typeof window !== 'undefined') {
  performanceMonitor.init();
}

export default performanceMonitor;
