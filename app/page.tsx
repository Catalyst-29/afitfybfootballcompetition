'use client';

import { useState } from 'react';
import { ArrowRight, CalendarDays, MapPin, ShieldCheck, Trophy, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    const result = await response.json();
    setLoading(false);
    if (!response.ok) return setError(result.error);
    router.push(result.hasTeam ? '/dashboard' : '/rules');
    router.refresh();
  }

  return (
    <main className="shell home-shell">
      <div className="stadium-wash" />
      <div className="container page-content">
        <nav className="nav">
          <a className="brand" href="/" aria-label="Go to homepage">
            <img className="brand-logo" src="/afit-logo-transparent.png" alt="Air Force Institute of Technology crest" />
            <div><span>AFIT Final Year Competition</span><small>2026/2027 Session</small></div>
          </a>
          <div className="nav-actions">
            <span className="nav-tag">Official registration portal</span>
            <a className="admin-link" href="/admin"><ShieldCheck size={15} /> Admin login</a>
          </div>
        </nav>

        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow"><ShieldCheck size={15} /> Official department registration</span>
            <h1><span>2026/2027 AFIT</span> Final Year Competition</h1>
            <p>One Institute. One Pitch. Register your department’s squad and compete for final year football glory.</p>
            <div className="quick-facts">
              <div><Users size={21} /><span><b>20–25 players</b><small>per department</small></span></div>
              <div><MapPin size={21} /><span><b>AFIT Stadium</b><small>Competition Venue</small></span></div>
              <div><Trophy size={21} /><span><b>16 Departments</b><small>1 Winner and Glory</small></span></div>
            </div>
          </div>

          <form className="card login-card" onSubmit={login}>
            <div className="kicker">Department access</div>
            <h2>Enter your team token</h2>
            <p className="muted">Use the secure token issued to your department. Your department name loads automatically.</p>
            <label className="label">Registration token</label>
            <input className="input" placeholder="AFIT-X7Q9" value={token} onChange={(event) => setToken(event.target.value.toUpperCase())} required autoCapitalize="characters" />
            <button className="btn full" style={{ marginTop: 14 }} disabled={loading}>
              {loading ? 'Verifying…' : <>Continue to registration <ArrowRight size={17} /></>}
            </button>
            {error && <div className="error">{error}</div>}
            <div className="hint secure-note"><ShieldCheck size={14} /> Keep your department token private.</div>
          </form>
        </section>

        <section className="competition-strip schedule-strip" aria-label="Competition schedule">
          <div><CalendarDays /><span><b>Registration closes</b><small>Wednesday, 30th September, 2026</small></span></div>
          <div><CalendarDays /><span><b>Grouping live draws</b><small>Thursday, 1st October, 2026</small></span></div>
          <div><CalendarDays /><span><b>Competition starts</b><small>Friday, 9th October, 2026</small></span></div>
          <div><CalendarDays /><span><b>End date</b><small>Saturday, 11th December, 2026</small></span></div>
        </section>
        <div className="footer-note">Air Force Institute of Technology · Quest for Excellence</div>
      </div>
    </main>
  );
}
