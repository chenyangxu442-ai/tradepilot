'use client';

import { Mail } from 'lucide-react';
import { MailForm } from './_components/MailForm';
import { MailResults } from './_components/MailResults';
import { MailSkeleton } from './_components/MailSkeleton';
import { MailHistory } from './_components/MailHistory';
import { EmptyState } from '@/components/empty-state';
import { DemoBanner } from '@/components/demo-banner';
import { useGenerate } from '@/hooks/use-generate';

export default function MailPage() {
  const { results, loading, error, isMock, history, submit, restore } = useGenerate('mail');

  return (
    <div className="flex h-full gap-6">
      <div className="w-[400px] shrink-0 flex flex-col gap-4 overflow-auto pr-2">
        <MailForm onSubmit={submit} loading={loading} />
        <MailHistory items={history.items} onSelect={restore} onClear={history.clear} />
      </div>
      <div className="flex-1 overflow-auto">
        {error && <div className="p-4 mb-4 text-sm text-destructive bg-destructive/10 rounded-lg">{error}</div>}
        {isMock && <DemoBanner />}
        {loading ? <MailSkeleton /> : results ? <MailResults results={results as any} /> : (
          <EmptyState icon={Mail}>输入客户情报和产品信息{'\n'}AI 将生成 5 个策略视角的开发信</EmptyState>
        )}
      </div>
    </div>
  );
}
