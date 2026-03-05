const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api';

export async function apiGet(path: string, token: string) {
  const res = await fetch(`${API_BASE}${path}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
  if (!res.ok) throw new Error('API error');
  return res.json();
}
