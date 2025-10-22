import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiSearch, FiEdit2, FiTrash2, FiShield, FiMail, FiPhone } from 'react-icons/fi';
import { adminAPI } from '../../api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setDarkMode(savedTheme ? savedTheme === 'dark' : true);

    const handleThemeChange = () => {
      const currentTheme = localStorage.getItem('theme');
      setDarkMode(currentTheme === 'dark');
    };

    window.addEventListener('storage', handleThemeChange);
    window.addEventListener('themeChange', handleThemeChange);

    return () => {
      window.removeEventListener('storage', handleThemeChange);
      window.removeEventListener('themeChange', handleThemeChange);
    };
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllUsers();
      setUsers(response.data || response || []);
    } catch (error) {
      toast.error('Failed to load users');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    setUpdating(true);
    try {
      await adminAPI.updateUser(selectedUser._id, {
        name: selectedUser.name,
        email: selectedUser.email,
        role: selectedUser.role
      });
      toast.success('User updated successfully');
      fetchUsers();
      setShowModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await adminAPI.deleteUser(userId);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className={`pt-24 pb-12 min-h-screen ${darkMode ? 'bg-gradient-to-b from-moon-night via-moon-midnight to-moon-night' : 'bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50'}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={`text-5xl font-bold bg-clip-text text-transparent ${
              darkMode 
                ? 'moon-gradient-text animate-glow' 
                : 'bg-gradient-to-r from-purple-600 to-pink-600'
            }`}
          >
            User Management
          </motion.h1>
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-moon-silver/50' : 'text-gray-400'}`} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users..."
                className={`pl-10 pr-4 py-2 border rounded-lg focus:ring-2 w-64 ${
                  darkMode 
                    ? 'bg-moon-midnight/50 border-moon-gold/30 text-moon-silver placeholder-moon-silver/40 focus:ring-moon-gold' 
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-600'
                }`}
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className={`px-4 py-2 border rounded-lg focus:ring-2 ${
                darkMode 
                  ? 'bg-moon-midnight/50 border-moon-gold/30 text-moon-silver focus:ring-moon-gold' 
                  : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-600'
              }`}
            >
              <option value="" className={darkMode ? 'bg-moon-midnight text-moon-silver' : 'bg-white text-gray-900'}>All Roles</option>
              <option value="user" className={darkMode ? 'bg-moon-midnight text-moon-silver' : 'bg-white text-gray-900'}>Users</option>
              <option value="admin" className={darkMode ? 'bg-moon-midnight text-moon-silver' : 'bg-white text-gray-900'}>Admins</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className={`rounded-full h-16 w-16 border-t-2 border-b-2 ${darkMode ? 'border-moon-gold' : 'border-vybe-purple'}`}
            />
          </div>
        ) : filteredUsers.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-12 text-center rounded-2xl border ${
              darkMode 
                ? 'bg-moon-midnight/50 border-moon-gold/20' 
                : 'bg-white border-purple-100'
            }`}
          >
            <FiUsers className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-moon-silver/40' : 'text-gray-400'}`} />
            <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}>No Users Found</h2>
            <p className={darkMode ? 'text-moon-silver/60' : 'text-gray-600'}>
              {searchTerm ? 'Try adjusting your search criteria' : 'Users will appear here as they register'}
            </p>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`overflow-hidden rounded-2xl border ${
              darkMode 
                ? 'bg-moon-midnight/30 border-moon-gold/20' 
                : 'bg-white border-purple-100 shadow-xl'
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`border-b ${darkMode ? 'bg-moon-midnight/50 border-moon-gold/20' : 'bg-gray-50 border-gray-200'}`}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-moon-gold' : 'text-gray-500'}`}>
                      User
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-moon-gold' : 'text-gray-500'}`}>
                      Contact
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-moon-gold' : 'text-gray-500'}`}>
                      Role
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-moon-gold' : 'text-gray-500'}`}>
                      Orders
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-moon-gold' : 'text-gray-500'}`}>
                      Joined
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-moon-gold' : 'text-gray-500'}`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-moon-gold/10' : 'divide-gray-200'}`}>
                  {filteredUsers.map((user, index) => (
                    <motion.tr 
                      key={user._id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.03, duration: 0.4 }}
                      className={`${darkMode ? 'hover:bg-moon-midnight/50' : 'hover:bg-gray-50'}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                            darkMode 
                              ? 'bg-gradient-to-br from-moon-gold to-moon-mystical' 
                              : 'bg-gradient-to-br from-vybe-purple to-vybe-pink'
                          }`}>
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className={`font-semibold ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}>{user.name}</div>
                            <div className={`text-sm ${darkMode ? 'text-moon-silver/50' : 'text-gray-500'}`}>ID: {user._id.slice(-8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className={`flex items-center gap-2 mb-1 ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}>
                            <FiMail className={darkMode ? 'text-moon-silver/50' : 'text-gray-400'} />
                            <span>{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className={`flex items-center gap-2 ${darkMode ? 'text-moon-silver/60' : 'text-gray-600'}`}>
                              <FiPhone className={darkMode ? 'text-moon-silver/50' : 'text-gray-400'} />
                              <span>{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${
                          user.role === 'admin' 
                            ? darkMode ? 'bg-moon-mystical/20 text-moon-gold' : 'bg-purple-100 text-purple-700'
                            : darkMode ? 'bg-moon-midnight border border-moon-gold/30 text-moon-silver' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {user.role === 'admin' && <FiShield />}
                          {user.role === 'admin' ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}>
                        {user.orderCount || 0} orders
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-moon-silver/60' : 'text-gray-500'}`}>
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowModal(true);
                            }}
                            className={`p-2 rounded ${
                              darkMode 
                                ? 'text-moon-gold hover:text-moon-silver hover:bg-moon-gold/20' 
                                : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                            }`}
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className={`p-2 rounded ${
                              darkMode 
                                ? 'text-red-400 hover:text-red-300 hover:bg-red-500/20' 
                                : 'text-red-600 hover:text-red-800 hover:bg-red-50'
                            }`}
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Stats */}
            <div className={`border-t px-6 py-4 grid grid-cols-3 gap-4 ${
              darkMode 
                ? 'bg-moon-midnight/50 border-moon-gold/20' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="text-center">
                <div className={`text-2xl font-bold ${darkMode ? 'text-moon-gold' : 'text-vybe-purple'}`}>{users.length}</div>
                <div className={`text-sm ${darkMode ? 'text-moon-silver/60' : 'text-gray-600'}`}>Total Users</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${darkMode ? 'text-moon-mystical' : 'text-purple-600'}`}>
                  {users.filter(u => u.role === 'admin').length}
                </div>
                <div className={`text-sm ${darkMode ? 'text-moon-silver/60' : 'text-gray-600'}`}>Admins</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${darkMode ? 'text-moon-silver' : 'text-blue-600'}`}>
                  {users.filter(u => u.role === 'user').length}
                </div>
                <div className={`text-sm ${darkMode ? 'text-moon-silver/60' : 'text-gray-600'}`}>Customers</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Edit User Modal */}
        {showModal && selectedUser && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className={`rounded-2xl p-6 max-w-md w-full border ${
                darkMode 
                  ? 'bg-moon-midnight border-moon-gold/30' 
                  : 'bg-white border-purple-100'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-moon-gold' : 'text-gray-900'}`}>Edit User</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className={`text-2xl ${darkMode ? 'text-moon-silver hover:text-moon-gold' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}>Name</label>
                  <input
                    type="text"
                    value={selectedUser.name || ''}
                    onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${
                      darkMode 
                        ? 'bg-moon-night/50 border-moon-gold/30 text-moon-silver focus:ring-moon-gold' 
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-600'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}>Email</label>
                  <input
                    type="email"
                    value={selectedUser.email || ''}
                    onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${
                      darkMode 
                        ? 'bg-moon-night/50 border-moon-gold/30 text-moon-silver focus:ring-moon-gold' 
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-600'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-moon-silver' : 'text-gray-900'}`}>Role</label>
                  <select
                    value={selectedUser.role || 'user'}
                    onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${
                      darkMode 
                        ? 'bg-moon-night/50 border-moon-gold/30 text-moon-silver focus:ring-moon-gold' 
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-600'
                    }`}
                  >
                    <option value="user" className={darkMode ? 'bg-moon-midnight text-moon-silver' : ''}>User</option>
                    <option value="admin" className={darkMode ? 'bg-moon-midnight text-moon-silver' : ''}>Admin</option>
                  </select>
                </div>

                <div className={`rounded-lg p-4 border ${
                  darkMode 
                    ? 'bg-moon-gold/10 border-moon-gold/30' 
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <p className={`text-sm ${darkMode ? 'text-moon-gold' : 'text-yellow-800'}`}>
                    <strong>Note:</strong> Changing a user's role to admin will grant them full access to the admin dashboard.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className={`flex-1 px-4 py-2 border rounded-lg ${
                    darkMode 
                      ? 'border-moon-gold/30 text-moon-silver hover:bg-moon-gold/20' 
                      : 'border-gray-300 text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateUser}
                  disabled={updating}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold disabled:opacity-50 ${
                    darkMode 
                      ? 'bg-gradient-to-r from-moon-gold to-moon-mystical text-moon-night hover:shadow-lg hover:shadow-moon-gold/50' 
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                  }`}
                >
                  {updating ? 'Updating...' : 'Update User'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
