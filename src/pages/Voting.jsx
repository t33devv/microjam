import React from 'react'

function Voting() {
  return (
    <div>
        <p className="text-white text-2xl font-bold mt-[6rem]">this page doesn't actually work yet :(</p>
        <p className="text-white text-2xl font-bold mt-[6rem]">📊 vote for the next jam prereq</p>
        <p className="text-nm text-base font-bold mt-[1rem]">Click one of the prerequisites below to vote for it. Don't worry if you misclick, you can change your vote by clicking a different one.</p>
        <section id="list" className="group mt-[1rem]">
            <div className="text-lg font-bold mt-[2rem]">
            <div className="mt-[1rem] flex flex-col justify-between border-l-4 border-li p-5 transition-all duration-300 group-hover:opacity-30 group-hover:border-bg group-hover:hover:opacity-100 group-hover:hover:border-l-[24px] group-hover:hover:border-primary">
                <a className="text-primary underline">Mouse input only</a>
            </div>
            <div className="mt-[1rem] flex flex-col justify-between border-l-4 border-li p-5 transition-all duration-300 group-hover:opacity-30 group-hover:border-bg group-hover:hover:opacity-100 group-hover:hover:border-l-[24px] group-hover:hover:border-primary">
                <a className="text-primary underline">The friends along the way</a>
            </div>
            <div className="mt-[1rem] flex flex-col justify-between border-l-4 border-li p-5 transition-all duration-300 group-hover:opacity-30 group-hover:border-bg group-hover:hover:opacity-100 group-hover:hover:border-l-[24px] group-hover:hover:border-primary">
                <a className="text-primary underline">Mirrored input</a>
            </div>
            <div className="mt-[1rem] flex flex-col justify-between border-l-4 border-li p-5 transition-all duration-300 group-hover:opacity-30 group-hover:border-bg group-hover:hover:opacity-100 group-hover:hover:border-l-[24px] group-hover:hover:border-primary">
                <a className="text-primary underline">The journey back matters</a>
            </div>
            <div className="mt-[1rem] flex flex-col justify-between border-l-4 border-li p-5 transition-all duration-300 group-hover:opacity-30 group-hover:border-bg group-hover:hover:opacity-100 group-hover:hover:border-l-[24px] group-hover:hover:border-primary">
                <a className="text-primary underline">Health is money</a>
            </div>
        </div>
        </section>
        
        
    </div>
  )
}

export default Voting