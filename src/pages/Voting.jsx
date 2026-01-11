import { useState, useEffect } from 'react';

import apiClient from '../services/apiClient';

const themes = [
    "Constantly overworked",
    "Full of mystery",
    "Choices matter",
    "No repetition",
    "Rules change mid-game"
];

function Voting() {
    const [selectedTheme, setSelectedTheme] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkExistingVote();
    }, []);

    const checkExistingVote = async () => {
        try {
            const response = await apiClient.get(`/votes/current`);
            
            if (response.data.hasVoted) {
                setSelectedTheme(response.data.selectedTheme);
            }
        } catch (error) {
            console.error('Error checking vote:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (theme) => {
        try {
            await apiClient.post(`/votes`, { theme });
            
            setSelectedTheme(theme);
        } catch (error) {
            console.error('Error submitting vote:', error);
            alert('Please log in to vote!');
        }
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