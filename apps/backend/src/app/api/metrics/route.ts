import { NextResponse } from 'next/server';
import performanceMonitor from '@/lib/metrics';
import { getAverageResponseTime } from '@/lib/commonResponses';

export async function GET() {
  // Get performance metrics
  const summaries = performanceMonitor.getAllSummaries();
  const slowOperations = performanceMonitor.getSlowOperations(10);

  // Get chat-specific metrics
  const chatResponseTimes = getAverageResponseTime();

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    operationSummaries: summaries,
    slowOperations: slowOperations,
    chatMetrics: {
      averageResponseTime: chatResponseTimes.average,
      cachedResponseTime: chatResponseTimes.cached,
      uncachedResponseTime: chatResponseTimes.uncached
    }
  });
}