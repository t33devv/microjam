const API_URL = import.meta.env.MODE === 'production' 
  ? 'https://microjam-backend.onrender.com' 
  : 'http://localhost:3000';

export { API_URL };