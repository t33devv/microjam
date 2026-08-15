import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/apiClient';
import useAdminStatus from '../hooks/useAdminStatus';

const JAM_STATUSES = ['upcoming', 'active', 'completed'];
const EMPTY_JAM = { title: '', status: 'upcoming', itchUrl: '', img: '' };
const EMPTY_CREATOR = { name: '', url: '', pfp: '' };
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
    } catch (e) {
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
        <VotingPeriodSection />
        <VoteTallySection />
        <PrerequisitesSection />
        <JamsSection />
        <CreatorsSection />
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
