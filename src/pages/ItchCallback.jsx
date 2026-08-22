import { useEffect, useState } from 'react';

import apiClient from '../services/apiClient';
import { saveAuthToken } from '../services/authToken';

function ItchCallback() {
    const [status, setStatus] = useState('Linking your itch.io account...');

    useEffect(() => {
        const complete = async () => {
            const hash = window.location.hash.startsWith('#')
                ? window.location.hash.slice(1)
                : window.location.hash;

            const params = new URLSearchParams(hash);
            const accessToken = params.get('access_token');
            const state = params.get('state');

            if (!accessToken) {
                setStatus('No access token returned from itch.io. Try again.');
                return;
            }

            let redirectUrl = '/';
            if (state) {
                try {
                    const decoded = JSON.parse(atob(state));
                    if (decoded?.redirectUrl) redirectUrl = decoded.redirectUrl;
                } catch { /* ignore */ }
            }

            try {
                const { data } = await apiClient.post('/auth/itch/complete', { access_token: accessToken });
                if (data?.token) saveAuthToken(data.token);
                setStatus('Linked! Redirecting...');
                window.location.href = redirectUrl;
            } catch (error) {
                console.error('itch link failed:', error);
                setStatus(error?.response?.data?.error || 'Failed to link itch account.');
            }
        };

        complete();
    }, []);

    return (
        <div className="px-4 md:px-0">
            <p className="text-white text-xl md:text-2xl font-bold mt-[3rem] md:mt-[6rem]">🎮 itch.io</p>
            <p className="text-nm text-sm md:text-base font-bold mt-[1rem]">{status}</p>
        </div>
    );
}

export default ItchCallback;
