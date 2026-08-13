'use client';

import { HeartPulse } from 'lucide-react';
import { ExpoForm } from './_components/ExpoForm';
import { ExpoResults } from './_components/ExpoResults';
import { ExpoSkeleton } from './_components/ExpoSkeleton';
import { ExpoHistory } from './_components/ExpoHistory';
import { EmptyState } from '@/components/empty-state';
import { DemoBanner } from '@/components/demo-banner';
import { useGenerate } from '@/hooks/use-generate';

export default function ExpoPage() {
  const { results, loading, error, isMock, history, submit, restore } = useGenerate('expo');

  return (
    <div className="flex h-full gap-6">
      <div className="w-[400px] shrink-0 flex flex-col gap-4 overflow-auto pr-2">
        <ExpoForm onSubmit={submit} loading={loading} />
        <ExpoHistory items={history.items} onSelect={restore} onClear={history.clear} />
      </div>
      <div className="flex-1 overflow-auto">
        {error && <div className="p-4 mb-4 text-sm text-destructive bg-destructive/10 rounded-lg">{error}</div>}
        {isMock && <DemoBanner />}
        {loading ? <ExpoSkeleton /> : results ? <ExpoResults results={results as any} /> : (
          <EmptyState icon={HeartPulse}>选择展会场景并输入产品信息{'\n'}AI 生成展会话术和 FAQ</EmptyState>
        )}
      </div>
    </div>
  );
}
