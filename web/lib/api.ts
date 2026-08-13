export async function generate(module: string, inputs: Record<string, string>) {
  let res: Response;
  try {
    res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ module, inputs }),
    });
  } catch {
    throw new Error('网络连接失败，请检查网络后重试');
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(body?.error || `请求失败 (${res.status})`);
  }
  return body;
}

export async function getConfig() {
  const res = await fetch('/api/config', { credentials: 'include' });
  if (!res.ok) throw new Error(`请求失败 (${res.status})`);
  return res.json();
}

export async function saveConfig(cfg: Record<string, unknown>) {
  const res = await fetch('/api/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(cfg),
  });
  if (!res.ok) throw new Error(`保存失败 (${res.status})`);
  return res.json();
}

export async function testConnection() {
  const res = await fetch('/api/test', { method: 'POST', credentials: 'include' });
  const body = await res.json().catch(() => ({}));
  return body;
}

// ponytail: trigger .txt download, no library needed
export function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
