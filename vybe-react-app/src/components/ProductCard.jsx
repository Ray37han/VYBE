import React from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'

export default function ProductCard({ product }) {
  const imageUrl = product.images?.[0]?.urls?.thumbnail || product.images?.[0]?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop'
  
  return (
    <div className="group relative glass-card p-6 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-2">
      <Link to={`/products/${product._id}`} className="block">
        <div className="relative overflow-hidden rounded-xl mb-4 bg-white/5">
          <img src={imageUrl} alt={product.name} className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
        <div className="space-y-3">
          <div className="text-xs text-cyan-400 font-medium uppercase">{product.category || 'General'}</div>
          <h3 className="text-lg font-bold leading-tight group-hover:text-cyan-400 transition-colors line-clamp-2">{product.name}</h3>
          <div className="flex items-center justify-between pt-2">
            <span className="text-2xl font-bold text-cyan-400">৳{product.basePrice}</span>
            <div className="px-4 py-2 glass-button rounded-lg hover:bg-gradient-to-r hover:from-cyan-500 hover:to-purple-500 transition-all">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
