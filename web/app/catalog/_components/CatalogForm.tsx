'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

const MARKETS = ['北美', '欧洲', '中东', '东南亚', '日韩', '拉美', '非洲', '全球'];

const EXAMPLES = [
  {
    label: 'TWS无线降噪耳机',
    data: {
      product_name: 'TWS ANC Wireless Earbuds Pro',
      chinese_specs: '蓝牙5.3芯片，主动降噪ANC，ENC通话降噪\n续航：耳机6小时+充电仓30小时\nIPX5防水，Type-C快充\n13mm动圈单元，AAC/SBC解码\n颜色：黑/白/蓝/粉\n配件：充电仓+Type-C线+3对耳塞\n包装：彩盒+塑封\n认证：CE/RoHS/FCC/BQB',
      target_market: '北美',
    },
  },
  {
    label: '不锈钢真空保温杯',
    data: {
      product_name: 'Stainless Steel Vacuum Insulated Water Bottle 500ml',
      chinese_specs: '316不锈钢内胆，真空双层结构\n容量500ml，保温12小时/保冷24小时\n食品级PP杯盖+硅胶密封圈\n直径6.8cm，高24cm，净重280g\n表面喷涂工艺，可定制颜色和logo\nBPA Free，FDA/LFGB认证\n常规包装：白盒/彩盒/礼盒可选\nMOQ 500个，交期30天',
      target_market: '欧洲',
    },
  },
  {
    label: 'LED智能落地灯',
    data: {
      product_name: 'Smart LED Floor Lamp with RGB & Dimmable',
      chinese_specs: 'LED光源 24W，色温2700K-6500K无极调光\nRGB彩光模式，App+语音控制(Alexa/Google)\n灯体高度180cm，铝合金+亚克力灯罩\n显色指数Ra>95，无频闪\n额定电压110-240V宽电压\n底座直径30cm，稳固防倾倒\n认证：CE/UL/ETL/FCC\n包装：珍珠棉+外箱，单件3.2kg',
      target_market: '东南亚',
    },
  },
  {
    label: '瑜伽垫TPE环保',
    data: {
      product_name: 'TPE Eco-Friendly Non-Slip Yoga Mat 6mm',
      chinese_specs: 'TPE环保材质，可回收降解\n尺寸183×61cm，厚度6mm\n双面防滑纹理，激光雕刻对齐线\n配收纳绑带+背包\nSGS无毒检测认证\n颜色可定制Pantone色\n常规单色/双色/渐变色\n高密度抗撕裂，净重1.2kg\nMOQ 300条，支持OEM/ODM',
      target_market: '日韩',
    },
  },
];

export function CatalogForm({ onSubmit, loading }: { onSubmit: (data: Record<string, string>) => void; loading: boolean }) {
  const [productName, setProductName] = useState('');
  const [chineseSpecs, setChineseSpecs] = useState('');
  const [targetMarket, setTargetMarket] = useState('北美');

  const fill = (ex: typeof EXAMPLES[number]) => {
    setProductName(ex.data.product_name);
    setChineseSpecs(ex.data.chinese_specs);
    setTargetMarket(ex.data.target_market);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ product_name: productName, chinese_specs: chineseSpecs, target_market: targetMarket });
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
        <label className="text-sm font-medium">产品名称</label>
        <Input
          placeholder="e.g. Stainless Steel Water Bottle 500ml"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">中文参数表</label>
        <Textarea
          placeholder="粘贴中文规格参数，AI 自动翻译为英文产品目录…"
          rows={6}
          value={chineseSpecs}
          onChange={(e) => setChineseSpecs(e.target.value)}
        />
      </div>

      <fieldset>
        <legend className="text-sm font-medium mb-2">目标市场</legend>
        <div className="flex flex-wrap gap-2">
          {MARKETS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setTargetMarket(m)}
              className={`px-3 py-2 rounded-md border text-sm transition-colors ${
                targetMarket === m ? 'border-black border-2 bg-accent' : 'hover:bg-accent'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </fieldset>

      <Button type="submit" disabled={loading || !productName.trim()} className="w-full">
        {loading ? '生成中…' : '生成产品目录'}
      </Button>
    </form>
  );
}
