/* eslint-disable @typescript-eslint/no-explicit-any */

interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface MetricsSummary {
  operation: string;
  count: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  p50: number;
  p90: number;
  p99: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private readonly MAX_METRICS_PER_OPERATION = 1000;

  // Start tracking an operation
  startOperation(operationName: string): () => void {
    const startTime = Date.now();

    return () => {
      this.recordMetric(operationName, Date.now() - startTime);
    };
  }

  // Record a metric
  recordMetric(operation: string, duration: number, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      operation,
      duration,
      timestamp: Date.now(),
      metadata
    };

    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }

    const operationMetrics = this.metrics.get(operation)!;
    operationMetrics.push(metric);

    // Keep only the most recent metrics
    if (operationMetrics.length > this.MAX_METRICS_PER_OPERATION) {
      operationMetrics.shift();
    }

    // Log slow operations
    if (duration > this.getSlowThreshold(operation)) {
      console.warn(`Slow operation detected: ${operation} took ${duration}ms`, metadata);
    }
  }

  // Get slow operation threshold
  private getSlowThreshold(operation: string): number {
    const thresholds: Record<string, number> = {
      'api.chat': 3000,
      'api.chat-stream': 2000,
      'zep.session.create': 1000,
      'zep.session.get': 500,
      'zep.memory.add': 500,
      'zep.memory.get': 500,
      'db.message.insert': 200,
      'db.conversation.fetch': 300,
      'gemini.generate': 2000,
      'cache.check': 10,
      'default': 1000
    };

    return thresholds[operation] || thresholds.default;
  }

  // Get summary for an operation
  getSummary(operation: string): MetricsSummary | null {
    const operationMetrics = this.metrics.get(operation);
    if (!operationMetrics || operationMetrics.length === 0) {
      return null;
    }

    const durations = operationMetrics.map(m => m.duration).sort((a, b) => a - b);
    const count = durations.length;
    const sum = durations.reduce((acc, d) => acc + d, 0);

    return {
      operation,
      count,
      avgDuration: Math.round(sum / count),
      minDuration: durations[0],
      maxDuration: durations[count - 1],
      p50: this.percentile(durations, 50),
      p90: this.percentile(durations, 90),
      p99: this.percentile(durations, 99)
    };
  }

  // Calculate percentile
  private percentile(sortedValues: number[], p: number): number {
    const index = Math.ceil((p / 100) * sortedValues.length) - 1;
    return sortedValues[Math.max(0, index)];
  }

  // Get all summaries
  getAllSummaries(): MetricsSummary[] {
    const summaries: MetricsSummary[] = [];
    for (const operation of this.metrics.keys()) {
      const summary = this.getSummary(operation);
      if (summary) {
        summaries.push(summary);
      }
    }
    return summaries.sort((a, b) => b.avgDuration - a.avgDuration);
  }

  // Get recent slow operations
  getSlowOperations(limit = 10): PerformanceMetric[] {
    const allMetrics: PerformanceMetric[] = [];

    for (const metrics of this.metrics.values()) {
      allMetrics.push(...metrics);
    }

    return allMetrics
      .filter(m => m.duration > this.getSlowThreshold(m.operation))
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  // Clear metrics for an operation
  clearMetrics(operation?: string): void {
    if (operation) {
      this.metrics.delete(operation);
    } else {
      this.metrics.clear();
    }
  }

  // Export metrics as JSON
  exportMetrics(): string {
    const data = {
      timestamp: new Date().toISOString(),
      summaries: this.getAllSummaries(),
      slowOperations: this.getSlowOperations(20)
    };
    return JSON.stringify(data, null, 2);
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Helper function for async operations
export async function trackAsync<T>(
  operation: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const startTime = Date.now();
  try {
    const result = await fn();
    performanceMonitor.recordMetric(operation, Date.now() - startTime, {
      ...metadata,
      success: true
    });
    return result;
  } catch (error) {
    performanceMonitor.recordMetric(operation, Date.now() - startTime, {
      ...metadata,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

// Helper function for sync operations
export function trackSync<T>(
  operation: string,
  fn: () => T,
  metadata?: Record<string, any>
): T {
  const startTime = Date.now();
  try {
    const result = fn();
    performanceMonitor.recordMetric(operation, Date.now() - startTime, {
      ...metadata,
      success: true
    });
    return result;
  } catch (error) {
    performanceMonitor.recordMetric(operation, Date.now() - startTime, {
      ...metadata,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

// Express middleware for API endpoints
export function metricsMiddleware(operationName: string) {
  return (req: any, res: any, next: any) => {
    const endTracking = performanceMonitor.startOperation(operationName);

    // Override res.json to track when response is sent
    const originalJson = res.json.bind(res);
    res.json = function(data: any) {
      endTracking();
      return originalJson(data);
    };

    next();
  };
}

export default performanceMonitor;