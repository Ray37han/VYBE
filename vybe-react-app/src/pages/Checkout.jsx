import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import api from '../api'

export default function Checkout() {
  const { items, clear } = useCartStore()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', phone: '', address: '', paymentMethod: 'cod' })
  const [loading, setLoading] = useState(false)
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/orders', {
        items: items.map(i => ({ product: i.productId, size: i.size, quantity: i.quantity })),
        shippingAddress: { name: form.name, phone: form.phone, address: form.address },
        paymentMethod: form.paymentMethod
      })
      clear()
      alert('Order placed successfully!')
      navigate('/my-orders')
    } catch (err) {
      alert('Failed to place order: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen pt-24 px-4 sm:px-6 lg:px-8 pb-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>
        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Full Name</label>
            <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-3 glass-card text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Phone</label>
            <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-4 py-3 glass-card text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Delivery Address</label>
            <textarea required value={form.address} onChange={e => setForm({...form, address: e.target.value})} rows={3} className="w-full px-4 py-3 glass-card text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50"></textarea>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Payment Method</label>
            <select value={form.paymentMethod} onChange={e => setForm({...form, paymentMethod: e.target.value})} className="w-full px-4 py-3 glass-card text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50">
              <option value="cod">Cash on Delivery</option>
              <option value="bkash">bKash</option>
            </select>
          </div>
          <div className="pt-4 border-t border-white/10">
            <div className="flex justify-between mb-4">
              <span className="text-lg">Total:</span>
              <span className="text-2xl font-bold text-cyan-400">৳{total.toFixed(2)}</span>
            </div>
            <button type="submit" disabled={loading || items.length === 0} className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50">
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
