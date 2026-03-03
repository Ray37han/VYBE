import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store';
import { authAPI } from '../api';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiSave, FiX, FiShield, FiPackage } from 'react-icons/fi';

export default function Account() {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Bangladesh'
    }
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || '',
          country: user.address?.country || 'Bangladesh'
        }
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await authAPI.updateProfile({
        name: formData.name,
        phone: formData.phone,
        address: formData.address
      });
      setUser(data.data);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: {
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        zipCode: user.address?.zipCode || '',
        country: user.address?.country || 'Bangladesh'
      }
    });
    setIsEditing(false);
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="pt-24 pb-12 min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-moon-night dark:via-moon-midnight dark:to-moon-night">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="card mb-6 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h1 className="text-2xl font-bold dark:text-moon-silver">{user.name}</h1>
                  <p className="text-gray-600 dark:text-moon-silver/70">{user.email}</p>
                  {user.role === 'admin' && (
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-1 bg-purple-100 dark:bg-moon-gold/20 text-purple-700 dark:text-moon-gold text-xs font-semibold rounded-full">
                      <FiShield className="w-3 h-3" />
                      Admin
                    </span>
                  )}
                </div>
              </div>
              
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <FiEdit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 dark:border-moon-gold/30 rounded-lg hover:bg-gray-100 dark:hover:bg-moon-midnight/50 transition-colors dark:text-moon-silver"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="btn-primary flex items-center gap-2"
                  >
                    <FiSave className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-purple-50 dark:bg-moon-midnight/50 rounded-lg border border-purple-100 dark:border-moon-gold/20">
                <div className="flex items-center gap-3">
                  <FiPackage className="w-8 h-8 text-purple-600 dark:text-moon-gold" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-moon-silver/70">Total Orders</p>
                    <p className="text-2xl font-bold dark:text-moon-silver">{user.orders?.length || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 dark:bg-moon-midnight/50 rounded-lg border border-blue-100 dark:border-moon-gold/20">
                <div className="flex items-center gap-3">
                  <FiMail className="w-8 h-8 text-blue-600 dark:text-moon-gold" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-moon-silver/70">Email Status</p>
                    <p className="text-lg font-bold dark:text-moon-silver">
                      {user.emailVerified === false ? (
                        <span className="text-red-600 dark:text-red-400">Not Verified</span>
                      ) : (
                        <span className="text-green-600 dark:text-green-400">Verified</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-moon-midnight/50 rounded-lg border border-green-100 dark:border-moon-gold/20">
                <div className="flex items-center gap-3">
                  <FiUser className="w-8 h-8 text-green-600 dark:text-moon-gold" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-moon-silver/70">Member Since</p>
                    <p className="text-lg font-bold dark:text-moon-silver">
                      {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-6 dark:text-moon-silver">Account Information</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold dark:text-moon-silver flex items-center gap-2">
                  <FiUser className="w-5 h-5" />
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 dark:text-moon-silver">Name</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field disabled:bg-gray-100 dark:disabled:bg-moon-midnight/30 dark:bg-moon-midnight/50 dark:border-moon-gold/20 dark:text-moon-silver dark:placeholder-moon-silver/40"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-2 dark:text-moon-silver">Email</label>
                    <input
                      type="email"
                      disabled
                      value={formData.email}
                      className="input-field disabled:bg-gray-100 dark:disabled:bg-moon-midnight/30 dark:bg-moon-midnight/50 dark:border-moon-gold/20 dark:text-moon-silver"
                    />
                    <p className="text-xs text-gray-500 dark:text-moon-silver/50 mt-1">Email cannot be changed</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-2 dark:text-moon-silver">Phone</label>
                    <input
                      type="tel"
                      disabled={!isEditing}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input-field disabled:bg-gray-100 dark:disabled:bg-moon-midnight/30 dark:bg-moon-midnight/50 dark:border-moon-gold/20 dark:text-moon-silver dark:placeholder-moon-silver/40"
                      placeholder="+880 1234567890"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-moon-gold/20">
                <h3 className="text-lg font-semibold dark:text-moon-silver flex items-center gap-2">
                  <FiMapPin className="w-5 h-5" />
                  Shipping Address
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 dark:text-moon-silver">Street Address</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={formData.address.street}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        address: { ...formData.address, street: e.target.value }
                      })}
                      className="input-field disabled:bg-gray-100 dark:disabled:bg-moon-midnight/30 dark:bg-moon-midnight/50 dark:border-moon-gold/20 dark:text-moon-silver dark:placeholder-moon-silver/40"
                      placeholder="123 Main St, Apartment 4B"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 dark:text-moon-silver">City</label>
                      <input
                        type="text"
                        disabled={!isEditing}
                        value={formData.address.city}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          address: { ...formData.address, city: e.target.value }
                        })}
                        className="input-field disabled:bg-gray-100 dark:disabled:bg-moon-midnight/30 dark:bg-moon-midnight/50 dark:border-moon-gold/20 dark:text-moon-silver dark:placeholder-moon-silver/40"
                        placeholder="Dhaka"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold mb-2 dark:text-moon-silver">State/Division</label>
                      <input
                        type="text"
                        disabled={!isEditing}
                        value={formData.address.state}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          address: { ...formData.address, state: e.target.value }
                        })}
                        className="input-field disabled:bg-gray-100 dark:disabled:bg-moon-midnight/30 dark:bg-moon-midnight/50 dark:border-moon-gold/20 dark:text-moon-silver dark:placeholder-moon-silver/40"
                        placeholder="Dhaka Division"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 dark:text-moon-silver">Postal Code</label>
                      <input
                        type="text"
                        disabled={!isEditing}
                        value={formData.address.zipCode}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          address: { ...formData.address, zipCode: e.target.value }
                        })}
                        className="input-field disabled:bg-gray-100 dark:disabled:bg-moon-midnight/30 dark:bg-moon-midnight/50 dark:border-moon-gold/20 dark:text-moon-silver dark:placeholder-moon-silver/40"
                        placeholder="1205"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold mb-2 dark:text-moon-silver">Country</label>
                      <input
                        type="text"
                        disabled={!isEditing}
                        value={formData.address.country}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          address: { ...formData.address, country: e.target.value }
                        })}
                        className="input-field disabled:bg-gray-100 dark:disabled:bg-moon-midnight/30 dark:bg-moon-midnight/50 dark:border-moon-gold/20 dark:text-moon-silver dark:placeholder-moon-silver/40"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-6 border-t border-gray-200 dark:border-moon-gold/20 flex justify-between">
                <button
                  type="button"
                  onClick={() => navigate('/my-orders')}
                  className="btn-secondary flex items-center gap-2"
                >
                  <FiPackage className="w-4 h-4" />
                  View Orders
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate('/');
                    toast.success('Logged out successfully');
                  }}
                  className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
