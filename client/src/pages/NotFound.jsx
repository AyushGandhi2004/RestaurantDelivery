import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-[calc(100vh-64px)] flex flex-col items-center
                  justify-center text-center px-4">
    <p className="text-8xl font-bold text-gray-100">404</p>
    <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-2">
      Page not found
    </h1>
    <p className="text-gray-500 mb-8">
      The page you're looking for doesn't exist.
    </p>
    <Link to="/"
      className="bg-brand-600 text-white px-6 py-3 rounded-xl
                 font-medium hover:bg-brand-700 transition-colors">
      Go Home
    </Link>
  </div>
);

export default NotFound;