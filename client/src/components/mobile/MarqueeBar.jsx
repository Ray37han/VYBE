import { motion } from 'framer-motion';

export default function MarqueeBar({ darkMode }) {
  const marqueeText = [
    'CUSTOM POSTERS',
    'PREMIUM ART',
    'EXPRESS YOURSELF',
    'FLAT 33% DISCOUNT',
    'CUSTOM POSTERS',
    'PREMIUM ART',
    'EXPRESS YOURSELF',
    'FLAT 33% DISCOUNT',
  ];

  return (
    <div className="relative overflow-hidden py-6 my-8">
      {/* Background with slight rotation */}
      <div
        className={`absolute inset-0 -skew-y-2 ${
          darkMode
            ? 'bg-gradient-to-r from-purple-900/40 via-pink-900/40 to-purple-900/40'
            : 'bg-gradient-to-r from-purple-200/60 via-pink-200/60 to-purple-200/60'
        }`}
        style={{
          boxShadow: darkMode
            ? 'inset 0 2px 10px rgba(0,0,0,0.3)'
            : 'inset 0 2px 10px rgba(147,51,234,0.2)',
        }}
      />

      {/* Animated Marquee Container */}
      <div className="relative overflow-hidden">
        <motion.div
          className="flex gap-8 whitespace-nowrap"
          animate={{
            x: [0, -1000],
          }}
          transition={{
            x: {
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            },
          }}
          style={{
            willChange: 'transform',
          }}
        >
          {marqueeText.map((text, index) => (
            <div
              key={index}
              className="flex items-center gap-8"
            >
              <span
                className={`text-2xl md:text-3xl font-black tracking-wider ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}
                style={{
                  textShadow: darkMode
                    ? '2px 2px 4px rgba(0,0,0,0.5)'
                    : '2px 2px 4px rgba(147,51,234,0.2)',
                }}
              >
                {text}
              </span>
              <span
                className={`text-3xl ${
                  darkMode ? 'text-purple-400' : 'text-purple-600'
                }`}
              >
                •
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Gradient Fade Edges */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-20 pointer-events-none ${
          darkMode
            ? 'bg-gradient-to-r from-moon-night to-transparent'
            : 'bg-gradient-to-r from-blue-50 to-transparent'
        }`}
      />
      <div
        className={`absolute right-0 top-0 bottom-0 w-20 pointer-events-none ${
          darkMode
            ? 'bg-gradient-to-l from-moon-night to-transparent'
            : 'bg-gradient-to-l from-pink-50 to-transparent'
        }`}
      />
    </div>
  );
}
