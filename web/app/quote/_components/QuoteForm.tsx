'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

const INCOTERMS = ['FOB', 'CIF', 'EXW', 'CFR', 'DAP', 'DDP'];
const PAYMENT_TERMS = ['T/T 30% in advance, 70% against B/L copy', 'L/C at sight', 'T/T 100% in advance', '30% deposit, 70% before shipment', 'D/P at sight'];

const EXAMPLES = [
  {
    label: '五金配件 FOB上海',
    data: {
      company_info: 'Hangzhou Jinli Hardware Co., Ltd.\nNo.188 Moxibustion Road, Xiaoshan, Hangzhou, Zhejiang, China\nTel: +86-571-88886666',
      buyer_info: 'Global Tools Inc.\n1234 Industrial Blvd, Los Angeles, CA 90001, USA\nAttn: Mr. James Wilson',
      items: '304 Stainless Steel Hex Bolt M6×30mm, 10000 pcs, $0.15/pc\n304 Stainless Steel Nut M6, 10000 pcs, $0.06/pc\n304 Stainless Steel Flat Washer M6, 10000 pcs, $0.03/pc',
      incoterms: 'FOB',
      payment_terms: 'T/T 30% in advance, 70% against B/L copy',
    },
  },
  {
    label: '电子产品 CIF洛杉矶',
    data: {
      company_info: 'Shenzhen TopTech Electronics Co., Ltd.\n4F, Building A, Science Park, Nanshan, Shenzhen, China\nTel: +86-755-26669999',
      buyer_info: 'TechGear Distribution LLC\n5678 Commerce Dr, Los Angeles, CA 90058, USA\nAttn: Ms. Sarah Chen',
      items: 'Bluetooth Speaker BS-200, 500 pcs, $22.50/pc\nLED Desk Lamp LT-100, 300 pcs, $18.00/pc\nWireless Charger WC-50, 800 pcs, $8.50/pc',
      incoterms: 'CIF',
      payment_terms: 'L/C at sight',
    },
  },
  {
    label: '家居用品 EXW工厂价',
    data: {
      company_info: 'Foshan HomeStyle Furniture Co., Ltd.\nLecong Furniture Zone, Shunde, Foshan, Guangdong, China\nTel: +86-757-28883333',
      buyer_info: 'EuroHome Interiors B.V.\nMeubelstraat 42, 3011 Rotterdam, Netherlands\nAttn: Mr. Pieter van Dijk',
      items: 'Nordic Oak Dining Table 160×90cm, 50 pcs, $185/pc\nMatching Dining Chair, 200 pcs, $65/pc\nTV Cabinet 200cm Walnut, 30 pcs, $220/pc',
      incoterms: 'EXW',
      payment_terms: '30% deposit, 70% before shipment',
    },
  },
  {
    label: '纺织品 DAP迪拜',
    data: {
      company_info: 'Nantong TexPro Textile Co., Ltd.\nNo.88 Diehu Road, Nantong, Jiangsu, China\nTel: +86-513-85551111',
      buyer_info: 'Al-Mansoor General Trading LLC\nSheikh Zayed Road, P.O. Box 12345, Dubai, UAE\nAttn: Mr. Ahmed Al-Rashid',
      items: '100% Cotton Hotel Bed Sheet Set (King), 500 sets, $28/set\nCotton Bath Towel 70×140cm, 1000 pcs, $5.50/pc\nMicrofiber Pillow Case Pair, 800 sets, $3.20/set',
      incoterms: 'DAP',
      payment_terms: 'T/T 30% in advance, 70% against B/L copy',
    },
  },
];

export function QuoteForm({ onSubmit, loading }: { onSubmit: (data: Record<string, string>) => void; loading: boolean }) {
  const [companyInfo, setCompanyInfo] = useState('');
  const [buyerInfo, setBuyerInfo] = useState('');
  const [items, setItems] = useState('');
  const [incoterms, setIncoterms] = useState('FOB');
  const [paymentTerms, setPaymentTerms] = useState(PAYMENT_TERMS[0]);

  const fill = (ex: typeof EXAMPLES[number]) => {
    setCompanyInfo(ex.data.company_info);
    setBuyerInfo(ex.data.buyer_info);
    setItems(ex.data.items);
    setIncoterms(ex.data.incoterms);
    setPaymentTerms(ex.data.payment_terms);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ company_info: companyInfo, buyer_info: buyerInfo, items, incoterms, payment_terms: paymentTerms });
      }}
      className="flex flex-col gap-4"
    >
      <div className="flex items-center gap-1.5 mb-1">
        <Sparkles className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className="text-xs text-muted-foreground">体验示例：</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {EXAMPLES.map((ex, i) => (
          <button key={i} type="button" onClick={() => fill(ex)}
            className="text-xs px-2.5 py-1.5 rounded-full border bg-card hover:bg-accent hover:border-black/30 transition-colors">
            {ex.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">卖方信息</label>
        <Input
          placeholder="Your company name, address, contact…"
          value={companyInfo}
          onChange={(e) => setCompanyInfo(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">买方信息</label>
        <Input
          placeholder="Buyer company name, address…"
          value={buyerInfo}
          onChange={(e) => setBuyerInfo(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">产品明细</label>
        <Textarea
          placeholder="产品名称、规格、数量、单价…每行一个产品"
          rows={5}
          value={items}
          onChange={(e) => setItems(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">贸易术语</label>
        <div className="flex flex-wrap gap-2">
          {INCOTERMS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setIncoterms(t)}
              className={`px-3 py-2 rounded-md border text-sm transition-colors ${
                incoterms === t ? 'border-black border-2 bg-accent' : 'hover:bg-accent'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">付款方式</label>
        <div className="flex flex-col gap-2">
          {PAYMENT_TERMS.map((p) => (
            <label
              key={p}
              className={`flex items-center gap-2 rounded-md border px-3 py-2.5 text-sm cursor-pointer transition-colors ${
                paymentTerms === p ? 'border-black border-2 bg-accent' : 'hover:bg-accent'
              }`}
            >
              <input
                type="radio"
                name="payment-terms"
                checked={paymentTerms === p}
                onChange={() => setPaymentTerms(p)}
                className="sr-only"
              />
              {p}
            </label>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={loading || !companyInfo.trim() || !buyerInfo.trim() || !items.trim()} className="w-full">
        {loading ? '生成中…' : '生成报价单 / PI'}
      </Button>
    </form>
  );
}
