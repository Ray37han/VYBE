import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function MobileHero({ darkMode }) {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  // Parallax transforms
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);

  return (
    <section 
      ref={heroRef}
      className="relative min-h-[85dvh] flex items-center justify-center overflow-hidden"
      style={{
        background: darkMode
          ? 'linear-gradient(135deg, #1a1625 0%, #2d1b4e 50%, #1a1625 100%)'
          : 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 50%, #fbc2eb 100%)'
      }}
    >
      {/* Floating Cloud Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full blur-3xl ${
              darkMode ? 'bg-purple-500/20' : 'bg-white/40'
            }`}
            style={{
              width: `${150 + i * 50}px`,
              height: `${150 + i * 50}px`,
              left: `${i * 20}%`,
              top: `${i * 15}%`,
            }}
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      {/* Parallax Content Container */}
      <motion.div 
        style={{ y, opacity, scale }}
        className="relative z-10 text-center px-6"
      >
        {/* 3D Bubble Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 100, 
            damping: 15,
            duration: 1 
          }}
          className="mb-8"
        >
          <h1 
            className={`text-8xl md:text-9xl font-black tracking-tight ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}
            style={{
              fontFamily: "'Fredoka', 'Nunito', 'Poppins', sans-serif",
              textShadow: darkMode
                ? `
                  0 4px 0 rgba(139, 92, 246, 0.3),
                  0 8px 0 rgba(139, 92, 246, 0.2),
                  0 12px 0 rgba(139, 92, 246, 0.1),
                  0 16px 20px rgba(0, 0, 0, 0.4)
                `
                : `
                  0 2px 0 rgba(255, 255, 255, 0.8),
                  0 4px 0 rgba(147, 51, 234, 0.2),
                  0 8px 0 rgba(147, 51, 234, 0.15),
                  0 12px 0 rgba(147, 51, 234, 0.1),
                  0 16px 30px rgba(147, 51, 234, 0.3)
                `,
              WebkitTextStroke: darkMode ? '2px rgba(139, 92, 246, 0.5)' : '2px rgba(147, 51, 234, 0.3)',
            }}
          >
            VYBE
          </h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`text-lg md:text-xl font-medium tracking-wide ${
              darkMode ? 'text-purple-200' : 'text-purple-700'
            }`}
          >
            Express Yourself in Art
          </motion.p>
        </motion.div>

        {/* Clay-style CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            to="/products"
            className={`inline-flex items-center gap-3 px-10 py-5 text-lg font-bold rounded-full transition-all duration-300 ${
              darkMode
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
            }`}
            style={{
              boxShadow: darkMode
                ? `
                  inset 2px 2px 8px rgba(255, 255, 255, 0.2),
                  inset -2px -2px 8px rgba(0, 0, 0, 0.3),
                  0 10px 30px rgba(139, 92, 246, 0.4)
                `
                : `
                  inset 2px 2px 8px rgba(255, 255, 255, 0.6),
                  inset -2px -2px 8px rgba(0, 0, 0, 0.1),
                  0 10px 30px rgba(147, 51, 234, 0.3)
                `,
            }}
          >
            <span>Shop Now</span>
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.span>
          </Link>
        </motion.div>

        {/* Floating badges */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          {['Custom Posters', 'Premium Quality', 'Fast Shipping'].map((text, i) => (
            <motion.div
              key={text}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.2 + i * 0.1, type: "spring" }}
              whileHover={{ scale: 1.1 }}
              className={`px-5 py-2 text-sm font-semibold rounded-full ${
                darkMode
                  ? 'bg-white/10 text-purple-200 backdrop-blur-sm border border-white/20'
                  : 'bg-white/60 text-purple-700 backdrop-blur-sm border border-purple-200/50'
              }`}
              style={{
                boxShadow: darkMode
                  ? 'inset 1px 1px 4px rgba(255,255,255,0.1), 0 4px 15px rgba(0,0,0,0.2)'
                  : 'inset 1px 1px 4px rgba(255,255,255,0.8), 0 4px 15px rgba(147,51,234,0.15)',
              }}
            >
              {text}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <div className={`w-6 h-10 rounded-full border-2 ${
          darkMode ? 'border-white/50' : 'border-purple-500/50'
        } flex justify-center pt-2`}>
          <motion.div
            className={`w-1.5 h-1.5 rounded-full ${
              darkMode ? 'bg-white' : 'bg-purple-500'
            }`}
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}
