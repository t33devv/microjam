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
    <section id="footer" className="pt-4 pb-24">
      <hr className="border-dashed border-li border-2 mt-[4rem] mb-[2rem]" />
      <p className="leading-6 text-base font-bold text-nm">
        made by <a href="https://github.com/t33devv " target="_blank"  className="text-ac underline hover:no-underline hover:bg-ac hover:text-bg">tobias zhou</a><br />
        made for <button onClick={scrollToTop} className="text-ac underline hover:no-underline hover:bg-ac hover:text-bg cursor-pointer">micro jam</button><br />
        v1.0.0<br /><br />
      </p>
    </section>
  )
}

export default Footer