import { useEffect, useMemo, useState } from 'react';

import apiClient from '../services/apiClient';

const TIERS = [
    { key: 'bronze', name: 'Bronze', jam: '$50', season: '$250', line: 'Logo on the jam page + microjam.xyz. Post kit included.' },
    { key: 'silver', name: 'Silver', jam: '$100', season: '$500', line: "Bronze + named prize category + listing in tools page." },
    { key: 'gold', name: 'Gold', jam: '$150', season: '$750', line: 'Silver + blog post + Discord announcement to 4,900+ members.' },
];

const PERKS = [
    { label: 'Logo on jam page (itch.io)', bronze: true, silver: true, gold: true },
    { label: 'Logo on microjam.xyz homepage', bronze: true, silver: true, gold: true },
    { label: 'Post kit (4 pre-made images + captions)', bronze: true, silver: true, gold: true },
    { label: 'Named prize category ("Best game made with…")', bronze: false, silver: true, gold: true },
    { label: 'Listing in the "Tools we recommend" page (tracked link)', bronze: false, silver: true, gold: true },
    { label: 'Blog post about your tool during jam week', bronze: false, silver: false, gold: true },
    { label: 'Discord announcement at jam start', bronze: false, silver: false, gold: true },
];

const FAQS = [
    {
        q: 'how many people will actually see my logo?',
        a: 'Each jam page gets 250+ joins, and every page stays live forever — all 60+ prior editions still get traffic. Season sponsors get their logo on 6 pages plus microjam.xyz.',
    },
    {
        q: 'can i offer credits or subscriptions instead of cash?',
        a: "No. Cash tier first, then you can layer on credits or keys as a prize. Credits-only sponsors historically don't stick around, and we want partners that keep the prize pool growing.",
    },
    {
        q: 'what if my company is an ai tool?',
        a: 'Micro Jam entrants build across Godot, GameMaker, Construct, Unity and browser — AI tools are welcome, but they\'ll be one option among many. If your fit is "we help devs ship faster," it works. If it\'s "AI generates the whole game," we\'re probably not the right jam.',
    },
    {
        q: 'can i sponsor a specific themed edition?',
        a: 'Yes — single-jam tier is for that. Season tier gets you every jam in a quarter.',
    },
    {
        q: 'do you send a report?',
        a: 'Yes. After each jam you sponsor, we send total joins, submissions, click-through count on your tracked link, and post-share metrics. One email.',
    },
    {
        q: 'who runs micro jam?',
        a: 'Tommy Zhou (founder) plus a small volunteer team. Email tommy@microjam.dev to talk to a person.',
    },
];

function Sponsors() {
    const [sponsors, setSponsors] = useState([]);
    const [stats, setStats] = useState({ editions: 0, joiners: 0, discordMembers: 0 });
    const [recentJams, setRecentJams] = useState([]);

    useEffect(() => {
        Promise.all([
            apiClient.get('/sponsors').catch(() => ({ data: [] })),
            apiClient.get('/sponsor-stats').catch(() => ({ data: {} })),
            apiClient.get('/jams').catch(() => ({ data: [] })),
        ]).then(([spRes, stRes, jamsRes]) => {
            setSponsors(Array.isArray(spRes.data) ? spRes.data : []);
            setStats({ editions: 0, joiners: 0, discordMembers: 0, ...(stRes.data || {}) });
            const jams = Array.isArray(jamsRes.data) ? jamsRes.data : [];
            setRecentJams([...jams].sort((a, b) => b.id - a.id).slice(0, 6));
        });
    }, []);

    const nf = useMemo(() => new Intl.NumberFormat('en-US'), []);

    return (
        <>
            <title>Sponsor Micro Jam — the biggest bi-weekly game jam on itch.io</title>
            <meta name="description" content="Sponsor Micro Jam: reach 4,900+ Discord members and 11,000+ lifetime joiners who ship small games every weekend. Bronze/Silver/Gold tiers, per-jam or per-season." />

            <div className="px-4 md:px-0">
                <h1 className="text-white text-xl md:text-2xl font-bold mt-[3rem] md:mt-[6rem]">🤝 sponsor micro jam</h1>
                <p className="text-nm text-sm md:text-base font-bold mt-[1rem]">
                    the biggest bi-weekly game jam on itch.io.
                </p>

                <div className="mt-[1.5rem] grid grid-cols-3 gap-3 md:gap-8 max-w-3xl">
                    {[
                        { n: stats.editions, l: 'editions run' },
                        { n: stats.joiners, l: 'total joiners' },
                        { n: stats.discordMembers, l: 'discord members' },
                    ].map((s) => (
                        <div key={s.l}>
                            <p className="text-primary text-2xl md:text-4xl font-bold">{nf.format(s.n)}</p>
                            <p className="text-li text-xs md:text-sm mt-1">{s.l}</p>
                        </div>
                    ))}
                </div>

                <p className="text-nm text-sm md:text-base font-bold mt-[1.5rem] max-w-3xl">
                    we've run a 48-hour game jam every two weeks since 2023. ~26% of everyone who joins ships a game — the same submit-rate as GMTK. your logo goes in front of people who <span className="italic">finish</span> games.
                </p>

                {/* Two-tier pricing */}
                <div className="mt-[2.5rem] grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {[
                        { key: 'jam', title: 'sponsor one jam', sub: 'single edition, 2-week cycle' },
                        { key: 'season', title: 'sponsor a season', sub: '6 jams / 3 months, best value' },
                    ].map((col) => (
                        <div key={col.key} className="border border-li/40 p-4 md:p-6 bg-black/20">
                            <p className="text-white text-lg md:text-xl font-bold">{col.title}</p>
                            <p className="text-li text-xs md:text-sm mt-1">{col.sub}</p>
                            <div className="mt-4 flex flex-col gap-3">
                                {TIERS.map((t) => (
                                    <div
                                        key={t.key}
                                        className="border border-li/40 p-3 flex items-center justify-between gap-3"
                                    >
                                        <div className="min-w-0">
                                            <p className="text-white font-bold">{t.name}</p>
                                            <p className="text-nm text-xs mt-1 truncate">{t.line}</p>
                                        </div>
                                        <span className="text-primary font-bold text-lg md:text-xl shrink-0">{t[col.key]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <p className="text-li text-xs md:text-sm mt-3 italic">
                    to reserve a tier, email <a href="mailto:tommy@microjam.dev" className="text-primary underline not-italic">tommy@microjam.dev</a> — we'll send an invoice / stripe link.
                </p>

                {/* Perks table */}
                <h2 className="text-white text-xl md:text-2xl font-bold mt-[3rem]">🎁 what you get</h2>
                <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-sm border-collapse min-w-[520px]">
                        <thead>
                            <tr className="border-b border-li/40">
                                <th className="text-left text-li font-bold py-2 pr-2">perk</th>
                                <th className="text-center text-li font-bold py-2 px-2 w-20">bronze</th>
                                <th className="text-center text-li font-bold py-2 px-2 w-20">silver</th>
                                <th className="text-center text-li font-bold py-2 px-2 w-20">gold</th>
                            </tr>
                        </thead>
                        <tbody>
                            {PERKS.map((p) => (
                                <tr key={p.label} className="border-b border-li/20">
                                    <td className="text-nm py-2 pr-2 font-bold">{p.label}</td>
                                    {['bronze', 'silver', 'gold'].map((k) => (
                                        <td key={k} className="text-center py-2 px-2">
                                            {p[k] ? <span className="text-primary font-bold">✓</span> : <span className="text-li/50">—</span>}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            <tr>
                                <td className="text-nm py-2 pr-2 font-bold">season tier — repeated exposure across 6 jams</td>
                                <td colSpan={3} className="text-center py-2 px-2 text-primary font-bold">included in any season tier</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p className="text-li text-xs md:text-sm mt-3 max-w-3xl italic">
                    digital goods (subscriptions, credits, keys) welcome on top of any cash tier, not instead of one. sponsors who add a named prize like "best game made with {"{your tool}"}" see the highest signup lift.
                </p>

                {/* What Micro Jam is */}
                <h2 className="text-white text-xl md:text-2xl font-bold mt-[3rem]">📌 what micro jam is</h2>
                <div className="mt-4 flex flex-col gap-4 max-w-3xl">
                    <p className="text-nm text-sm md:text-base font-bold">
                        micro jam is a 48-hour game jam that runs every two weeks on itch.io. we've been going since 2023 — {stats.editions || 60}+ editions and counting. entrants build a small browser or downloadable game around a theme we announce at jam start, then rate each other's submissions.
                    </p>
                    <p className="text-nm text-sm md:text-base font-bold">
                        community reach: {nf.format(stats.discordMembers)} discord members, {nf.format(stats.joiners)} lifetime jam joiners across all editions, and an average submit rate of ~26% — close to GMTK's 28% and higher than most weekly jams.
                    </p>
                    <p className="text-nm text-sm md:text-base font-bold">
                        sponsors reach a self-selected audience: people who already ship small games in a weekend. that's rarer than it sounds, and it's why your logo on a micro jam page converts differently to a display ad.
                    </p>
                </div>

                {/* Recent editions */}
                {recentJams.length > 0 && (
                    <>
                        <h2 className="text-white text-xl md:text-2xl font-bold mt-[3rem]">📜 recent editions</h2>
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                            {recentJams.map((j) => (
                                <a
                                    key={j.id}
                                    href={j.itchUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="border border-li/40 hover:border-primary/70 p-3 no-underline"
                                >
                                    <p className="text-primary font-bold">#{String(j.id).padStart(3, '0')}</p>
                                    <p className="text-white text-sm font-bold mt-1 break-words">{j.title.replace(/^Micro Jam \d+:?\s*/i, '') || j.title}</p>
                                    <p className="text-li text-xs mt-2 underline">view on itch →</p>
                                </a>
                            ))}
                        </div>
                    </>
                )}

                {/* Current sponsors */}
                {sponsors.length > 0 && (
                    <>
                        <h2 className="text-white text-xl md:text-2xl font-bold mt-[3rem]">💫 current sponsors</h2>
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                            {sponsors.map((s, i) => (
                                <a
                                    key={`${s.name}-${i}`}
                                    href={s.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="border border-li/40 hover:border-primary/70 p-4 flex flex-col items-center gap-2 no-underline"
                                >
                                    <img src={s.logoUrl} alt={s.name} className="max-h-16 object-contain" />
                                    <p className="text-nm text-xs md:text-sm font-bold">{s.name}</p>
                                </a>
                            ))}
                        </div>
                        <p className="text-li text-xs md:text-sm mt-3 italic">join them — pick a tier above.</p>
                    </>
                )}

                {/* How it works */}
                <h2 className="text-white text-xl md:text-2xl font-bold mt-[3rem]">⚙️ how it works</h2>
                <ol className="mt-4 flex flex-col gap-3 max-w-3xl list-decimal list-inside">
                    <li className="text-nm text-sm md:text-base font-bold">email tommy@microjam.dev with the tier you want. we send an invoice / stripe link — payment lands, we build your listing the same day.</li>
                    <li className="text-nm text-sm md:text-base font-bold">send us your logo, the link you want it pointing at (with a UTM if you like), and the promo code or prize you want to offer entrants.</li>
                    <li className="text-nm text-sm md:text-base font-bold">your logo goes live on the jam page and site before the next jam starts. you get a post kit with 4 pre-made images and suggested share dates.</li>
                </ol>

                {/* FAQ */}
                <h2 className="text-white text-xl md:text-2xl font-bold mt-[3rem]">❓ faq</h2>
                <div className="mt-4 flex flex-col gap-4 max-w-3xl">
                    {FAQS.map((f) => (
                        <div key={f.q}>
                            <p className="text-white text-sm md:text-base font-bold">{f.q}</p>
                            <p className="text-nm text-sm mt-1">{f.a}</p>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="mt-[3rem] mb-[4rem] text-center border-t border-li/40 pt-6">
                    <p className="text-white text-lg md:text-xl font-bold">
                        ready to sponsor? email <a href="mailto:tommy@microjam.dev" className="text-primary underline">tommy@microjam.dev</a> with the tier you want.
                    </p>
                    <p className="text-li text-sm mt-2">lock-in for the next jam is 7 days before it starts.</p>
                </div>
            </div>
        </>
    );
}

export default Sponsors;
