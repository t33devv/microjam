import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useLocation } from "react-router-dom"

import { API_URL } from '../config';

function Navbar() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    const checkAuth = () => {
        // Check if user is authenticated
        fetch(`${API_URL}/auth/user`, {
            credentials: 'include',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Auth check failed');
                }
                return res.json();
            })
            .then(data => {
                console.log('Auth response:', data); // Debug log
                if (data.authenticated && data.user) {
                    setUser(data.user);
                } else {
                    setUser(null);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Auth check failed:', err);
                setUser(null);
                setLoading(false);
            });
    };

    useEffect(() => {
        checkAuth();
    }, []);

    // Re-check auth when location changes (after redirect from login)
    useEffect(() => {
        // Small delay to ensure cookie is set after redirect
        const timer = setTimeout(() => {
            checkAuth();
        }, 500);
        return () => clearTimeout(timer);
    }, [location.pathname]);

    const handleLogin = () => {
        window.location.href = `${API_URL}/auth/discord`;
    };

    const handleLogout = async () => {
        try {
            await fetch(`${API_URL}/auth/logout`, {
                credentials: 'include',
                method: 'GET'
            });
            setUser(null);
            window.location.href = '/';
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

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