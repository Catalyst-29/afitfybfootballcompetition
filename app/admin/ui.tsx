'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, LogOut, Search, ShieldCheck, Users } from 'lucide-react';

const Status = ({ value }: { value: string }) => <span className={`status ${value}`}>{value}</span>;
const effectiveTeamStatus = (team: any) => team.status === 'rejected' ? 'rejected' : team.status === 'approved' && team.players.length > 0 && team.players.every((player: any) => player.status === 'approved') ? 'approved' : 'pending';

export default function AdminClient({ authenticated, teams }: { authenticated: boolean; teams: any[] }) {
  const router = useRouter();
  const [departments, setDepartments] = useState(teams);
  const [selectedId, setSelectedId] = useState<string | null>(teams[0]?.id || null);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [reason, setReason] = useState<Record<string, string>>({});
  const [reviewing, setReviewing] = useState<string | null>(null);

  useEffect(() => {
    setDepartments(teams);
    setSelectedId((current) => current && teams.some((team) => team.id === current) ? current : teams[0]?.id || null);
  }, [teams]);

  const visibleDepartments = useMemo(
    () => departments.filter((team) => team.departments.name.toLowerCase().includes(query.trim().toLowerCase())),
    [departments, query],
  );
  const selected = departments.find((team) => team.id === selectedId) || null;
  const pendingTeams = departments.filter((team) => effectiveTeamStatus(team) === 'pending').length;
  const pendingPlayers = departments.reduce((total, team) => total + team.players.filter((player: any) => player.status === 'pending').length, 0);

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

  async function logout() { await fetch('/api/admin-logout', { method: 'POST' }); router.refresh(); }

  if (!authenticated) return (
    <main className="shell"><div className="container page-content"><nav className="nav"><div className="brand"><img className="brand-logo" src="/afit-logo-transparent.png" alt="AFIT crest" /><div><span>AFIT Competition Admin</span><small>2026/2027 Session</small></div></div></nav><section className="hero" style={{ gridTemplateColumns: '1fr', maxWidth: 520, margin: '0 auto' }}><form className="card login-card" onSubmit={login}><div className="kicker">Administrator access</div><h1 style={{ fontSize: 38, margin: '12px 0' }}>Review registrations</h1><label className="label">Admin password</label><input name="password" className="input" type="password" required /><button className="btn full" style={{ marginTop: 14 }}>Open dashboard</button>{error && <div className="error">{error}</div>}</form></section></div></main>
  );

  return (
    <main className="shell dashboard">
      <div className="container page-content">
        <nav className="nav"><div className="brand"><img className="brand-logo" src="/afit-logo-transparent.png" alt="AFIT crest" /><div><span>AFIT Competition Admin</span><small>2026/2027 Session</small></div></div><button className="btn secondary tiny" onClick={logout}><LogOut size={14} /> Logout</button></nav>
        <header className="dash-head"><div className="kicker">Competition administration</div><h1>Registered departments</h1><p className="muted">Select a department to review its team and registered players.</p></header>
        {error && <div className="error" style={{ marginBottom: 18 }}>{error}</div>}
        <section className="admin-summary"><div><span>Departments</span><b>{departments.length}</b></div><div><span>Teams pending</span><b>{pendingTeams}</b></div><div><span>Players pending</span><b>{pendingPlayers}</b></div></section>

        <section className="admin-browser">
          <aside className="card department-list">
            <div className="section-title"><div><div className="kicker">Department directory</div><h2>Registrations</h2></div><span className="status pending">{departments.length}</span></div>
            <label className="department-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search departments" /></label>
            <div className="department-items">
              {visibleDepartments.length === 0 && <div className="muted empty-state">No department found.</div>}
              {visibleDepartments.map((team) => {
                const pending = team.players.filter((player: any) => player.status === 'pending').length;
                return <button key={team.id} className={`department-item ${selectedId === team.id ? 'active' : ''}`} onClick={() => setSelectedId(team.id)}>{team.logo_url ? <img src={team.logo_url} alt="" /> : <span className="department-fallback">{team.departments.name.charAt(0)}</span>}<span><b>{team.departments.name}</b><small>{team.players.length} players · {pending} pending</small></span><Status value={effectiveTeamStatus(team)} /></button>;
              })}
            </div>
          </aside>

          <div className="department-detail">
            {!selected ? <div className="card empty-detail"><Users size={34} /><h2>Select a department</h2><p className="muted">Choose a registered department to view its players.</p></div> : <>
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
            </>}
          </div>
        </section>
      </div>
    </main>
  );
}
