
function Jam({ name, url, imageUrl }) {

    return (
        <a href={url} target="_blank" rel="noreferrer">
            <div className="bg-white pb-[0.6rem] mt-[1rem] flex flex-col items-center" style={{ width: 'fit-content' }}>
                <img src={imageUrl} alt={name} width={300} />
                <p className="mt-[0.5rem] text-bg text-base font-bold">{name}</p>
            </div>
        </a>
        
    )
}

export default Jam