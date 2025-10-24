import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectCreative, EffectCoverflow, Navigation } from 'swiper/modules';
import { FiShoppingCart, FiStar, FiTruck, FiAward, FiZap, FiMoon, FiSun } from 'react-icons/fi';
import { productsAPI, featuredPostersAPI } from '../api';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-creative';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';

// Snowflake component
const Snowflake = ({ delay, duration, left }) => (
  <motion.div
    className="absolute text-white text-2xl opacity-80"
    style={{ left: `${left}%`, top: '-5%' }}
    initial={{ y: -20, opacity: 0 }}
    animate={{ 
      y: '110vh', 
      opacity: [0, 1, 1, 0],
      x: [0, Math.random() * 100 - 50, 0]
    }}
    transition={{ 
      duration, 
      delay, 
      repeat: Infinity,
      ease: 'linear'
    }}
  >
    ❄
  </motion.div>
);

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [posterGallery, setPosterGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snowEnabled, setSnowEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });
  const heroRef = useRef(null);
  
  const { scrollYProgress } = useScroll();
  
  // Smoother scroll animations with spring physics
  const smoothScrollProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  
  const yPosAnim = useTransform(smoothScrollProgress, [0, 1], [0, -100]);
  const opacityAnim = useTransform(smoothScrollProgress, [0, 0.5], [1, 0]);
  const scaleAnim = useTransform(smoothScrollProgress, [0, 0.5], [1, 0.8]);

  // Listen for theme changes from Navbar
  useEffect(() => {
    const handleThemeChange = () => {
      const currentTheme = localStorage.getItem('theme');
      setDarkMode(currentTheme === 'dark');
    };

    window.addEventListener('storage', handleThemeChange);
    window.addEventListener('themeChange', handleThemeChange);

    return () => {
      window.removeEventListener('storage', handleThemeChange);
      window.removeEventListener('themeChange', handleThemeChange);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse, postersResponse] = await Promise.all([
          productsAPI.getAll({ featured: true, limit: 8 }),
          featuredPostersAPI.getAll()
        ]);
        
        setFeaturedProducts(productsResponse.data || productsResponse || []);
        setPosterGallery(postersResponse.data || postersResponse || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="pt-16 overflow-hidden">
      {/* Hero Section - Moon Knight Theme */}
      <section 
        ref={heroRef}
        className={`relative min-h-screen flex items-center justify-center overflow-hidden transition-colors duration-500 ${
          darkMode ? 'bg-moon-gradient' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
        }`}
      >
        {/* Control Buttons - Fixed Position */}
        <div className="fixed top-24 right-6 z-50 flex flex-col gap-3">
          {/* Snowfall Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSnowEnabled(!snowEnabled)}
            className={`p-4 rounded-full shadow-lg backdrop-blur-md border-2 transition-all duration-300 ${
              darkMode 
                ? 'bg-moon-midnight/60 border-moon-silver text-moon-silver hover:bg-moon-silver hover:text-moon-night' 
                : 'bg-white/60 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white'
            }`}
            title={snowEnabled ? "Disable Snowfall" : "Enable Snowfall"}
          >
            <span className="text-2xl">{snowEnabled ? '❄️' : '🌙'}</span>
          </motion.button>
        </div>

        {/* Snowfall Effect */}
        {snowEnabled && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(50)].map((_, i) => (
              <Snowflake
                key={i}
                delay={Math.random() * 5}
                duration={5 + Math.random() * 10}
                left={Math.random() * 100}
              />
            ))}
          </div>
        )}

        {/* Egyptian Hieroglyphic Pattern Overlay */}
        <div className="absolute inset-0 hieroglyph-overlay opacity-30"></div>

        {/* Moon/Sun Symbol */}
        <motion.div
          className="absolute top-20 right-10 md:right-20"
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{ 
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity }
          }}
        >
          {darkMode ? (
            <FiMoon className="w-20 h-20 md:w-32 md:h-32 opacity-20 text-moon-gold" />
          ) : (
            <FiSun className="w-20 h-20 md:w-32 md:h-32 opacity-20 text-yellow-400" />
          )}
        </motion.div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Text Content with Moon Knight Theme */}
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, type: "spring" }}
              style={{ y: yPosAnim, opacity: opacityAnim }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-4"
              >
                <span className={`inline-block px-6 py-2 rounded-full font-semibold text-sm tracking-wider animate-pulse-slow ${
                  darkMode 
                    ? 'bg-moon-mystical/20 border border-moon-gold/30 text-moon-gold' 
                    : 'bg-purple-100 border border-purple-300 text-purple-600'
                }`}>
                  ✨ VENGEANCE IN STYLE
                </span>
              </motion.div>

              <motion.h1 
                className={`text-5xl md:text-7xl font-bold mb-6 leading-tight ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Rise of the{' '}
                <span className={`block mt-2 ${darkMode ? 'moon-gradient-text neon-text' : 'gradient-text'}`}>
                  Night Warriors
                </span>
              </motion.h1>

              <motion.p 
                className={`text-xl mb-8 leading-relaxed ${
                  darkMode ? 'text-moon-silver' : 'text-gray-700'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Unleash your inner champion with our exclusive collection of epic posters.
                From football icons to supercar dreams - Transform your space into a shrine of greatness.
              </motion.p>

              <motion.div 
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Link to="/products" className={darkMode ? "btn-moon group" : "btn-primary group"}>
                  <span className="flex items-center gap-2">
                    <FiZap className="group-hover:rotate-12 transition-transform" />
                    Explore Collection
                  </span>
                </Link>
                <Link 
                  to="/products?category=custom" 
                  className={`px-8 py-4 bg-transparent border-2 font-bold rounded-full transform hover:scale-110 transition-all duration-500 ${
                    darkMode 
                      ? 'border-moon-gold text-moon-gold hover:bg-moon-gold hover:text-moon-night'
                      : 'border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white'
                  }`}
                >
                  Custom Creations
                </Link>
              </motion.div>
            </motion.div>

            {/* 3D Floating Poster Cards */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, type: "spring" }}
              className="relative h-[600px] hidden md:block perspective-1000"
              style={{ scale: scaleAnim }}
            >
              {/* Main Poster - Center */}
              <motion.div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-96 rounded-2xl overflow-hidden shadow-2xl z-30 poster-card glow-border"
                animate={{ 
                  y: [0, -20, 0],
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                whileHover={{ scale: 1.1, z: 50 }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&h=800&fit=crop" 
                  alt="Football Icon"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-moon-night via-transparent to-transparent flex items-end p-6">
                  <div>
                    <div className="text-white font-bold text-2xl mb-1">CR7</div>
                    <div className="text-moon-gold text-sm">Football Icon</div>
                  </div>
                </div>
              </motion.div>

              {/* Left Poster - Car */}
              <motion.div
                className="absolute top-24 left-0 w-56 h-80 rounded-2xl overflow-hidden shadow-2xl z-20 poster-card"
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [-5, -8, -5]
                }}
                transition={{ 
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                whileHover={{ scale: 1.05, rotate: 0, z: 40 }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&h=800&fit=crop" 
                  alt="Lamborghini"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-yellow-600/90 via-transparent to-transparent flex items-end p-4">
                  <div className="text-white font-bold text-lg">Lambo Dreams</div>
                </div>
              </motion.div>

              {/* Right Poster - Football Player */}
              <motion.div
                className="absolute top-32 right-0 w-64 h-88 rounded-2xl overflow-hidden shadow-2xl z-20 poster-card"
                animate={{ 
                  y: [0, -18, 0],
                  rotate: [5, 8, 5]
                }}
                transition={{ 
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                whileHover={{ scale: 1.05, rotate: 0, z: 40 }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=600&h=800&fit=crop" 
                  alt="Messi"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-600/90 via-transparent to-transparent flex items-end p-4">
                  <div className="text-white font-bold text-lg">The GOAT</div>
                </div>
              </motion.div>

              {/* Bottom Poster - Car */}
              <motion.div
                className="absolute bottom-10 left-1/4 w-52 h-72 rounded-2xl overflow-hidden shadow-2xl z-10 poster-card"
                animate={{ 
                  y: [0, -12, 0],
                  rotate: [3, -3, 3]
                }}
                transition={{ 
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                whileHover={{ scale: 1.05, rotate: 0, z: 35 }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600&h=800&fit=crop" 
                  alt="Ferrari"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-red-600/90 via-transparent to-transparent flex items-end p-4">
                  <div className="text-white font-bold text-lg">Ferrari Pride</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Mystical Scroll Indicator */}
        <motion.div 
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-8 h-12 border-2 border-moon-gold rounded-full flex justify-center relative overflow-hidden">
            <motion.div 
              className="w-1 h-3 bg-moon-gold rounded-full mt-2"
              animate={{ y: [0, 20, 0], opacity: [1, 0, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            ></motion.div>
          </div>
          <div className="text-moon-silver text-xs mt-2 text-center">Scroll</div>
        </motion.div>
      </section>

      {/* Poster Gallery Showcase - 3D Carousel */}
      <section className={`py-20 relative overflow-hidden transition-colors duration-500 ${
        darkMode ? 'bg-gradient-to-b from-moon-night to-moon-midnight' : 'bg-gradient-to-b from-purple-50 to-blue-100'
      }`}>
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10">
          <div className={`absolute w-96 h-96 rounded-full filter blur-3xl animate-pulse-slow top-10 left-10 ${
            darkMode ? 'bg-moon-mystical' : 'bg-purple-400'
          }`}></div>
          <div className={`absolute w-96 h-96 rounded-full filter blur-3xl animate-pulse-slow bottom-10 right-10 ${
            darkMode ? 'bg-moon-gold' : 'bg-yellow-400'
          }`} style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.h2 
              className={`text-5xl md:text-6xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <span className={darkMode ? 'moon-gradient-text neon-text' : 'gradient-text'}>Mystical Collection</span>
            </motion.h2>
            <motion.p 
              className={`text-xl max-w-2xl mx-auto ${darkMode ? 'text-moon-silver' : 'text-gray-700'}`}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              Icons that inspire. Champions that motivate. Art that transforms.
            </motion.p>
          </motion.div>

          {/* 3D Coverflow Swiper */}
          <Swiper
            modules={[Autoplay, EffectCoverflow, Navigation]}
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            slidesPerView="auto"
            coverflowEffect={{
              rotate: 50,
              stretch: 0,
              depth: 100,
              modifier: 1,
              slideShadows: true,
            }}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            navigation={true}
            className="poster-gallery-swiper"
          >
            {posterGallery.map((poster, index) => (
              <SwiperSlide key={poster._id} style={{ width: '350px', height: '500px' }}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, rotateY: 10 }}
                  className="relative h-full rounded-2xl overflow-hidden shadow-2xl poster-card group"
                >
                  <img 
                    src={poster.image} 
                    alt={poster.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${poster.colorGradient} opacity-60 group-hover:opacity-40 transition-opacity duration-500`}></div>
                  
                  {/* Content */}
                  {/* Image */}
                  <img 
                    src={poster.image} 
                    alt={poster.title}
                    className="absolute inset-0 w-full h-full object-cover rounded-2xl group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {/* Gradient Overlay - Only bottom portion for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent group-hover:from-black/95 transition-all duration-500"></div>
                  
                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="text-sm font-semibold text-moon-gold mb-2 tracking-wider">
                        {poster.category}
                      </div>
                      <h3 className="text-3xl font-bold mb-4 group-hover:scale-110 transition-transform">
                        {poster.title}
                      </h3>
                      <button className="px-6 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full font-semibold hover:bg-white hover:text-moon-night transition-all duration-300 transform hover:scale-105">
                        View Poster
                      </button>
                    </motion.div>
                  </div>

                  {/* Glowing Border Effect */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-moon-gold transition-all duration-500 rounded-2xl"></div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* Features Section - Glass Morphism */}
      <section className={`py-20 relative overflow-hidden transition-colors duration-500 ${
        darkMode ? 'bg-moon-midnight' : 'bg-white'
      }`}>
        <div className="absolute inset-0 hieroglyph-overlay opacity-20"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: FiShoppingCart,
                title: "Custom Creations",
                description: "Create your own masterpiece with iconic designs and custom artworks",
                color: "from-moon-mystical to-purple-600",
                delay: 0
              },
              {
                icon: FiTruck,
                title: "Swift Delivery",
                description: "Fast as Moon Knight's justice - Secure packaging across Bangladesh",
                color: "from-moon-gold to-yellow-600",
                delay: 0.2
              },
              {
                icon: FiAward,
                title: "Supreme Quality",
                description: "Museum-grade prints that honor the greatness they represent",
                color: "from-moon-silver to-gray-400",
                delay: 0.4
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: feature.delay, type: "spring" }}
                whileHover={{ y: -10, scale: 1.05 }}
                className={`text-center p-8 rounded-2xl transition-all duration-500 group ${
                  darkMode 
                    ? 'glass-moon hover:shadow-2xl hover:shadow-moon-mystical/30'
                    : 'bg-white/80 backdrop-blur-lg border border-gray-200 hover:shadow-2xl hover:shadow-purple-300/50'
                }`}
              >
                <motion.div 
                  className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center group-hover:animate-spin-slow`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 1 }}
                >
                  <feature.icon className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className={`text-2xl font-bold mb-3 transition-colors ${
                  darkMode 
                    ? 'text-white group-hover:text-moon-gold'
                    : 'text-gray-900 group-hover:text-purple-600'
                }`}>
                  {feature.title}
                </h3>
                <p className={`leading-relaxed ${darkMode ? 'text-moon-silver' : 'text-gray-600'}`}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products - Swiper Carousel */}
      <section className={`py-20 transition-colors duration-500 ${
        darkMode ? 'bg-gradient-to-b from-moon-midnight to-moon-night' : 'bg-gradient-to-b from-gray-50 to-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className={`text-5xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <span className={darkMode ? 'moon-gradient-text' : 'gradient-text'}>Featured Treasures</span>
            </h2>
            <p className={`text-xl ${darkMode ? 'text-moon-silver' : 'text-gray-700'}`}>Curated selection of iconic wall art</p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <motion.div 
                className="w-16 h-16 border-4 border-moon-gold border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              ></motion.div>
            </div>
          ) : (
            <Swiper
              modules={[Autoplay, Pagination, EffectCreative]}
              spaceBetween={30}
              slidesPerView={1}
              pagination={{ clickable: true }}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
                1280: { slidesPerView: 4 },
              }}
              className="pb-12"
            >
              {featuredProducts.map((product, index) => (
                <SwiperSlide key={product._id}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ 
                      delay: index * 0.05,
                      duration: 0.5,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                  >
                    <Link to={`/products/${product._id}`} className="block group">
                      <div className="card-moon overflow-hidden">
                        <div className="relative aspect-[3/4] overflow-hidden bg-moon-blue">
                          <img
                            src={product.images[0]?.url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="500"%3E%3Crect fill="%231e293b" width="400" height="500"/%3E%3Ctext fill="%23cbd5e1" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24"%3ENo Image%3C/text%3E%3C/svg%3E'}
                            alt={product.name}
                            className="absolute inset-0 w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-700 ease-out"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-moon-night/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end">
                            <div className="p-4 text-white w-full">
                              <button className="w-full btn-moon text-sm py-2">View Details</button>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-lg mb-2 truncate text-white">{product.name}</h3>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-moon-gold">
                              ৳{product.basePrice}
                            </span>
                            <div className="flex items-center text-sm text-moon-silver">
                              <FiStar className="w-4 h-4 fill-moon-gold text-moon-gold mr-1" />
                              <span>{product.rating.average.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}

          <motion.div 
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link to="/products" className="btn-moon">
              Explore Full Collection
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Epic Moon Knight Style */}
      <section className={`py-20 relative overflow-hidden transition-colors duration-500 ${
        darkMode ? 'bg-moon-gradient' : 'bg-gradient-to-br from-purple-100 via-blue-50 to-pink-100'
      }`}>
        {/* Animated Moon/Sun */}
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 opacity-10"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: 360 
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {darkMode ? (
            <FiMoon className="w-full h-full text-moon-gold" />
          ) : (
            <FiSun className="w-full h-full text-yellow-400" />
          )}
        </motion.div>

        <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", duration: 1 }}
          >
            <motion.h2 
              className="text-5xl md:text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className={darkMode ? 'neon-text' : ''}>Ready to Join</span>
              <br />
              <span className={darkMode ? 'moon-gradient-text' : 'gradient-text'}>The Essence?</span>
            </motion.h2>
            
            <motion.p 
              className={`text-xl mb-8 max-w-2xl mx-auto ${darkMode ? 'text-moon-silver' : 'text-gray-700'}`}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Transform your space into a hall of masterpieces. Start your collection today and let greatness inspire you every day.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Link 
                to="/products?category=custom" 
                className="inline-block px-12 py-5 bg-gradient-to-r from-moon-gold via-moon-mystical to-moon-silver text-moon-night font-bold text-xl rounded-full hover:shadow-2xl hover:shadow-moon-gold/50 transform hover:scale-110 transition-all duration-500 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <FiZap className="group-hover:rotate-180 transition-transform duration-500" />
                  Begin Your Legacy
                  <FiZap className="group-hover:rotate-180 transition-transform duration-500" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-white"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                ></motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
