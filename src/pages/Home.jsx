import { Link } from "react-router-dom"

import { jams } from "../data/jams";

import Jam from "../components/Jam";

function Home() {
    let upcomingJam = null;
    for (const jam of jams) {
        if (jam.status === "upcoming") {
            upcomingJam = jam;
            break;
        }
    }
  return (
    <>
        <div className="px-4 md:px-0">
            <p className="text-white text-xl md:text-2xl font-bold mt-[3rem] md:mt-[6rem]">👋 hello, welcome to this page!</p>
            <p className="text-nm text-sm md:text-base font-bold mt-[1rem]">Micro Jam is a 48-hour Game Jam (game dev competition) that runs once every 2 weeks. We host our Jams on itch.io, and we're trying to become the world's largest weekend Jam.</p>
            <p className="text-nm text-sm md:text-base font-bold mt-[1rem]">We offer $200+ worth of prizes every event, thanks to our sponsors <span className="italic underline">GameMaker</span> and <span className="italic underline">Bezi</span>, as well as <span className="italic underline">MiniScript</span>! Since our creation in December of 2023 by Tommy (Tobias) Zhou, our generous sponsors helped us grow to a community of 3,500+ members.</p>

            <div className="mt-[1rem] text-base md:text-lg font-bold">
                <p className="text-muted">
                    <span className="text-muted">* </span>
                    <a target="_blank" href="https://discord.com/invite/micro-jam-1190868995226730616" className="text-primary underline">
                        join our discord server
                    </a>
                </p>
                <iframe 
                    className="mt-[2rem] w-full max-w-[350px]" 
                    src="https://discord.com/widget?id=1190868995226730616&theme=dark" 
                    width="350" 
                    height="500" 
                    allowtransparency="true" 
                    frameBorder="0" 
                    sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                ></iframe>
            </div>
        </div>

        <div className="px-4 md:px-0">
            <p className="text-white text-xl md:text-2xl font-bold mt-[3rem] md:mt-[4rem]">⏳ upcoming jam</p>
            <Jam 
                key={upcomingJam.id} 
                name={upcomingJam.title} 
                url={upcomingJam.itchUrl}
                imageUrl={upcomingJam.img}
            />
        </div>

        <div className="mt-[3rem] md:mt-[5rem] px-4 md:px-0">
            <p className="text-white text-xl md:text-2xl font-bold mt-[3rem] md:mt-[4rem]">🤝 our beloved partners</p>
            <div className="text-base md:text-lg font-bold">
                <section id="list" className="group mt-[1rem]">
                    <div className="flex flex-col justify-between border-l-4 border-li p-4 md:p-5 transition-all duration-300 group-hover:opacity-30 group-hover:border-bg group-hover:hover:opacity-100 group-hover:hover:border-l-[24px] group-hover:hover:border-primary">
                        <a target="_blank" href="https://opr.as/GameMaker-Micro-Jam" className="text-primary text-lg md:text-xl underline">GameMaker</a>
                        <span className="text-li font-bold before:content-['//_']">an amazing user friendly game engine</span>
                    </div>
                    <div className="flex flex-col justify-between border-l-4 border-li p-4 md:p-5 transition-all duration-300 group-hover:opacity-30 group-hover:border-bg group-hover:hover:opacity-100 group-hover:hover:border-l-[24px] group-hover:hover:border-primary">
                        <a href="https://www.bezi.com/?utm_medium=itch&utm_source=microjam" target="_blank" className="text-primary text-lg md:text-xl underline">Bezi</a>
                        <span className="text-li font-bold before:content-['//_']">a smart AI unity assistant for dev</span>
                    </div>
                    <div className="flex flex-col justify-between border-l-4 border-li p-4 md:p-5 transition-all duration-300 group-hover:opacity-30 group-hover:border-bg group-hover:hover:opacity-100 group-hover:hover:border-l-[24px] group-hover:hover:border-primary">
                        <a target="_blank" href="https://miniscript.org/" className="text-primary text-lg md:text-xl underline">MiniScript</a>
                        <span className="text-li font-bold before:content-['//_']">easy scripting language to create games</span>
                    </div>
                </section>
            </div>
        </div>
    </>
  )
}

export default Home