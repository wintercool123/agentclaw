/**
 * API 请求封装
 * 开发环境：走 Vite proxy → localhost:3001
 * 生产环境：直接请求 VITE_API_BASE_URL（Railway 域名）
 */

// __API_BASE__ is injected by vite.config.ts at build time
declare const __API_BASE__: string;

const BASE = (typeof __API_BASE__ !== 'undefined' ? __API_BASE__ : '') || '';

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('cc_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export function apiStream(path: string, body: unknown, onChunk: (text: string) => void) {
  const token = localStorage.getItem('cc_token');
  return fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  }).then(async (res) => {
    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    if (!reader) return;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value);
      const lines = text.split('\n').filter((l) => l.startsWith('data: '));
      for (const line of lines) {
        const data = line.slice(6);
        if (data === '[DONE]') return;
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onChunk(content);
        } catch (_) { /* ignore parse errors */ }
      }
    }
  });
}
