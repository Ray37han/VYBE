import React, { useState, useEffect } from 'react'
import { Package } from 'lucide-react'
import api from '../api'
import LoadingSpinner from '../components/LoadingSpinner'

export default function MyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/orders').then(res => {
      setOrders(res.data.data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <div className="relative min-h-screen pt-24 px-4 sm:px-6 lg:px-8 pb-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">My <span className="gradient-text">Orders</span></h1>

        {loading ? <LoadingSpinner /> : orders.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-white/30" />
            <p className="text-white/60">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order._id} className="glass-card p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-white/60">Order #{order._id.slice(-8)}</p>
                    <p className="text-sm text-white/60">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'delivered' ? 'bg-green-500/20 text-green-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                    {order.status}
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  {order.items?.map((item, i) => (
                    <div key={i} className="text-sm">
                      <span className="font-medium">{item.product?.name || 'Product'}</span> x {item.quantity}
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-white/10 flex justify-between">
                  <span className="text-white/60">Total:</span>
                  <span className="font-bold text-cyan-400">৳{order.totalPrice}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
