'use client';

import { BookOpen } from 'lucide-react';
import { CatalogForm } from './_components/CatalogForm';
import { CatalogResults } from './_components/CatalogResults';
import { CatalogSkeleton } from './_components/CatalogSkeleton';
import { CatalogHistory } from './_components/CatalogHistory';
import { EmptyState } from '@/components/empty-state';
import { DemoBanner } from '@/components/demo-banner';
import { useGenerate } from '@/hooks/use-generate';

export default function CatalogPage() {
  const { results, loading, error, isMock, history, submit, restore } = useGenerate('catalog');

  return (
    <div className="flex h-full gap-6">
      <div className="w-[400px] shrink-0 flex flex-col gap-4 overflow-auto pr-2">
        <CatalogForm onSubmit={submit} loading={loading} />
        <CatalogHistory items={history.items} onSelect={restore} onClear={history.clear} />
      </div>
      <div className="flex-1 overflow-auto">
        {error && <div className="p-4 mb-4 text-sm text-destructive bg-destructive/10 rounded-lg">{error}</div>}
        {isMock && <DemoBanner />}
        {loading ? <CatalogSkeleton /> : results ? <CatalogResults results={results as any} /> : (
          <EmptyState icon={BookOpen}>输入产品名称和中文参数{'\n'}AI 自动生成英文产品目录</EmptyState>
        )}
      </div>
    </div>
  );
}
