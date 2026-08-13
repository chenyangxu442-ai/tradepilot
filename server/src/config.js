// ponytail: single local config file — API key lives here, never in the repo
const fs = require('fs');
const path = require('path');

const DEFAULT_PATH = path.resolve(__dirname, '..', 'config.json');

const DEFAULTS = {
  provider: 'openai',               // 'openai'（任意 OpenAI 兼容）| 'anthropic'（Claude）
  baseUrl: 'https://api.deepseek.com',
  model: 'deepseek-chat',
  apiKey: '',
};

function getConfigPath() {
  return process.env.CONFIG_PATH || DEFAULT_PATH;
}

function readConfig() {
  try {
    return { ...DEFAULTS, ...JSON.parse(fs.readFileSync(getConfigPath(), 'utf-8')) };
  } catch {
    return { ...DEFAULTS };
  }
}

function saveConfig(patch) {
  const cfg = { ...readConfig(), ...patch };
  fs.mkdirSync(path.dirname(getConfigPath()), { recursive: true });
  fs.writeFileSync(getConfigPath(), JSON.stringify(cfg, null, 2));
  return cfg;
}

function getApiKey() {
  return readConfig().apiKey || '';
}

module.exports = { getConfigPath, readConfig, saveConfig, getApiKey, DEFAULTS };
