import { useState, useEffect } from "react"
import { Link } from "react-router-dom"

import axios from "axios";

function Navbar() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMe();
    }, []);

    const handleLogin = () => {
        window.location.href = 'http://localhost:4000/auth/discord/login';
    }

    const handleLogout = async (e) => {
        e.preventDefault();
        
        try {
            await axios.post('http://localhost:4000/auth/logout', {}, {
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
            const response = await axios.get('http://localhost:4000/user/me', {
                withCredentials: true,
            });
            console.log('User:', response.data);
            setUser(response.data);
        } catch (error) {
            console.error('Not logged in:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

  return (
    <div className="grid grid-cols-custom-layout w-full gap-4">
        <div className="flex justify-start items-center">
            <p className="text-muted font-bold text-3xl">
                // Micro Jam
            </p>
        </div>
        <div className="flex justify-end items-center">
            <p className="flex justify-center items-center font-bold text-base">
                <span className="text-primary underline">
                    <Link to="/">home</Link>
                </span>
                <span className="text-muted mx-[0.5rem]">
                    /
                </span>
                <span className="text-primary underline">
                    <Link to="/jams">jams</Link>
                </span>
                <span className="text-muted mx-[0.5rem]">
                    /
                </span>
                <span className="text-primary underline">
                    <Link to="/hof">hall of fame</Link>
                </span>
                <span className="text-muted mx-[0.5rem]">
                    /
                </span>
                <span className="text-primary underline">
                    <Link to="/voting">voting</Link>
                </span>
                <span className="text-muted mx-[0.5rem]">
                    /
                </span>
                {loading ? (
                    <span className="text-muted">...</span>
                ) : user ? (
                    <span className="text-white italic underline relative group border border-white px-2 py-1">
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