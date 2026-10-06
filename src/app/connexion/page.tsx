'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/ui';
export default function ConnexionPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    try {
      const response = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) });
      if (!response.ok) throw new Error('L’inscription a échoué.');
      router.push('/');
    } catch { setError('Impossible de créer le compte.'); }
  }
  return <div className="auth-page">
    <Link href="/" className="brand-link"><Logo /></Link>
    <form onSubmit={submit} className="auth-form">
      <h1>Créer mon compte</h1>
      {error && <p className="auth-error">{error}</p>}
      <label>Nom<input value={name} onChange={e => setName(e.target.value)} required /></label>
      <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
      <label>Mot de passe<input type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={8} required /></label>
      <button type="submit" className="btn-primary">Créer mon compte</button>
    </form>
  </div>;
}