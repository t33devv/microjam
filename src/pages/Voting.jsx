import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const themes = [
    "Mouse input only",
    "The friends along the way",
    "Mirrored input",
    "The journey back matters",
    "Health is money"
];

function Voting() {
    const [selectedTheme, setSelectedTheme] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkExistingVote();
    }, []);

    const checkExistingVote = async () => {
        try {
            const response = await axios.get(`${API_URL}/votes/current`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
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
            await axios.post(`${API_URL}/votes`, 
                { theme },
                { 
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            setSelectedTheme(theme);
        } catch (error) {
            console.error('Error submitting vote:', error);
            alert('Please log in to vote!');
        }
    };

    if (loading) return <div className="text-white text-2xl font-bold mt-[6rem]">Loading...</div>;

    return (
        <div>
            <p className="text-white text-2xl font-bold mt-[6rem]">📊 vote for the next jam prereq</p>
            <p className="text-nm text-base font-bold mt-[1rem]">
                Click one of the prerequisites below to vote for it. Don't worry if you misclick, you can change your vote by clicking a different one.
            </p>
            
            {selectedTheme && (
                <p className="text-primary text-lg font-bold mt-[2rem]">
                    ✅ You voted for: {selectedTheme}
                </p>
            )}
            
            <section id="list" className="group mt-[1rem]">
                <div className="text-lg font-bold mt-[2rem]">
                    {themes.map((theme) => (
                        <div 
                            key={theme}
                            onClick={() => handleVote(theme)}
                            className={`mt-[1rem] flex flex-col justify-between border-l-4 p-5 transition-all duration-300 cursor-pointer
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
    );
}

export default Voting;