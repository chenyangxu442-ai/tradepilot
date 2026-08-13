'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { EXPO_SCENARIOS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

const EXAMPLES = [
  {
    label: '广交会客户压价',
    data: {
      scenario: 'price_change',
      product_info: '304不锈钢厨房水槽 双槽800×450mm，FOB $45/pc，MOQ 200pcs，常规交期45天',
      change_details: '广交会现场客户要求批量折扣：1000pcs → 目标$38/pc。同时要求加快交期到30天。需要计算利润空间和给客户的还价方案（如4200pcs → $40/pc）。',
    },
  },
  {
    label: '德国客户换材质配置',
    data: {
      scenario: 'config_change',
      product_info: '不锈钢201材质置物架 三层60×30×80cm，FOB $12/pc，表面拉丝处理',
      change_details: '德国客户要求把201不锈钢换成304不锈钢，每层加高5cm，表面改镜面抛光，加防滑脚垫。需确认加价幅度和交期延长天数。',
    },
  },
  {
    label: '展会临时推新品',
    data: {
      scenario: 'new_product',
      product_info: '新开发的折叠露营椅，铝合金骨架+600D牛津布，承重150kg，自重仅1.2kg，折叠后40×15cm',
      change_details: '展会第二天客户对新品反馈积极，但需要快速报价：MOQ 1000pcs FOB价格、包装方案（单个彩盒还是5个一箱）、CE认证情况、打样时间。关键词：轻量化、便携、户外。',
    },
  },
  {
    label: '客户现场要报价',
    data: {
      scenario: 'urgent_quote',
      product_info: 'CNC精密加工铝合金件，公差±0.02mm，年需求50000pcs，图纸已发',
      change_details: '香港电子展客户现场拿了图纸过来，需要当场出PI：CNC铝合金壳体+阳极氧化，5款不同尺寸，合计2000pcs试单，FOB深圳，T/T付款，需标注模具分摊费。',
    },
  },
];

export function ExpoForm({ onSubmit, loading }: { onSubmit: (data: Record<string, string>) => void; loading: boolean }) {
  const [scenario, setScenario] = useState('price_change');
  const [productInfo, setProductInfo] = useState('');
  const [changeDetails, setChangeDetails] = useState('');

  const fill = (ex: typeof EXAMPLES[number]) => {
    setScenario(ex.data.scenario);
    setProductInfo(ex.data.product_info);
    setChangeDetails(ex.data.change_details);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ scenario, product_info: productInfo, change_details: changeDetails });
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

      <fieldset>
        <legend className="text-sm font-medium mb-2">展会场景</legend>
        <RadioGroup value={scenario} onValueChange={setScenario} className="grid grid-cols-2 gap-2">
          {EXPO_SCENARIOS.map((s) => (
            <label
              key={s.value}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg border p-3 cursor-pointer text-center text-sm transition-colors hover:bg-accent',
                scenario === s.value && 'border-black border-2 bg-accent'
              )}
            >
              <RadioGroupItem value={s.value} className="sr-only" />
              {s.label}
            </label>
          ))}
        </RadioGroup>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">产品信息</label>
        <Input
          placeholder="产品名称和基本信息…"
          value={productInfo}
          onChange={(e) => setProductInfo(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">变更详情</label>
        <Textarea
          placeholder="描述需要变更的内容：新价格、新配置、新产品详情…"
          rows={4}
          value={changeDetails}
          onChange={(e) => setChangeDetails(e.target.value)}
        />
      </div>

      <Button type="submit" disabled={loading || !productInfo.trim()} className="w-full">
        {loading ? '生成中…' : '生成展会话术'}
      </Button>
    </form>
  );
}
