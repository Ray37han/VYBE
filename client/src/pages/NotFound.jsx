import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>Page Not Found | VYBE</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="The page you are looking for does not exist. Browse our premium poster collection at VYBE." />
      </Helmet>
      <div className="pt-24 pb-12 min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 dark:from-moon-night dark:via-moon-midnight dark:to-moon-night">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center px-4"
        >
          <h1 className="text-8xl font-bold text-indigo-400 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            The page you are looking for doesn't exist or has been moved. Let's get you back to something awesome.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/"
              className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
            >
              Go Home
            </Link>
            <Link
              to="/products"
              className="px-6 py-3 rounded-xl border border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
            >
              Browse Posters
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
}
