import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import BackToTop from './components/BackToTop'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Customize from './pages/Customize'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import MyOrders from './pages/MyOrders'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/Products'
import AdminOrders from './pages/admin/Orders'
import AdminUsers from './pages/admin/Users'
import AdminFeaturedPosters from './pages/admin/FeaturedPosters'
import AdminHeroItems from './pages/admin/HeroItems'
import AdminCustomOrders from './pages/admin/AdminCustomOrders'
import AdminCustomApprovals from './pages/Admin/CustomApprovals'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          {/* <Route path="/customize/:id" element={<Customize />} /> */}
          {/* Customize feature temporarily disabled - Coming Soon */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route path="/checkout" element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } />
          <Route path="/order-success" element={
            <ProtectedRoute>
              <OrderSuccess />
            </ProtectedRoute>
          } />
          <Route path="/my-orders" element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/products" element={
            <ProtectedRoute adminOnly>
              <AdminProducts />
            </ProtectedRoute>
          } />
          <Route path="/admin/orders" element={
            <ProtectedRoute adminOnly>
              <AdminOrders />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute adminOnly>
              <AdminUsers />
            </ProtectedRoute>
          } />
          <Route path="/admin/featured-posters" element={
            <ProtectedRoute adminOnly>
              <AdminFeaturedPosters />
            </ProtectedRoute>
          } />
          <Route path="/admin/hero-items" element={
            <ProtectedRoute adminOnly>
              <AdminHeroItems />
            </ProtectedRoute>
          } />
          <Route path="/admin/custom-orders" element={
            <ProtectedRoute adminOnly>
              <AdminCustomOrders />
            </ProtectedRoute>
          } />
          <Route path="/admin/custom-approvals" element={
            <ProtectedRoute adminOnly>
              <AdminCustomApprovals />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      <Footer />
      <BackToTop />
    </div>
  )
}

export default App
