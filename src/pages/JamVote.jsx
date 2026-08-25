import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { API_URL } from '../config';
import apiClient from '../services/apiClient';

function StarRow({ value, onChange, disabled }) {
    const [hover, setHover] = useState(0);
    return (
        <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((n) => {
                const filled = (hover || value || 0) >= n;
                return (
                    <button
                        key={n}
                        type="button"
                        disabled={disabled}
                        onMouseEnter={() => setHover(n)}
                        onClick={() => onChange(n)}
                        className={`text-xl md:text-2xl leading-none ${filled ? 'text-primary' : 'text-li'} ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:scale-110'}`}
                        aria-label={`${n} star${n > 1 ? 's' : ''}`}
                    >
                        {filled ? '★' : '☆'}
                    </button>
                );
            })}
        </div>
    );
}

function JamVote() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [jam, setJam] = useState(null);
    const [entries, setEntries] = useState([]);
    const [savingKey, setSavingKey] = useState(null);
    const [notLinked, setNotLinked] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const { data } = await apiClient.get(`/jams/${id}/voting-queue`);
                setJam(data.jam);
                setEntries(data.entries);
                setError(null);
            } catch (err) {
                const status = err?.response?.status;
                const msg = err?.response?.data?.error || 'Failed to load voting queue.';
                if (status === 401 || (status === 403 && /itch/i.test(msg))) {
                    setNotLinked(true);
                }
                setError(msg);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const handleVote = async (entryId, category, score) => {
        const key = `${entryId}:${category}`;
        setSavingKey(key);
        // optimistic
        setEntries((prev) => prev.map((e) => e.id === entryId
            ? { ...e, votes: { ...e.votes, [category]: score } }
            : e
        ));
        try {
            await apiClient.post(`/jams/${id}/votes`, { entryId, category, score });
        } catch (err) {
            console.error('vote failed', err);
            setError(err?.response?.data?.error || 'Failed to submit vote.');
        } finally {
            setSavingKey(null);
        }
    };

    const progress = useMemo(() => {
        if (!jam || entries.length === 0) return { rated: 0, total: 0, pct: 0 };
        const total = entries.length;
        const rated = entries.reduce((sum, e) => {
            const hasAny = Object.keys(e.votes || {}).some((c) => jam.categories.includes(c));
            return sum + (hasAny ? 1 : 0);
        }, 0);
        return { rated, total, pct: total ? Math.round((rated / total) * 100) : 0 };
    }, [entries, jam]);

    const linkItch = () => {
        const url = new URL(`${API_URL}/auth/itch/login`);
        url.searchParams.set('redirectUrl', window.location.href);
        window.location.href = url.toString();
    };

    if (loading) return <div className="text-white text-xl md:text-2xl font-bold mt-[3rem] md:mt-[6rem] px-4">Loading...</div>;

    if (notLinked) {
        return (
            <div className="px-4 md:px-0">
                <p className="text-white text-xl md:text-2xl font-bold mt-[3rem] md:mt-[6rem]">🎮 vote for jam entries</p>
                <p className="text-nm text-sm md:text-base font-bold mt-[1rem]">
                    You need to link your itch.io account to vote. Voting is limited to jam contributors so ratings can't be manipulated.
                </p>
                <button
                    type="button"
                    onClick={linkItch}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-black font-bold rounded hover:opacity-80"
                >
                    Link itch.io
                </button>
                {error && <p className="text-primary text-base mt-4">{error}</p>}
            </div>
        );
    }

    if (error && entries.length === 0) {
        return (
            <div className="px-4 md:px-0">
                <p className="text-white text-xl md:text-2xl font-bold mt-[3rem] md:mt-[6rem]">🎮 vote for jam entries</p>
                <p className="text-primary text-base md:text-lg font-bold mt-[1rem]">{error}</p>
            </div>
        );
    }

    return (
        <>
            <title>{jam?.title} — Voting | Micro Jam</title>
            <div className="px-4 md:px-0">
                <p className="text-white text-xl md:text-2xl font-bold mt-[3rem] md:mt-[6rem]">🎮 {jam?.title} — voting</p>
                <p className="text-nm text-sm md:text-base font-bold mt-[1rem]">
                    Rate each entry 1–5 stars per category. Your vote saves automatically. You can change any rating before voting closes.
                </p>

                <div className="mt-4 flex items-center gap-3">
                    <div className="flex-1 h-2 bg-li/30 rounded overflow-hidden">
                        <div className="h-full bg-primary transition-all" style={{ width: `${progress.pct}%` }} />
                    </div>
                    <span className="text-nm text-sm">{progress.rated} / {progress.total} games rated</span>
                </div>

                {error && <p className="text-primary text-base mt-4">{error}</p>}

                {jam && !jam.isOpen && (
                    <p className="text-primary text-base font-bold mt-4">Voting is currently closed for this jam.</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {entries.map((entry) => (
                        <div key={entry.id} className="border border-li/40 p-4 flex flex-col gap-3">
                            <div className="flex gap-3">
                                {entry.coverUrl && (
                                    <img src={entry.coverUrl} alt="" className="w-20 h-20 object-cover border border-li/40" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <a href={entry.url} target="_blank" rel="noreferrer" className="text-primary underline font-bold break-words">
                                        {entry.title}
                                    </a>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {jam.categories.map((cat) => (
                                    <div key={cat} className="flex items-center justify-between gap-3">
                                        <span className="text-nm text-sm font-bold">{cat}</span>
                                        <StarRow
                                            value={entry.votes?.[cat] || 0}
                                            disabled={!jam.isOpen || savingKey === `${entry.id}:${cat}`}
                                            onChange={(score) => handleVote(entry.id, cat, score)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8">
                    <Link to={`/jam/${id}/results`} className="text-primary underline">See results →</Link>
                </div>
            </div>
        </>
    );
}

export default JamVote;
