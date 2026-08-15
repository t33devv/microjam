import { useEffect, useState } from 'react';
import apiClient from '../services/apiClient';

function Creator({ name, url, pfp }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-block transition-transform duration-300 hover:-translate-y-4"
      style={{ width: 'fit-content' }}
    >
      <div className="bg-white pb-[0.6rem] mt-[2rem] flex flex-col items-center">
        {pfp ? (
          <img src={pfp} alt={name} width={280} height={280} className="object-cover aspect-square" />
        ) : (
          <div
            className="flex items-center justify-center bg-black text-white text-4xl font-bold"
            style={{ width: 280, height: 280 }}
          >
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <p className="mt-[0.5rem] text-bg text-base font-bold">{name}</p>
      </div>
    </a>
  );
}

function HoC() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/creators')
      .then((res) => setCreators(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error('Failed to load creators', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="px-4 md:px-0">
      <title>Hall of Creators | Micro Jam</title>
      <meta name="description" content="Creators partnering with Micro Jam to document their game jam experience on their channels." />

      <p className="text-white text-xl md:text-2xl font-bold mt-[3rem] md:mt-[6rem]">🎬 hall of creators</p>
      <p className="text-nm text-sm md:text-base font-bold mt-[1rem]">
        we're partnering with creators, inviting them to join a jam and log their experience on their channel.
      </p>

      {loading ? (
        <p className="text-li text-base font-bold mt-[2rem]">loading creators...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mt-[2rem] md:mt-[3rem]">
          {creators.map((creator, index) => (
            <Creator key={`${creator.name}-${index}`} {...creator} />
          ))}
        </div>
      )}
    </main>
  );
}

export default HoC
