'use client';

import { DollarSign } from 'lucide-react';
import { QuoteForm } from './_components/QuoteForm';
import { QuoteResults } from './_components/QuoteResults';
import { QuoteSkeleton } from './_components/QuoteSkeleton';
import { QuoteHistory } from './_components/QuoteHistory';
import { EmptyState } from '@/components/empty-state';
import { DemoBanner } from '@/components/demo-banner';
import { useGenerate } from '@/hooks/use-generate';

export default function QuotePage() {
  const { results, loading, error, isMock, history, submit, restore } = useGenerate('quote');

  return (
    <div className="flex h-full gap-6">
      <div className="w-[400px] shrink-0 flex flex-col gap-4 overflow-auto pr-2">
        <QuoteForm onSubmit={submit} loading={loading} />
        <QuoteHistory items={history.items} onSelect={restore} onClear={history.clear} />
      </div>
      <div className="flex-1 overflow-auto">
        {error && <div className="p-4 mb-4 text-sm text-destructive bg-destructive/10 rounded-lg">{error}</div>}
        {isMock && <DemoBanner />}
        {loading ? <QuoteSkeleton /> : results ? <QuoteResults results={results as any} /> : (
          <EmptyState icon={DollarSign}>输入买卖双方信息和产品明细{'\n'}AI 自动生成 Proforma Invoice</EmptyState>
        )}
      </div>
    </div>
  );
}
