import { motion } from 'framer-motion';
import { FiInstagram } from 'react-icons/fi';
import { FaFacebook } from 'react-icons/fa';

/**
 * InstagramFeed - Social proof section (Facebook & Instagram Posts)
 */

const socialPosts = [
  { 
    id: 1, 
    type: 'facebook',
    embedUrl: 'https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fvybe.bd911%2Fposts%2Fpfbid02gmUgvdR1ibqQyL3n4a8r6CzfZHjAvNbYWGHuLDBqBj1mBAWpKpMsfcx6eVdeGijDl&show_text=true&width=500',
    postUrl: 'https://www.facebook.com/vybe.bd911/posts/pfbid02gmUgvdR1ibqQyL3n4a8r6CzfZHjAvNbYWGHuLDBqBj1mBAWpKpMsfcx6eVdeGijDl'
  },
  { 
    id: 2, 
    type: 'facebook',
    embedUrl: 'https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fvybe.bd911%2Fposts%2Fpfbid0kFdMQDy7QAQU8giUC5EA7MmLRWe62UPF9E3dV4bs9zjzMzRHb3W8UKMFEaxBTup9l&show_text=true&width=500',
    postUrl: 'https://www.facebook.com/vybe.bd911/posts/pfbid0kFdMQDy7QAQU8giUC5EA7MmLRWe62UPF9E3dV4bs9zjzMzRHb3W8UKMFEaxBTup9l'
  },
  { 
    id: 3, 
    type: 'facebook',
    embedUrl: 'https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fvybe.bd911%2Fposts%2Fpfbid0pjf3rmzVr8ByPrDkPZdw3Eooxb8ymVnQFRAgoqWS7LwPJ5LNEhGXrh6GVqP9mEaLl&show_text=true&width=500',
    postUrl: 'https://www.facebook.com/vybe.bd911/posts/pfbid0pjf3rmzVr8ByPrDkPZdw3Eooxb8ymVnQFRAgoqWS7LwPJ5LNEhGXrh6GVqP9mEaLl'
  },
  { 
    id: 4, 
    type: 'facebook',
    embedUrl: 'https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fvybe.bd911%2Fposts%2Fpfbid02n6ymnzLJibFC2YJt5aSfyegGrA9AeLcgNdA13GQ69JB3Fgi8ukEAe5i1NHZdVPU6l&show_text=true&width=500',
    postUrl: 'https://www.facebook.com/vybe.bd911/posts/pfbid02n6ymnzLJibFC2YJt5aSfyegGrA9AeLcgNdA13GQ69JB3Fgi8ukEAe5i1NHZdVPU6l'
  },
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
            Follow Us on <span className="text-pink-500">Instagram</span> & <span className="text-blue-600">Facebook</span>
          </h2>
          <div className="flex items-center justify-center gap-6 mt-3">
            <a
              href="https://www.instagram.com/vybe.bd/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-pink-500 font-medium hover:text-pink-600 transition"
            >
              <FiInstagram className="w-5 h-5" />
              @vybe.bd
            </a>
            <a
              href="https://www.facebook.com/vybe.bd911/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition"
            >
              <FaFacebook className="w-5 h-5" />
              vybe.bd911
            </a>
          </div>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {socialPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Facebook Embed */}
              <div className="w-full h-[400px] sm:h-[450px] overflow-hidden">
                <iframe
                  src={post.embedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 'none', overflow: 'hidden' }}
                  scrolling="no"
                  frameBorder="0"
                  allowFullScreen={true}
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  className="w-full h-full"
                />
              </div>
              
              {/* Hover Overlay with View on Facebook */}
              <a
                href={post.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100"
              >
                <div className="bg-blue-600 text-white px-4 py-2 rounded-full flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                  <FaFacebook className="w-5 h-5" />
                  <span className="text-sm font-medium">View on Facebook</span>
                </div>
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
