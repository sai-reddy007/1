'use client';

import { FormEvent, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@acme-sec.com');
  const [password, setPassword] = useState('ChangeMe123!');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    localStorage.setItem('token', data.token);
    alert('Token saved to localStorage');
  };

  return (
    <form onSubmit={submit} className="max-w-md bg-cyberCard p-6 rounded-xl space-y-3">
      <h1 className="text-neon text-xl">Login</h1>
      <input className="w-full p-2 bg-black/40" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" className="w-full p-2 bg-black/40" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button className="bg-neon text-black px-4 py-2 rounded">Authenticate</button>
    </form>
  );
}
