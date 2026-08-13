const { Router } = require('express');
const { generateMail, generateCatalog, generateQuote, generateExpo, testConnection, hasLLM } = require('./llm');
const config = require('../config');

const router = Router();

const MAX_INPUT = 3000;
const MODULES = ['mail', 'catalog', 'quote', 'expo'];

// 把「我的公司」注入生成输入（用户没填 company_info 时自动带出）
function injectCompany(inputs) {
  const { company } = config.readConfig();
  if (!company) return inputs;
  const { name = '', address = '', contact = '' } = company;
  const block = [name, address, contact].filter(Boolean).join('\n');
  if (!block) return inputs;
  if (!inputs.company_info && !inputs.companyInfo) {
    return { ...inputs, company_info: block };
  }
  return inputs;
}

// POST /api/generate — 单机版核心，无账号无限流
router.post('/generate', async (req, res) => {
  const { module, inputs = {}, options = {} } = req.body;

  if (!module || !MODULES.includes(module)) {
    return res.status(400).json({ success: false, error: 'Invalid module' });
  }

  // ponytail: prevent fat-finger/abuse
  for (const [key, val] of Object.entries(inputs)) {
    if (typeof val === 'string' && val.length > MAX_INPUT) {
      return res.status(400).json({ success: false, error: `${key} too long (max ${MAX_INPUT} chars)` });
    }
  }

  try {
    const filled = injectCompany(inputs);
    let results;
    switch (module) {
      case 'mail': results = await generateMail(filled, options); break;
      case 'catalog': results = await generateCatalog(filled, options); break;
      case 'quote': results = await generateQuote(filled, options); break;
      case 'expo': results = await generateExpo(filled, options); break;
    }
    res.json({ success: true, module, results, isMock: !hasLLM() });
  } catch (err) {
    console.error('Generate error:', err.message);
    res.status(500).json({ success: false, error: err.message || 'Generation failed, please try again' });
  }
});

// GET /api/config — 返回配置状态，绝不回传 key 明文
router.get('/config', (_req, res) => {
  const cfg = config.readConfig();
  const hasKey = !!cfg.apiKey;
  res.json({
    hasKey,
    provider: cfg.provider,
    baseUrl: hasKey ? cfg.baseUrl : null,
    model: hasKey ? cfg.model : null,
    company: cfg.company || null,
  });
});

// POST /api/config — 保存配置（apiKey / provider / baseUrl / model / company）
router.post('/config', (req, res) => {
  const { apiKey, provider, baseUrl, model, company } = req.body || {};

  const patch = {};
  if (typeof apiKey === 'string') patch.apiKey = apiKey.trim();
  if (provider === 'openai' || provider === 'anthropic') patch.provider = provider;
  if (typeof baseUrl === 'string' && baseUrl.trim()) patch.baseUrl = baseUrl.trim();
  if (typeof model === 'string' && model.trim()) patch.model = model.trim();
  if (company && typeof company === 'object') {
    patch.company = {
      name: (company.name || '').trim(),
      address: (company.address || '').trim(),
      contact: (company.contact || '').trim(),
    };
  }

  const cfg = config.saveConfig(patch);
  res.json({
    success: true,
    hasKey: !!cfg.apiKey,
    provider: cfg.provider,
    baseUrl: cfg.baseUrl,
    model: cfg.model,
    company: cfg.company || null,
  });
});

// POST /api/test — 连接测试
router.post('/test', async (_req, res) => {
  try {
    const ok = await testConnection();
    res.json({ success: true, ok });
  } catch (err) {
    res.json({ success: false, ok: false, error: err.message });
  }
});

module.exports = router;
