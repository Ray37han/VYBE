import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
import { ClayCard, ClayButton, ClayWrapper } from '../clay';
import { useCartStore } from '../../store';

/**
 * ClayProductCard - Example implementation of Clay UI for product cards
 * 
 * This demonstrates:
 * 1. Using ClayCard as the container with proper shadow depth
 * 2. ClayWrapper for tactile hover/tap interactions
 * 3. ClayButton for Add to Cart action
 * 4. Proper text contrast (slate-700/slate-200)
 * 5. GPU optimization via clay-optimized class
 */
export default function ClayProductCard({ product }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const { addItem } = useCartStore();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product._id,
      name: product.name,
      price: product.basePrice || product.price || product.sizes?.[0]?.price,
      image: product.images?.[0]?.url || product.image,
      quantity: 1,
    });
  };

  const toggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <Link to={`/products/${product._id}`} className="block h-full">
      <ClayWrapper>
        <ClayCard 
          size="md" 
          hoverable 
          className="h-full overflow-hidden group"
        >
          {/* Image Container */}
          <div className="relative aspect-[4/5] overflow-hidden bg-clay-200 dark:bg-clay-700">
            <img
              src={product.images?.[0]?.url || product.image || '/placeholder.jpg'}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />

            {/* Gradient Overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

            {/* Favorite Button - Top Right */}
            <button
              onClick={toggleFavorite}
              className="
                absolute top-4 right-4 
                p-2.5 rounded-full
                bg-clay-100/90 dark:bg-clay-800/90
                shadow-clay-sm dark:shadow-clay-dark-sm
                backdrop-blur-sm
                transition-all duration-200
                hover:scale-110
                active:scale-95
              "
            >
              <FiHeart 
                className={`w-5 h-5 transition-colors ${
                  isFavorite 
                    ? 'fill-red-500 text-red-500' 
                    : 'text-slate-600 dark:text-slate-300'
                }`} 
              />
            </button>

            {/* Stock Badge */}
            {product.stock < 10 && (
              <div className="
                absolute top-4 left-4
                px-3 py-1 rounded-full
                bg-red-500/90 backdrop-blur-sm
                text-white text-xs font-bold
                shadow-clay-sm
              ">
                Only {product.stock} left
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-4 space-y-3">
            {/* Category */}
            <p className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wide">
              {product.category}
            </p>

            {/* Title */}
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 line-clamp-2 min-h-[3.5rem]">
              {product.name}
            </h3>

            {/* Rating */}
            {product.rating?.average && (
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating.average)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-clay-300 dark:text-clay-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  ({product.rating.count || 0})
                </span>
              </div>
            )}

            {/* Price & Add to Cart */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <div>
                <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                  ৳{product.basePrice || product.price || product.sizes?.[0]?.price || 'N/A'}
                </p>
                {product.originalPrice && product.originalPrice > (product.basePrice || product.price) && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-through">
                    ৳{product.originalPrice}
                  </p>
                )}
              </div>

              <ClayButton
                variant="primary"
                size="sm"
                icon={<FiShoppingCart className="w-4 h-4" />}
                onClick={handleAddToCart}
                className="flex-shrink-0"
              >
                Add
              </ClayButton>
            </div>
          </div>
        </ClayCard>
      </ClayWrapper>
    </Link>
  );
}

/**
 * USAGE NOTES:
 * 
 * 1. GPU Optimization:
 *    - ClayWrapper applies 'clay-optimized' class (translateZ(0))
 *    - Safe for scrollable product grids
 * 
 * 2. Text Contrast:
 *    - Light mode: text-slate-700 (dark text on light clay)
 *    - Dark mode: text-slate-200 (light text on dark clay)
 *    - NEVER white text on light clay backgrounds
 * 
 * 3. Shadow System:
 *    - Card uses shadow-clay-md (auto switches to dark variant)
 *    - Buttons have hover shadow transitions built-in
 *    - Small elements use shadow-clay-sm
 * 
 * 4. Interaction Physics:
 *    - Hover: Card lifts 4px via ClayWrapper
 *    - Tap: Card scales to 0.96 via ClayWrapper
 *    - Image zoom on hover for visual feedback
 * 
 * 5. Performance:
 *    - No backdrop-blur on cards (only on favorite button)
 *    - Lazy loading images
 *    - GPU-accelerated transforms
 */
