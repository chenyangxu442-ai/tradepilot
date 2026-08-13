'use client';

import { useEffect, useState } from 'react';
import { KeyRound, Loader2, CheckCircle2, XCircle, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { getConfig, saveConfig, testConnection } from '@/lib/api';

// 常用 OpenAI 兼容服务商预设
const PRESETS: Record<string, { label: string; baseUrl: string; model: string; provider: string }> = {
  deepseek: { label: 'DeepSeek', baseUrl: 'https://api.deepseek.com', model: 'deepseek-chat', provider: 'openai' },
  openrouter: { label: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', model: 'openrouter/auto', provider: 'openai' },
  groq: { label: 'Groq', baseUrl: 'https://api.groq.com/openai/v1', model: 'llama-3.3-70b-versatile', provider: 'openai' },
  moonshot: { label: 'Kimi (Moonshot)', baseUrl: 'https://api.moonshot.cn/v1', model: 'moonshot-v1-8k', provider: 'openai' },
  custom: { label: '自定义 (OpenAI 兼容)', baseUrl: '', model: '', provider: 'openai' },
  anthropic: { label: 'Claude (Anthropic)', baseUrl: 'https://api.anthropic.com', model: 'claude-sonnet-4-6', provider: 'anthropic' },
};

export default function SettingsPage() {
  const [status, setStatus] = useState<'loading' | 'ready'>('loading');
  const [hasKey, setHasKey] = useState(false);

  const [provider, setProvider] = useState<'openai' | 'anthropic'>('openai');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [model, setModel] = useState('');

  const [company, setCompany] = useState({ name: '', address: '', contact: '' });

  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<null | { ok: boolean; error?: string }>(null);

  useEffect(() => {
    getConfig()
      .then((cfg) => {
        setHasKey(cfg.hasKey);
        setProvider(cfg.provider || 'openai');
        setBaseUrl(cfg.baseUrl || '');
        setModel(cfg.model || '');
        setCompany(cfg.company || { name: '', address: '', contact: '' });
        setStatus('ready');
      })
      .catch(() => setStatus('ready'));
  }, []);

  function applyPreset(key: string) {
    const p = PRESETS[key];
    if (!p) return;
    setProvider(p.provider as 'openai' | 'anthropic');
    if (p.baseUrl) setBaseUrl(p.baseUrl);
    if (p.model) setModel(p.model);
    setTestResult(null);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const cfg = await saveConfig({
        apiKey,
        provider,
        baseUrl,
        model,
        company: {
          name: company.name,
          address: company.address,
          contact: company.contact,
        },
      });
      setHasKey(cfg.hasKey);
      toast.success('配置已保存');
    } catch {
      toast.error('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    if (!apiKey && !hasKey) { toast.error('请先填写 API Key'); return; }
    setTesting(true);
    setTestResult(null);
    try {
      const r = await testConnection();
      if (r.ok) {
        setTestResult({ ok: true });
        toast.success('连接成功');
      } else {
        setTestResult({ ok: false, error: r.error || '连接失败' });
        toast.error(r.error || '连接失败');
      }
    } catch {
      setTestResult({ ok: false, error: '网络错误' });
      toast.error('测试失败');
    } finally {
      setTesting(false);
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <KeyRound className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold">AI 模型配置</p>
            <p className="text-sm text-muted-foreground">
              接入任意 OpenAI 兼容服务，或 Claude。Key 仅存本机。
            </p>
          </div>
        </div>
      </div>

      {/* 服务商 */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">服务商</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(PRESETS).map(([k, p]) => (
              <button
                key={k}
                onClick={() => applyPreset(k)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  (k === 'anthropic' && provider === 'anthropic')
                  || (k !== 'anthropic' && provider === 'openai' && baseUrl === p.baseUrl)
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/40'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={hasKey ? '留空则保持不变' : '粘贴你的 API Key'}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        {provider === 'openai' ? (
          <>
            <div>
              <label className="text-sm font-medium mb-2 block">Base URL</label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://api.deepseek.com"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">模型名</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="deepseek-chat"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
          </>
        ) : (
          <div>
            <label className="text-sm font-medium mb-2 block">模型名</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="claude-sonnet-4-6"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleTest}
              disabled={testing}
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
            >
              {testing ? '测试中…' : '测试连接'}
            </button>
            {testResult && (testResult.ok
              ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              : <XCircle className="h-4 w-4 text-destructive" />)}
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? '保存中…' : '保存'}
          </button>
        </div>
        {testResult && !testResult.ok && (
          <p className="text-xs text-destructive">{testResult.error}</p>
        )}
      </div>

      {/* 我的公司 */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">我的公司信息</h2>
        </div>
        <p className="text-xs text-muted-foreground -mt-2">
          生成开发信和报价单时自动填充，不用每次手输
        </p>
        <input
          type="text"
          value={company.name}
          onChange={(e) => setCompany({ ...company, name: e.target.value })}
          placeholder="公司名称，如 Foshan ABC HomeStyle Co., Ltd."
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
        <textarea
          value={company.address}
          onChange={(e) => setCompany({ ...company, address: e.target.value })}
          placeholder="地址（英文），如 No.18 Industrial Rd, Shunde, Foshan, Guangdong, China"
          rows={2}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none"
        />
        <input
          type="text"
          value={company.contact}
          onChange={(e) => setCompany({ ...company, contact: e.target.value })}
          placeholder="联系方式，如 Tel: +86-757-88888888"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-semibold mb-2">常见问题</h2>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>· DeepSeek / OpenRouter / Groq / Kimi 等任何 OpenAI 兼容接口都能接入</li>
          <li>· 接入后点「测试连接」确认 Key 有效</li>
          <li>· Key 和公司信息仅保存在本机，不会上传</li>
        </ul>
      </div>
    </div>
  );
}
