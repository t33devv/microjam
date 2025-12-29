import { jams } from "../data/jams";

import Jam from "../components/Jam";

function Jams() {
    const sortedJams = [...jams].sort((a, b) => b.id - a.id);

    return (
        <>
            <div className="px-4 md:px-0">
                <p className="text-white text-xl md:text-2xl font-bold mt-[3rem] md:mt-[6rem]">📜 our (long) history of jams:</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mt-[2rem] md:mt-[3rem] px-4 md:px-0">
                {sortedJams.map((jam) => {
                    return (
                        <Jam 
                            key={jam.id} 
                            name={jam.title} 
                            url={jam.itchUrl}
                            imageUrl={jam.img}
                        />
                    );
                })}
            </div>
        </>
    )
}

export default Jams