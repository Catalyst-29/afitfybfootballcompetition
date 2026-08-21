'use client';

import { ArrowLeft, Camera, Check, Circle, CircleDot, Clock3, ShieldCheck, UserCheck, UserX } from 'lucide-react';

export function StatusBadge({ value }: { value: string }) {
  const normalized = ['approved', 'rejected'].includes(value) ? value : 'pending';
  return <span className={`status-badge status-${normalized}`}><span aria-hidden="true" />{normalized.charAt(0).toUpperCase() + normalized.slice(1)}</span>;
}

export function RegistrationProgress({ playerCount, submitted }: { playerCount: number; submitted: boolean }) {
  const active = submitted ? 3 : playerCount >= 20 ? 2 : 1;
  const steps = ['Team Details', 'Players', 'Review', 'Submit'];
  return <ol className="registration-progress" aria-label="Registration progress">
    {steps.map((step, index) => {
      const complete = index < active || submitted;
      const current = index === active && !submitted;
      return <li key={step} className={complete ? 'complete' : current ? 'current' : 'incomplete'} aria-current={current ? 'step' : undefined}>
        <span className="step-icon">{complete ? <Check size={15} /> : current ? <CircleDot size={15} /> : <Circle size={15} />}</span>
        <span><b>{step}</b><small>{complete ? 'Completed' : current ? 'In progress' : 'Not started'}</small></span>
      </li>;
    })}
  </ol>;
}

export function SquadProgress({ count, approved = 0, pending = 0, rejected = 0 }: { count: number; approved?: number; pending?: number; rejected?: number }) {
  const state = count < 20 ? 'incomplete' : count < 25 ? 'valid' : 'full';
  const percent = Math.min(100, (count / 25) * 100);
  return <section className={`squad-progress squad-${state}`} aria-labelledby="squad-progress-title">
    <h2 id="squad-progress-title">Squad Progress</h2>
    <div className="squad-progress-total"><b>{count}</b><span>/ 20</span></div><p>minimum players required</p>
    <div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={25} aria-valuenow={count} aria-label={`${count} of 25 players registered`}><span style={{ width: `${percent}%` }} /></div>
    <div className="progress-scale"><span style={{left:`${Math.min(96,percent)}%`}}>{count}</span><b>20</b></div>
    <div className="squad-approval-tiles"><div><UserCheck/><span><b>{approved}</b><small>Approved</small></span></div><div><Clock3/><span><b>{pending}</b><small>Pending</small></span></div><div><UserX/><span><b>{rejected}</b><small>Rejected</small></span></div></div>
    <div className="squad-stat-tiles"><div><b>20</b><span>Minimum</span></div><div><b>25</b><span>Maximum</span></div><div><b>{Math.max(0,25-count)}</b><span>Slots Available</span></div></div>
  </section>;
}

export function RegistrationReview({ department, logoUrl, players, submitted, onSubmit, onBack, onChangeLogo, busy }: { department: string; logoUrl: string | null; players: any[]; submitted: boolean; onSubmit: () => void; onBack: () => void; onChangeLogo: () => void; busy: boolean }) {
  const remaining = Math.max(0, 20 - players.length);
  const groups = [
    ['Goalkeepers', players.filter((player) => player.position === 'Goalkeeper')],
    ['Defenders', players.filter((player) => player.position === 'Defender')],
    ['Midfielders', players.filter((player) => player.position === 'Midfielder')],
    ['Attackers', players.filter((player) => player.position === 'Forward')],
  ] as const;
  const positionColors = ['#2563eb', '#14b8a6', '#8b5cf6', '#f97316'];
  let chartCursor = 0;
  const chartSegments = groups.map(([, group], index) => { const start = chartCursor; chartCursor += group.length / 25 * 100; return `${positionColors[index]} ${start}% ${chartCursor}%`; });
  chartSegments.push(`#e5e7eb ${chartCursor}% 100%`);
  return <section className="review-page" id="registration-review" aria-labelledby="review-title">
    <header className="review-page-heading"><button type="button" onClick={onBack} aria-label="Back to dashboard"><ArrowLeft size={18}/></button><div><h2 id="review-title">Review your registration</h2><p>Please review your team and players before final submission.</p></div>{submitted && <StatusBadge value="approved" />}</header>
    <section className="review-overview-card">
      <div className="review-team-summary"><h3>Team Summary</h3><div className="review-team-identity">{logoUrl&&<img src={logoUrl} alt={`${department} logo`}/>}<span><b>{department}</b><small>Department registration</small></span></div><dl><div><dt>Players Registered</dt><dd>{players.length} / 25</dd></div><div><dt>Minimum Required</dt><dd>20</dd></div><div><dt>Maximum Allowed</dt><dd>25</dd></div></dl><p className={remaining?'requirement-pending':'requirement-met'}>{remaining?`${remaining} more required`:'✓ Minimum Requirement Met'}</p></div>
      <div className="review-squad-overview"><h3>Squad Overview</h3><div className="squad-donut" style={{background:`conic-gradient(${chartSegments.join(',')})`}}><span><b>{players.length}</b><small>Total Players</small></span></div><ul>{groups.map(([label,group],index)=><li key={label}><i className={`position-dot dot-${index}`}/><span>{label}</span><b>{group.length}</b></li>)}</ul></div>
      <div className="review-logo-panel"><h3>Team Logo</h3>{logoUrl?<img src={logoUrl} alt={`${department} logo`}/>:<div className="review-logo-placeholder"><Camera/></div>}<button type="button" className="btn secondary tiny" onClick={onChangeLogo} disabled={submitted}>Change Logo</button></div>
    </section>
    <div className="review-position-groups" aria-label="Squad review list">{groups.map(([label, group]) => <section key={label}><h3>{label} <span>({group.length})</span></h3>{group.length ? group.map((player) => <div key={player.id}><img src={player.photo_url} alt=""/><b>{String(player.jersey_number).padStart(2, '0')}</b><span>{player.first_name} {player.last_name}</span></div>) : <p>No players</p>}</section>)}</div>
    <footer className={`review-submit-bar ${remaining?'not-ready':'ready'}`}><span><ShieldCheck size={16}/>{submitted?'Final submission received.':remaining?`You need ${remaining} more ${remaining===1?'player':'players'} before submitting.`:'Your squad is ready to be submitted.'}</span>{!submitted&&<button type="button" className="btn primary-action" onClick={onSubmit} disabled={remaining>0||busy}>{busy?'Submitting...':'Submit Registration →'}</button>}</footer>
  </section>;
}
