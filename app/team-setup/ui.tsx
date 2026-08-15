'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImagePlus, LogOut, ShieldCheck, Upload } from 'lucide-react';

export default function TeamSetupClient({ departmentName }: { departmentName: string }) {
  const router = useRouter();
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submitLogo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const response = await fetch('/api/team', { method: 'POST', body: new FormData(event.currentTarget) });
    const result = await response.json();
    if (!response.ok) { setError(result.error); setBusy(false); return; }
    router.push('/dashboard');
    router.refresh();
  }

  async function logout() {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  return (
    <main className="shell setup-shell">
      <div className="stadium-wash" />
      <div className="container page-content">
        <nav className="nav">
          <a className="brand" href="/" aria-label="Go to homepage"><img className="brand-logo" src="/afit-logo-transparent.png" alt="AFIT crest" /><div><span>AFIT Final Year Competition</span><small>2026/2027 Session</small></div></a>
          <button className="btn secondary tiny" onClick={logout}><LogOut size={14} /> Exit</button>
        </nav>
        <section className="setup-wrap">
          <div className="setup-copy">
            <span className="eyebrow"><ShieldCheck size={15} /> Rules accepted</span>
            <div className="kicker">One final step</div>
            <h1>Add your Department Logo</h1>
            <p>Your logo identifies <b>{departmentName}</b> throughout the registration and approval process.</p>
            <div className="setup-note"><ImagePlus size={22} /><span><b>Upload requirements</b><small>PNG format only · Maximum file size 5MB · Use a clear, official department mark</small></span></div>
          </div>
          <form className="card setup-card" onSubmit={submitLogo}>
            <div className="logo-preview">{preview ? <img src={preview} alt="Department logo preview" /> : <ImagePlus size={48} />}</div>
            <div className="kicker">{departmentName}</div>
            <h2>Department Logo</h2>
            <label className="upload logo-picker"><Upload size={18} /><span><b>Choose a PNG logo</b><small>The image preview will appear above.</small></span><input name="logo" type="file" accept="image/png" required onChange={(event) => { const file = event.target.files?.[0]; if (file) setPreview(URL.createObjectURL(file)); }} /></label>
            {error && <div className="error">{error}</div>}
            <button className="btn full" style={{ marginTop: 16 }} disabled={busy}>{busy ? 'Uploading…' : 'Upload logo & continue'}</button>
          </form>
        </section>
      </div>
    </main>
  );
}
