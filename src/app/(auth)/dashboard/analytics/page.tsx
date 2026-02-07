import { Suspense } from 'react';
import {
  getRFMData,
  getAnalyticsSummary,
  getNewVsReturning,
  getPopularServices,
  getPopularHours,
  getMonthlyGrowth,
  getTopClients,
  getServiceDurations,
  getRetentionCohorts,
  generateInsights,
} from '@/lib/queries/analytics';
import { AnalyticsContent } from './AnalyticsContent';
import { Shimmer } from '@/components/animations';

export const metadata = {
  title: 'Аналітика — ShinePRO CRM',
};

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <Shimmer className="h-8 w-48" rounded="lg" />
        <Shimmer className="h-10 w-40" rounded="lg" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Shimmer key={i} className="h-28" rounded="lg" />
        ))}
      </div>
      <Shimmer className="h-10 w-full" rounded="lg" />
      <Shimmer className="h-64" rounded="lg" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Shimmer key={i} className="h-16" rounded="lg" />
        ))}
      </div>
    </div>
  );
}

export default async function AnalyticsPage() {
  const [
    rfmData,
    summary,
    newVsReturning,
    popularServices,
    hourlyLoad,
    monthlyGrowth,
    serviceDurations,
    cohorts,
  ] = await Promise.all([
    getRFMData(),
    getAnalyticsSummary(),
    getNewVsReturning(),
    getPopularServices(),
    getPopularHours(),
    getMonthlyGrowth(),
    getServiceDurations(),
    getRetentionCohorts(),
  ]);

  const [topClients, insights] = await Promise.all([
    getTopClients(rfmData.results),
    generateInsights(summary, rfmData.results, popularServices, hourlyLoad, monthlyGrowth),
  ]);

  return (
    <Suspense fallback={<AnalyticsSkeleton />}>
      <AnalyticsContent
        summary={summary}
        rfmResults={rfmData.results}
        rfmSegments={rfmData.segments}
        newVsReturning={newVsReturning}
        popularServices={popularServices}
        hourlyLoad={hourlyLoad}
        monthlyGrowth={monthlyGrowth}
        topClients={topClients}
        serviceDurations={serviceDurations}
        cohorts={cohorts}
        insights={insights}
      />
    </Suspense>
  );
}
