# Admin Access Control Manual - VYBE

## Table of Contents
1. [Overview](#overview)
2. [User Role System](#user-role-system)
3. [Creating Admin Users](#creating-admin-users)
4. [Changing User Roles](#changing-user-roles)
5. [Access Control Implementation](#access-control-implementation)
6. [Security Best Practices](#security-best-practices)

---

## Overview

VYBE uses a role-based access control (RBAC) system with two primary roles:
- **User**: Regular customers with access to shopping features
- **Admin**: Administrators with full system access

Admin users have access to:
- Admin Dashboard (`/admin/dashboard`)
- Product Management (`/admin/products`)
- Order Management (`/admin/orders`)
- User Management (`/admin/users`)
- Featured Posters Management (`/admin/featured-posters`)

---

## User Role System

### Database Schema
User roles are stored in the MongoDB User model:

```javascript
// Location: server/models/User.js
{
  name: String,
  email: String,
  password: String (hashed),
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}
```

---

## Creating Admin Users

### Method 1: Using the createAdmin Script (Recommended)

1. **Navigate to the server directory:**
   ```bash
   cd server
   ```

2. **Edit the createAdmin.js file:**
   ```bash
   nano createAdmin.js
   # or
   code createAdmin.js
   ```

3. **Update admin credentials:**
   ```javascript
   const adminData = {
     name: 'Admin Name',
     email: 'admin@example.com',
     password: 'YourSecurePassword123',
     role: 'admin'
   };
   ```

4. **Run the script:**
   ```bash
   node createAdmin.js
   ```

5. **Verify success:**
   - You should see: "✅ Admin user created successfully"
   - Login credentials will be displayed

### Method 2: MongoDB Direct Access

1. **Connect to MongoDB:**
   ```bash
   # If using MongoDB Compass
   # Connection string: mongodb://localhost:27017/vybe
   
   # Or using MongoDB Shell
   mongosh "mongodb://localhost:27017/vybe"
   ```

2. **Find the user:**
   ```javascript
   db.users.find({ email: "user@example.com" })
   ```

3. **Update user role to admin:**
   ```javascript
   db.users.updateOne(
     { email: "user@example.com" },
     { $set: { role: "admin" } }
   )
   ```

4. **Verify the change:**
   ```javascript
   db.users.find({ email: "user@example.com" }, { email: 1, role: 1 })
   ```

### Method 3: Through Admin Dashboard (If Admin Access Exists)

1. **Login as existing admin**
2. **Navigate to:** `/admin/users`
3. **Find the user** you want to promote
4. **Click the role dropdown** and select "Admin"
5. **Changes are saved automatically**

---

## Changing User Roles

### Promote User to Admin

**Via Admin Dashboard:**
1. Login as admin
2. Go to Admin Dashboard → Users
3. Find the user in the list
4. Click on their role dropdown
5. Select "Admin"
6. Confirm the change

**Via Database:**
```javascript
// MongoDB Shell
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "admin" } }
)
```

### Demote Admin to User

**Via Admin Dashboard:**
1. Login as admin
2. Go to Admin Dashboard → Users
3. Find the admin user
4. Click on their role dropdown
5. Select "User"
6. Confirm the change

**Via Database:**
```javascript
// MongoDB Shell
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "user" } }
)
```

---

## Access Control Implementation

### Backend Protection

#### Middleware Location
```
server/middleware/auth.js
```

#### Available Middleware:

1. **protect**: Requires user to be logged in
   ```javascript
   router.get('/protected-route', protect, async (req, res) => {
     // Only authenticated users can access
   });
   ```

2. **authorize('admin')**: Requires admin role
   ```javascript
   router.get('/admin-route', protect, authorize('admin'), async (req, res) => {
     // Only authenticated admins can access
   });
   ```

#### Usage Example:
```javascript
// server/routes/admin.js
import { protect, authorize } from '../middleware/auth.js';

// All admin routes require authentication + admin role
router.use(protect, authorize('admin'));

router.get('/dashboard', async (req, res) => {
  // Admin-only endpoint
});
```

### Frontend Protection

#### Protected Route Component
```
client/src/components/ProtectedRoute.jsx
```

#### Usage in Routes:
```javascript
// client/src/App.jsx
<Route 
  path="/admin/*" 
  element={
    <ProtectedRoute adminOnly>
      <AdminLayout />
    </ProtectedRoute>
  } 
/>
```

#### How it Works:
1. Checks if user is logged in (has token)
2. Decodes JWT token to get user role
3. If `adminOnly` prop is true, verifies role === 'admin'
4. Redirects to login if unauthorized

---

## Security Best Practices

### 1. Password Security
- **Minimum Length**: 8 characters
- **Complexity**: Mix of uppercase, lowercase, numbers, special characters
- **Hashing**: Uses bcrypt with salt rounds (automatically handled)

### 2. Admin Account Management

**DO:**
✅ Use strong, unique passwords for admin accounts
✅ Limit the number of admin accounts
✅ Regularly audit admin access
✅ Use the createAdmin script for initial setup
✅ Keep admin credentials secure (use environment variables)

**DON'T:**
❌ Share admin credentials
❌ Use simple/common passwords
❌ Store passwords in plain text
❌ Give admin access unnecessarily
❌ Commit admin credentials to Git

### 3. Environment Variables

Store sensitive data in `.env` file:
```env
JWT_SECRET=your_very_secure_random_string_here
MONGODB_URI=mongodb://localhost:27017/vybe
```

### 4. JWT Token Security

**Current Implementation:**
- Tokens stored in HTTP-only cookies (more secure)
- 7-day expiration
- Signed with JWT_SECRET

**To Change Token Expiration:**
```javascript
// server/routes/auth.js
const token = jwt.sign(
  { id: user._id },
  process.env.JWT_SECRET,
  { expiresIn: '7d' } // Change this value
);
```

### 5. Monitoring Admin Activity

**Check Admin Actions:**
```javascript
// MongoDB Shell
// Find all admin users
db.users.find({ role: "admin" }, { name: 1, email: 1 })

// Check recent orders (admins can see all)
db.orders.find().sort({ createdAt: -1 }).limit(10)
```

---

## Troubleshooting

### Issue: Cannot Access Admin Dashboard

**Check 1: Verify User Role**
```bash
# In MongoDB Shell
db.users.findOne({ email: "your@email.com" }, { role: 1 })
```
Expected: `{ role: "admin" }`

**Check 2: Verify JWT Token**
- Open browser DevTools → Application → Cookies
- Look for `token` cookie
- Try logging out and back in

**Check 3: Check Browser Console**
- Look for 403 (Forbidden) errors
- Check Network tab for failed API calls

### Issue: Admin Role Not Saving

**Solution:**
```javascript
// Force update in MongoDB
db.users.updateOne(
  { email: "admin@example.com" },
  { 
    $set: { role: "admin" },
    $currentDate: { updatedAt: true }
  }
)
```

### Issue: Multiple Admins with Same Email

**Check for Duplicates:**
```javascript
db.users.aggregate([
  { $group: { _id: "$email", count: { $sum: 1 } } },
  { $match: { count: { $gt: 1 } } }
])
```

**Remove Duplicates:**
```javascript
// Keep only the first, delete others
db.users.deleteMany({
  email: "duplicate@example.com",
  _id: { $ne: ObjectId("keep_this_id") }
})
```

---

## Quick Reference Commands

### Create New Admin
```bash
cd server
node createAdmin.js
```

### Promote Existing User to Admin
```javascript
// MongoDB Shell
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "admin" } }
)
```

### List All Admins
```javascript
// MongoDB Shell
db.users.find({ role: "admin" }, { name: 1, email: 1 })
```

### Revoke Admin Access
```javascript
// MongoDB Shell
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "user" } }
)
```

### Reset Admin Password
```javascript
// Use the auth API or createAdmin script
// Password must be hashed before storing
```

---

## API Endpoints Reference

### Authentication
```
POST /api/auth/register     - Register new user (role: 'user' by default)
POST /api/auth/login        - Login (returns JWT token)
POST /api/auth/logout       - Logout (clears cookie)
GET  /api/auth/me           - Get current user info
```

### Admin Endpoints (Require Admin Role)
```
GET    /api/admin/dashboard           - Admin dashboard stats
GET    /api/admin/products            - All products
POST   /api/admin/products            - Create product
PUT    /api/admin/products/:id        - Update product
DELETE /api/admin/products/:id        - Delete product
GET    /api/admin/orders              - All orders
PUT    /api/admin/orders/:id/status   - Update order status
GET    /api/admin/users               - All users
PUT    /api/admin/users/:id/role      - Change user role
DELETE /api/admin/users/:id           - Delete user
GET    /api/featured-posters/admin/all - All featured posters
POST   /api/featured-posters          - Create featured poster
PUT    /api/featured-posters/:id      - Update featured poster
DELETE /api/featured-posters/:id      - Delete featured poster
```

---

## Contact & Support

For additional help:
1. Check the main README.md
2. Review server logs: `server/logs` (if logging is enabled)
3. Check MongoDB logs
4. Review browser console for frontend errors

---

**Last Updated**: October 25, 2025
**Version**: 1.0
**Author**: VYBE Development Team
