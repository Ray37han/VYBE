import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useCartStore } from '../store/cartStore'

export default function Cart() {
  const { items, removeItem, updateQuantity, clear } = useCartStore()
  const navigate = useNavigate()
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  return (
    <div className="relative min-h-screen pt-24 px-4 sm:px-6 lg:px-8 pb-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Shopping <span className="gradient-text">Cart</span></h1>

        {items.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-white/30" />
            <p className="text-white/60 mb-6">Your cart is empty</p>
            <Link to="/products" className="inline-block px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-medium">Shop Now</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {items.map((item, index) => (
              <div key={index} className="glass-card p-6">
                <div className="flex gap-6">
                  <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
                  <div className="flex-1">
                    <h3 className="font-bold mb-1">{item.name}</h3>
                    <p className="text-sm text-white/60 mb-2">Size: {item.size}</p>
                    <p className="text-cyan-400 font-bold">৳{item.price}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button onClick={() => removeItem(index)} className="p-2 glass-button rounded-lg hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center space-x-3">
                      <button onClick={() => updateQuantity(index, -1)} className="p-1 glass-button rounded"><Minus className="w-4 h-4" /></button>
                      <span className="font-medium w-8 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(index, 1)} className="p-1 glass-button rounded"><Plus className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="glass-card p-6 space-y-4">
              <div className="flex justify-between text-lg">
                <span>Total:</span>
                <span className="text-2xl font-bold text-cyan-400">৳{total.toFixed(2)}</span>
              </div>
              <div className="flex gap-4">
                <button onClick={clear} className="flex-1 py-3 glass-button rounded-lg font-medium">Clear Cart</button>
                <Link to="/checkout" className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-medium text-center">Checkout</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
