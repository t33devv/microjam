function HoC() {
  return (
    <main className="px-4 md:px-0">
      <title>Hall of Creators | Micro Jam</title>
      <meta name="description" content="Creators partnering with Micro Jam to document their game jam experience on their channels." />

      <p className="text-white text-xl md:text-2xl font-bold mt-[3rem] md:mt-[6rem]">🎬 hall of creators</p>
      <p className="text-nm text-sm md:text-base font-bold mt-[1rem]">
        we're partnering with creators, inviting them to join a jam and log their experience on their channel.
      </p>

      <section className="group mt-[2rem] md:mt-[3rem]">
        <div className="flex flex-col justify-between border-l-4 border-li p-4 md:p-5 transition-all duration-300 group-hover:opacity-30 group-hover:border-bg group-hover:hover:opacity-100 group-hover:hover:border-l-[24px] group-hover:hover:border-primary">
          <a
            target="_blank"
            rel="noreferrer"
            href="https://www.youtube.com/@DatonedevYT"
            className="text-primary text-lg md:text-xl underline font-bold"
          >
            DatOneDev
          </a>
          <span className="text-li text-sm md:text-base font-bold before:content-['//_']">youtube devlog creator</span>
        </div>
        <div className="flex flex-col justify-between border-l-4 border-li p-4 md:p-5 transition-all duration-300 group-hover:opacity-30 group-hover:border-bg group-hover:hover:opacity-100 group-hover:hover:border-l-[24px] group-hover:hover:border-primary">
          <a
            target="_blank"
            rel="noreferrer"
            href="https://www.youtube.com/@LandonDevelops"
            className="text-primary text-lg md:text-xl underline font-bold"
          >
            LandonDevlops
          </a>
          <span className="text-li text-sm md:text-base font-bold before:content-['//_']">youtube devlog creator</span>
        </div>
      </section>
    </main>
  )
}

export default HoC
