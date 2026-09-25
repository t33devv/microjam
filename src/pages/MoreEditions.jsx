import { useEffect, useState } from 'react';

import Jam from '../components/Jam';
import apiClient from '../services/apiClient';

function MoreEditions() {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let ignore = false;
        apiClient.get('/partnered-jams')
            .then(({ data }) => {
                if (ignore) return;
                setList(Array.isArray(data) ? data : []);
                setError(null);
            })
            .catch(() => {
                if (!ignore) setError('Failed to load partnered jams.');
            })
            .finally(() => {
                if (!ignore) setLoading(false);
            });
        return () => { ignore = true; };
    }, []);

    return (
        <>
            <title>More editions — partnered & co-hosted jams | Micro Jam</title>
            <meta name="description" content="Jams Micro Jam co-hosts or partners on — Code for a Cause, SlapJam, and more." />
            <div className="px-4 md:px-0">
                <p className="text-white text-xl md:text-2xl font-bold mt-[3rem] md:mt-[6rem]">🤝 more editions</p>
                <p className="text-nm text-sm md:text-base font-bold mt-[1rem]">
                    jams we co-host or partner on. not part of the main Micro Jam series.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mt-[2rem] md:mt-[3rem] px-4 md:px-0">
                {loading ? (
                    <p className="text-li text-base font-bold">Loading...</p>
                ) : error ? (
                    <p className="text-primary text-base font-bold">{error}</p>
                ) : list.length ? (
                    list.map((p, i) => (
                        <div key={`${p.title}-${i}`} className="relative">
                            <Jam name={p.title} url={p.url} imageUrl={p.img} />
                            {p.blurb && (
                                <p className="text-li text-xs md:text-sm mt-2 max-w-[280px] break-words">{p.blurb}</p>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="text-li text-base font-bold">No partnered jams yet.</p>
                )}
            </div>
        </>
    );
}

export default MoreEditions;
