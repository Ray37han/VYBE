import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

/**
 * HeroCarousel - Main hero section with rotating slides
 * 
 * UX COPY VARIATIONS (better than "Express Yourself in Art"):
 * 1. "Your Wall Deserves Better" - Creates problem awareness
 * 2. "Turn Your Walls Into Vibes" - Speaks the customer's language
 * 3. "Where Passion Meets Paper" - Premium feel + identity
 */

const slides = [
  {
    id: 1,
    title: 'Turn Your Walls Into',
    highlight: 'Vibes',
    subtitle: 'Premium posters that speak your language. Made in Bangladesh, made for you.',
    cta: 'Shop Now',
    ctaLink: '/products',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1920&q=85',
    gradient: 'from-purple-900/90 via-purple-900/70 to-transparent',
  },
  {
    id: 2,
    title: 'Your Passion,',
    highlight: 'Your Wall',
    subtitle: 'From Anime to Football — find art that defines you.',
    cta: 'Explore Collections',
    ctaLink: '/products',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1920&q=85',
    gradient: 'from-indigo-900/90 via-indigo-900/70 to-transparent',
  },
  {
    id: 3,
    title: 'Create Your Own',
    highlight: 'Masterpiece',
    subtitle: 'Upload any image. We\'ll turn it into premium wall art.',
    cta: 'Start Creating',
    ctaLink: '/customize',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1920&q=85',
    gradient: 'from-pink-900/90 via-pink-900/70 to-transparent',
  },
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const slide = slides[currentSlide];

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <section className="relative h-[70vh] sm:h-[80vh] lg:h-[90vh] overflow-hidden bg-gray-900">
      {/* Background Slides */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
          className="absolute inset-0"
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`} />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={`content-${currentSlide}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                  {slide.title}{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    {slide.highlight}
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-lg">
                  {slide.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to={slide.ctaLink}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 font-bold rounded-full hover:bg-gray-100 transition-all hover:scale-105 min-h-[48px]"
                  >
                    <span>{slide.cta}</span>
                    <FiArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/products?category=custom"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-gray-900 transition-all min-h-[48px]"
                  >
                    <span>Custom Poster</span>
                  </Link>
                </div>

                {/* Trust Badges - Mobile */}
                <div className="mt-8 flex flex-wrap gap-4 text-sm text-white/70">
                  <span className="flex items-center gap-1">
                    <span>🚚</span> Cash on Delivery
                  </span>
                  <span className="flex items-center gap-1">
                    <span>💳</span> bKash/Nagad
                  </span>
                  <span className="flex items-center gap-1">
                    <span>🇧🇩</span> Made in BD
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors"
        aria-label="Previous slide"
      >
        <FiChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors"
        aria-label="Next slide"
      >
        <FiChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSlide
                ? 'w-8 bg-white'
                : 'bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
