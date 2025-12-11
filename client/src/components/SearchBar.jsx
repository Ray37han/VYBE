import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiX } from 'react-icons/fi';
import Fuse from 'fuse.js';

export default function SearchBar({ products = [], darkMode = false }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Fuse.js configuration
  const fuseOptions = {
    keys: ['name', 'category'],
    threshold: 0.4,
    includeScore: true,
    minMatchCharLength: 2,
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Hybrid Search Logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    let searchResults = [];

    if (query.length === 1) {
      // **Condition A: Single letter - Use startsWith for speed & precision**
      searchResults = products.filter(
        (product) =>
          product.name.toLowerCase().startsWith(query.toLowerCase()) ||
          product.category.toLowerCase().startsWith(query.toLowerCase())
      );
    } else {
      // **Condition B: Multiple letters - Use Fuse.js for fuzzy matching**
      const fuse = new Fuse(products, fuseOptions);
      const fuseResults = fuse.search(query);
      searchResults = fuseResults.map((result) => result.item);
    }

    setResults(searchResults.slice(0, 8)); // Limit to 8 results
    setIsOpen(searchResults.length > 0);
  }, [query, products]);

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
    setQuery('');
    setIsOpen(false);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <FiSearch className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
          placeholder="Search for posters, wall art, categories..."
          className={`w-full pl-12 pr-12 py-3 rounded-xl border transition-all ${
            darkMode
              ? 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500'
          } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
        />

        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
          >
            <FiX className={`w-5 h-5 ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'} transition`} />
          </button>
        )}
      </div>

      {/* Results Dropdown - Glassmorphism Style */}
      {isOpen && results.length > 0 && (
        <div
          className={`absolute z-50 w-full mt-2 rounded-xl shadow-2xl overflow-hidden border backdrop-blur-xl ${
            darkMode
              ? 'bg-gray-900/95 border-gray-700/50'
              : 'bg-white/90 border-white/20'
          }`}
        >
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {results.map((product) => (
              <button
                key={product._id}
                onClick={() => handleProductClick(product._id)}
                className={`w-full flex items-center gap-4 p-4 transition-all ${
                  darkMode
                    ? 'hover:bg-purple-600/20 border-gray-700/50'
                    : 'hover:bg-purple-50 border-gray-100'
                } border-b last:border-b-0`}
              >
                {/* Product Image */}
                <div className="flex-shrink-0">
                  <img
                    src={product.image || '/placeholder-product.jpg'}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/64x64?text=No+Image';
                    }}
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1 text-left">
                  <h4 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {product.name}
                  </h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {product.category}
                  </p>
                </div>

                {/* Product Price */}
                <div className="flex-shrink-0">
                  <span className={`text-lg font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                    ৳{product.price}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* View All Results */}
          {results.length >= 8 && (
            <div className={`p-3 text-center border-t ${darkMode ? 'border-gray-700/50 bg-gray-800/50' : 'border-gray-100 bg-gray-50/50'}`}>
              <button
                onClick={() => {
                  navigate(`/products?search=${query}`);
                  setQuery('');
                  setIsOpen(false);
                }}
                className={`text-sm font-semibold ${darkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'} transition`}
              >
                View All Results →
              </button>
            </div>
          )}
        </div>
      )}

      {/* No Results */}
      {isOpen && query.length >= 2 && results.length === 0 && (
        <div
          className={`absolute z-50 w-full mt-2 rounded-xl shadow-2xl p-8 text-center backdrop-blur-xl ${
            darkMode
              ? 'bg-gray-900/95 border border-gray-700/50'
              : 'bg-white/90 border border-white/20'
          }`}
        >
          <div className="text-6xl mb-4">🔍</div>
          <h4 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            No products found
          </h4>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Try searching with different keywords
          </p>
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${darkMode ? 'rgba(55, 65, 81, 0.3)' : 'rgba(243, 244, 246, 0.5)'};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${darkMode ? 'rgba(147, 51, 234, 0.5)' : 'rgba(147, 51, 234, 0.3)'};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? 'rgba(147, 51, 234, 0.7)' : 'rgba(147, 51, 234, 0.5)'};
        }
      `}</style>
    </div>
  );
}
