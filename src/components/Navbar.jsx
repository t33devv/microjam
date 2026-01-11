import { useState, useEffect } from "react"
import { Link } from "react-router-dom"

import { API_URL } from "../config";
import apiClient from "../services/apiClient";
import { saveAuthToken, clearAuthToken } from "../services/authToken";

function Navbar() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const [adminList, setAdminList] = useState([]);
    const [adminsLoading, setAdminsLoading] = useState(false);
    const [adminsError, setAdminsError] = useState(null);
    const [newAdminId, setNewAdminId] = useState("");
    const [savingAdmin, setSavingAdmin] = useState(false);

    useEffect(() => {
        syncTokenFromUrl();
        getMe();
    }, []);

    const handleLogin = () => {
        if (typeof window === 'undefined') return;

        const loginUrl = new URL(`${API_URL}/auth/discord/login`);
        loginUrl.searchParams.set('redirectUrl', window.location.origin);

        window.location.href = loginUrl.toString();
    }

    const handleLogout = async (e) => {
        e.preventDefault();
        
        try {
            await apiClient.post(`/auth/logout`);
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            clearAuthToken();
            setUser(null);
            window.location.href = '/';
        }
    };

    const getMe = async () => {
        try {
            const response = await apiClient.get(`/user/me`);
            setUser(response.data);
        } catch (error) {
            if (error.response?.status === 401) {
                clearAuthToken();
            }
            console.error('Not logged in:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    const syncTokenFromUrl = () => {
        if (typeof window === 'undefined') return;

        const url = new URL(window.location.href);
        const token = url.searchParams.get('token');

        if (!token) return;

        saveAuthToken(token);
        url.searchParams.delete('token');
        const newSearch = url.searchParams.toString();
        const newUrl = `${url.pathname}${newSearch ? `?${newSearch}` : ''}${url.hash}`;
        window.history.replaceState({}, '', newUrl);
    }

    useEffect(() => {
        if (showAdminPanel && user?.isAdmin) {
            fetchAdmins();
        }
    }, [showAdminPanel, user]);

    const fetchAdmins = async () => {
        try {
            setAdminsLoading(true);
            setAdminsError(null);
            const response = await apiClient.get('/admins');
            setAdminList(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Failed to load admins', error);
            setAdminsError('Failed to load admins');
        } finally {
            setAdminsLoading(false);
        }
    };

    const handleAddAdmin = async () => {
        if (!newAdminId.trim()) return;
        try {
            setSavingAdmin(true);
            setAdminsError(null);
            await apiClient.post('/admins', { discordId: newAdminId.trim() });
            setNewAdminId('');
            await fetchAdmins();
        } catch (error) {
            console.error('Failed to add admin', error);
            setAdminsError(error?.response?.data?.error || 'Failed to add admin');
        } finally {
            setSavingAdmin(false);
        }
    };

    const handleRemoveAdmin = async (discordId) => {
        if (!discordId) return;
        try {
            setSavingAdmin(true);
            setAdminsError(null);
            await apiClient.delete(`/admins/${discordId}`);
            await fetchAdmins();
        } catch (error) {
            console.error('Failed to remove admin', error);
            setAdminsError(error?.response?.data?.error || 'Failed to remove admin');
        } finally {
            setSavingAdmin(false);
        }
    };

  return (
    <header>
        <div className="flex flex-col md:grid md:grid-cols-custom-layout w-full gap-2 md:gap-4 px-4 md:px-0">
            <div className="flex justify-start items-center">
                <p className="text-muted font-bold text-3xl md:text-3xl">
                    // Micro Jam
                </p>
            </div>
            <nav className="flex flex-wrap justify-start md:justify-end items-center gap-1 md:gap-0">
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
                        <span className="text-white italic underline relative group border border-white px-1 md:px-2 py-0.5 md:py-1 text-xs md:text-base flex items-center gap-2">
                            <span className="relative">
                                <a href="#" onClick={handleLogout} className="cursor-pointer">
                                    *{user.username}*
                                </a>
                                <span className="absolute bottom-full left-1 transform -translate-x-1/2 mb-2 px-2 py-1 bg-bg border border-li text-nm text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    click to sign out
                                </span>
                            </span>
                            {user?.isAdmin && (
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setShowAdminPanel((prev) => !prev)}
                                        className="bg-primary text-black font-bold rounded px-2 py-1 text-[10px] md:text-xs"
                                    >
                                        admins
                                    </button>
                                    {showAdminPanel && (
                                        <div className="absolute top-full right-0 mt-2 w-64 bg-bg border border-li rounded shadow-lg p-3 z-50">
                                            <div className="flex justify-between items-center mb-2">
                                                <p className="text-white font-bold text-sm">Admin IDs</p>
                                                <button
                                                    type="button"
                                                    className="text-muted text-xs"
                                                    onClick={() => setShowAdminPanel(false)}
                                                >
                                                    close
                                                </button>
                                            </div>
                                            {adminsError && (
                                                <p className="text-xs text-red-400 mb-2">{adminsError}</p>
                                            )}
                                            {adminsLoading ? (
                                                <p className="text-xs text-muted">loading...</p>
                                            ) : (
                                                <div className="max-h-40 overflow-y-auto space-y-1 mb-3">
                                                    {adminList.length === 0 ? (
                                                        <p className="text-xs text-muted">No admins yet.</p>
                                                    ) : (
                                                        adminList.map((id) => (
                                                            <div key={id} className="flex items-center justify-between bg-black/40 px-2 py-1 rounded text-xs text-white">
                                                                <span className="truncate" title={id}>{id}</span>
                                                                <button
                                                                    type="button"
                                                                    disabled={savingAdmin || id === String(user.discordId) || id === String(user.discord_id)}
                                                                    onClick={() => handleRemoveAdmin(id)}
                                                                    className="text-red-400 disabled:opacity-40"
                                                                >
                                                                    remove
                                                                </button>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                            <div className="space-y-2">
                                                <input
                                                    type="text"
                                                    placeholder="Discord ID"
                                                    value={newAdminId}
                                                    onChange={(e) => setNewAdminId(e.target.value)}
                                                    className="w-full bg-black/40 border border-li text-white text-xs px-2 py-1 rounded"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleAddAdmin}
                                                    disabled={savingAdmin || !newAdminId.trim()}
                                                    className="w-full bg-primary text-black font-bold text-xs py-1 rounded disabled:opacity-50"
                                                >
                                                    add admin
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </span>
                    ) : (
                        <span className="text-primary underline">
                            <a href="#" onClick={handleLogin}>LOGIN</a>
                        </span>
                    )}
                </p>
            </nav>
        </div>
    </header>
    
  )
}

export default Navbar