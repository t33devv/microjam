const API_URL = import.meta.env.MODE === 'production' 
  ? '/api'  // Proxied through Vercel - same domain!
  : 'http://localhost:3000';

export { API_URL };