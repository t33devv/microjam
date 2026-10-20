import { useEffect, useMemo, useState } from "react";
import apiClient from "../services/apiClient";

import Jam from "../components/Jam";

function Home() {
    const [jams, setJams] = useState([]);
    const [loadingJams, setLoadingJams] = useState(true);
    const [jamsError, setJamsError] = useState(null);

    useEffect(() => {
        let ignore = false;

        const fetchJams = async () => {
            try {
                const { data } = await apiClient.get('/jams');
                if (ignore) return;

                const jamList = Array.isArray(data) ? data : [];
                setJams(jamList);
                setJamsError(null);
            } catch (error) {
                if (!ignore) {
                    console.error('Failed to load jams', error);
                    setJamsError('Failed to load the upcoming jam.');
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
    }, []);

    const featuredJam = useMemo(
        () => jams.find((jam) => jam.status === "active")
            || jams.find((jam) => jam.status === "voting")
            || jams.find((jam) => jam.status === "upcoming"),
        [jams],
    );

    const featuredLabel = featuredJam?.status === "active"
        ? "🔥 active micro jam"
        : featuredJam?.status === "voting"
            ? "🎮 vote on micro jam"
            : "⏳ upcoming micro jam";
  return (
    <>
        <title>48-hour Biweekly Game Jam with Prizes | Micro Jam</title>
        <meta name="description" content="Micro Jam is a 48-hour Game Jam that runs once every 2 weeks. Join 4,900+ members and compete for $300+ in prizes!" />
        <div className="px-4 md:px-0">
            <h1 className="text-white text-xl md:text-2xl font-bold mt-[3rem] md:mt-[6rem]">👋 hello, welcome to Micro Jam: a 48-hour Game Jam!</h1>
            <p className="text-nm text-sm md:text-base font-bold mt-[1rem]">Micro Jam is a 48-hour Game Jam (game dev competition) that runs once every 2 weeks. We host our Jams on itch.io, and we're trying to become the world's largest weekend Jam.</p>
            <p className="text-nm text-sm md:text-base font-bold mt-[1rem]">We offer $300+ worth of prizes every event, thanks to our sponsors <span className="italic underline">Ziva</span> and <span className="italic underline">Xorin</span>! Since our creation in December of 2023, our generous sponsors helped us grow to a community of 4,900+ members.</p>

            <div className="mt-[1rem] text-base md:text-lg font-bold">
                <p className="text-muted">
                    <span className="text-muted">* </span>
                    <a target="_blank" href="https://discord.com/invite/micro-jam-1190868995226730616" className="text-primary underline">
                        join our discord server
                    </a>
                </p>
                <div className="mt-[2rem] flex flex-col md:flex-row gap-8 items-start">
                    <iframe
                        className="w-full max-w-[350px] shrink-0"
                        src="https://discord.com/widget?id=1190868995226730616&theme=dark"
                        width="350"
                        height="500"
                        allowtransparency="true"
                        frameBorder="0"
                        sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                    ></iframe>
                    <div>
                        <h2 className="text-white text-xl md:text-2xl font-bold">{featuredLabel}</h2>
                        {loadingJams ? (
                            <p className="text-li text-base font-bold mt-4">Loading jam...</p>
                        ) : jamsError ? (
                            <p className="text-primary text-base font-bold mt-4">{jamsError}</p>
                        ) : featuredJam ? (
                            <Jam
                                key={featuredJam.id}
                                name={featuredJam.title}
                                url={featuredJam.itchUrl}
                                imageUrl={featuredJam.img}
                            />
                        ) : (
                            <p className="text-li text-base font-bold mt-4">No upcoming jam has been announced yet. Check back soon!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-[3rem] md:mt-[5rem] px-4 md:px-0">
            <h2 className="text-white text-xl md:text-2xl font-bold mt-[3rem] md:mt-[4rem]">🤝 our beloved partners</h2>
            <div className="text-base md:text-lg font-bold">
                <section id="list" className="group mt-[1rem]">
                    <div className="flex flex-col justify-between border-l-4 border-li p-4 md:p-5 transition-all duration-300 group-hover:opacity-30 group-hover:border-bg group-hover:hover:opacity-100 group-hover:hover:border-l-[24px] group-hover:hover:border-primary">
                        <a target="_blank" href="https://ziva.sh/?utm_source=microjam" className="text-primary text-lg md:text-xl underline">Ziva</a>
                        <span className="text-li font-bold before:content-['//_']">top tier dev godot AI assistant</span>
                    </div>
                    <div className="flex flex-col justify-between border-l-4 border-li p-4 md:p-5 transition-all duration-300 group-hover:opacity-30 group-hover:border-bg group-hover:hover:opacity-100 group-hover:hover:border-l-[24px] group-hover:hover:border-primary">
                        <a href="https://xorin.ai/jam/get-xorin/" target="_blank" className="text-primary text-lg md:text-xl underline">Xorin</a>
                        <span className="text-li font-bold before:content-['//_']">Unity tool for building games faster</span>
                    </div>
                    <div className="flex flex-col justify-between border-l-4 border-li p-4 md:p-5 transition-all duration-300 group-hover:opacity-30 group-hover:border-bg group-hover:hover:opacity-100 group-hover:hover:border-l-[24px] group-hover:hover:border-primary">
                        <a href="" target="_blank" className="text-primary text-lg md:text-xl underline">Easel</a>
                        <span className="text-li font-bold before:content-['//_']">special programming lang for games</span>
                    </div>
                    <div className="flex flex-col justify-between border-l-4 border-li p-4 md:p-5 transition-all duration-300 group-hover:opacity-30 group-hover:border-bg group-hover:hover:opacity-100 group-hover:hover:border-l-[24px] group-hover:hover:border-primary">
                        <a href="https://craftpix.net/?utm_source=microjam" target="_blank" className="text-primary text-lg md:text-xl underline">CraftPix</a>
                        <span className="text-li font-bold before:content-['//_']">pixel art game assets for every genre</span>
                    </div>
                    <div className="flex flex-col justify-between border-l-4 border-li p-4 md:p-5 transition-all duration-300 group-hover:opacity-30 group-hover:border-bg group-hover:hover:opacity-100 group-hover:hover:border-l-[24px] group-hover:hover:border-primary">
                        <a href="https://1bitdragon.com/?utm_source=microjam" target="_blank" className="text-primary text-lg md:text-xl underline">1BitDragon</a>
                        <span className="text-li font-bold before:content-['//_']">simple music-making tool for game devs</span>
                    </div>
                </section>
            </div>
        </div>

        <div className="mt-[3rem] md:mt-[5rem] px-4 md:px-0">
            <h2 className="text-white text-xl md:text-2xl font-bold mt-[3rem] md:mt-[4rem]">❓ frequently asked questions</h2>
            <p className="text-li text-xs md:text-sm font-bold mt-2">hover a question to reveal the answer.</p>
            <div className="text-base md:text-lg font-bold">
                <section className="mt-[1rem]">
                    {[
                        {
                            q: "Where do I vote on games?",
                            a: "All official voting happens on the Micro Jam website (microjam.xyz) — not on itch.io. Only votes on microjam.xyz count toward prizes.",
                        },
                        {
                            q: "If I'm in a team, do all members have to submit the game?",
                            a: "No, only one person should submit it. You can add your team members to the game page.",
                        },
                        {
                            q: "Can I submit a game I already made?",
                            a: "No, you can only submit games made in the given timeframe.",
                        },
                        {
                            q: "Can I use premade assets?",
                            a: "Yes, as long as you have permission to use them, or they're your own.",
                        },
                        {
                            q: "Can I use AI (artificial intelligence)?",
                            a: "Yes, AI is allowed.",
                        },
                        {
                            q: "What's a prerequisite?",
                            a: "A prerequisite is something your game must follow. It is voted on and released once the Jam starts.",
                        },
                        {
                            q: "Does my game have to follow the theme and prerequisite?",
                            a: "No, but both are part of the rating criteria, so try to integrate them into your game.",
                        },
                        {
                            q: "Is there a prize for winning?",
                            a: "Yes, we offer numerous prizes. Check the jam page for a full breakdown.",
                        },
                        {
                            q: "Can someone win 2 awards?",
                            a: "Yes and no. Someone can win both a top 3 award and a \"Best Ziva / Easel / Xorin Entry\" award. Their prize includes both awards plus the cash prize.",
                        },
                    ].map((f) => (
                        <div key={f.q} className="group/card flex flex-col justify-between border-l-4 border-li p-4 md:p-5 transition-all duration-300 hover:border-l-[24px] hover:border-primary">
                            <span className="text-primary text-lg md:text-xl">{f.q}</span>
                            <span className="hidden group-hover/card:block text-li font-bold before:content-['//_'] mt-1">{f.a}</span>
                        </div>
                    ))}
                </section>
            </div>
        </div>
    </>
  )
}

export default Home