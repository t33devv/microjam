const DEFAULT_API_URL = 'https://mj-server-juv9.onrender.com';

const API_URL = import.meta.env.VITE_API_URL ?? DEFAULT_API_URL;

export { API_URL };