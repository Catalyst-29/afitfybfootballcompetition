'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, LogOut, Scale, ShieldCheck } from 'lucide-react';

const rules = [
  'All FIFA standard rules apply.',
  'All registered players must present their ID card for verification before the first match. Without verification, no player will be permitted to play. Spill-over or deferred students may only play if they have not attempted any final-year examinations. A violation leads to disqualification.',
  'All registered players must be from the registering department only. A violation discovered at any point during the competition leads to automatic disqualification.',
  'Merging different departments will not be tolerated unless expressly stated and agreed otherwise. A violation discovered at any point leads to automatic disqualification.',
  'If a player represents a department other than their own, that department will receive a three-point deduction during the group stage or be disqualified during the knockout stage, unless otherwise agreed.',
  'Any player not properly registered on the app will not be permitted to play. Every player registered on the app must also be registered on paper.',
  'No form of abuse will be tolerated from any player or team during matches. An offending player will be removed from the competition, and a replacement is permitted only if the replacement is from the department.',
  'No player or coach may be violent toward the officiating team—including the referee and linesmen—during or after a match. An offender will be removed from the competition without replacement.',
  'Players, whether on or off the pitch, and coaches may not communicate with the linesmen during a match. An offender will be subject to the referee’s decision.',
  'Inappropriate language toward teammates, opponents, or match officials will lead to the offending player or coach being sent off.',
  'A straight red card shown to a player, whether on or off the pitch, results in a two-match ban. A coach is sent off for the remainder of the match and receives a one-match ban.',
  'A red card resulting from two consecutive yellow cards leads to a one-match ban.',
  'Any player shown three yellow cards within five consecutive matches receives a one-match ban.',
  'A walkover will be awarded when a team is more than 15 minutes late. A team may be permitted to play when at least seven players are present on the pitch.',
  'Players must not remain beside the pitch during a match except when preparing for substitution, to prevent distractions or unnecessary disruption.',
  'Captains must ensure that card fines are paid to the appropriate officials on or before their next match begins.',
  'Iron-stud boots are prohibited and will result in player disqualification. Short hose or socks are also prohibited.',
  'Any department found guilty of match-fixing will be disqualified from the current competition and subsequent competitions.',
  'No apology will be considered from a player or coach found guilty of violating any of these rules.',
];

export default function RulesClient({ departmentName }: { departmentName: string }) {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function acceptRules() {
    if (!agreed) return;
    setBusy(true);
    setError('');
    const response = await fetch('/api/accept-rules', { method: 'POST' });
    const result = await response.json();
    if (!response.ok) { setError(result.error); setBusy(false); return; }
    router.push('/team-setup');
    router.refresh();
  }

  async function declineRules() {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  return (
    <main className="shell rules-shell">
      <div className="container page-content">
        <nav className="nav">
          <a className="brand" href="/" aria-label="Go to homepage"><img className="brand-logo" src="/afit-logo-transparent.png" alt="AFIT crest" /><div><span>AFIT Final Year Competition</span><small>2026/2027 Session</small></div></a>
          <button className="btn secondary tiny" onClick={declineRules}><LogOut size={14} /> Exit</button>
        </nav>

        <header className="rules-heading">
          <span className="eyebrow"><ShieldCheck size={15} /> Required before registration</span>
          <div className="rules-title"><div><div className="kicker">Tournament code of conduct</div><h1>Rules & Regulations</h1><p>Please read every rule carefully before continuing to team registration.</p></div><div className="department-chip"><Scale size={18} /><span><small>Registering department</small><b>{departmentName}</b></span></div></div>
        </header>

        <section className="card rules-card">
          <ol className="rules-list">{rules.map((rule, index) => <li key={index}><span>{String(index + 1).padStart(2, '0')}</span><p>{rule}</p></li>)}</ol>
        </section>

        <section className="card rules-consent">
          <label className="consent-check"><input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} /><span><b>I have read and agree to the tournament rules and regulations.</b><small>I understand that violations may lead to penalties or disqualification.</small></span></label>
          {error && <div className="error">{error}</div>}
          <div className="rules-actions"><button className="btn secondary" onClick={declineRules}>I do not agree</button><button className="btn" disabled={!agreed || busy} onClick={acceptRules}>{busy ? 'Saving…' : <>Agree & continue <ArrowRight size={17} /></>}</button></div>
        </section>
      </div>
    </main>
  );
}
