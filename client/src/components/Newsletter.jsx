import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

/**
 * Newsletter - Email capture component
 */

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    
    // Simulate subscription
    setSubscribed(true);
    toast.success('Thanks for subscribing! 🎉');
    setEmail('');
    
    // Reset after 5 seconds
    setTimeout(() => setSubscribed(false), 5000);
  };

  return (
    <section className="py-12 sm:py-16 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Get <span className="text-purple-400">10% OFF</span> Your First Order
          </h2>
          <p className="text-gray-400 mb-8">
            Subscribe to our newsletter for exclusive deals, new arrivals, and art inspiration.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <div className="relative flex-1">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 min-h-[48px]"
                required
              />
            </div>
            <button
              type="submit"
              disabled={subscribed}
              className={`px-8 py-3 font-bold rounded-full transition-all min-h-[48px] ${
                subscribed
                  ? 'bg-green-500 text-white cursor-default'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {subscribed ? (
                <span className="flex items-center gap-2">
                  <FiCheck className="w-5 h-5" />
                  Subscribed!
                </span>
              ) : (
                'Subscribe'
              )}
            </button>
          </form>

          <p className="text-xs text-gray-500 mt-4">
            No spam, ever. Unsubscribe anytime.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
