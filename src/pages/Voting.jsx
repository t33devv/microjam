import { useState, useEffect } from 'react';

import { API_URL } from '../config';
import apiClient from '../services/apiClient';

function Voting() {
    const [votingError, setVotingError] = useState(null);
    const [selectedTheme, setSelectedTheme] = useState(null);
    const [loading, setLoading] = useState(true);
    const [themes, setThemes] = useState([]);
    const [requiresItch, setRequiresItch] = useState(false);

    useEffect(() => {
        loadPage();
    }, []);

    const loadPage = async () => {
        try {
            const [prereqsRes, voteRes] = await Promise.all([
                apiClient.get('/prerequisites'),
                apiClient.get('/votes/current').catch(() => ({ data: { hasVoted: false } })),
            ]);
            setThemes(Array.isArray(prereqsRes.data) ? prereqsRes.data : []);
            if (voteRes.data?.hasVoted) {
                setSelectedTheme(voteRes.data.selectedTheme);
            }
            if (voteRes.data?.requiresItch) {
                setRequiresItch(true);
            }
        } catch (error) {
            console.error('Error loading voting page:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (theme) => {
        try {
            await apiClient.post(`/votes`, { theme });
            setVotingError(null);
            setSelectedTheme(theme);
        } catch (error) {
            console.error('Error submitting vote:', error);
            const status = error?.response?.status;
            const msg = error?.response?.data?.error;
            if (status === 403 && /itch/i.test(msg || '')) {
                setRequiresItch(true);
                setVotingError(msg);
            } else {
                setVotingError(msg || 'Please log in to vote!');
            }
        }
    };

    const linkItch = () => {
        const url = new URL(`${API_URL}/auth/itch/login`);
        url.searchParams.set('redirectUrl', window.location.href);
        window.location.href = url.toString();
    };

    if (loading) return <div className="text-white text-xl md:text-2xl font-bold mt-[3rem] md:mt-[6rem] px-4">Loading...</div>;

    return (
        <>
            <title>Game Jam Prerequisite Voting | Micro Jam</title>
            <meta name="description" content="Select a prerequisite for the next Micro Jam! The game developers community is shaping the competition." />
            <div className="px-4 md:px-0">
                <p className="text-white text-xl md:text-2xl font-bold mt-[3rem] md:mt-[6rem]">📊 vote for the next jam prereq</p>
                <p className="text-nm text-sm md:text-base font-bold mt-[1rem]">
                    Click one of the prerequisites below to vote for it. Don't worry if you misclick, you can change your vote by clicking a different one.
                </p>

                {requiresItch && (
                    <div className="mt-[1rem] border border-primary/40 p-4 rounded">
                        <p className="text-nm text-sm md:text-base font-bold">
                            You need to link your itch.io account to vote. This prevents double-voting through duplicate Discord accounts.
                        </p>
                        <button
                            type="button"
                            onClick={linkItch}
                            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-primary text-black font-bold rounded hover:opacity-80"
                        >
                            Link itch.io
                        </button>
                    </div>
                )}

                <b className="text-primary text-base md:text-lg font-bold mt-[2rem]">{votingError}</b>

                {selectedTheme && (
                    <p className="text-primary text-base md:text-lg font-bold mt-[2rem]">
                        ✅ <span className="text-white">You voted for: </span>*{selectedTheme}*
                    </p>
                )}
                
                <section id="list" className="group mt-[1rem]">
                    <div className="text-base md:text-lg font-bold mt-[2rem]">
                        {themes.map((theme) => (
                            <div 
                                key={theme}
                                onClick={() => handleVote(theme)}
                                className={`mt-[1rem] flex flex-col justify-between border-l-4 p-4 md:p-5 transition-all duration-300 cursor-pointer
                                    ${selectedTheme === theme 
                                        ? 'border-l-[24px] border-primary opacity-100' 
                                        : 'border-li group-hover:opacity-30 group-hover:border-bg group-hover:hover:opacity-100 group-hover:hover:border-l-[24px] group-hover:hover:border-primary'
                                    }`}
                            >
                                <a className="text-primary underline">{theme}</a>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </>
        
    );
}

export default Voting;