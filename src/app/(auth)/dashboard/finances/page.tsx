import { Suspense } from 'react';
import {
  getFinancialSummary,
  getRevenueByPeriod,
  getExpenses,
  getServiceRevenue,
  getStaffRevenue,
  getPayroll,
  getServiceProfitability,
} from '@/lib/queries/finances';
import { FinancesContent } from './FinancesContent';
import { Shimmer } from '@/components/animations';

export const metadata = {
  title: 'Фінанси — ShinePRO CRM',
};

function FinancesSkeleton() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <Shimmer className="h-8 w-48" rounded="lg" />
        <Shimmer className="h-10 w-40" rounded="lg" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Shimmer key={i} className="h-32" rounded="lg" />
        ))}
      </div>
      <Shimmer className="h-64" rounded="lg" />
      <Shimmer className="h-10 w-full" rounded="lg" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Shimmer key={i} className="h-16" rounded="lg" />
        ))}
      </div>
    </div>
  );
}

export default async function FinancesPage() {
  const [summary, chartData, expenses, serviceRevenue, staffRevenue, payroll, profitability] =
    await Promise.all([
      getFinancialSummary(),
      getRevenueByPeriod(),
      getExpenses(),
      getServiceRevenue(),
      getStaffRevenue(),
      getPayroll(),
      getServiceProfitability(),
    ]);

  return (
    <Suspense fallback={<FinancesSkeleton />}>
      <FinancesContent
        summary={summary}
        chartData={chartData}
        expenses={expenses}
        serviceRevenue={serviceRevenue}
        staffRevenue={staffRevenue}
        payroll={payroll}
        profitability={profitability}
      />
    </Suspense>
  );
}
