import { Mail, BookOpen, DollarSign, HeartPulse } from "lucide-react";

export const MODULES = [
  { key: 'mail', label: 'ColdMail', sub: '开发信工厂', icon: Mail, href: '/mail' },
  { key: 'catalog', label: 'CatalogX', sub: '产品目录', icon: BookOpen, href: '/catalog' },
  { key: 'quote', label: 'PI Pilot', sub: '报价单 & PI', icon: DollarSign, href: '/quote' },
  { key: 'expo', label: 'ExpoKit', sub: '展会急救包', icon: HeartPulse, href: '/expo' },
] as const;

export const MODULE_TITLES: Record<string, { title: string; subtitle: string }> = {
  mail: { title: 'ColdMail', subtitle: '开发信工厂' },
  catalog: { title: 'CatalogX', subtitle: '产品目录生成器' },
  quote: { title: 'PI Pilot', subtitle: '报价单 & PI' },
  expo: { title: 'ExpoKit', subtitle: '展会急救包' },
  settings: { title: 'AI 设置', subtitle: 'API Key 配置' },
  about: { title: '关于', subtitle: 'TradePilot' },
};

export const INDUSTRIES = [
  { value: 'hardware', label: '五金' },
  { value: 'auto', label: '汽配' },
  { value: 'home', label: '家居' },
  { value: 'electronics', label: '电子' },
  { value: 'textile', label: '纺织' },
];

export const CUSTOMER_TYPES = [
  { value: 'brand', label: '品牌商' },
  { value: 'wholesale', label: '批发商' },
  { value: 'amazon', label: '亚马逊卖家' },
  { value: 'trader', label: '贸易商' },
];

export const EXPO_SCENARIOS = [
  { value: 'price_change', label: '现场调价' },
  { value: 'config_change', label: '更换配置' },
  { value: 'new_product', label: '临时加新品' },
  { value: 'urgent_quote', label: '紧急报价' },
];
