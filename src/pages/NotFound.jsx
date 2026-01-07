import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="px-4 md:px-0 mt-[4rem] md:mt-[6rem]">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <p className="text-primary text-sm uppercase tracking-[0.5em]">404</p>
        <h1 className="text-white text-3xl md:text-4xl font-bold">
          Nothing here
        </h1>
        <p className="text-nm text-base md:text-lg font-bold">
          The page you are trying to reach doesn&apos;t exist or may have been moved.
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-primary/60 text-white font-bold hover:border-white/80"
          >
            take me home
          </Link>
          <Link
            to="/jams"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-li/40 text-white font-bold hover:border-primary/60"
          >
            explore jams
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound
