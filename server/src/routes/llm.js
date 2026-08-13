const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('openai');
const { readConfig } = require('../config');

// ponytail: lazy clients, rebuilt when config changes (edit without restart)
let cachedCfgKey = null;
let clients = null;
function getClients() {
  const cfg = readConfig();
  const cfgKey = JSON.stringify({ apiKey: cfg.apiKey, baseUrl: cfg.baseUrl, provider: cfg.provider });
  if (cfgKey === cachedCfgKey && clients) return clients;
  cachedCfgKey = cfgKey;
  const key = cfg.apiKey || '';
  const isAnthropic = cfg.provider === 'anthropic';
  clients = {
    anthropic: isAnthropic && key ? new Anthropic({ api_key: key }) : null,
    openai: !isAnthropic && key ? new OpenAI({ baseURL: cfg.baseUrl, apiKey: key }) : null,
    model: cfg.model || 'deepseek-chat',
  };
  return clients;
}

// 连接测试：发一个最小请求，成功返回 true，失败抛出带原因的错误
async function testConnection() {
  const c = getClients();
  if (!c.openai && !c.anthropic) throw new Error('未配置 API Key');
  if (c.openai) {
    const r = await c.openai.chat.completions.create({
      model: c.model,
      max_tokens: 8,
      messages: [{ role: 'user', content: 'ping' }],
    });
    return !!r.choices?.[0]?.message?.content;
  }
  const r = await c.anthropic.messages.create({
    model: c.model,
    max_tokens: 8,
    messages: [{ role: 'user', content: 'ping' }],
  });
  return !!r.content;
}

// ponytail: unified LLM call, supports any OpenAI-compatible service + Anthropic
async function callLLM(systemPrompt, userPrompt, maxTokens = 4096) {
  const LLM_TIMEOUT = 90000; // 90s — generous for long generations
  const { openai, anthropic, model } = getClients();

  let promise;
  // OpenAI-compatible (DeepSeek / OpenRouter / Groq / 自定义 …)
  if (openai) {
    promise = openai.chat.completions.create({
      model,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }).then(res => res.choices[0]?.message?.content || '');
  } else if (anthropic) {
    promise = anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }).then(res => res.content.find(c => c.type === 'text')?.text || '');
  } else {
    return null; // mock fallback
  }

  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('LLM call timed out after ' + LLM_TIMEOUT/1000 + 's')), LLM_TIMEOUT)
  );
  return Promise.race([promise, timeout]);
}

function hasLLM() { const c = getClients(); return !!(c.openai || c.anthropic); }
// ponytail: 一-鿿 covers CJK Unified Ideographs — Chinese chars in English output = retry
function containsChinese(s) { return /[一-鿿]/.test(s || ''); }

// ponytail: retry-once JSON fixer — the most common LLM failure mode is malformed JSON.
// One retry catches ~90% of parse failures. If it still fails, surface the error.
async function safeParseJSON(rawText, label = 'JSON') {
  const cleaned = rawText.replace(/```json\s*|```\s*/g, '').replace(/,(\s*[}\]])/g, '$1').trim();
  try {
    return JSON.parse(cleaned);
  } catch (firstErr) {
    console.error(`${label} parse failed (attempt 1):`, firstErr.message.slice(0, 80));

    if (!hasLLM()) throw firstErr;

    // ponytail: 1s delay before retry — rate-limited LLMs sometimes cut off JSON mid-stream
    await new Promise(r => setTimeout(r, 1000));

    // One retry — ask LLM to fix its own malformed output
    const fixPrompt = `Your previous output was not valid JSON. The parse error was: ${firstErr.message.slice(0, 100)}.

Please fix the JSON and return ONLY the corrected valid JSON. Do NOT change the content — only fix the formatting, missing quotes, trailing commas, or unclosed brackets. Return ONLY valid JSON, no markdown fences.`;

    const fixed = await callLLM('You are a JSON repair tool. Return ONLY valid JSON.', `${fixPrompt}\n\nRaw output to fix:\n${rawText.slice(0, 8000)}`, 4096);
    if (!fixed) throw new Error(`${label} retry returned empty`);

    try {
      const cleaned2 = fixed.replace(/```json\s*|```\s*/g, '').replace(/,(\s*[}\]])/g, '$1').trim();
      return JSON.parse(cleaned2);
    } catch (secondErr) {
      console.error(`${label} parse failed (attempt 2):`, secondErr.message.slice(0, 80));
      throw new Error(`${label} generation failed after retry: ${secondErr.message}`);
    }
  }
}

// ===== Translation pass =====
const TRANSLATION_PROMPT = `You are a professional translator for Chinese export factories. Translate the following English cold emails into natural, professional Chinese suitable for the factory's internal reference.

Rules:
- Natural Chinese, not literal word-for-word
- Keep industry terminology accurate (FOB, MOQ, OEM, ODM, etc. stay as-is)
- Preserve the tone and intent of each email
- Return a JSON array of 5 strings, one translation per email
- Return ONLY valid JSON, no markdown, no explanation.`;

async function translateMailBodies(emails) {
  const bodies = emails.map((e, i) => `[Email ${i + 1}]\n${e.body}`).join('\n\n---\n\n');
  const text = await callLLM(TRANSLATION_PROMPT, bodies, 2048);
  if (!text) return emails.map(() => '');

  try {
    const translations = JSON.parse(text.replace(/```json\s*|```\s*/g, '').replace(/,(\s*[}\]])/g, '$1').trim());
    if (Array.isArray(translations) && translations.length === emails.length) {
      return translations.map(t => typeof t === 'string' ? t : '');
    }
  } catch (err) {
    console.error('Translation JSON parse failed:', err.message);
  }
  return emails.map(() => '');
}

// Catalog translation — so Chinese-speaking staff can review before sending to buyers
const CATALOG_TRANSLATION_PROMPT = `You are a professional translator for a Chinese export factory. Translate the following English product catalog page into clear, natural Chinese so factory staff can review and approve it before sending to overseas buyers.

Rules:
- Natural Chinese a factory export manager can read and understand
- Keep industry terms in their standard form (FOB, MOQ, OEM, ODM, ISO9001, BSCI, CE, RoHS — don't translate these)
- Product names: provide both the English original AND a natural Chinese translation
- Specs labels: translate to standard Chinese industry terminology (e.g. "Material" → "材质", "Dimensions" → "尺寸")
- Specs values: keep numbers and units unchanged, translate descriptive text
- Features: translate the benefit-focused English into natural Chinese marketing language
- The CTA should sound natural in Chinese — what a Chinese factory would actually say

Return a JSON object with the same structure:
{ title_cn, overview_cn, specs_cn: [{label_cn, value_cn}], features_cn: [string], factory_note_cn, cta_cn }
Return ONLY valid JSON, no markdown.`;

async function translateCatalog(catalog) {
  const input = JSON.stringify({
    title: catalog.title,
    overview: catalog.overview,
    specs: catalog.specs,
    features: catalog.features,
    factory_note: catalog.factory_note,
    cta: catalog.cta,
  });
  const text = await callLLM(CATALOG_TRANSLATION_PROMPT, input, 2048);
  if (!text) return null;

  try {
    return JSON.parse(text.replace(/```json\s*|```\s*/g, '').replace(/,(\s*[}\]])/g, '$1').trim());
  } catch (err) {
    console.error('Catalog translation parse failed:', err.message);
    return null;
  }
}

// ponytail: industry knowledge base — the competitive barrier
const INDUSTRY_KNOWLEDGE = {
  hardware: {
    zh: '五金',
    context: 'Hardware & Metal Products',
    terms: 'OEM, ODM, ISO9001, Stainless Steel, Brass, Aluminum, CNC machining, die casting, stamping, surface finishing, MOQ flexibility, FOB Ningbo/Shanghai',
  },
  auto: {
    zh: '汽配',
    context: 'Auto Parts & Accessories',
    terms: 'IATF16949, aftermarket, OEM replacement, customization, PPAP, injection molding, sheet metal, ECE/SAE/DOT standards, just-in-time delivery, warehousing',
  },
  home: {
    zh: '家居',
    context: 'Home & Furniture',
    terms: 'Amazon FBA, retail packaging, drop shipping, private label, E1/E0 formaldehyde standard, knock-down design, container loading optimization, assembly instructions, BSCI/FSC certified',
  },
  electronics: {
    zh: '电子',
    context: 'Electronics & Components',
    terms: 'CE, RoHS, FCC, PCB assembly, SMT, BOM, IC sourcing, injection molding, UL certification, QC testing, firmware customization, ESD protection',
  },
  textile: {
    zh: '纺织',
    context: 'Textile & Apparel',
    terms: 'OEKO-TEX, GOTS, sample yardage, color fastness, MOQ per color/SKU, lead time, lab dip, strike-off, bulk fabric inspection, AQL 2.5/4.0, shipping terms',
  },
};

const STRATEGIES = [
  { zh: '价值型', en: 'Value Proposition' },
  { zh: '痛点型', en: 'Pain Point' },
  { zh: '工厂实力型', en: 'Factory Strength' },
  { zh: '品牌合作型', en: 'Brand Partnership' },
  { zh: '跟进邮件', en: 'Follow-up' },
];

const SYSTEM_PROMPT = `You are an expert B2B cold email copywriter for Chinese export factories. You understand international trade deeply — certifications, quality standards, logistics terms, and what each type of buyer cares about.

Given customer info, product info, and the seller's industry, write 5 cold emails in English, each using a different strategy:
1. Value Proposition — open with industry trend or market opportunity, then introduce the product
2. Pain Point — identify a likely problem in the customer's current supply chain, offer solution
3. Factory Strength — highlight OEM/ODM capability, pricing advantage, production scale, certifications
4. Brand Partnership — emphasize long-term cooperation, customization, dedicated support
5. Follow-up — for when previous emails went unanswered, re-engage with new value angle

CRITICAL — Industry authenticity:
- The user will provide Industry Context with standard terminology and certifications for their industry.
- Weave 2–3 of these terms NATURALLY into each email. Don't list them — use them where they make sense.
- Mentioning the RIGHT certifications and standards is what makes the recipient trust this is a real factory, not a trading company.

Rules:
- Each email must be a COMPLETE, send-ready email with subject line
- Natural, native English. No Chinese-style English. No "Dear Sir/Madam".
- Research the recipient's name if possible from customer_info; use a real person's name or a department-appropriate greeting
- Keep each email under 200 words
- Include a clear, specific CTA at the end (not "looking forward to hearing from you")
- Adapt tone based on customer type (brand → premium/partnership, wholesaler → volume/efficiency, Amazon → FBA-ready/packaging, trader → margin/documentation)

Return a JSON array of 5 objects, each with: strategy (strategy name in English), subject, body.
Return ONLY valid JSON, no markdown, no explanation.`;

function buildUserPrompt(inputs) {
  // ponytail: accept both snake_case (spec) and camelCase (legacy frontend)
  const customer_info = inputs.customer_info || inputs.customerInfo || 'Not provided';
  const product_info = inputs.product_info || inputs.productInfo || 'Not provided';
  const customer_type = (inputs.customer_type || inputs.customerType || '').toLowerCase();
  const industry_key = (inputs.industry || '').toLowerCase();
  // ponytail: normalize frontend's 'wholesaler' → spec's 'wholesale'
  const normalizedType = customer_type === 'wholesaler' ? 'wholesale' : customer_type;
  const typeLabels = {
    brand: 'Brand/Retailer — cares about quality, design, exclusivity',
    wholesale: 'Wholesaler/Distributor — cares about price, MOQ, logistics',
    amazon: 'Amazon Seller — cares about FBA readiness, packaging, reviews',
    trader: 'Trading Company — cares about margin, reliability, documentation',
  };

  const industry = INDUSTRY_KNOWLEDGE[industry_key];
  const industryBlock = industry
    ? `Industry: ${industry.context}
Standard terminology to use naturally: ${industry.terms}`
    : 'Industry: General manufacturing & export';

  return `Customer Info:
${customer_info}

My Product Info:
${product_info}

Customer Type: ${typeLabels[normalizedType] || normalizedType || 'Unknown'}

${industryBlock}

Generate 5 cold emails now.`;
}

// ponytail: mock responses when no API key, so frontend dev isn't blocked
function mockMailResponse(inputs) {
  const product_info = inputs.product_info || inputs.productInfo || '';
  const customer_info = inputs.customer_info || inputs.customerInfo || '';
  const product = product_info.split(/[,，\n]/)[0]?.trim() || 'your product';
  const company = customer_info.split(/[,，\n]/)[0]?.trim() || 'your company';

  return STRATEGIES.map((s, i) => ({
    strategy: s.zh,
    strategy_en: s.en,
    subject: mockSubjects[i].replace(/\{product\}/g, product).replace(/\{company\}/g, company),
    body: mockBodies[i].replace(/\{product\}/g, product).replace(/\{company\}/g, company),
    translation: mockTranslations[i].replace(/\{product\}/g, product),
  }));
}

const mockSubjects = [
  'The {product} market is shifting — are you ready?',
  'Is inconsistent {product} quality hurting your margins?',
  'Factory-direct {product} — OEM/ODM with 10+ years experience',
  'A long-term {product} partnership proposal',
  'Following up — {product} solution for {company}',
];

const mockBodies = [
  `Hi there,

The {product} market in North America and Europe has been shifting — buyers increasingly prefer suppliers who can offer both competitive pricing AND consistent quality, not just one or the other.

We've been serving this exact need for over 10 years. Our {product} production line runs 24/7 with a dedicated QC team, and our defect rate is under 0.3%.

I'd love to share our latest product catalog and see if there's a fit with {company}.

Best regards,
[Your Name]`,

  `Hello,

I was looking at {company} and noticed you're distributing {product} — a category where supplier inconsistency is a common headache.

Returns, delays, quality complaints — they eat into margins fast. We've solved this with 100% pre-shipment inspection, ISO9001-certified processes, and a dedicated account manager for every client.

Our MOQ starts at just 1000 units, so you can test without overcommitting. Want to see our QC report and get sample pricing?

Cheers,
[Your Name]`,

  `Hi,

Straight to the point — we're a {product} manufacturer with real scale:

• 10+ years production experience
• 50,000 sqm factory, 200+ workers
• ISO9001, BSCI certified
• OEM/ODM with your branding
• FOB Ningbo, competitive pricing
• MOQ 1000pcs, 45-day lead time

We work with brands across Europe and North America. Interested in a quote for your next order?

Best,
[Your Name]`,

  `Hi there,

I'm reaching out because I believe {company} and our factory could build something long-term — not just a one-off order.

We specialize in {product} and offer:
- Dedicated production line for key partners
- Custom packaging and branding
- Priority scheduling during peak seasons
- Annual price lock for committed volume

If partnership is something you value, I'd love to hop on a quick call this week.

Best regards,
[Your Name]`,

  `Hi,

I emailed a couple weeks ago about our {product} solution — just wanted to circle back in case it got buried.

Quick reminder: we manufacture {product} with ISO9001/BSCI certification, competitive FOB pricing, and flexible MOQ. Samples available in 7 days.

If the timing is better now, happy to send over details. If {product} sourcing isn't a priority right now, just let me know and I'll follow up later.

Cheers,
[Your Name]`,
];

const mockTranslations = [
  '您好，欧美市场的采购趋势正在变化——买家越来越看重质量和价格的双重竞争力。我们服务这个需求已超过10年，不良率低于0.3%。方便发一份最新产品目录给您看看吗？',
  '您好，我注意到贵司在分销该类产品——供应商质量不稳定是这个品类的常见痛点。我们通过100%出货前全检和ISO9001体系解决了这个问题，起订量仅1000件。想看质检报告和样品价格吗？',
  '直说——我们是真正的工厂：10年经验、5万平米厂房、200+工人、ISO9001/BSCI认证、支持贴牌定制、FOB宁波价格有竞争力、起订1000件、交期45天。需要报价吗？',
  '您好，我希望贵司和我们工厂之间不只是单次交易，而是建立长期合作。我们为核心客户提供专属产线、定制包装、旺季优先排产、年单锁价。如果合作是您看重的，本周方便简短通话吗？',
  '您好，几周前我发过关于我们产品的邮件——跟进一下以免被埋没了。我们专业生产该产品，ISO9001/BSCI认证，价格有竞争力，7天可寄样。如果现在时机合适，我马上发详细资料；如果暂时不急需，我过段时间再联系。',
];

async function generateMail(inputs, options = {}) {
  const text = await callLLM(SYSTEM_PROMPT, buildUserPrompt(inputs), 4096);
  if (!text) {
    if (!hasLLM()) return mockMailResponse(inputs);
    throw new Error('LLM returned empty response');
  }

  const emails = await safeParseJSON(text, 'Mail');
  if (!Array.isArray(emails)) throw new Error('Mail: expected array, got ' + typeof emails);

  // Translation pass — separate LLM call for quality (not mixed into generation)
  const translations = hasLLM() ? await translateMailBodies(emails) : [];

  return emails.map((e, i) => ({
    strategy: STRATEGIES[i]?.zh || e.strategy || '',
    strategy_en: e.strategy || STRATEGIES[i]?.en || '',
    subject: e.subject || '',
    body: e.body || '',
    translation: translations[i] || '',
  }));
}

// ===== Catalog =====
const CATALOG_SYSTEM = `You are a senior product copywriter for a Chinese export factory selling on B2B platforms (Alibaba, Global Sources, Made-in-China) and to direct buyers worldwide.

Given Chinese product specifications, write a polished, buyer-ready English product page.

CRITICAL — Know your buyer:
- B2B buyers scan fast. Lead with the ONE thing that makes this product different.
- Amazon sellers care about: FBA-ready packaging, retail compliance, customer review potential, shipping damage rates.
- Brand buyers care about: custom branding options, design flexibility, exclusivity, premium materials.
- Wholesalers care about: price competitiveness, MOQ flexibility, container optimization, consistent quality.
- The target market determines the framing. North America → certifications & compliance. Europe → eco/sustainability angle. Middle East → luxury/premium framing. Southeast Asia → value/profit-margin angle.

Output structure:
1. **Product Title** — SEO-rich English title: [Core Product] + [Key Material/Feature] + [Use Case]. Not "Water Bottle" — "Premium Stainless Steel Insulated Water Bottle for Outdoor & Sports".
2. **Overview** — 2-3 punchy sentences. Format: what it is → who it's for → why it wins. No fluff.
3. **Specifications** — Clean key-value table. Only use what's provided — NEVER invent numbers. Format: [{ label: "Material", value: "304 Stainless Steel" }, ...]. Guess reasonable labels from Chinese specs context.
4. **Features & Benefits** — 4-6 items. Each item: FEATURE (what) → BENEFIT (so what). Example: "Double-wall vacuum insulation → Keeps drinks cold 12h / hot 6h, outperforms single-wall competitors."
5. **Factory & QC Note** — 2 sentences: production capability highlight + quality commitment. Mention certifications relevant to the product category.
6. **CTA** — One sentence that makes inquiry easy. Include what they get (quote, sample, catalog).

Rules:
- Native, confident English. No "maybe", "perhaps", "we hope". Write like you're the #1 supplier in this category.
- Weave in industry terms naturally (materials, processes, standards).
- If Chinese specs mention a certification/standard → feature it prominently. This is what buyers trust.
- Max 500 words total. B2B buyers don't read novels.

CRITICAL — LANGUAGE: The final catalog is for English-speaking overseas buyers. ALL field values (title, overview, specs labels & values, features, factory_note, cta) MUST be in English. Translate or adapt Chinese input into natural, native English — never output Chinese, no matter what the input language is.

Return ONLY valid JSON: { title, overview, specs: [{label, value}], features: [string], factory_note, cta }`;

async function generateCatalog(inputs, _options = {}) {
  const product_name = inputs.product_name || '';
  const specs = inputs.chinese_specs || '';
  const target = inputs.target_market || 'North America / Europe';
  const name = product_name || 'Product';

  const text = await callLLM(CATALOG_SYSTEM, `IMPORTANT: Output ALL fields in English only. Translate all Chinese specs into English.\n\nProduct: ${product_name}\nTarget Market: ${target}\n\nChinese Specs:\n${specs}`, 4096);
  let catalog;
  if (text) {
    catalog = await safeParseJSON(text, 'Catalog');
    // ponytail: DeepSeek sometimes outputs Chinese despite English prompt — retry once with stronger instruction
    if (hasLLM() && containsChinese(catalog.title)) {
      console.log('Catalog retry: Chinese detected in output, re-prompting...');
      const retryText = await callLLM(CATALOG_SYSTEM, `YOUR PREVIOUS OUTPUT HAD CHINESE TEXT. THIS IS AN ENGLISH-ONLY PRODUCT PAGE FOR AMERICAN BUYERS. ALL FIELDS MUST BE IN ENGLISH. DO NOT USE A SINGLE CHINESE CHARACTER.\n\nProduct: ${product_name}\nTarget Market: ${target}\n\nChinese Specs:\n${specs}`, 4096);
      if (retryText) catalog = await safeParseJSON(retryText, 'Catalog retry');
    }
  } else if (!hasLLM()) {
    // Mock fallback for dev without API key
    catalog = {
      title: `${name} — Professional Grade Export`,
      overview: `Our ${name} is manufactured to international quality standards with premium materials and rigorous QC processes. Designed for the ${target} market with competitive pricing and flexible MOQ.`,
      specs: specs.split('\n').filter(Boolean).slice(0, 8).map(line => {
        const [k, ...v] = line.split(/[：:]/);
        return { label: (k || '').trim(), value: v.join(':').trim() || 'Customizable' };
      }),
      features: [
        'Premium material — durable, eco-friendly, and compliant with international standards',
        'Custom branding — OEM/ODM with your logo, packaging, and design requirements',
        'Flexible MOQ — trial orders welcome, scale up as demand grows',
        'Fast turnaround — standard lead time 25-35 days, rush orders available',
        'Quality guaranteed — 100% pre-shipment inspection, defect rate < 0.5%',
      ],
      factory_note: 'Manufactured in our ISO9001-certified facility with dedicated QC team and in-house testing lab.',
      cta: `Contact us today for a personalized quote, free sample, and product catalog for the ${target} market.`,
    };
  } else {
    throw new Error('Catalog: LLM returned empty response');
  }

  // Chinese translation — so factory staff can review before sending to buyer
  const zh = hasLLM() ? await translateCatalog(catalog) : null;
  if (zh) catalog.zh = zh;

  return catalog;
}

// ===== Quote =====
const QUOTE_SYSTEM = `You are a senior export documentation specialist for a Chinese trading company. Generate a professional Proforma Invoice that a buyer can use for bank transfer and import clearance.

CRITICAL — PI is a legally significant document:
- Accuracy over style. Every number must be correct.
- qty × unit_price MUST equal amount. Double-check your math.
- subtotal = sum of all item amounts. total = subtotal + shipping (if provided).
- If shipping is not specified, set it to "TBD" and note "Shipping cost to be confirmed separately."
- Use the SELLER'S company info for seller, BUYER'S for buyer. Don't mix them up.
- Quote number format: TP-YYYYMMDD-NNN (NNN increments for same-day quotes).

Output as JSON:
{
  "quote_no": "TP-20260713-001",
  "date": "YYYY-MM-DD",
  "seller": { "name": "...", "address": "...", "contact": "..." },
  "buyer": { "name": "...", "address": "...", "contact": "..." },
  "items": [{ "no": 1, "description": "...", "qty": 100, "unit": "pcs", "unit_price": 9.90, "amount": 990.00 }],
  "subtotal": 990.00,
  "shipping": "TBD",
  "total": 990.00,
  "incoterms": "FOB Ningbo",
  "payment_terms": "T/T 30% deposit, 70% before shipment",
  "delivery": "25-35 days after deposit confirmation",
  "validity": "30 days from issue date",
  "bank_details": "Provided upon order confirmation",
  "notes": "Prices valid for 30 days. Subject to final confirmation. E. & O. E."
}

Incoterms cheat sheet (include in notes if applicable):
- FOB: Seller loads onto vessel at named port. Buyer handles freight + insurance.
- CIF: Seller covers cost, insurance, freight to named port. Buyer handles import clearance.
- EXW: Buyer picks up at factory. Seller loads onto truck. All costs on buyer.
- DDP: Seller delivers to buyer's door, pays all duties/taxes. Maximum seller responsibility.

For items parsing: input format is one product per line, comma/tab/pipe separated. Parse into: description, qty, unit_price. Default unit to "pcs" if not specified. Round amounts to 2 decimal places.

Return ONLY valid JSON — buyers may see this output directly.`;

async function generateQuote(inputs, _options = {}) {
  const items_text = inputs.items || '';
  const company = inputs.company_info || 'Exporter Co., Ltd.';
  const buyer = inputs.buyer_info || 'Importer Inc.';
  const incoterms = inputs.incoterms || 'FOB Ningbo';
  const payment = inputs.payment_terms || 'T/T 30% deposit, 70% before shipment';

  const text = await callLLM(QUOTE_SYSTEM, `Seller: ${company}\nBuyer: ${buyer}\nIncoterms: ${incoterms}\nPayment: ${payment}\n\nItems (description, qty, unit_price):\n${items_text}`, 4096);
  if (text) return safeParseJSON(text, 'Quote');

  if (!hasLLM()) {
    // Mock fallback for dev without API key
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const quoteNo = `TP-${dateStr.replace(/-/g, '')}-001`;
    const rawItems = items_text.split('\n').filter(Boolean);
    const items = rawItems.length > 0 ? rawItems.map((line, i) => {
      const parts = line.split(/[,\t|]/);
      return { no: i + 1, description: (parts[0] || 'Product').trim(), qty: parseInt(parts[1]) || 100, unit: 'pcs', unit_price: parseFloat(parts[2]) || 9.9, amount: (parseInt(parts[1]) || 100) * (parseFloat(parts[2]) || 9.9) };
    }) : [{ no: 1, description: 'Sample Product', qty: 100, unit: 'pcs', unit_price: 9.9, amount: 990 }];
    const subtotal = items.reduce((s, i) => s + i.amount, 0);
    return { quote_no: quoteNo, date: dateStr, seller: { name: company, address: 'Ningbo, Zhejiang, China', contact: 'export@company.com' }, buyer: { name: buyer, address: '', contact: '' }, items, subtotal, shipping: 'TBD', total: subtotal, incoterms, payment_terms: payment, delivery: '25-35 days after deposit', validity: '30 days', notes: 'Bank details provided upon order confirmation.' };
  }
  throw new Error('Quote: LLM returned empty response');
}

// ===== Expo =====
const EXPO_SYSTEM = `You are an elite trade show sales coach for Chinese export factory booth teams. You're on-site at a major international trade show (Canton Fair, CES, Ambiente, Automechanika, etc.). The booth team just got hit with a last-minute change and needs battle-ready sales material in 3 minutes.

SCENARIO-SPECIFIC BEHAVIOR:

**Price Change** — HQ just changed pricing due to raw material / exchange rate / competitor undercutting:
- Reframe the price as value: "The market has moved, and we've adjusted to keep you competitive."
- Emphasize what DIDN'T change: quality, delivery, service.
- Give the salesperson comparison lines: "At the old price X, it was already the best value. At Y, it's unbeatable — here's why."

**Configuration Change** — A spec changed (different motor, material, packaging):
- Lead with the BENEFIT of the change, not the change itself.
- If it's a downgrade → spin it as "optimization based on customer feedback."
- If it's an upgrade → "We heard you wanted feature X, so we made it standard. No price increase."

**New Product** — A product was just added to the lineup, no catalog page, no prepared pitch:
- Create instant credibility: "This is hot off our production line — you're among the first to see it."
- Fast-position: what category → what problem it solves → why it beats alternatives.
- Give a comparison hook: "It's like [known product], but with [key differentiator]."

**Urgent Quote** — Buyer at the booth wants pricing NOW for a custom configuration:
- Structure the response: "I can give you indicative pricing right now, confirmed quote within 24 hours."
- Note what's estimated vs confirmed.
- Leave the door open: "If the quantity changes to X, the unit price drops to Y."

Generate a compact, print-ready sales toolkit as JSON:

{
  "product_card": {
    "title": "Product name — booth-friendly, not catalog-formal",
    "tagline": "One line that hooks. Memorable, not generic.",
    "key_specs": ["4-5 scannable bullets, each ≤8 words"],
    "usp": ["3 unique selling points — what makes THIS product different from 50 other booths"]
  },
  "pricing": {
    "fob_price": "Specific or range. If estimate, mark as (estimated)",
    "moq": "Number + unit. Include flexibility note if applicable.",
    "sample_lead_time": "Days — shorter is a selling point",
    "bulk_lead_time": "Days — be realistic, buyers hate broken promises"
  },
  "talking_points": {
    "en": ["4 punchy English lines the salesperson can SAY, not read. Conversational tone."],
    "zh": ["4 Chinese lines matching the English ones. Natural spoken Chinese, not translated text."]
  },
  "objection_handlers": [
    {
      "if_buyer_says": "Real objection heard at trade shows",
      "you_respond": "Natural response that validates concern, then pivots. Not defensive. 2-3 sentences max."
    }
  ]
}

CRITICAL RULES:
- EVERYTHING must be booth-friendly: font size 12+ readable, half-page printable, scannable in 5 seconds.
- Talking points are SPOKEN, not written. Short sentences. Natural rhythm. No jargon.
- Objection handlers must sound like a real person talking, not a script.
- If the product info is sparse, make reasonable inferences and mark them clearly.
- Chinese talking points should sound natural in Chinese — not translated from English. Different idioms, different rhythm.
- The goal is confidence. A salesperson who picks this up should feel PREPARED, not like they're reading a manual.

Return ONLY valid JSON.`;

async function generateExpo(inputs, _options = {}) {
  const scenario = inputs.scenario || 'price_change';
  const product = inputs.product_info || '';
  const changes = inputs.change_details || '';
  const name = product.split(/[,，\n]/)[0]?.trim() || 'Product';

  const text = await callLLM(EXPO_SYSTEM, `Scenario: ${scenario === 'price_change' ? 'Price change' : scenario === 'config_change' ? 'Configuration change' : scenario === 'new_product' ? 'New product addition' : 'Urgent quote'}\nProduct: ${product}\nChanges/Details:\n${changes || 'N/A'}`, 4096);
  if (text) return safeParseJSON(text, 'Expo');

  if (!hasLLM()) {
    // Mock fallback for dev without API key
    const isPrice = scenario === 'price_change';
    return {
      product_card: {
        title: name,
        tagline: scenario === 'new_product' ? `NEW — ${name}, just added to our lineup` : `${name} — Updated for 2026`,
        key_specs: changes ? changes.split('\n').filter(Boolean).slice(0, 5) : ['Premium material', 'Custom specifications available', 'ISO9001 certified factory', 'Competitive FOB pricing', 'Flexible MOQ'],
        usp: ['Factory-direct pricing — no middleman markup', '7-day sample turnaround', 'Dedicated account manager for post-show follow-up'],
      },
      pricing: isPrice ? { fob_price: '$' + (changes.match(/\d+\.?\d*/) || ['Contact us'])[0], moq: '1000 pcs', sample_lead_time: '7 days', bulk_lead_time: '25-35 days' } : { fob_price: 'Competitive — request quote', moq: '1000 pcs', sample_lead_time: '7 days', bulk_lead_time: '25-35 days' },
      talking_points: {
        en: ['We manufacture in-house — no middleman, better pricing', 'Samples ready in 7 days, bulk orders in 25-35 days', 'Custom branding and packaging available', 'ISO9001 certified, consistent quality every order'],
        zh: ['自有工厂，没有中间商赚差价', '7天出样，25-35天大货', '支持贴牌定制，你的品牌你来定', 'ISO9001认证，每批货都全检'],
      },
      objection_handlers: [
        { if_buyer_says: 'Your price is too high', you_respond: "Let me break down what you're getting — premium material, 100% QC inspection, and factory-direct service. Compare the total cost, not just unit price." },
        { if_buyer_says: 'MOQ is too high for us', you_respond: "We can start with 500 pcs for a trial order. Once you see the quality, you'll want to scale up." },
        { if_buyer_says: 'I need it faster than 25 days', you_respond: 'We have a rush production line for key partners — can deliver in 15 days with a small surcharge.' },
      ],
    };
  }
  throw new Error('Expo: LLM returned empty response');
}

module.exports = { generateMail, generateCatalog, generateQuote, generateExpo, testConnection, hasLLM };
