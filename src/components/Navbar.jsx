import { useState, useEffect } from "react"
import { Link } from "react-router-dom"

import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function Navbar() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMe();
    }, []);

    const handleLogin = () => {
        window.location.href = `${API_URL}/auth/discord/login`;
    }

    const handleLogout = async (e) => {
        e.preventDefault();
        
        try {
            await axios.post(`${API_URL}/auth/logout`, {}, {
                withCredentials: true
            });
            
            setUser(null);
            window.location.href = '/';
        } catch (error) {
            console.error('Logout failed:', error);
            setUser(null);
            window.location.href = '/';
        }
    };
    
    const getMe = async () => {
        try {
            const response = await axios.get(`${API_URL}/user/me`, {
                withCredentials: true,
            });
            setUser(response.data);
        } catch (error) {
            console.error('Not logged in:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

  return (
    <div className="flex flex-col md:grid md:grid-cols-custom-layout w-full gap-2 md:gap-4 px-4 md:px-0">
        <div className="flex justify-start items-center">
            <p className="text-muted font-bold text-3xl md:text-3xl">
                // Micro Jam
            </p>
        </div>
        <div className="flex flex-wrap justify-start md:justify-end items-center gap-1 md:gap-0">
            <p className="flex flex-wrap justify-start md:justify-center items-center font-bold text-sm md:text-base">
                <span className="text-primary underline">
                    <Link to="/">home</Link>
                </span>
                <span className="text-muted mx-1 md:mx-[0.5rem]">
                    /
                </span>
                <span className="text-primary underline">
                    <Link to="/jams">jams</Link>
                </span>
                <span className="text-muted mx-1 md:mx-[0.5rem]">
                    /
                </span>
                <span className="text-primary underline">
                    <Link to="/hof">hoFame</Link>
                </span>
                <span className="text-muted mx-1 md:mx-[0.5rem]">
                    /
                </span>
                <span className="text-primary underline">
                    <Link to="/voting">voting</Link>
                </span>
                <span className="text-muted mx-1 md:mx-[0.5rem]">
                    /
                </span>
                {loading ? (
                    <span className="text-muted">...</span>
                ) : user ? (
                    <span className="text-white italic underline relative group border border-white px-1 md:px-2 py-0.5 md:py-1 text-xs md:text-base">
                        <a href="#" onClick={handleLogout} className="cursor-pointer">
                            *{user.username}*
                        </a>
                        <span className="absolute bottom-full left-1 transform -translate-x-1/2 mb-2 px-2 py-1 bg-bg border border-li text-nm text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            click to sign out
                        </span>
                    </span>
                ) : (
                    <span className="text-primary underline">
                        <a href="#" onClick={handleLogin}>login</a>
                    </span>
                )}
            </p>
        </div>
    </div>
  )
}

export default Navbar