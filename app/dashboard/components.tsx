'use client';

import { Check, ChevronDown, Circle, CircleDot, Clock3, UserCheck, UserX } from 'lucide-react';

export function StatusBadge({ value }: { value: string }) {
  const normalized = ['approved', 'rejected'].includes(value) ? value : 'pending';
  return <span className={`status-badge status-${normalized}`}><span aria-hidden="true" />{normalized.charAt(0).toUpperCase() + normalized.slice(1)}</span>;
}

export function RegistrationProgress({ playerCount, submitted }: { playerCount: number; submitted: boolean }) {
  const active = submitted ? 3 : playerCount >= 20 ? 2 : 1;
  const steps = ['Team Details', 'Players', 'Review', 'Submit'];
  return <ol className="registration-progress" aria-label="Registration progress">{steps.map((step, index) => {
    const complete = index < active || submitted;
    const current = index === active && !submitted;
    return <li key={step} className={complete ? 'complete' : current ? 'current' : 'incomplete'} aria-current={current ? 'step' : undefined}><span className="step-icon">{complete ? <Check size={15} /> : current ? <CircleDot size={15} /> : <Circle size={15} />}</span><span><b>{step}</b><small>{complete ? 'Completed' : current ? 'In progress' : 'Not started'}</small></span></li>;
  })}</ol>;
}

export function SquadProgress({ count, approved = 0, pending = 0, rejected = 0 }: { count: number; approved?: number; pending?: number; rejected?: number }) {
  const state = count < 20 ? 'incomplete' : count < 25 ? 'valid' : 'full';
  const percent = Math.min(100, (count / 25) * 100);
  return <section className={`squad-progress squad-${state}`} aria-labelledby="squad-progress-title"><h2 id="squad-progress-title">Squad Progress</h2><div className="squad-progress-total"><b>{count}</b><span>/ 20</span></div><p>minimum players required</p><div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={25} aria-valuenow={count} aria-label={`${count} of 25 players registered`}><span style={{ width: `${percent}%` }} /></div><div className="progress-scale"><span style={{left:`${Math.min(96,percent)}%`}}>{count}</span><b>20</b></div><div className="squad-approval-tiles"><div><UserCheck/><span><b>{approved}</b><small>Approved</small></span></div><div><Clock3/><span><b>{pending}</b><small>Pending</small></span></div><div><UserX/><span><b>{rejected}</b><small>Rejected</small></span></div></div><div className="squad-stat-tiles"><div><b>20</b><span>Minimum</span></div><div><b>25</b><span>Maximum</span></div><div><b>{Math.max(0,25-count)}</b><span>Slots Available</span></div></div></section>;
}

export function RegistrationReview({ department, logoUrl, players, submitted, status, rejectionReason, onSubmit, busy }: { department: string; logoUrl: string | null; players: any[]; submitted: boolean; status: string; rejectionReason?: string | null; onSubmit: () => void; busy: boolean }) {
  const remaining = Math.max(0, 20 - players.length);
  const rejected = players.filter((player) => player.status === 'rejected').length;
  const groups = [
    ['Goalkeepers', players.filter((player) => player.position === 'Goalkeeper')],
    ['Defenders', players.filter((player) => player.position === 'Defender')],
    ['Midfielders', players.filter((player) => player.position === 'Midfielder')],
    ['Attackers', players.filter((player) => player.position === 'Forward')],
  ] as const;
  const positionColors = ['#174ea6', '#0876c9', '#20a64a', '#db202b'];
  const positionIcons = ['/position-goalkeeper.png', '/position-defender.png', '/position-midfielder.png', '/position-attacker.png'];
  let chartCursor = 0;
  const chartSegments = groups.map(([, group], index) => { const start = chartCursor; chartCursor += players.length ? group.length / players.length * 100 : 0; return `${positionColors[index]} ${start}% ${chartCursor}%`; });
  if (!players.length) chartSegments.push('#e5e7eb 0% 100%');

  return <section className="review-page" id="registration-review" aria-labelledby="review-title">
    <h2 className="review-mobile-title" id="review-title">Team Summary</h2>
    <section className="review-team-card"><div className="review-team-identity">{logoUrl?<img src={logoUrl} alt={`${department} logo`}/>:<span className="review-team-fallback">{department.slice(0,2).toUpperCase()}</span>}<span><b>{department} FC</b><StatusBadge value={status}/></span></div>{rejectionReason&&<p className="review-team-decision"><b>Admin decision:</b> {rejectionReason}</p>}<dl><div><dt>Players Registered</dt><dd>{players.length}</dd></div><div><dt>Minimum Required</dt><dd>20</dd></div><div><dt>Maximum Allowed</dt><dd>25</dd></div></dl></section>
    <section className="review-position-summary"><h2>Squad Overview (By Position)</h2><div><div className="review-position-pie" style={{background:`conic-gradient(${chartSegments.join(',')})`}}/><ul>{groups.map(([label,group],index)=><li key={label}><i style={{background:positionColors[index]}}/><span>{label}</span><b>{group.length} ({players.length?(group.length/players.length*100).toFixed(1):'0'}%)</b></li>)}</ul></div></section>
    <section className="review-player-groups" aria-label="Players by position"><h2>Players by Position</h2><div>{groups.map(([label, group], index) => <details className={`position-group position-group-${index}`} key={label}><summary><span><img className="position-emblem" src={positionIcons[index]} alt=""/>{label} ({group.length})</span><ChevronDown/></summary><div>{group.length ? group.map((player) => <article key={player.id}><img src={player.photo_url} alt=""/><span><b>{player.first_name} {player.last_name}</b><small>Jersey {String(player.jersey_number).padStart(2, '0')}</small></span></article>) : <p>No players</p>}</div></details>)}</div></section>
    <footer className="review-submit-bar">{status==='approved'?<span>Department registration approved.</span>:submitted?<span>Final submission received — awaiting admin decision.</span>:rejected>0?<span className="review-submit-blocked">Correct the {rejected} rejected player{rejected===1?'':'s'} before final submission.</span>:<button type="button" className="btn primary-action" onClick={onSubmit} disabled={remaining>0||busy}>{busy?'Submitting...':'Submit Registration'}</button>}</footer>
  </section>;
}
