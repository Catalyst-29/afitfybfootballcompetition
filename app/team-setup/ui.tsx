'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImagePlus, LogOut, ShieldCheck, Upload } from 'lucide-react';
import BrandLink from '../components/BrandLink';

export default function TeamSetupClient({ departmentName }: { departmentName: string }) {
  const router = useRouter();
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function selectLogo(file?: File) {
    setError('');
    if (!file) { setPreview(''); return; }
    if (file.type !== 'image/png') { setError('Team logo must be a PNG image.'); setPreview(''); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Maximum logo size is 5 MB.'); setPreview(''); return; }
    setPreview(URL.createObjectURL(file));
  }

  async function submitLogo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const file = new FormData(event.currentTarget).get('logo');
    if (!(file instanceof File) || !file.size || file.type !== 'image/png' || file.size > 5 * 1024 * 1024) { selectLogo(file instanceof File ? file : undefined); return; }
    setBusy(true);
    setError('');
    const response = await fetch('/api/team', { method: 'POST', body: new FormData(event.currentTarget) });
    const result = await response.json();
    if (!response.ok) { setError(result.error); setBusy(false); return; }
    router.push('/dashboard');
    router.refresh();
  }

  async function logout() {
    if (!confirm('Are you sure you want to log out?')) return;
    await fetch('/api/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  return (
    <main className="shell setup-shell">
      <div className="stadium-wash" />
      <div className="container page-content">
        <nav className="nav setup-nav">
          <BrandLink />
          <button className="btn secondary tiny" onClick={logout}><LogOut size={14} /> Exit</button>
        </nav>
        <section className="setup-wrap">
          <div className="setup-copy setup-hero-copy">
            <span className="eyebrow"><ShieldCheck size={15} /> Rules accepted</span>
            <div className="kicker">One final step</div>
            <h1>Add your Department Logo</h1>
            <p>Your logo identifies <b>{departmentName}</b> throughout the registration and approval process.</p>
            <div className="setup-note"><ImagePlus size={22} /><span><b>Upload requirements</b><small>PNG format only · Maximum file size 5MB · Use a clear, official department mark</small></span></div>
          </div>
          <form className="card setup-card setup-upload-card" onSubmit={submitLogo}>
            <div className="logo-preview">{preview ? <img src={preview} alt="Department logo preview" /> : <ImagePlus size={48} />}</div>
            <div className="kicker">{departmentName}</div>
            <h2>Department Logo</h2>
            <label className="upload logo-picker"><Upload size={18} /><span><b>{preview ? 'Replace PNG logo' : 'Choose a PNG logo'}</b><small>PNG only · Maximum 5 MB · Preview appears above.</small></span><input name="logo" type="file" accept="image/png" required onChange={(event) => selectLogo(event.target.files?.[0])} /></label>
            {error && <div className="error">{error}</div>}
            <button className="btn full" style={{ marginTop: 16 }} disabled={busy}>{busy ? 'Uploading…' : 'Upload logo & continue'}</button>
          </form>
        </section>
      </div>
    </main>
  );
}
