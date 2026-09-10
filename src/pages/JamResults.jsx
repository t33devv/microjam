import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import apiClient from '../services/apiClient';

function JamResults() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [jam, setJam] = useState(null);
    const [results, setResults] = useState([]);
    const [engineFilter, setEngineFilter] = useState('all');

    const availableEngines = useMemo(() => {
        const set = new Set();
        for (const r of results) for (const eng of r.engines || []) set.add(eng);
        return Array.from(set);
    }, [results]);

    const filteredResults = useMemo(() => (
        engineFilter === 'all'
            ? results
            : results.filter((r) => (r.engines || []).includes(engineFilter))
    ), [results, engineFilter]);

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await apiClient.get(`/jams/${id}/results`);
                setJam(data.jam);
                setResults(data.results);
            } catch (err) {
                setError(err?.response?.data?.error || 'Failed to load results.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    if (loading) return <div className="text-white text-xl md:text-2xl font-bold mt-[3rem] md:mt-[6rem] px-4">Loading...</div>;

    if (error) {
        return (
            <div className="px-4 md:px-0">
                <p className="text-white text-xl md:text-2xl font-bold mt-[3rem] md:mt-[6rem]">🏆 results</p>
                <p className="text-primary text-base md:text-lg font-bold mt-[1rem]">{error}</p>
            </div>
        );
    }

    return (
        <>
            <title>{jam?.title} — Results | Micro Jam</title>
            <div className="px-4 md:px-0">
                <p className="text-white text-xl md:text-2xl font-bold mt-[3rem] md:mt-[6rem]">🏆 {jam?.title} — results</p>
                <p className="text-nm text-sm md:text-base font-bold mt-[1rem]">Ranked by average overall score across all categories.</p>

                {availableEngines.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => setEngineFilter('all')}
                            className={`px-3 py-1 text-sm font-bold border rounded-full ${engineFilter === 'all' ? 'bg-primary text-black border-primary' : 'text-nm border-li/40 hover:border-primary/60'}`}
                        >
                            All ({results.length})
                        </button>
                        {availableEngines.map((eng) => {
                            const count = results.filter((r) => (r.engines || []).includes(eng)).length;
                            return (
                                <button
                                    key={eng}
                                    type="button"
                                    onClick={() => setEngineFilter(eng)}
                                    className={`px-3 py-1 text-sm font-bold border rounded-full ${engineFilter === eng ? 'bg-primary text-black border-primary' : 'text-nm border-li/40 hover:border-primary/60'}`}
                                >
                                    {eng} ({count})
                                </button>
                            );
                        })}
                    </div>
                )}

                <div className="mt-6 flex flex-col gap-3">
                    {filteredResults.length === 0 && (
                        <p className="text-li">{results.length === 0 ? 'No votes yet.' : 'No entries match this filter.'}</p>
                    )}
                    {filteredResults.map((r, i) => (
                        <div key={r.entryId} className="border border-li/40 p-4 flex flex-col md:flex-row gap-4">
                            <div className="flex items-start gap-3 md:w-1/3">
                                <span className="text-primary font-bold text-xl w-8">#{i + 1}</span>
                                {r.coverUrl && (
                                    <img src={r.coverUrl} alt="" className="w-16 h-16 object-cover border border-li/40" />
                                )}
                                <div className="min-w-0 flex-1">
                                    <a href={r.url} target="_blank" rel="noreferrer" className="text-primary underline font-bold break-words">
                                        {r.title}
                                    </a>
                                    {r.contributors?.length > 0 && (
                                        <p className="text-nm text-xs mt-1 break-words">
                                            by {r.contributors.map((c, idx) => (
                                                <span key={`${c.name}-${idx}`}>
                                                    {idx > 0 && ', '}
                                                    {c.url
                                                        ? <a href={c.url} target="_blank" rel="noreferrer" className="underline">{c.name}</a>
                                                        : c.name}
                                                </span>
                                            ))}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-sm">
                                <div className="col-span-2 md:col-span-3 text-white font-bold">
                                    Overall: {r.overall.toFixed(2)}
                                </div>
                                {jam?.categories?.map((cat) => (
                                    <div key={cat} className="text-nm">
                                        <span className="text-li">{cat}: </span>
                                        {r.categories?.[cat]
                                            ? `${r.categories[cat].avg.toFixed(2)} (${r.categories[cat].count})`
                                            : '—'}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

export default JamResults;
