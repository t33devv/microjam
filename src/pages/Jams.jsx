

import { jams } from "../data/jams";

import Jam from "../components/Jam";

function Jams() {
    const sortedJams = [...jams].sort((a, b) => b.id - a.id);

    return (
        <>
            <div>
                <p className="text-white text-2xl font-bold mt-[6rem]">📜 our (long) history of jams:</p>
            </div>
            <div className="grid grid-cols-2 gap-10 mt-[3rem]">
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
