'use client';

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Copy, Download } from 'lucide-react';
import { exportExpoHTML } from '@/lib/export-html';

interface ExpoResult {
  product_card: { title: string; tagline: string; key_specs: string[]; usp: string[] };
  pricing: { fob_price: string; moq: string; sample_lead_time: string; bulk_lead_time: string };
  talking_points: { en: string[]; zh: string[] };
  objection_handlers: { if_buyer_says: string; you_respond: string }[];
}

export function ExpoResults({ results }: { results: { results: ExpoResult } }) {
  const r = results.results;

  const copyAll = () => {
    const text = [
      `# ${r.product_card.title}`,
      r.product_card.tagline,
      '',
      '## Key Specs',
      ...r.product_card.key_specs.map((s) => `- ${s}`),
      '',
      '## USPs',
      ...r.product_card.usp.map((u) => `- ${u}`),
      '',
      '## Pricing',
      `FOB Price: ${r.pricing.fob_price}`,
      `MOQ: ${r.pricing.moq}`,
      `Sample Lead Time: ${r.pricing.sample_lead_time}`,
      `Bulk Lead Time: ${r.pricing.bulk_lead_time}`,
      '',
      '## Talking Points (EN)',
      ...r.talking_points.en.map((t) => `- ${t}`),
      '',
      '## 中文话术',
      ...r.talking_points.zh.map((t) => `- ${t}`),
      '',
      '## Objection Handlers',
      ...r.objection_handlers.map((o) => `Q: ${o.if_buyer_says}\nA: ${o.you_respond}\n`),
    ].join('\n');
    navigator.clipboard.writeText(text);
    toast.success('展会话术已复制');
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>{r.product_card.title}</CardTitle>
          <p className="text-sm text-muted-foreground">{r.product_card.tagline}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold mb-1.5">Key Specs</h3>
            <div className="flex flex-wrap gap-1.5">
              {r.product_card.key_specs.map((s, i) => (
                <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-1.5">USPs</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-0.5">
              {r.product_card.usp.map((u, i) => <li key={i}>{u}</li>)}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Pricing</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-muted-foreground">FOB Price:</span> <span className="font-medium">{r.pricing.fob_price}</span></div>
            <div><span className="text-muted-foreground">MOQ:</span> <span className="font-medium">{r.pricing.moq}</span></div>
            <div><span className="text-muted-foreground">Sample Lead:</span> <span>{r.pricing.sample_lead_time}</span></div>
            <div><span className="text-muted-foreground">Bulk Lead:</span> <span>{r.pricing.bulk_lead_time}</span></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Talking Points</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground mb-1.5">English</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                {r.talking_points.en.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground mb-1.5">中文</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                {r.talking_points.zh.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Objection Handlers</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {r.objection_handlers.map((o, i) => (
            <div key={i}>
              <p className="text-sm font-medium text-destructive">❓ {o.if_buyer_says}</p>
              <p className="text-sm text-muted-foreground mt-0.5">✅ {o.you_respond}</p>
              {i < r.objection_handlers.length - 1 && <Separator className="mt-2" />}
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={copyAll}>
              <Copy className="h-3 w-3 mr-1" />复制全文
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportExpoHTML(results)}>
              <Download className="h-3 w-3 mr-1" />下载 HTML
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
