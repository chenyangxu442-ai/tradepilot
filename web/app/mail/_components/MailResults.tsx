'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Copy, ChevronDown, Download } from 'lucide-react';
import { exportMailHTML } from '@/lib/export-html';

interface MailResult {
  strategy: string;
  strategy_en: string;
  subject: string;
  body: string;
  translation: string;
}

export function MailResults({ results }: { results: { results: MailResult[] } }) {
  const downloadAll = () => {
    exportMailHTML(results);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground">{results.results.length} 封开发信</span>
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={downloadAll}>
          <Download className="h-3 w-3 mr-1" />下载全部
        </Button>
      </div>
      <div className="grid gap-4 grid-cols-1 xl:grid-cols-3">
        {results.results.map((r, i) => (
          <MailCard key={i} result={r} />
        ))}
      </div>
    </div>
  );
}

function MailCard({ result }: { result: MailResult }) {
  const [open, setOpen] = useState(false);

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} 已复制`);
  };

  return (
    <Card size="sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">{result.strategy}</Badge>
          <span className="text-[10px] text-muted-foreground">{result.strategy_en}</span>
        </div>
        <CardTitle className="text-sm font-semibold mt-1">{result.subject}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed line-clamp-6">
          {result.body}
        </p>
      </CardContent>
      <CardFooter className="flex gap-1 flex-wrap">
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => copyText(result.body, '正文')}>
          <Copy className="h-3 w-3 mr-1" />正文
        </Button>
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => copyText(`${result.body}\n\n${result.translation}`, '双语')}>
          <Copy className="h-3 w-3 mr-1" />双语
        </Button>
        <Collapsible open={open} onOpenChange={setOpen} className="w-full mt-1">
          <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground w-full">
            <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
            中文翻译
          </CollapsibleTrigger>
          <CollapsibleContent>
            <p className="text-xs text-muted-foreground whitespace-pre-line mt-2 leading-relaxed">
              {result.translation}
            </p>
          </CollapsibleContent>
        </Collapsible>
      </CardFooter>
    </Card>
  );
}
