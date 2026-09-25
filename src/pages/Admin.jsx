import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/apiClient';
import useAdminStatus from '../hooks/useAdminStatus';

const JAM_STATUSES = ['upcoming', 'active', 'voting', 'completed'];
const EMPTY_JAM = { title: '', status: 'upcoming', itchUrl: '', img: '' };
const EMPTY_CREATOR = { name: '', url: '', pfp: '' };
const EMPTY_SPONSOR = { name: '', url: '', logoUrl: '' };
const EMPTY_PARTNERED = { title: '', url: '', img: '', blurb: '' };
const EMPTY_WINNER = { place: '1', category: 'overall', jam: '', gameName: '', gameUrl: '', contributors: [] };

const sectionClass = 'border border-li/30 bg-black/30 rounded-2xl p-4 md:p-6';
const inputClass = 'w-full bg-black/60 border border-li/40 text-white text-sm px-3 py-2 rounded';
const labelClass = 'text-li text-xs uppercase tracking-widest block mb-1';
const btnPrimary = 'px-4 py-2 bg-primary text-black font-bold rounded-full disabled:opacity-50';
const btnSecondary = 'px-4 py-2 border border-li/40 text-white font-bold rounded-full disabled:opacity-50';
const btnDanger = 'px-3 py-1 text-xs bg-red-500/20 border border-red-400 text-red-300 rounded font-bold hover:bg-red-500/30 disabled:opacity-50';
const btnMini = 'px-3 py-1 text-xs border border-li/40 text-white rounded font-bold hover:border-primary/60 disabled:opacity-50';

function StatusBanner({ message, type }) {
  if (!message) return null;
  const color = type === 'error' ? 'text-red-300' : 'text-primary';
  return <p className={`${color} text-sm font-bold mt-2`}>{message}</p>;
}

function JamsSection() {
  const [jams, setJams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_JAM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/jams');
      setJams(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load jams');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const startEdit = (jam) => {
    setEditingId(jam.id);
    setForm({ title: jam.title, status: jam.status, itchUrl: jam.itchUrl, img: jam.img });
    setError(null);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_JAM);
    setError(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        await apiClient.put(`/admin/jams/${editingId}`, form);
      } else {
        await apiClient.post('/admin/jams', form);
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to save jam');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this jam?')) return;
    try {
      await apiClient.delete(`/admin/jams/${id}`);
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to delete jam');
    }
  };

  return (
    <section className={sectionClass}>
      <p className="text-white text-xl font-bold">🎮 jams</p>
      <p className="text-li text-sm mt-1">Add, edit, or remove game jams.</p>

      <form onSubmit={submit} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="md:col-span-2">
          <label className={labelClass}>Title</label>
          <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Micro Jam 064: Theme" />
        </div>
        <div>
          <label className={labelClass}>Status</label>
          <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {JAM_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Itch URL</label>
          <input className={inputClass} value={form.itchUrl} onChange={(e) => setForm({ ...form, itchUrl: e.target.value })} placeholder="https://itch.io/jam/micro-jam-064" />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Image URL</label>
          <input className={inputClass} value={form.img} onChange={(e) => setForm({ ...form, img: e.target.value })} placeholder="https://res.cloudinary.com/..." />
        </div>
        <div className="md:col-span-2 flex gap-3">
          <button type="submit" disabled={saving} className={btnPrimary}>{saving ? 'Saving…' : editingId ? 'Update jam' : 'Add jam'}</button>
          {editingId && <button type="button" onClick={resetForm} className={btnSecondary}>Cancel</button>}
        </div>
      </form>

      <StatusBanner message={error} type="error" />

      <div className="mt-6 max-h-[400px] overflow-y-auto space-y-2">
        {loading ? <p className="text-li text-sm">loading...</p> : jams.slice().reverse().map((jam) => (
          <div key={jam.id} className="flex items-center justify-between bg-black/40 px-3 py-2 rounded border border-li/20">
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-bold truncate">#{jam.id} — {jam.title}</p>
              <p className="text-li text-xs">{jam.status} · {jam.itchUrl}</p>
            </div>
            <div className="flex gap-2 ml-3">
              <button className={btnMini} onClick={() => startEdit(jam)}>edit</button>
              <button className={btnDanger} onClick={() => remove(jam.id)}>del</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PrerequisitesSection() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newValue, setNewValue] = useState('');
  const [editing, setEditing] = useState({ index: null, value: '' });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/prerequisites');
      setList(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load prerequisites');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = async (e) => {
    e.preventDefault();
    if (!newValue.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await apiClient.post('/admin/prerequisites', { value: newValue.trim() });
      setNewValue('');
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to add');
    } finally {
      setSaving(false);
    }
  };

  const saveEdit = async () => {
    if (!editing.value.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await apiClient.put(`/admin/prerequisites/${editing.index}`, { value: editing.value.trim() });
      setEditing({ index: null, value: '' });
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (index) => {
    if (!window.confirm('Delete this prerequisite?')) return;
    try {
      await apiClient.delete(`/admin/prerequisites/${index}`);
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to delete');
    }
  };

  return (
    <section className={sectionClass}>
      <p className="text-white text-xl font-bold">📊 prerequisites (voting themes)</p>
      <p className="text-li text-sm mt-1">Options shown on the voting page.</p>

      <form onSubmit={add} className="mt-4 flex gap-2">
        <input className={inputClass} value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder="Add a new prerequisite..." />
        <button type="submit" disabled={saving || !newValue.trim()} className={btnPrimary}>Add</button>
      </form>

      <StatusBanner message={error} type="error" />

      <div className="mt-4 space-y-2">
        {loading ? <p className="text-li text-sm">loading...</p> : list.map((value, index) => (
          <div key={`${index}-${value}`} className="flex items-center justify-between bg-black/40 px-3 py-2 rounded border border-li/20 gap-2">
            {editing.index === index ? (
              <>
                <input className={`${inputClass} flex-1`} value={editing.value} onChange={(e) => setEditing({ ...editing, value: e.target.value })} />
                <button className={btnMini} onClick={saveEdit}>save</button>
                <button className={btnSecondary} onClick={() => setEditing({ index: null, value: '' })}>cancel</button>
              </>
            ) : (
              <>
                <span className="text-white text-sm flex-1 truncate">{value}</span>
                <button className={btnMini} onClick={() => setEditing({ index, value })}>edit</button>
                <button className={btnDanger} onClick={() => remove(index)}>del</button>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function VotingPeriodSection() {
  const [period, setPeriod] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    apiClient.get('/settings').then(({ data }) => {
      setPeriod(String(data?.currentVotingPeriod ?? ''));
    }).catch(() => setError('Failed to load settings'));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await apiClient.put('/admin/settings', { currentVotingPeriod: Number(period) });
      setSuccess(`Voting period set to ${period}`);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const resetCurrentVotes = async () => {
    if (!window.confirm(`Delete ALL votes for period ${period}?`)) return;
    try {
      const { data } = await apiClient.post('/admin/votes/reset-current');
      setSuccess(data?.message || 'Votes reset');
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to reset');
    }
  };

  return (
    <section className={sectionClass}>
      <p className="text-white text-xl font-bold">🗳️ voting period</p>
      <p className="text-li text-sm mt-1">The current jam number votes are being collected for.</p>

      <form onSubmit={save} className="mt-4 flex gap-2 items-end">
        <div className="flex-1">
          <label className={labelClass}>Current voting period (jam #)</label>
          <input type="number" className={inputClass} value={period} onChange={(e) => setPeriod(e.target.value)} />
        </div>
        <button type="submit" disabled={saving} className={btnPrimary}>{saving ? 'Saving…' : 'Save'}</button>
      </form>

      <div className="mt-4">
        <button type="button" onClick={resetCurrentVotes} className={btnDanger}>Reset votes for current period</button>
      </div>

      <StatusBanner message={error} type="error" />
      <StatusBanner message={success} type="ok" />
    </section>
  );
}

function CreatorsSection() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_CREATOR);
  const [editingIndex, setEditingIndex] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/creators');
      setList(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load creators');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const reset = () => {
    setEditingIndex(null);
    setForm(EMPTY_CREATOR);
    setError(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editingIndex !== null) {
        await apiClient.put(`/admin/creators/${editingIndex}`, form);
      } else {
        await apiClient.post('/admin/creators', form);
      }
      reset();
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to save creator');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (index) => {
    if (!window.confirm('Delete this creator?')) return;
    try {
      await apiClient.delete(`/admin/creators/${index}`);
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to delete');
    }
  };

  return (
    <section className={sectionClass}>
      <p className="text-white text-xl font-bold">🎬 creators (hall of creators)</p>

      <form onSubmit={submit} className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>Name</label>
          <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>URL</label>
          <input className={inputClass} value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>PFP URL (optional)</label>
          <input className={inputClass} value={form.pfp} onChange={(e) => setForm({ ...form, pfp: e.target.value })} />
        </div>
        <div className="md:col-span-3 flex gap-3">
          <button type="submit" disabled={saving} className={btnPrimary}>{saving ? 'Saving…' : editingIndex !== null ? 'Update creator' : 'Add creator'}</button>
          {editingIndex !== null && <button type="button" onClick={reset} className={btnSecondary}>Cancel</button>}
        </div>
      </form>

      <StatusBanner message={error} type="error" />

      <div className="mt-4 space-y-2">
        {loading ? <p className="text-li text-sm">loading...</p> : list.map((c, index) => (
          <div key={`${index}-${c.name}`} className="flex items-center justify-between bg-black/40 px-3 py-2 rounded border border-li/20">
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-bold truncate">{c.name}</p>
              <p className="text-li text-xs truncate">{c.url}</p>
            </div>
            <div className="flex gap-2 ml-3">
              <button className={btnMini} onClick={() => { setEditingIndex(index); setForm({ name: c.name, url: c.url, pfp: c.pfp || '' }); }}>edit</button>
              <button className={btnDanger} onClick={() => remove(index)}>del</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SponsorsSection() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_SPONSOR);
  const [editingIndex, setEditingIndex] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/sponsors');
      setList(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load sponsors');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const reset = () => {
    setEditingIndex(null);
    setForm(EMPTY_SPONSOR);
    setError(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editingIndex !== null) {
        await apiClient.put(`/admin/sponsors/${editingIndex}`, form);
      } else {
        await apiClient.post('/admin/sponsors', form);
      }
      reset();
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to save sponsor');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (index) => {
    if (!window.confirm('Delete this sponsor?')) return;
    try {
      await apiClient.delete(`/admin/sponsors/${index}`);
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to delete');
    }
  };

  return (
    <section className={sectionClass}>
      <p className="text-white text-xl font-bold">🤝 sponsors</p>
      <p className="text-li text-sm mt-1">Logos shown on <Link to="/sponsors" className="text-primary underline">/sponsors</Link>.</p>

      <form onSubmit={submit} className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>Name</label>
          <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ziva" />
        </div>
        <div>
          <label className={labelClass}>Website URL</label>
          <input className={inputClass} value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://ziva..." />
        </div>
        <div>
          <label className={labelClass}>Logo URL</label>
          <input className={inputClass} value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} placeholder="https://.../logo.png" />
        </div>
        <div className="md:col-span-3 flex gap-3">
          <button type="submit" disabled={saving} className={btnPrimary}>{saving ? 'Saving…' : editingIndex !== null ? 'Update sponsor' : 'Add sponsor'}</button>
          {editingIndex !== null && <button type="button" onClick={reset} className={btnSecondary}>Cancel</button>}
        </div>
      </form>

      <StatusBanner message={error} type="error" />

      <div className="mt-4 space-y-2">
        {loading ? <p className="text-li text-sm">loading...</p> : list.map((s, index) => (
          <div key={`${index}-${s.name}`} className="flex items-center justify-between bg-black/40 px-3 py-2 rounded border border-li/20">
            <div className="flex items-center gap-3 min-w-0">
              {s.logoUrl && <img src={s.logoUrl} alt="" className="w-8 h-8 object-contain" />}
              <div className="min-w-0">
                <p className="text-white text-sm font-bold truncate">{s.name}</p>
                <p className="text-li text-xs truncate">{s.url}</p>
              </div>
            </div>
            <div className="flex gap-2 ml-3">
              <button className={btnMini} onClick={() => { setEditingIndex(index); setForm({ name: s.name, url: s.url, logoUrl: s.logoUrl || '' }); }}>edit</button>
              <button className={btnDanger} onClick={() => remove(index)}>del</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PartneredJamsSection() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_PARTNERED);
  const [editingIndex, setEditingIndex] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/partnered-jams');
      setList(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load partnered jams');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const reset = () => {
    setEditingIndex(null);
    setForm(EMPTY_PARTNERED);
    setError(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editingIndex !== null) {
        await apiClient.put(`/admin/partnered-jams/${editingIndex}`, form);
      } else {
        await apiClient.post('/admin/partnered-jams', form);
      }
      reset();
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to save partnered jam');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (index) => {
    if (!window.confirm('Delete this partnered jam?')) return;
    try {
      await apiClient.delete(`/admin/partnered-jams/${index}`);
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to delete');
    }
  };

  return (
    <section className={sectionClass}>
      <p className="text-white text-xl font-bold">🤝 more editions (partnered jams)</p>
      <p className="text-li text-sm mt-1">Shown on <Link to="/more-editions" className="text-primary underline">/more-editions</Link>. Co-hosted / partnered jams outside the Micro Jam series.</p>

      <form onSubmit={submit} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Title</label>
          <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Code for a Cause" />
        </div>
        <div>
          <label className={labelClass}>URL</label>
          <input className={inputClass} value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://itch.io/jam/..." />
        </div>
        <div>
          <label className={labelClass}>Image URL</label>
          <input className={inputClass} value={form.img} onChange={(e) => setForm({ ...form, img: e.target.value })} placeholder="https://.../cover.png" />
        </div>
        <div>
          <label className={labelClass}>Blurb (optional)</label>
          <input className={inputClass} value={form.blurb} onChange={(e) => setForm({ ...form, blurb: e.target.value })} placeholder="world's largest AI jam — co-hosted" />
        </div>
        <div className="md:col-span-2 flex gap-3">
          <button type="submit" disabled={saving} className={btnPrimary}>{saving ? 'Saving…' : editingIndex !== null ? 'Update' : 'Add partnered jam'}</button>
          {editingIndex !== null && <button type="button" onClick={reset} className={btnSecondary}>Cancel</button>}
        </div>
      </form>

      <StatusBanner message={error} type="error" />

      <div className="mt-4 space-y-2">
        {loading ? <p className="text-li text-sm">loading...</p> : list.map((p, index) => (
          <div key={`${index}-${p.title}`} className="flex items-center justify-between bg-black/40 px-3 py-2 rounded border border-li/20">
            <div className="flex items-center gap-3 min-w-0">
              {p.img && <img src={p.img} alt="" className="w-10 h-10 object-cover border border-li/20" />}
              <div className="min-w-0">
                <p className="text-white text-sm font-bold truncate">{p.title}</p>
                <p className="text-li text-xs truncate">{p.url}</p>
              </div>
            </div>
            <div className="flex gap-2 ml-3">
              <button className={btnMini} onClick={() => { setEditingIndex(index); setForm({ title: p.title, url: p.url, img: p.img, blurb: p.blurb || '' }); }}>edit</button>
              <button className={btnDanger} onClick={() => remove(index)}>del</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SponsorStatsSection() {
  const [stats, setStats] = useState({ editions: '', joiners: '', discordMembers: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    apiClient.get('/sponsor-stats')
      .then(({ data }) => setStats({
        editions: data?.editions ?? 0,
        joiners: data?.joiners ?? 0,
        discordMembers: data?.discordMembers ?? 0,
      }))
      .catch(() => setError('Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await apiClient.put('/admin/sponsor-stats', {
        editions: Number(stats.editions),
        joiners: Number(stats.joiners),
        discordMembers: Number(stats.discordMembers),
      });
      setMessage('Saved.');
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={sectionClass}>
      <p className="text-white text-xl font-bold">📊 sponsor page stats</p>
      <p className="text-li text-sm mt-1">The three big numbers at the top of /sponsors.</p>

      {loading ? <p className="text-li text-sm mt-4">loading...</p> : (
        <form onSubmit={save} className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className={labelClass}>Editions run</label>
            <input type="number" min="0" className={inputClass} value={stats.editions} onChange={(e) => setStats({ ...stats, editions: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Total joiners</label>
            <input type="number" min="0" className={inputClass} value={stats.joiners} onChange={(e) => setStats({ ...stats, joiners: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Discord members</label>
            <input type="number" min="0" className={inputClass} value={stats.discordMembers} onChange={(e) => setStats({ ...stats, discordMembers: e.target.value })} />
          </div>
          <div className="md:col-span-3">
            <button type="submit" disabled={saving} className={btnPrimary}>{saving ? 'Saving…' : 'Save stats'}</button>
          </div>
        </form>
      )}

      <StatusBanner message={error} type="error" />
      <StatusBanner message={message} />
    </section>
  );
}

function AdminsSection() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newId, setNewId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/admins');
      setList(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load admins');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = async (e) => {
    e.preventDefault();
    if (!newId.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await apiClient.post('/admins', { discordId: newId.trim() });
      setNewId('');
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to add admin');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm(`Remove admin ${id}?`)) return;
    try {
      await apiClient.delete(`/admins/${id}`);
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to remove');
    }
  };

  return (
    <section className={sectionClass}>
      <p className="text-white text-xl font-bold">🛡️ admins</p>
      <p className="text-li text-sm mt-1">Discord IDs granted admin privileges.</p>

      <form onSubmit={add} className="mt-4 flex gap-2">
        <input className={inputClass} value={newId} onChange={(e) => setNewId(e.target.value)} placeholder="Discord user ID" />
        <button type="submit" disabled={saving || !newId.trim()} className={btnPrimary}>Add</button>
      </form>

      <StatusBanner message={error} type="error" />

      <div className="mt-4 space-y-2">
        {loading ? <p className="text-li text-sm">loading...</p> : list.map((id) => (
          <div key={id} className="flex items-center justify-between bg-black/40 px-3 py-2 rounded border border-li/20">
            <span className="text-white text-sm font-mono truncate">{id}</span>
            <button className={btnDanger} onClick={() => remove(id)}>remove</button>
          </div>
        ))}
      </div>
    </section>
  );
}

function VoteTallySection() {
  const [tally, setTally] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get('/getVotes');
      setTally(data);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load votes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <section className={sectionClass}>
      <div className="flex items-center justify-between">
        <p className="text-white text-xl font-bold">📈 current vote tally</p>
        <button onClick={load} disabled={loading} className={btnMini}>{loading ? 'loading…' : 'refresh'}</button>
      </div>

      <StatusBanner message={error} type="error" />

      {tally && (
        <div className="mt-4">
          <p className="text-li text-sm">Total votes: <span className="text-white font-bold">{tally.totalVotes}</span></p>
          <div className="mt-3 space-y-2">
            {(tally.voteCounts || []).map((v) => (
              <div key={v.prerequisite} className="flex items-center justify-between bg-black/40 px-3 py-2 rounded border border-li/20">
                <span className={`text-sm font-bold ${v.isWinner ? 'text-primary' : 'text-white'}`}>
                  {v.placementLabel}: {v.prerequisite}
                </span>
                <span className="text-li text-sm">{v.count}</span>
              </div>
            ))}
            {(tally.voteCounts || []).length === 0 && <p className="text-li text-sm">No votes yet.</p>}
          </div>
        </div>
      )}
    </section>
  );
}

function formatCellValue(value) {
  if (value === null || value === undefined) return <span className="text-li/50 italic">null</span>;
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') return JSON.stringify(value);
  const str = String(value);
  return str.length > 80 ? str.slice(0, 80) + '…' : str;
}

function DatabaseSection() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('desc');

  useEffect(() => {
    apiClient.get('/admin/db/tables')
      .then(({ data }) => {
        const list = data?.tables || [];
        setTables(list);
        if (list.length > 0) setSelectedTable(list[0]);
      })
      .catch((err) => setError(err?.response?.data?.error || 'Failed to load tables'));
  }, []);

  const loadPage = useCallback(async () => {
    if (!selectedTable) return;
    setLoading(true);
    setError(null);
    try {
      const params = { limit, offset };
      if (orderBy) params.orderBy = orderBy;
      if (order) params.order = order;
      const { data } = await apiClient.get(`/admin/db/tables/${selectedTable}`, { params });
      setPageData(data);
      if (!orderBy && data?.orderBy) setOrderBy(data.orderBy);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load rows');
    } finally {
      setLoading(false);
    }
  }, [selectedTable, limit, offset, orderBy, order]);

  useEffect(() => { loadPage(); }, [loadPage]);

  const changeTable = (name) => {
    setSelectedTable(name);
    setOffset(0);
    setOrderBy('');
  };

  const total = pageData?.total ?? 0;
  const rows = pageData?.rows ?? [];
  const columns = pageData?.columns ?? [];
  const hasPrev = offset > 0;
  const hasNext = offset + limit < total;

  return (
    <section className={sectionClass}>
      <p className="text-white text-xl font-bold">🗄️ database browser</p>
      <p className="text-li text-sm mt-1">View raw data from the Supabase Postgres database.</p>

      <div className="mt-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className={labelClass}>Table</label>
          <select className={inputClass} value={selectedTable} onChange={(e) => changeTable(e.target.value)}>
            {tables.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Order by</label>
          <input className={inputClass} value={orderBy} onChange={(e) => setOrderBy(e.target.value)} placeholder="column name" />
        </div>
        <div>
          <label className={labelClass}>Direction</label>
          <select className={inputClass} value={order} onChange={(e) => setOrder(e.target.value)}>
            <option value="desc">desc</option>
            <option value="asc">asc</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Page size</label>
          <select className={inputClass} value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setOffset(0); }}>
            {[10, 25, 50, 100, 200].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <button type="button" onClick={loadPage} disabled={loading} className={btnMini}>{loading ? 'loading…' : 'refresh'}</button>
      </div>

      <StatusBanner message={error} type="error" />

      {pageData && (
        <div className="mt-4">
          <p className="text-li text-sm">
            Showing rows <span className="text-white font-bold">{total === 0 ? 0 : offset + 1}</span>–<span className="text-white font-bold">{Math.min(offset + limit, total)}</span> of <span className="text-white font-bold">{total}</span>
          </p>

          <div className="mt-3 overflow-x-auto border border-li/30 rounded">
            <table className="min-w-full text-xs">
              <thead className="bg-black/60">
                <tr>
                  {columns.map((col) => (
                    <th key={col} className="text-left px-3 py-2 text-primary font-bold uppercase tracking-widest border-b border-li/30 whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={columns.length || 1} className="text-li text-center py-6">No rows.</td></tr>
                ) : rows.map((row, i) => (
                  <tr key={row.id ?? i} className="odd:bg-black/30 even:bg-black/10">
                    {columns.map((col) => (
                      <td key={col} className="px-3 py-2 text-white border-b border-li/10 whitespace-nowrap font-mono">
                        {formatCellValue(row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex gap-2 justify-between items-center">
            <button className={btnMini} disabled={!hasPrev || loading} onClick={() => setOffset(Math.max(0, offset - limit))}>← prev</button>
            <span className="text-li text-xs">page {Math.floor(offset / limit) + 1} / {Math.max(1, Math.ceil(total / limit))}</span>
            <button className={btnMini} disabled={!hasNext || loading} onClick={() => setOffset(offset + limit)}>next →</button>
          </div>
        </div>
      )}
    </section>
  );
}

function formatDuration(seconds) {
  if (!seconds || seconds < 0) return '—';
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s ? `${m}m ${s}s` : `${m}m`;
}

function VoterAnalyticsSection() {
  const [jams, setJams] = useState([]);
  const [jamId, setJamId] = useState('');
  const [itchName, setItchName] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [voters, setVoters] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiClient.get('/jams').then(({ data }) => {
      const votingOrCompleted = (data || []).filter((j) => j.status === 'voting' || j.status === 'completed');
      setJams(votingOrCompleted.slice().reverse());
      const firstVoting = votingOrCompleted.find((j) => j.status === 'voting');
      if (firstVoting) setJamId(String(firstVoting.id));
      else if (votingOrCompleted.length) setJamId(String(votingOrCompleted[votingOrCompleted.length - 1].id));
    }).catch(() => setError('Failed to load jams'));
  }, []);

  const search = async (e) => {
    e?.preventDefault();
    if (!jamId || !itchName.trim()) return;
    setLoading(true);
    setError(null);
    setAnalytics(null);
    try {
      const { data } = await apiClient.get(`/admin/jams/${jamId}/voter`, { params: { itch: itchName.trim() } });
      setAnalytics(data);
    } catch (err) {
      setError(err?.response?.data?.error || 'Voter not found');
    } finally {
      setLoading(false);
    }
  };

  const loadVoters = async () => {
    if (!jamId) return;
    setLoadingList(true);
    setError(null);
    try {
      const { data } = await apiClient.get(`/admin/jams/${jamId}/voters`);
      setVoters(data?.voters || []);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load voters');
    } finally {
      setLoadingList(false);
    }
  };

  return (
    <section className={sectionClass}>
      <p className="text-white text-xl font-bold">🕵️ voter analytics</p>
      <p className="text-li text-sm mt-1">Inspect a voter's behavior to catch spam-rating and vote manipulation.</p>

      <form onSubmit={search} className="mt-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className={labelClass}>Jam</label>
          <select className={inputClass} value={jamId} onChange={(e) => { setJamId(e.target.value); setAnalytics(null); setVoters(null); }}>
            {jams.map((j) => <option key={j.id} value={j.id}>#{j.id} — {j.title}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className={labelClass}>itch.io username</label>
          <input className={inputClass} value={itchName} onChange={(e) => setItchName(e.target.value)} placeholder="e.g. 121a121" />
        </div>
        <button type="submit" disabled={loading || !jamId || !itchName.trim()} className={btnPrimary}>{loading ? 'Searching…' : 'Search'}</button>
        <button type="button" onClick={loadVoters} disabled={loadingList || !jamId} className={btnSecondary}>{loadingList ? 'Loading…' : 'List all voters'}</button>
      </form>

      <StatusBanner message={error} type="error" />

      {analytics && (
        <div className="mt-6 space-y-4">
          <div className="bg-black/40 border border-li/20 rounded p-4">
            <p className="text-white font-bold text-lg">
              {analytics.user.itchUsername}
              {analytics.user.discordUsername && <span className="text-li text-sm ml-2">(discord: {analytics.user.discordUsername})</span>}
            </p>
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div><span className="text-li">Games rated:</span> <span className="text-white font-bold">{analytics.summary.gamesRated}</span></div>
              <div><span className="text-li">Total ratings:</span> <span className="text-white font-bold">{analytics.summary.totalRatings}</span></div>
              <div><span className="text-li">Avg score:</span> <span className="text-white font-bold">{analytics.summary.avgScore}</span></div>
              <div><span className="text-li">Avg time/game:</span> <span className="text-white font-bold">{formatDuration(analytics.summary.avgDurationSeconds)}</span></div>
              <div><span className="text-li">Avg gap between games:</span> <span className="text-white font-bold">{formatDuration(analytics.summary.avgGapSeconds)}</span></div>
              <div><span className="text-li">Median gap:</span> <span className="text-white font-bold">{formatDuration(analytics.summary.medianGapSeconds)}</span></div>
              <div className="col-span-2 md:col-span-2">
                <span className="text-li">Score distribution: </span>
                <span className="text-white font-mono text-xs">
                  {Object.entries(analytics.summary.distribution).map(([k, v]) => `${k}★:${v}`).join('  ')}
                </span>
              </div>
            </div>
            {analytics.summary.flags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {analytics.summary.flags.map((f) => (
                  <span key={f.code} className="bg-red-500/20 border border-red-400 text-red-300 text-xs font-bold px-2 py-1 rounded">
                    ⚠ {f.label}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="overflow-x-auto border border-li/30 rounded">
            <table className="min-w-full text-xs">
              <thead className="bg-black/60">
                <tr>
                  <th className="text-left px-3 py-2 text-primary font-bold uppercase tracking-widest border-b border-li/30">Game</th>
                  <th className="text-left px-3 py-2 text-primary font-bold uppercase tracking-widest border-b border-li/30">Ratings</th>
                  <th className="text-left px-3 py-2 text-primary font-bold uppercase tracking-widest border-b border-li/30">First → Last</th>
                  <th className="text-left px-3 py-2 text-primary font-bold uppercase tracking-widest border-b border-li/30">Duration</th>
                  <th className="text-left px-3 py-2 text-primary font-bold uppercase tracking-widest border-b border-li/30">Scores</th>
                </tr>
              </thead>
              <tbody>
                {analytics.games.map((g) => (
                  <tr key={g.entryId} className="odd:bg-black/30 even:bg-black/10">
                    <td className="px-3 py-2 text-white border-b border-li/10">
                      <a href={g.url} target="_blank" rel="noreferrer" className="text-primary underline">{g.title}</a>
                    </td>
                    <td className="px-3 py-2 text-white border-b border-li/10">{g.ratingCount}</td>
                    <td className="px-3 py-2 text-li border-b border-li/10 font-mono text-[10px]">
                      {new Date(g.firstAt).toLocaleTimeString()}<br />
                      {new Date(g.lastAt).toLocaleTimeString()}
                    </td>
                    <td className={`px-3 py-2 border-b border-li/10 font-bold ${g.durationSeconds < 15 && g.ratingCount > 1 ? 'text-red-300' : 'text-white'}`}>
                      {formatDuration(g.durationSeconds)}
                    </td>
                    <td className="px-3 py-2 text-white border-b border-li/10 font-mono text-[10px]">
                      {Object.entries(g.categories).map(([cat, sc]) => `${cat.slice(0, 3)}:${sc}`).join('  ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {voters && (
        <div className="mt-6">
          <p className="text-li text-sm mb-2">All voters for this jam (sorted by flag count):</p>
          <div className="overflow-x-auto border border-li/30 rounded">
            <table className="min-w-full text-xs">
              <thead className="bg-black/60">
                <tr>
                  <th className="text-left px-3 py-2 text-primary font-bold uppercase tracking-widest border-b border-li/30">Voter</th>
                  <th className="text-left px-3 py-2 text-primary font-bold uppercase tracking-widest border-b border-li/30">Games</th>
                  <th className="text-left px-3 py-2 text-primary font-bold uppercase tracking-widest border-b border-li/30">Ratings</th>
                  <th className="text-left px-3 py-2 text-primary font-bold uppercase tracking-widest border-b border-li/30">Avg score</th>
                  <th className="text-left px-3 py-2 text-primary font-bold uppercase tracking-widest border-b border-li/30">Avg time/game</th>
                  <th className="text-left px-3 py-2 text-primary font-bold uppercase tracking-widest border-b border-li/30">Median gap</th>
                  <th className="text-left px-3 py-2 text-primary font-bold uppercase tracking-widest border-b border-li/30">Flags</th>
                </tr>
              </thead>
              <tbody>
                {voters.length === 0 && (
                  <tr><td colSpan={7} className="text-li text-center py-4">No voters yet.</td></tr>
                )}
                {voters.map((v) => (
                  <tr
                    key={v.userId}
                    className={`odd:bg-black/30 even:bg-black/10 cursor-pointer hover:bg-primary/10 ${v.flags.length > 0 ? 'border-l-2 border-red-400' : ''}`}
                    onClick={() => { if (v.itchUsername) { setItchName(v.itchUsername); search(); } }}
                  >
                    <td className="px-3 py-2 text-white border-b border-li/10">
                      {v.itchUsername || <span className="text-li">(no itch)</span>}
                      {v.discordUsername && <span className="text-li text-[10px] ml-2">d:{v.discordUsername}</span>}
                    </td>
                    <td className="px-3 py-2 text-white border-b border-li/10">{v.gamesRated}</td>
                    <td className="px-3 py-2 text-white border-b border-li/10">{v.totalRatings}</td>
                    <td className="px-3 py-2 text-white border-b border-li/10">{v.avgScore}</td>
                    <td className="px-3 py-2 text-white border-b border-li/10">{formatDuration(v.avgDurationSeconds)}</td>
                    <td className="px-3 py-2 text-white border-b border-li/10">{formatDuration(v.medianGapSeconds)}</td>
                    <td className="px-3 py-2 border-b border-li/10">
                      {v.flags.length === 0
                        ? <span className="text-ac">clean</span>
                        : <span className="text-red-300 font-bold">{v.flags.length} ⚠</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

function Admin() {
  const { isAdmin, loadingAdmin } = useAdminStatus();

  if (loadingAdmin) {
    return (
      <main className="px-4 md:px-0 mt-[6rem]">
        <p className="text-white text-xl font-bold">Loading admin panel...</p>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="px-4 md:px-0 mt-[6rem]">
        <p className="text-white text-2xl font-bold">🔒 admin only</p>
        <p className="text-li text-base font-bold mt-3">
          You need admin privileges to view this page.{' '}
          <Link to="/" className="text-primary underline">Return home.</Link>
        </p>
      </main>
    );
  }

  return (
    <main className="px-4 md:px-0 mt-[3rem] md:mt-[6rem]">
      <title>Admin Panel | Micro Jam</title>
      <p className="text-white text-2xl md:text-3xl font-bold">⚙️ admin panel</p>
      <p className="text-nm text-sm md:text-base font-bold mt-2">
        manage jams, prerequisites, voting period, creators, admins, and votes.
      </p>

      <div className="mt-8 space-y-6">
        <VoterAnalyticsSection />
        <VotingPeriodSection />
        <VoteTallySection />
        <DatabaseSection />
        <PrerequisitesSection />
        <JamsSection />
        <CreatorsSection />
        <SponsorsSection />
        <SponsorStatsSection />
        <PartneredJamsSection />
        <AdminsSection />
        <section className={sectionClass}>
          <p className="text-white text-xl font-bold">🏆 winners</p>
          <p className="text-li text-sm mt-1">
            Winners are managed directly on the{' '}
            <Link to="/hof" className="text-primary underline">Hall of Fame page</Link>{' '}
            (admin edit controls appear when signed in).
          </p>
        </section>
      </div>
    </main>
  );
}

export default Admin;
