import { Link } from "react-router-dom"

import { useNavigate } from "react-router-dom";

function Footer() {

  const navigate = useNavigate();

  const scrollToTop = () => {
    navigate('/'); 
    setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  }

  return (
    <section id="footer" className="pt-4 pb-12 md:pb-24 px-4 md:px-0">
      <hr className="border-dashed border-li border-2 mt-[2rem] md:mt-[4rem] mb-[1.5rem] md:mb-[2rem]" />
      <p className="leading-6 text-sm md:text-base font-bold text-nm">
        made by <a href="https://github.com/t33devv " target="_blank"  className="text-ac underline hover:no-underline hover:bg-ac hover:text-bg">tobias zhou</a><br />
        made for <button onClick={scrollToTop} className="text-ac underline hover:no-underline hover:bg-ac hover:text-bg cursor-pointer">micro jam</button><br />
        v1.0.3<br />
        © 2026<br />
        
        <br /><br />
      </p>
    </section>
  )
}

export default Footer