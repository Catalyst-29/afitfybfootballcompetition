'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, CircleAlert, LogOut, Pencil, Plus, ShieldCheck, Trash2, Upload, Users, X } from 'lucide-react';

const Status = ({ value }: { value: string }) => <span className={`status ${value}`}>{value}</span>;

function DateOfBirthFields({ initial = '' }: { initial?: string }) {
  const [day, setDay] = useState(initial ? String(Number(initial.slice(8, 10))) : '');
  const [month, setMonth] = useState(initial ? String(Number(initial.slice(5, 7))) : '');
  const [year, setYear] = useState(initial ? initial.slice(0, 4) : '');
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1949 }, (_, index) => currentYear - index);
  const daysInMonth = month && year ? new Date(Number(year), Number(month), 0).getDate() : 31;
  const days = Array.from({ length: daysInMonth }, (_, index) => index + 1);
  const validDay = day && Number(day) <= daysInMonth ? day : '';
  const value = validDay && month && year ? `${year}-${month.padStart(2, '0')}-${validDay.padStart(2, '0')}` : '';

  return (
    <div className="dob-group">
      <label className="label">Date of birth</label>
      <div className="dob-fields">
        <select className="select" value={validDay} onChange={(event) => setDay(event.target.value)} required aria-label="Birth day"><option value="">Day</option>{days.map((item) => <option key={item} value={item}>{item}</option>)}</select>
        <select className="select" value={month} onChange={(event) => setMonth(event.target.value)} required aria-label="Birth month"><option value="">Month</option><option value="1">January</option><option value="2">February</option><option value="3">March</option><option value="4">April</option><option value="5">May</option><option value="6">June</option><option value="7">July</option><option value="8">August</option><option value="9">September</option><option value="10">October</option><option value="11">November</option><option value="12">December</option></select>
        <select className="select" value={year} onChange={(event) => setYear(event.target.value)} required aria-label="Birth year"><option value="">Year</option>{years.map((item) => <option key={item} value={item}>{item}</option>)}</select>
      </div>
      <input type="hidden" name="date_of_birth" value={value} />
    </div>
  );
}

export default function DashboardClient({ initial }: { initial: any }) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const team = initial.team;
  const players = initial.players || [];
  const locked = !!team?.final_submitted;
  const allPlayersApproved = players.length > 0 && players.every((player: any) => player.status === 'approved');
  const registrationStatus = team?.status === 'rejected' ? 'rejected' : team?.status === 'approved' && allPlayersApproved ? 'approved' : 'pending';

  async function postForm(path: string, form: FormData) {
    setBusy(true);
    setMessage('');
    const response = await fetch(path, { method: 'POST', body: form });
    const result = await response.json();
    setBusy(false);
    if (!response.ok) { setMessage(result.error); return false; }
    router.refresh();
    return true;
  }
  async function saveTeam(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); await postForm('/api/team', new FormData(event.currentTarget)); }
  async function addPlayer(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); if (await postForm('/api/players', new FormData(event.currentTarget))) event.currentTarget.reset(); }
  async function removePlayer(id: string) { if (!confirm('Remove this player?')) return; const response = await fetch('/api/players', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); const result = await response.json(); if (!response.ok) setMessage(result.error); else router.refresh(); }
  async function editPlayer(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); setMessage(''); const response = await fetch('/api/players', { method: 'PATCH', body: new FormData(event.currentTarget) }); const result = await response.json(); setBusy(false); if (!response.ok) { setMessage(result.error); return; } setEditing(null); router.refresh(); }
  async function submit() { if (!confirm('Final submission will lock team editing while the registration is under review. Continue?')) return; const response = await fetch('/api/submit', { method: 'POST' }); const result = await response.json(); if (!response.ok) setMessage(result.error); else router.refresh(); }
  async function logout() { await fetch('/api/logout', { method: 'POST' }); router.push('/'); router.refresh(); }

  return (
    <main className="shell dashboard">
      <div className="container page-content">
        <nav className="nav">
          <div className="brand"><img className="brand-logo" src="/afit-logo-transparent.png" alt="AFIT crest" /><div><span>AFIT Final Year Competition</span><small>2026/2027 Session</small></div></div>
          <button className="btn secondary tiny" onClick={logout}><LogOut size={14} /> Logout</button>
        </nav>
        <header className="dash-head">
          <div className="kicker">2026/2027 Department dashboard</div>
          <div className="department-heading">{initial.logoUrl && <img src={initial.logoUrl} alt={`${initial.department.name} logo`} />}<h1>{initial.department.name}</h1><div className="registration-summary"><span>Registration status</span><Status value={registrationStatus} /><small>{registrationStatus === 'pending' && !allPlayersApproved ? 'Waiting for all player approvals' : locked ? 'Submitted for official review' : 'Registration still editable'}</small></div></div>
          <div className="actions">{locked && <span className="status approved"><ShieldCheck size={14} /> Final submission received</span>}</div>
          {team?.rejection_reason && <div className="error" style={{ maxWidth: 680 }}><b>Team review:</b> {team.rejection_reason}</div>}
        </header>
        {message && <div className="error" style={{ marginBottom: 18 }}>{message}</div>}
        <section className="grid dashboard-grid">
          <div className="card span-4"><div className="kicker">Squad size</div><div className="stat">{players.length} / 25</div><div className="muted" style={{ fontSize: 13 }}>Minimum 20 players required</div><div className="progress"><div style={{ width: `${Math.min(players.length / 25 * 100, 100)}%` }} /></div></div>
          <div className="card span-4"><div className="kicker">Approved players</div><div className="stat">{players.filter((player: any) => player.status === 'approved').length}</div><div className="muted" style={{ fontSize: 13 }}>Admin-approved squad members</div></div>
          <div className="card span-4 summary-card"><div className="kicker">Rejected players</div><div className="stat">{players.filter((player: any) => player.status === 'rejected').length}</div><div className="muted" style={{ fontSize: 13 }}>Players requiring correction or replacement</div></div>

          <div className="card span-4">
            <div className="section-title"><h2>1. Team registration</h2>{team && <CheckCircle2 size={20} />}</div>
            <form onSubmit={saveTeam}>
              <label className="label">Department</label><input className="input" value={initial.department.name} readOnly />
              <label className="label">Team logo</label>
              <div className="upload">{initial.logoUrl && <img src={initial.logoUrl} alt="Team logo" style={{ width: 84, height: 84, objectFit: 'contain', display: 'block', marginBottom: 12, borderRadius: 13, background: 'white' }} />}<input name="logo" type="file" accept="image/png" required={!team} disabled={locked} /><div className="hint" style={{ marginTop: 9 }}>PNG only · Maximum 5MB</div></div>
              <button className="btn full" style={{ marginTop: 14 }} disabled={busy || locked}><Upload size={16} /> {team ? 'Update team logo' : 'Save team & continue'}</button>
            </form>
          </div>

          <div className="card span-8">
            <div className="section-title"><div><h2>2. Player registration</h2><div className="hint">JPEG only · 5MB max · Keep face centered · Clear background</div></div><span className="status pending"><Users size={14} />{players.length}/25</span></div>
            {!team ? <div className="error">Register your team logo before adding players.</div> : locked ? <div className="success error">Registration submitted. Player editing is locked while under review.</div> : players.length >= 25 ? <div className="success error">Maximum squad size reached.</div> : (
              <form className="form-grid" onSubmit={addPlayer}>
                <div style={{ gridColumn: '1/-1' }} className="upload"><label className="label" style={{ marginTop: 0 }}>Player photo</label><input name="photo" type="file" accept="image/jpeg,.jpg,.jpeg" required /><div className="hint">Keep face centered · Use a clear background</div></div>
                <div><label className="label">First name</label><input name="first_name" className="input" required /></div><div><label className="label">Last name</label><input name="last_name" className="input" required /></div>
                <div><label className="label">Nationality</label><input className="input" value="Nigeria" readOnly /></div><DateOfBirthFields />
                <div><label className="label">Jersey number</label><input name="jersey_number" className="input" type="number" min="1" max="99" required /></div><div><label className="label">Position</label><select name="position" className="select" required defaultValue=""><option value="" disabled>Select position</option><option>Goalkeeper</option><option>Defender</option><option>Midfielder</option><option>Forward</option></select></div>
                <div><label className="label">Height (cm)</label><input name="height_cm" className="input" type="number" min="140" max="240" required /></div><div><label className="label">Preferred foot</label><select name="preferred_foot" className="select" required><option>Right</option><option>Left</option></select></div>
                <button className="btn" style={{ gridColumn: '1/-1' }} disabled={busy}><Plus size={16} /> Add player</button>
              </form>
            )}
          </div>

          <div className="card span-12">
            <div className="section-title"><div><h2>Registered players</h2><div className="hint">Approval decisions from competition administrators appear here.</div></div></div>
            <div className="players">{players.length === 0 ? <div className="muted">No players registered yet.</div> : players.map((player: any) => <div className="player" key={player.id}><img className="avatar" src={player.photo_url} alt={`${player.first_name} ${player.last_name}`} /><div><div className="player-name">#{player.jersey_number} · {player.first_name} {player.last_name}</div><div className="meta">{player.position} · {player.height_cm}cm · {player.preferred_foot} foot · Nigeria</div><div style={{ marginTop: 8 }}><Status value={player.status} /></div>{player.rejection_reason && <div className="reason"><CircleAlert size={12} style={{ verticalAlign: 'middle' }} /> {player.rejection_reason}</div>}</div><div className="actions">{!locked && player.status !== 'approved' && <><button className="btn secondary tiny" onClick={() => { setMessage(''); setEditing(player); }}><Pencil size={14} /> Edit</button><button className="btn danger tiny" onClick={() => removePlayer(player.id)}><Trash2 size={14} /> Remove</button></>}</div></div>)}</div>
            {!locked && <button className="btn full" style={{ marginTop: 20 }} onClick={submit} disabled={players.length < 20 || players.length > 25}>{players.length < 20 ? `Add ${20 - players.length} more player(s) to submit` : 'Final submit for admin review'}</button>}
          </div>
        </section>
        {editing && <div className="edit-modal" role="dialog" aria-modal="true" aria-label="Edit player"><form className="card edit-player-card" onSubmit={editPlayer}><div className="section-title"><div><div className="kicker">Update squad member</div><h2>Edit player information</h2></div><button type="button" className="icon-button" onClick={() => setEditing(null)} aria-label="Close"><X size={20} /></button></div><input type="hidden" name="id" value={editing.id} /><div className="form-grid"><div style={{ gridColumn: '1/-1' }} className="upload"><label className="label" style={{ marginTop: 0 }}>Replace player photo <span className="hint">(optional)</span></label><input name="photo" type="file" accept="image/jpeg,.jpg,.jpeg" /><div className="hint">Leave empty to keep the current photo · JPEG only · Maximum 5MB</div></div><div><label className="label">First name</label><input name="first_name" className="input" defaultValue={editing.first_name} required /></div><div><label className="label">Last name</label><input name="last_name" className="input" defaultValue={editing.last_name} required /></div><div><label className="label">Nationality</label><input className="input" value="Nigeria" readOnly /></div><DateOfBirthFields key={editing.id} initial={editing.date_of_birth} /><div><label className="label">Jersey number</label><input name="jersey_number" className="input" type="number" min="1" max="99" defaultValue={editing.jersey_number} required /></div><div><label className="label">Position</label><select name="position" className="select" defaultValue={editing.position} required><option>Goalkeeper</option><option>Defender</option><option>Midfielder</option><option>Forward</option></select></div><div><label className="label">Height (cm)</label><input name="height_cm" className="input" type="number" min="140" max="240" defaultValue={editing.height_cm} required /></div><div><label className="label">Preferred foot</label><select name="preferred_foot" className="select" defaultValue={editing.preferred_foot} required><option>Right</option><option>Left</option></select></div></div>{message && <div className="error">{message}</div>}<div className="edit-actions"><button type="button" className="btn secondary" onClick={() => setEditing(null)}>Cancel</button><button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button></div></form></div>}
      </div>
    </main>
  );
}
