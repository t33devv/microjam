
function Jam({ name, url, imageUrl }) {

    return (
        <a href={url} target="_blank" rel="noreferrer" className="inline-block transition-transform duration-300 hover:-translate-y-4" style={{ width: 'fit-content' }}>
            <div className="bg-white pb-[0.6rem] mt-[2rem] flex flex-col items-center">
                <img src={imageUrl} alt={name} width={280} />
                <p className="mt-[0.5rem] text-bg text-base font-bold">{name}</p>
            </div>
        </a>
        
    )
}

export default Jam