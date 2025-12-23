/**
 * SkeletonCard - Lightweight loading placeholder for product cards
 * Uses pure CSS animations (no libraries) for maximum performance
 * Optimized for low-end devices
 */

export default function SkeletonCard({ darkMode }) {
  return (
    <div className={`rounded-2xl overflow-hidden ${
      darkMode ? 'bg-gray-800/50' : 'bg-gray-200'
    }`}>
      {/* Image skeleton */}
      <div 
        className={`aspect-[3/4] skeleton-pulse ${
          darkMode ? 'bg-gray-700' : 'bg-gray-300'
        }`}
      />
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div 
          className={`h-4 rounded skeleton-pulse ${
            darkMode ? 'bg-gray-700' : 'bg-gray-300'
          }`}
          style={{ width: '70%' }}
        />
        
        {/* Price */}
        <div 
          className={`h-5 rounded skeleton-pulse ${
            darkMode ? 'bg-gray-700' : 'bg-gray-300'
          }`}
          style={{ width: '40%' }}
        />
        
        {/* Rating */}
        <div className="flex gap-2">
          <div 
            className={`h-3 rounded skeleton-pulse ${
              darkMode ? 'bg-gray-700' : 'bg-gray-300'
            }`}
            style={{ width: '30%' }}
          />
          <div 
            className={`h-3 rounded skeleton-pulse ${
              darkMode ? 'bg-gray-700' : 'bg-gray-300'
            }`}
            style={{ width: '20%' }}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * SkeletonCarousel - Skeleton loader for carousel sections
 */
export function SkeletonCarousel({ darkMode, count = 3 }) {
  return (
    <div className="px-4 py-8">
      {/* Title skeleton */}
      <div 
        className={`h-8 rounded-lg mb-6 skeleton-pulse ${
          darkMode ? 'bg-gray-700' : 'bg-gray-300'
        }`}
        style={{ width: '50%' }}
      />
      
      {/* Cards skeleton */}
      <div className="flex gap-4 overflow-hidden">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="flex-shrink-0" style={{ width: '280px' }}>
            <SkeletonCard darkMode={darkMode} />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * SkeletonFeatureGrid - Skeleton for feature cards grid
 */
export function SkeletonFeatureGrid({ darkMode }) {
  return (
    <div className="px-4 py-12">
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`p-6 rounded-3xl skeleton-pulse ${
              darkMode ? 'bg-gray-800/50' : 'bg-gray-200'
            }`}
            style={{ height: '140px' }}
          />
        ))}
      </div>
    </div>
  );
}
