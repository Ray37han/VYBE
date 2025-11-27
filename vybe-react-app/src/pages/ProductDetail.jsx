import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ShoppingBag, ArrowLeft } from 'lucide-react'
import api from '../api'
import { useCartStore } from '../store/cartStore'
import LoadingSpinner from '../components/LoadingSpinner'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [selectedSize, setSelectedSize] = useState('')
  const [loading, setLoading] = useState(true)
  const addItem = useCartStore(s => s.addItem)

  useEffect(() => {
    api.get(`/products/${id}`).then(res => {
      setProduct(res.data.data)
      if (res.data.data?.sizes?.length > 0) setSelectedSize(res.data.data.sizes[0].name)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  const handleAddToCart = () => {
    if (!product) return
    if (product.sizes?.length > 0 && !selectedSize) return alert('Please select a size')
    
    const size = product.sizes?.find(s => s.name === selectedSize)
    addItem({
      productId: product._id,
      name: product.name,
      image: product.images?.[0]?.urls?.thumbnail || product.images?.[0]?.url,
      size: selectedSize || 'default',
      price: size?.price || product.basePrice,
      quantity: 1
    })
    alert('Added to cart!')
    navigate('/cart')
  }

  if (loading) return <div className="pt-24"><LoadingSpinner /></div>
  if (!product) return <div className="pt-24 text-center">Product not found</div>

  return (
    <div className="relative min-h-screen pt-24 px-4 sm:px-6 lg:px-8 pb-12">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center space-x-2 glass-button px-4 py-2 rounded-lg">
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="glass-card p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <img src={product.images?.[0]?.urls?.large || product.images?.[0]?.url} alt={product.name} className="w-full h-auto rounded-xl" />
            </div>

            <div className="space-y-6">
              <div>
                <div className="text-xs text-cyan-400 font-medium uppercase mb-2">{product.category}</div>
                <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
                <p className="text-white/70">{product.description}</p>
              </div>

              <div className="text-3xl font-bold text-cyan-400">৳{selectedSize ? product.sizes?.find(s => s.name === selectedSize)?.price : product.basePrice}</div>

              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold mb-3">Select Size:</label>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map(size => (
                      <button key={size.name} onClick={() => setSelectedSize(size.name)} className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedSize === size.name ? 'bg-gradient-to-r from-cyan-500 to-purple-500' : 'glass-button'}`}>
                        {size.name} - ৳{size.price}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={handleAddToCart} className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center justify-center space-x-2">
                <ShoppingBag className="w-5 h-5" />
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
