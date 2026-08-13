'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { INDUSTRIES, CUSTOMER_TYPES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

const EXAMPLES = [
  {
    label: '五金厂 → 美国品牌商',
    data: { customer_info: '美国厨房用品品牌商采购总监，在找不锈钢餐具OEM供应商，关心FDA食品安全认证和独特外观设计，年采购量约200万美金', product_info: '浙江永康不锈钢餐具工厂，20年出口经验，通过FDA/LFGB认证，支持激光刻字和定制包装，MOQ 1000套，45天交期', industry: 'hardware', customer_type: 'brand' },
  },
  {
    label: '汽配厂 → 德国批发商',
    data: { customer_info: '德国汽车后市场批发商，需要OEM刹车片和刹车盘，月采购量5000套，非常在意IATF16949认证和E-mark认证，价格敏感但重视长期合作', product_info: '山东刹车片工厂，IATF16949认证，半金属/陶瓷配方可选，配套车型覆盖日系德系美系，实验室可做SAE J2521台架测试', industry: 'auto', customer_type: 'wholesale' },
  },
  {
    label: '家居厂 → 亚马逊大卖',
    data: { customer_info: '亚马逊美国站大卖家，月销3000件家居产品，在找北欧简约风LED台灯独家供应商，需要FBA-ready包装和UPC码，要求产品差异化避免跟卖', product_info: '中山LED台灯工厂，可做北欧/日式/工业风设计，3C+UL+CE认证齐全，支持丝印logo和定制色温，常备库存10000台可快速发货', industry: 'home', customer_type: 'amazon' },
  },
  {
    label: '电子厂 → 中东贸易商',
    data: { customer_info: '迪拜贸易商，覆盖中东和北非市场，寻找TWS蓝牙耳机稳定供应商，要求高性价比，月订单10000台起，在意交期和售后保障', product_info: '深圳TWS耳机工厂，蓝牙5.3芯片，ENC通话降噪，续航6+30小时，可定制充电仓外观和包装，CE/RoHS/FCC认证齐全', industry: 'electronics', customer_type: 'trader' },
  },
];

interface MailFormProps {
  onSubmit: (data: Record<string, string>) => void;
  loading: boolean;
  defaults?: Record<string, string>;
}

export function MailForm({ onSubmit, loading, defaults }: MailFormProps) {
  const [customerInfo, setCustomerInfo] = useState(defaults?.customer_info ?? '');
  const [productInfo, setProductInfo] = useState(defaults?.product_info ?? '');
  const [industry, setIndustry] = useState(defaults?.industry ?? 'hardware');
  const [customerType, setCustomerType] = useState(defaults?.customer_type ?? 'brand');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ customer_info: customerInfo, product_info: productInfo, industry, customer_type: customerType });
      }}
      className="flex flex-col gap-4"
    >
      {/* 示例 */}
      <div className="flex items-center gap-1.5 mb-1">
        <Sparkles className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className="text-xs text-muted-foreground">体验示例：</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {EXAMPLES.map((ex, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              setCustomerInfo(ex.data.customer_info);
              setProductInfo(ex.data.product_info);
              setIndustry(ex.data.industry);
              setCustomerType(ex.data.customer_type);
            }}
            className="text-xs px-2.5 py-1.5 rounded-full border bg-card hover:bg-accent hover:border-black/30 transition-colors text-left leading-relaxed"
          >
            {ex.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">客户情报 <span className="text-muted-foreground font-normal">（公司、职位、痛点…）</span></label>
        <Textarea
          placeholder="e.g. Amazon seller, sourcing kitchenware, needs unique designs..."
          rows={5}
          maxLength={2000}
          value={customerInfo}
          onChange={(e) => setCustomerInfo(e.target.value)}
        />
        <span className="text-xs text-muted-foreground self-end">{customerInfo.length}/2000</span>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">我方产品</label>
        <Textarea
          placeholder="Describe your product, factory strengths, MOQ, certifications..."
          rows={4}
          value={productInfo}
          onChange={(e) => setProductInfo(e.target.value)}
        />
      </div>

      <fieldset>
        <legend className="text-sm font-medium mb-2">所属行业</legend>
        <RadioGroup value={industry} onValueChange={setIndustry} className="grid grid-cols-5 gap-2">
          {INDUSTRIES.map((ind) => (
            <label
              key={ind.value}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg border p-2.5 cursor-pointer text-center text-sm transition-colors hover:bg-accent',
                industry === ind.value && 'border-black border-2 bg-accent'
              )}
            >
              <RadioGroupItem value={ind.value} className="sr-only" />
              {ind.label}
            </label>
          ))}
        </RadioGroup>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium mb-2">客户类型</legend>
        <RadioGroup value={customerType} onValueChange={setCustomerType} className="grid grid-cols-4 gap-2">
          {CUSTOMER_TYPES.map((ct) => (
            <label
              key={ct.value}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg border p-2.5 cursor-pointer text-center text-sm transition-colors hover:bg-accent',
                customerType === ct.value && 'border-black border-2 bg-accent'
              )}
            >
              <RadioGroupItem value={ct.value} className="sr-only" />
              {ct.label}
            </label>
          ))}
        </RadioGroup>
      </fieldset>

      <Button type="submit" disabled={loading || !customerInfo.trim()} className="w-full">
        {loading ? '生成中…' : '生成开发信'}
      </Button>
    </form>
  );
}
