import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Import optimized images
import footballImg from './images/FOOTBALL.jpg';
import carsImg from './images/CARS.jpg';
import bikesImg from './images/BIKES.jpg';
import f1Img from './images/F1.jpg';
import seriesImg from './images/SERIES.jpg';
import moviesImg from './images/MOVIES.jpg';
import musicImg from './images/MUSIC.jpg';
import gamesImg from './images/GAMES.jpg';

/**
 * CollectionGrid Component - "Shop by Passion" Category Grid
 * 
 * WHY THIS INCREASES SALES:
 * - Sells identity, not just paper ("I'm an Anime fan")
 * - Reduces decision fatigue by guiding users
 * - 2x2 mobile grid is thumb-friendly
 * - Hover zoom creates premium "want" feeling
 * - Each category tells a story
 */

const collections = [
  {
    id: 'football',
    name: 'Football',
    tagline: 'Icons of the Beautiful Game',
    image: footballImg,
    category: 'football',
    color: 'from-green-500 to-emerald-700',
    emoji: '⚽',
  },
  {
    id: 'cars',
    name: 'Cars',
    tagline: 'Dream Machines on Walls',
    image: carsImg,
    category: 'cars',
    color: 'from-red-600 to-orange-600',
    emoji: '🚗',
  },
  {
    id: 'bikes',
    name: 'Bikes',
    tagline: 'Ride the Wall Art',
    image: bikesImg,
    category: 'bikes',
    color: 'from-gray-700 to-gray-900',
    emoji: '🏍️',
  },
  {
    id: 'f1',
    name: 'F1',
    tagline: 'Speed Legends & Racing Icons',
    image: f1Img,
    category: 'f1',
    color: 'from-red-500 to-red-800',
    emoji: '🏁',
  },
  {
    id: 'series',
    name: 'Series',
    tagline: 'Your Favourite Shows',
    image: seriesImg,
    category: 'tv-series',
    color: 'from-blue-600 to-indigo-800',
    emoji: '📺',
  },
  {
    id: 'movies',
    name: 'Movies',
    tagline: 'Cinema on Your Wall',
    image: moviesImg,
    category: 'movies',
    color: 'from-yellow-600 to-red-700',
    emoji: '🎬',
  },
  {
    id: 'music',
    name: 'Music',
    tagline: 'Feel the Beat Every Day',
    image: musicImg,
    category: 'music',
    color: 'from-purple-600 to-pink-600',
    emoji: '🎵',
  },
  {
    id: 'games',
    name: 'Games',
    tagline: 'Level Up Your Room',
    image: gamesImg,
    category: 'games',
    color: 'from-cyan-500 to-blue-700',
    emoji: '🎮',
  },
];

export default function CollectionGrid() {
  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Shop by <span className="text-purple-600">Passion</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find art that speaks to your soul. Every collection tells a story.
          </p>
        </motion.div>

        {/* Grid: 2 cols mobile, 4 cols desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={`/products?category=${collection.category}`}
                className="group block relative overflow-hidden rounded-2xl aspect-[3/4] sm:aspect-square"
              >
                {/* Background Image with Zoom Effect */}
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    src={collection.image}
                    alt={collection.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                  />
                </div>

                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t ${collection.color} opacity-60 group-hover:opacity-70 transition-opacity duration-300`} />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5">
                  {/* Emoji Badge */}
                  <motion.span
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.05, type: 'spring' }}
                    className="absolute top-3 right-3 text-2xl sm:text-3xl filter drop-shadow-lg"
                  >
                    {collection.emoji}
                  </motion.span>

                  {/* Title & Tagline */}
                  <div className="transform transition-transform duration-300 group-hover:-translate-y-2">
                    <h3 className="text-white font-bold text-base sm:text-lg lg:text-xl mb-1 drop-shadow-lg">
                      {collection.name}
                    </h3>
                    <p className="text-white/80 text-xs sm:text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {collection.tagline}
                    </p>
                  </div>

                  {/* Explore Arrow */}
                  <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <span className="text-white text-xs font-medium">Explore</span>
                    <svg 
                      className="w-4 h-4 text-white transform transition-transform duration-300 group-hover:translate-x-1" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Border Glow on Hover */}
                <div className="absolute inset-0 rounded-2xl border-2 border-white/0 group-hover:border-white/30 transition-all duration-300" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-8 sm:mt-10"
        >
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-colors"
          >
            <span>View All Collections</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/**
 * CSS for extra hover effects (add to your stylesheet):
 * 
 * .collection-card::before {
 *   content: '';
 *   position: absolute;
 *   inset: 0;
 *   background: linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.8) 100%);
 *   z-index: 1;
 * }
 * 
 * .collection-card:hover img {
 *   transform: scale(1.1);
 * }
 */
