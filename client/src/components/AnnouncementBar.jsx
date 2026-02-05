import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiGift } from 'react-icons/fi';

/**
 * AnnouncementBar - Top banner for promotions
 * 
 * WHY: Immediate trust + urgency = higher conversion
 */

const announcements = [
  { id: 1, text: '🔥 MEGA SALE: 33% OFF Everything!', highlight: true },
  { id: 2, text: '🚚 Cash on Delivery Available Nationwide', highlight: false },
  { id: 3, text: '💳 Pay with bKash/Nagad - Instant Confirmation', highlight: false },
  { id: 4, text: '✨ Free Delivery on Orders Over ৳999', highlight: true },
];

export default function AnnouncementBar() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white py-2 px-4 relative overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 text-sm font-medium"
          >
            {announcements[currentIndex].highlight && (
              <FiGift className="w-4 h-4 animate-bounce" />
            )}
            <span>{announcements[currentIndex].text}</span>
          </motion.div>
        </AnimatePresence>
        
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Close announcement"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
