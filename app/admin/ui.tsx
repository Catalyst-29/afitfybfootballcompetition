'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, ClipboardCheck, Download, LayoutDashboard, LogOut, Search, ShieldCheck, UserCheck, Users } from 'lucide-react';
import BrandLink from '../components/BrandLink';
import DashboardBrand from '../components/DashboardBrand';

const Status = ({ value }: { value: string }) => <span className={`status ${value}`}>{value}</span>;
const effectiveTeamStatus = (team: any) => team.status === 'rejected' ? 'rejected' : team.status === 'approved' && team.players.length > 0 && team.players.every((player: any) => player.status === 'approved') ? 'approved' : 'pending';

export default function AdminClient({ authenticated, teams }: { authenticated: boolean; teams: any[] }) {
  const router = useRouter();
  const [departments, setDepartments] = useState(teams);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [reason, setReason] = useState<Record<string, string>>({});
  const [reviewing, setReviewing] = useState<string | null>(null);

  useEffect(() => {
    setDepartments(teams);
    setSelectedId((current) => current && teams.some((team) => team.id === current) ? current : null);
  }, [teams]);

  const visibleDepartments = useMemo(
    () => departments.filter((team) => team.departments.name.toLowerCase().includes(query.trim().toLowerCase())),
    [departments, query],
  );
  const selected = departments.find((team) => team.id === selectedId) || null;
  const pendingTeams = departments.filter((team) => effectiveTeamStatus(team) === 'pending').length;
  const allPlayers = departments.flatMap((team) => team.players);
  const totalPlayers = allPlayers.length;
  const approvedPlayers = allPlayers.filter((player: any) => player.status === 'approved').length;
  const pendingPlayers = allPlayers.filter((player: any) => player.status === 'pending').length;
  const rejectedPlayers = allPlayers.filter((player: any) => player.status === 'rejected').length;
  const approvedPercent = totalPlayers ? approvedPlayers / totalPlayers * 100 : 0;
  const pendingPercent = totalPlayers ? pendingPlayers / totalPlayers * 100 : 0;

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/admin-login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: form.get('password') }) });
    const result = await response.json();
    if (!response.ok) setError(result.error); else router.refresh();
  }

  async function decide(type: 'team' | 'player', id: string, status: 'approved' | 'rejected') {
    setError('');
    setReviewing(id);
    try {
      const response = await fetch('/api/admin', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, id, status, reason: reason[id] || '' }) });
      const result = await response.json();
      if (!response.ok) { setError(result.error); return; }
      setDepartments((current) => current.map((team) => {
        if (type === 'team' && team.id === id) return { ...team, status, rejection_reason: status === 'rejected' ? reason[id] || 'Registration needs correction.' : null };
        if (type !== 'player' || !team.players.some((player: any) => player.id === id)) return team;
        return { ...team, status: team.status === 'rejected' ? 'rejected' : 'pending', rejection_reason: team.status === 'rejected' ? team.rejection_reason : null, players: team.players.map((player: any) => player.id === id ? { ...player, status, rejection_reason: status === 'rejected' ? reason[id] || 'Registration needs correction.' : null } : player) };
      }));
      if (result.warning) setError(result.warning);
      setReason((current) => { const next = { ...current }; delete next[id]; return next; });
      router.refresh();
    } catch {
      setError('Unable to update this approval. Please try again.');
    } finally {
      setReviewing(null);
    }
  }

  async function logout() { if (!confirm('Are you sure you want to log out of the admin dashboard?')) return; await fetch('/api/admin-logout', { method: 'POST' }); router.refresh(); }

  if (!authenticated) return (
    <main className="shell admin-login-shell"><div className="stadium-wash"/><div className="container page-content"><nav className="nav admin-nav"><BrandLink /></nav><section className="admin-login-wrap"><div className="admin-login-copy"><span className="eyebrow"><ShieldCheck size={15}/> Secure administration</span><div className="kicker">AFIT competition control</div><h1>Registration<br/>Review Portal</h1><p>Review department registrations, verify player information and manage approval decisions.</p></div><form className="card login-card admin-login-card" onSubmit={login}><ShieldCheck className="admin-login-icon" size={30}/><div className="kicker">Administrator access</div><h2>Sign in to continue</h2><p>Enter the competition administrator password.</p><label className="label">Admin password</label><input name="password" className="input" type="password" required /><button className="btn full">Open dashboard</button>{error && <div className="error">{error}</div>}</form></section></div></main>
  );

  return (
    <main className="admin-dashboard-shell">
      <aside className="admin-app-sidebar"><DashboardBrand/><div className="admin-sidebar-label">Main</div><nav><a className="active" href="#admin-overview"><LayoutDashboard/> Dashboard</a><a href="#departments"><Building2/> Departments</a><a href="#approvals"><Users/> Players</a><a href="#approvals"><ClipboardCheck/> Approvals</a></nav><button type="button" onClick={logout}><LogOut/> Logout</button></aside>
      <div className="admin-app-main"><header className="admin-app-topbar"><div><small>AFIT CUP · 2026/2027</small><b><i/> Admin Dashboard</b></div><label><Search/><input value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="Search departments, players..."/></label><span>AD</span><strong>Admin User<small>Super Admin</small></strong></header><div className="admin-content" id="admin-overview">
        <header className="dash-head admin-dashboard-heading"><div className="kicker">Overview</div><h1>Competition Administration</h1><p>Here&apos;s what&apos;s happening in the registration portal.</p></header>
        {error && <div className="error" style={{ marginBottom: 18 }}>{error}</div>}
        <section className="admin-overview-stats"><div><Building2/><span><b>{departments.length}</b><small>Departments Registered</small></span></div><div><Users/><span><b>{totalPlayers}</b><small>Players Registered</small></span></div><div><UserCheck/><span><b>{approvedPlayers}</b><small>Players Approved</small></span></div><div><ClipboardCheck/><span><b>{pendingPlayers}</b><small>Players Pending</small></span></div><div><ShieldCheck/><span><b>{rejectedPlayers}</b><small>Players Rejected</small></span></div></section>
        <section className="admin-analytics-row"><div className="card admin-registration-progress"><h2>Registration Progress</h2><div className="admin-donut" style={{background:`conic-gradient(#07813b 0 ${approvedPercent}%, #f3b51b ${approvedPercent}% ${approvedPercent+pendingPercent}%, #d64545 ${approvedPercent+pendingPercent}% 100%)`}}><span><b>{totalPlayers}</b><small>Total Players</small></span></div><ul><li><i/> Approved <b>{approvedPlayers}</b></li><li><i/> Pending <b>{pendingPlayers}</b></li><li><i/> Rejected <b>{rejectedPlayers}</b></li></ul></div><div className="card admin-department-progress"><div className="department-progress-heading"><h2>Department Registration Status</h2><span><i className="approved-segment"/>Approved <i className="pending-segment"/>Pending <i className="rejected-segment"/>Rejected</span></div>{departments.slice(0,8).map((team)=>{const approved=team.players.filter((player:any)=>player.status==='approved').length;const pending=team.players.filter((player:any)=>player.status==='pending').length;const rejected=team.players.filter((player:any)=>player.status==='rejected').length;return <div key={team.id}><span>{team.departments.name}</span><i className="department-status-track"><b className="approved-segment" style={{width:`${approved/25*100}%`}}/><b className="pending-segment" style={{width:`${pending/25*100}%`}}/><b className="rejected-segment" style={{width:`${rejected/25*100}%`}}/></i><strong><em className="approved-count">{approved}</em><em className="pending-count">{pending}</em><em className="rejected-count">{rejected}</em></strong></div>})}</div></section>

        <section className={`admin-browser ${selected ? 'has-selection' : 'departments-only'}`} id="departments">
          <aside className="card department-list">
            <div className="section-title"><div><div className="kicker">Department directory</div><h2>Registrations</h2></div><span className="status pending">{departments.length}</span></div>
            <label className="department-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search departments" /></label>
            <div className="department-items">
              {visibleDepartments.length === 0 && <div className="muted empty-state">No department found.</div>}
              {visibleDepartments.map((team) => {
                return <button key={team.id} className={`department-item ${selectedId === team.id ? 'active' : ''}`} onClick={() => setSelectedId(team.id)}>{team.logo_url ? <img src={team.logo_url} alt="" /> : <span className="department-fallback">{team.departments.name.charAt(0)}</span>}<span><b>{team.departments.name}</b><small>Department registration</small></span><Status value={effectiveTeamStatus(team)} /></button>;
              })}
            </div>
          </aside>

          {selected && <div className="department-detail">
            <>
              <section className="card team-review">
                <div className="team-review-head">{selected.logo_url && <img src={selected.logo_url} alt={`${selected.departments.name} logo`} />}<div><div className="kicker">Department registration</div><h2>{selected.departments.name}</h2><div className="meta">{selected.players.length}/25 registered players</div></div><Status value={effectiveTeamStatus(selected)} /></div>
                {selected.rejection_reason && <div className="reason">Team decision: {selected.rejection_reason}</div>}
                <div className="actions team-review-actions">
                  {effectiveTeamStatus(selected) === 'pending' && <><button className="btn tiny" title={selected.players.every((player: any) => player.status === 'approved') ? '' : 'Approve every player first'} disabled={reviewing === selected.id || selected.players.length === 0 || !selected.players.every((player: any) => player.status === 'approved')} onClick={() => decide('team', selected.id, 'approved')}>Approve team</button><button className="btn danger tiny" disabled={reviewing === selected.id} onClick={() => decide('team', selected.id, 'rejected')}>Reject team</button><input className="input" placeholder="Team rejection reason" value={reason[selected.id] || ''} onChange={(event) => setReason({ ...reason, [selected.id]: event.target.value })} /></>}
                  <a className="btn secondary tiny" href={`/api/download?team=${selected.id}`}><Download size={14} /> Download information</a>
                </div>
              </section>

              <div className="detail-heading"><div><div className="kicker">Squad review</div><h2>Registered players</h2></div><span className="status pending">{selected.players.filter((player: any) => player.status === 'pending').length} pending</span></div>
              <div className="admin-player-list">
                {selected.players.length === 0 && <div className="card muted">No players have been registered by this department.</div>}
                {selected.players.map((player: any) => <article className="card review-player" key={player.id}><img src={player.photo_url} alt={`${player.first_name} ${player.last_name}`} /><div className="review-player-info"><div className="player-name">#{player.jersey_number} · {player.first_name} {player.last_name}</div><div className="meta">{player.position} · {player.height_cm}cm · {player.preferred_foot} foot · {player.nationality}</div><Status value={player.status} />{player.rejection_reason && <div className="reason">{player.rejection_reason}</div>}</div><div className="review-player-actions">{player.status === 'pending' && <><input className="input" placeholder="Rejection reason" value={reason[player.id] || ''} onChange={(event) => setReason({ ...reason, [player.id]: event.target.value })} /><div className="actions"><button className="btn tiny" disabled={reviewing === player.id} onClick={() => decide('player', player.id, 'approved')}>Approve</button><button className="btn danger tiny" disabled={reviewing === player.id} onClick={() => decide('player', player.id, 'rejected')}>Reject</button></div></>}<a className="btn tiny" href={`/api/player-card?id=${player.id}`}><Download size={14} /> Player card</a><a className="btn secondary tiny" href={`/api/photo?id=${player.id}`}><Download size={14} /> Original photo</a></div></article>)}
              </div>
            </>
          </div>}
        </section>
      </div></div>
    </main>
  );
}
