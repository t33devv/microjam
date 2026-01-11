import { useEffect, useMemo, useState } from "react";

import Jam from "../components/Jam";
import apiClient from "../services/apiClient";
import useAdminStatus from "../hooks/useAdminStatus";
import AdminJsonEditor from "../components/AdminJsonEditor";

function Jams() {
    const [jams, setJams] = useState([]);
    const [loadingJams, setLoadingJams] = useState(true);
    const [jamsError, setJamsError] = useState(null);
    const [editingJamId, setEditingJamId] = useState(null);
    const [isAddingJam, setIsAddingJam] = useState(false);
    const [editorValue, setEditorValue] = useState("{}");
    const [editorError, setEditorError] = useState(null);
    const [savingJam, setSavingJam] = useState(false);
    const { isAdmin, loadingAdmin } = useAdminStatus();

    const loadJams = () => {
        let ignore = false;

        const fetchJams = async () => {
            try {
                const { data } = await apiClient.get('/jams');
                if (ignore) return;

                setJams(Array.isArray(data) ? data : []);
                setJamsError(null);
            } catch (error) {
                if (!ignore) {
                    console.error('Failed to load jams', error);
                    setJamsError('Failed to load jams. Please try again later.');
                }
            } finally {
                if (!ignore) {
                    setLoadingJams(false);
                }
            }
        };

        fetchJams();

        return () => {
            ignore = true;
        };
    };

    useEffect(loadJams, []);

    const sortedJams = useMemo(() => [...jams].sort((a, b) => b.id - a.id), [jams]);

    const openEditorForJam = (jam) => {
        setEditorError(null);
        setSavingJam(false);
        setIsAddingJam(false);
        setEditingJamId(jam.id);
        setEditorValue(JSON.stringify(jam, null, 2));
    };

    const openAddJam = () => {
        setEditorError(null);
        setSavingJam(false);
        setEditingJamId(null);
        setIsAddingJam(true);
        setEditorValue(JSON.stringify({
            title: "",
            status: "upcoming",
            itchUrl: "",
            img: ""
        }, null, 2));
    };

    const resetEditor = () => {
        setEditingJamId(null);
        setIsAddingJam(false);
        setEditorError(null);
        setSavingJam(false);
    };

    const handleSaveJam = async () => {
        try {
            setEditorError(null);
            setSavingJam(true);
            const parsed = JSON.parse(editorValue);
            if (!parsed.title || !parsed.itchUrl || !parsed.img) {
                setEditorError('title, itchUrl and img are required.');
                setSavingJam(false);
                return;
            }

            if (isAddingJam) {
                await apiClient.post('/admin/jams', parsed);
            } else {
                await apiClient.put(`/admin/jams/${editingJamId}`, parsed);
            }

            resetEditor();
            setLoadingJams(true);
            loadJams();
            if (typeof window !== "undefined") {
                window.location.reload();
            }
        } catch (error) {
            console.error('Failed to save jam', error);
            if (error instanceof SyntaxError) {
                setEditorError('Invalid JSON. Please fix and try again.');
            } else {
                setEditorError(error?.response?.data?.error || 'Failed to save jam.');
            }
            setSavingJam(false);
        }
    };

    return (
        <>
            <title>Game jams archive | Micro Jam</title>
            <meta name="description" content="Explore past Micro Jam competitions. View results, winning games, previous themes, and join the upcoming biweekly game development challenge!" />
            <div className="px-4 md:px-0">
                <p className="text-white text-xl md:text-2xl font-bold mt-[3rem] md:mt-[6rem]">📜 our (long) history of jams:</p>
            </div>
            {isAdmin && !loadingAdmin && (
                <div className="px-4 md:px-0 mt-3">
                    <button
                        type="button"
                        onClick={openAddJam}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-li/40 text-white font-bold rounded-full hover:border-primary/60"
                    >
                        <span className="text-lg">+</span>
                        <span>Add jam</span>
                    </button>
                </div>
            )}
            {(isAddingJam || editingJamId !== null) && (
                <div className="px-4 md:px-0 mt-4">
                    <AdminJsonEditor
                        title={isAddingJam ? "Add jam" : "Edit jam"}
                        description="Update the jam JSON and save to persist."
                        value={editorValue}
                        onChange={setEditorValue}
                        onSave={handleSaveJam}
                        onCancel={resetEditor}
                        saving={savingJam}
                        error={editorError}
                    />
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mt-[2rem] md:mt-[3rem] px-4 md:px-0">
                {loadingJams ? (
                    <p className="text-li text-base font-bold">Loading jams...</p>
                ) : jamsError ? (
                    <p className="text-primary text-base font-bold">{jamsError}</p>
                ) : sortedJams.length ? (
                    sortedJams.map((jam) => {
                        const isEditingThis = editingJamId === jam.id && !isAddingJam;
                        if (isEditingThis) {
                            return null;
                        }

                        return (
                            <div key={jam.id} className="relative">
                                <Jam 
                                    name={jam.title} 
                                    url={jam.itchUrl}
                                    imageUrl={jam.img}
                                />
                                {isAdmin && !loadingAdmin && (
                                    <button
                                        type="button"
                                        onClick={() => openEditorForJam(jam)}
                                        className="absolute top-3 right-3 bg-black/70 text-white p-2 rounded-full border border-white/30 hover:border-primary/70"
                                        aria-label="Edit jam"
                                    >
                                        ✏️
                                    </button>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <p className="text-li text-base font-bold">No jams found.</p>
                )}
            </div>
        </>
    )
}

export default Jams