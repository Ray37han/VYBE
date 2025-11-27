import React, { useState, useEffect } from 'react'
import { Edit2, Save, X } from 'lucide-react'
import api from '../api'
import LoadingSpinner from '../components/LoadingSpinner'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [editData, setEditData] = useState({})

  useEffect(() => {
    api.get('/admin/products').then(res => {
      setProducts(res.data.data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const startEdit = (product) => {
    setEditing(product._id)
    setEditData({ category: product.category, name: product.name, basePrice: product.basePrice })
  }

  const saveEdit = async (id) => {
    try {
      await api.put(`/admin/products/${id}`, { productData: editData })
      setProducts(products.map(p => p._id === id ? {...p, ...editData} : p))
      setEditing(null)
      alert('Product updated!')
    } catch (err) {
      alert('Failed to update: ' + (err.response?.data?.message || err.message))
    }
  }

  return (
    <div className="relative min-h-screen pt-24 px-4 sm:px-6 lg:px-8 pb-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Admin <span className="gradient-text">Products</span></h1>

        {loading ? <LoadingSpinner /> : (
          <div className="glass-card overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product._id} className="border-b border-white/5">
                    <td className="px-4 py-3">
                      {editing === product._id ? (
                        <input value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} className="px-2 py-1 glass-card text-sm" />
                      ) : product.name}
                    </td>
                    <td className="px-4 py-3">
                      {editing === product._id ? (
                        <input value={editData.category} onChange={e => setEditData({...editData, category: e.target.value})} className="px-2 py-1 glass-card text-sm" />
                      ) : product.category}
                    </td>
                    <td className="px-4 py-3">
                      {editing === product._id ? (
                        <input type="number" value={editData.basePrice} onChange={e => setEditData({...editData, basePrice: e.target.value})} className="px-2 py-1 glass-card text-sm w-24" />
                      ) : `৳${product.basePrice}`}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {editing === product._id ? (
                        <div className="flex justify-end space-x-2">
                          <button onClick={() => saveEdit(product._id)} className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30">
                            <Save className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditing(null)} className="p-2 glass-button rounded-lg">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => startEdit(product)} className="p-2 glass-button rounded-lg">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
