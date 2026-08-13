'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Copy, Download, ChevronDown, Languages } from 'lucide-react';
import { exportCatalogHTML } from '@/lib/export-html';

interface CatalogZh {
  title_cn: string;
  overview_cn: string;
  specs_cn: { label_cn: string; value_cn: string }[];
  features_cn: string[];
  factory_note_cn: string;
  cta_cn: string;
}

interface CatalogResult {
  title: string;
  overview: string;
  specs: { label: string; value: string }[];
  features: string[];
  factory_note: string;
  cta: string;
  zh?: CatalogZh;
}

export function CatalogResults({ results }: { results: { results: CatalogResult } }) {
  const r = results.results;
  const hasZh = !!r.zh;
  const [showZh, setShowZh] = useState(!!hasZh);

  const buildText = (includeZh: boolean) => {
    const lines = [
      `# ${r.title}`,
      '',
      r.overview,
      '',
      '## Specifications',
      ...r.specs.map((s) => `- ${s.label}: ${s.value}`),
      '',
      '## Features',
      ...r.features.map((f) => `- ${f}`),
      '',
      r.factory_note,
      '',
      r.cta,
    ];
    if (includeZh && r.zh) {
      lines.push(
        '',
        '---',
        '# 中文参考',
        '',
        `## ${r.zh.title_cn}`,
        '',
        r.zh.overview_cn,
        '',
        '## 产品规格',
        ...r.zh.specs_cn.map((s) => `- ${s.label_cn}: ${s.value_cn}`),
        '',
        '## 产品特性',
        ...r.zh.features_cn.map((f) => `- ${f}`),
        '',
        r.zh.factory_note_cn,
        '',
        r.zh.cta_cn,
      );
    }
    return lines.join('\n');
  };

  const copyAll = () => {
    navigator.clipboard.writeText(buildText(showZh));
    toast.success(showZh ? '中英文已复制' : '产品目录已复制');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{r.title}</CardTitle>
          {hasZh && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => setShowZh(!showZh)}
            >
              <Languages className="h-3 w-3" />
              {showZh ? '隐藏中文' : '显示中文'}
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{r.overview}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold mb-2">产品规格</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
            {r.specs.map((s, i) => (
              <div key={i} className="flex justify-between text-sm py-1 border-b border-border/50">
                <span className="text-muted-foreground">{s.label}</span>
                <span className="font-medium">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-2">产品特性</h3>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            {r.features.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>

        {/* Chinese translation — collapsible, shown by default when available */}
        {hasZh && showZh && (
          <>
            <Separator />
            <div className="space-y-3 bg-accent/30 rounded-lg p-4">
              <h4 className="text-sm font-semibold flex items-center gap-1.5">
                <Languages className="h-3.5 w-3.5" />
                中文参考
                <span className="text-xs font-normal text-muted-foreground">（工厂内部审核用）</span>
              </h4>

              <div>
                <p className="text-sm font-medium">{r.zh!.title_cn}</p>
                <p className="text-sm text-muted-foreground mt-1">{r.zh!.overview_cn}</p>
              </div>

              <div>
                <h5 className="text-xs font-semibold text-muted-foreground mb-1.5">产品规格</h5>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {r.zh!.specs_cn.map((s, i) => (
                    <div key={i} className="flex justify-between text-sm py-0.5">
                      <span className="text-muted-foreground">{s.label_cn}</span>
                      <span className="font-medium">{s.value_cn}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-xs font-semibold text-muted-foreground mb-1">产品特性</h5>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-0.5">
                  {r.zh!.features_cn.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </div>

              <p className="text-sm text-muted-foreground">{r.zh!.factory_note_cn}</p>
              <p className="text-sm font-semibold">{r.zh!.cta_cn}</p>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2">
        <p className="text-sm text-muted-foreground">{r.factory_note}</p>
        <div className="flex items-center justify-between w-full">
          <p className="text-sm font-semibold">{r.cta}</p>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={copyAll}>
              <Copy className="h-3 w-3 mr-1" />复制全文
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportCatalogHTML(results)}>
              <Download className="h-3 w-3 mr-1" />下载 HTML
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
