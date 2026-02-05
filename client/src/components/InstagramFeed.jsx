import { motion } from 'framer-motion';
import { FiInstagram } from 'react-icons/fi';

/**
 * InstagramFeed - Social proof section
 */

const instagramPosts = [
  { id: 1, image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80', likes: 234 },
  { id: 2, image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80', likes: 189 },
  { id: 3, image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&q=80', likes: 312 },
  { id: 4, image: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&q=80', likes: 156 },
];

export default function InstagramFeed() {
  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Follow Us on <span className="text-pink-500">Instagram</span>
          </h2>
          <a
            href="https://www.instagram.com/vybebd/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-pink-500 font-medium hover:text-pink-600"
          >
            <FiInstagram className="w-5 h-5" />
            @vybebd
          </a>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
          {instagramPosts.map((post, index) => (
            <motion.a
              key={post.id}
              href="https://www.instagram.com/vybebd/"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative aspect-square overflow-hidden rounded-xl"
            >
              <img
                src={post.image}
                alt={`Instagram post ${post.id}`}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="text-white text-center">
                  <FiInstagram className="w-8 h-8 mx-auto mb-2" />
                  <span className="text-sm font-medium">View on Instagram</span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
