'use client';

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Copy, Download } from 'lucide-react';
import { exportQuoteHTML } from '@/lib/export-html';

interface QuoteResult {
  quote_no: string;
  date: string;
  seller: { name: string; address: string; contact?: string };
  buyer: { name: string; address: string; contact?: string };
  items: { no: number; description: string; qty: number; unit: string; unit_price: number; amount: number }[];
  subtotal: number;
  shipping: string;
  total: number;
  incoterms: string;
  payment_terms: string;
  delivery: string;
  validity: string;
  notes: string;
}

export function QuoteResults({ results }: { results: { results: QuoteResult } }) {
  const r = results.results;

  const copyText = () => {
    const text = [
      `PROFORMA INVOICE`,
      `PI No: ${r.quote_no}`,
      `Date: ${r.date}`,
      '',
      `Seller: ${r.seller.name}`,
      r.seller.address,
      `Buyer: ${r.buyer.name}`,
      r.buyer.address,
      '',
      `| No | Description | Qty | Unit | Unit Price | Amount |`,
      `|-----|-------------|-----|------|------------|--------|`,
      ...r.items.map((i) => `| ${i.no} | ${i.description} | ${i.qty} | ${i.unit} | ${i.unit_price.toFixed(2)} | ${i.amount.toFixed(2)} |`),
      '',
      `Subtotal: ${r.subtotal.toFixed(2)}`,
      `Shipping: ${r.shipping}`,
      `Total: ${r.total.toFixed(2)}`,
      '',
      `Incoterms: ${r.incoterms}`,
      `Payment: ${r.payment_terms}`,
      `Delivery: ${r.delivery}`,
      `Validity: ${r.validity}`,
      `Notes: ${r.notes}`,
    ].join('\n');
    navigator.clipboard.writeText(text);
    toast.success('PI 已复制');
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-lg">PROFORMA INVOICE</CardTitle>
        <div className="flex justify-center gap-4 text-sm text-muted-foreground">
          <span>PI No: {r.quote_no}</span>
          <span>Date: {r.date}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold">Seller</p>
            <p className="text-muted-foreground">{r.seller.name}</p>
            <p className="text-muted-foreground text-xs">{r.seller.address}</p>
          </div>
          <div>
            <p className="font-semibold">Buyer</p>
            <p className="text-muted-foreground">{r.buyer.name}</p>
            <p className="text-muted-foreground text-xs">{r.buyer.address}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y">
                <th className="text-left py-1.5 pr-2">No</th>
                <th className="text-left py-1.5 pr-2">Description</th>
                <th className="text-right py-1.5 pr-2">Qty</th>
                <th className="text-left py-1.5 pr-2">Unit</th>
                <th className="text-right py-1.5 pr-2">Price</th>
                <th className="text-right py-1.5">Amount</th>
              </tr>
            </thead>
            <tbody>
              {r.items.map((item) => (
                <tr key={item.no} className="border-b border-border/50">
                  <td className="py-1.5 pr-2">{item.no}</td>
                  <td className="py-1.5 pr-2">{item.description}</td>
                  <td className="text-right py-1.5 pr-2">{item.qty}</td>
                  <td className="py-1.5 pr-2">{item.unit}</td>
                  <td className="text-right py-1.5 pr-2">{item.unit_price.toFixed(2)}</td>
                  <td className="text-right py-1.5">{item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end text-sm">
          <div className="space-y-1">
            <div className="flex justify-between gap-8"><span>Subtotal:</span><span className="font-medium">{r.subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between gap-8"><span>Shipping:</span><span>{r.shipping}</span></div>
            <Separator />
            <div className="flex justify-between gap-8 font-semibold"><span>Total:</span><span>{r.total.toFixed(2)}</span></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div><span className="text-muted-foreground">Incoterms:</span> <Badge variant="outline" className="text-xs">{r.incoterms}</Badge></div>
          <div><span className="text-muted-foreground">Payment:</span> <span className="text-xs">{r.payment_terms}</span></div>
          <div><span className="text-muted-foreground">Delivery:</span> <span className="text-xs">{r.delivery}</span></div>
          <div><span className="text-muted-foreground">Validity:</span> <span className="text-xs">{r.validity}</span></div>
        </div>
        {r.notes && <p className="text-sm text-muted-foreground">{r.notes}</p>}
      </CardContent>
      <CardFooter>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" onClick={copyText}>
            <Copy className="h-3 w-3 mr-1" />复制 PI
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportQuoteHTML(results)}>
            <Download className="h-3 w-3 mr-1" />下载 HTML
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
