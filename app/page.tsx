'use client';

import { useState } from 'react';
import { ArrowRight, CalendarDays, LockKeyhole, MapPin, ShieldCheck, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  async function login(event: React.FormEvent) {
    event.preventDefault(); setLoading(true); setError('');
    try {
      const response = await fetch('/api/login', { method: 'POST', credentials: 'same-origin', cache: 'no-store', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
      const result = await response.json().catch(() => null);
      if (!response.ok) { setError(result?.error || 'Token verification failed. Please try again.'); return; }
      router.push(result.hasTeam ? '/dashboard' : '/rules'); router.refresh();
    } catch { setError('Unable to connect. Check your internet connection and try again.'); }
    finally { setLoading(false); }
  }
  return <main className="glory-home">
    <header className="glory-header"><a className="glory-brand" href="/"><img src="/afit-logo-transparent.png" alt="AFIT crest"/><span><b>AFIT CUP</b><small>2026/2027 SESSION</small></span></a><a className="glory-admin" href="/admin"><ShieldCheck/> Admin Login</a></header>
    <section className="glory-hero" id="competition">
      <div className="glory-message"><h1><small>AFIT Final Year Competition.</small><span>The Road to</span><em>Glory Starts Here.</em></h1><div className="glory-rule"><span/>★<span/></div><p><b>16 Departments, One Trophy.</b></p><div className="glory-meta"><span><MapPin/> AFIT Stadium</span><span><Users/> 20–25 players</span><span><CalendarDays/> 2026/2027</span></div></div>
      <form className="glory-login" id="registration" onSubmit={login}><div className="glory-tag"><Users/> DEPARTMENT ACCESS</div><h2>Enter your registration code</h2><label className="visually-hidden" htmlFor="department-code">Registration code</label><input id="department-code" placeholder="AFIT-X7Q9" value={token} onChange={(event)=>setToken(event.target.value.toUpperCase())} required autoCapitalize="characters"/><button disabled={loading}>{loading ? 'Verifying...' : <>Continue to Registration <ArrowRight/></>}</button>{error && <div className="glory-error" role="alert">{error}</div>}<small className="glory-secure"><LockKeyhole/> Secure access. Your data is protected.</small><div className="glory-deadline"><CalendarDays/><span><small>Registration closes</small><b>30 SEP 2026</b></span></div></form>
    </section>
    <footer className="glory-motto-footer"><div>FAIR PLAY <b>•</b> TEAMWORK <b>•</b> EXCELLENCE</div><small><i/><img src="/winged-mark.svg" alt="" aria-hidden="true"/><i/></small><p><b>★</b><i/>AIR FORCE INSTITUTE OF TECHNOLOGY <span>•</span> QUEST FOR EXCELLENCE<i/><b>★</b></p></footer>
  </main>;
}
