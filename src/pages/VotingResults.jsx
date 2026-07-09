import { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import useAdminStatus from '../hooks/useAdminStatus';
import NotFound from './NotFound';

const themes = [
    "Random generation",
    "No boats allowed",
    "Rising tide",
    "You start with nothing",
    "Shrinking map"
];

const COLORS = ['#F25859', '#6a9956', '#4A90D9', '#E8A838', '#9B59B6'];

function PieChart({ data, total }) {
    const cx = 150, cy = 150, r = 120;

    const nonZero = data.filter(d => d.count > 0);

    if (nonZero.length === 1) {
        const idx = data.findIndex(d => d.count > 0);
        return (
            <svg viewBox="0 0 300 300" className="w-full max-w-[280px]">
                <circle cx={cx} cy={cy} r={r} fill={COLORS[idx]} />
            </svg>
        );
    }

    let startAngle = -Math.PI / 2;
    const slices = data.map((item, i) => {
        const angle = (item.count / total) * 2 * Math.PI;
        const endAngle = startAngle + angle;

        const x1 = cx + r * Math.cos(startAngle);
        const y1 = cy + r * Math.sin(startAngle);
        const x2 = cx + r * Math.cos(endAngle);
        const y2 = cy + r * Math.sin(endAngle);

        const path = item.count === 0
            ? null
            : `M ${cx} ${cy} L ${x1.toFixed(3)} ${y1.toFixed(3)} A ${r} ${r} 0 ${angle > Math.PI ? 1 : 0} 1 ${x2.toFixed(3)} ${y2.toFixed(3)} Z`;

        startAngle = endAngle;
        return { path, color: COLORS[i] };
    });

    return (
        <svg viewBox="0 0 300 300" className="w-full max-w-[280px]">
            {slices.map((slice, i) =>
                slice.path && (
                    <path key={i} d={slice.path} fill={slice.color} stroke="#1f1f1f" strokeWidth="2" />
                )
            )}
        </svg>
    );
}

function VotingResults() {
    const { isAdmin, loadingAdmin } = useAdminStatus();
    const [votes, setVotes] = useState([]);
    const [totalVotes, setTotalVotes] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isAdmin) return;

        const fetchVotes = async () => {
            try {
                const { data } = await apiClient.get('/getVotes');

                const voteMap = {};
                data.voteCounts.forEach(v => {
                    voteMap[v.prerequisite] = v.count;
                });

                setVotes(themes.map(theme => ({
                    theme,
                    count: voteMap[theme] ?? 0,
                })));
                setTotalVotes(data.totalVotes);
            } catch {
                setError('Failed to load voting results.');
            } finally {
                setLoading(false);
            }
        };

        fetchVotes();
    }, [isAdmin]);

    if (loadingAdmin) return <div className="text-white text-xl md:text-2xl font-bold mt-[3rem] md:mt-[6rem] px-4">Loading...</div>;
    if (!isAdmin) return <NotFound />;
    if (loading) return <div className="text-white text-xl md:text-2xl font-bold mt-[3rem] md:mt-[6rem] px-4">Loading...</div>;
    if (error) return <div className="text-primary text-xl font-bold mt-[3rem] px-4">{error}</div>;

    return (
        <>
            <title>Voting Results | Micro Jam</title>
            <meta name="description" content="Live voting results for the next Micro Jam prerequisite." />
            <div className="px-4 md:px-0">
                <p className="text-white text-xl md:text-2xl font-bold mt-[3rem] md:mt-[6rem]">📊 voting results</p>
                <p className="text-nm text-sm md:text-base font-bold mt-[1rem]">
                    {totalVotes} total vote{totalVotes !== 1 ? 's' : ''} cast so far.
                </p>

                {totalVotes === 0 ? (
                    <p className="text-muted font-bold text-base mt-[2rem]">No votes yet — be the first!</p>
                ) : (
                    <div className="mt-[2rem] flex flex-col md:flex-row gap-8 items-center md:items-start">
                        <div className="flex-shrink-0">
                            <PieChart data={votes} total={totalVotes} />
                        </div>

                        <div className="flex flex-col gap-4 w-full">
                            {votes.map((item, i) => {
                                const pct = totalVotes > 0 ? ((item.count / totalVotes) * 100).toFixed(1) : '0.0';
                                return (
                                    <div key={item.theme} className="flex items-center gap-3">
                                        <div className="w-3.5 h-3.5 rounded-sm flex-shrink-0 mt-0.5" style={{ backgroundColor: COLORS[i] }} />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-baseline gap-4">
                                                <span className="text-nm text-sm md:text-base font-bold">{item.theme}</span>
                                                <span className="text-muted text-sm font-bold whitespace-nowrap">{item.count} ({pct}%)</span>
                                            </div>
                                            <div className="mt-1.5 h-1.5 bg-[#2d2d2d] rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full"
                                                    style={{ width: `${pct}%`, backgroundColor: COLORS[i] }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default VotingResults;
