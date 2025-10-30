# Fix: Product Upload from Windows/Android Devices

## Problem
Users cannot upload products from Windows PCs or Android devices using Chrome or Brave browsers. Error message: "Cannot connect to server. Please check your internet connection."

## Root Cause
The issue occurs because:
1. **Frontend points to `localhost:5001`** which only works on the same machine
2. **Windows/Android devices** need to use the **network IP address** (e.g., `192.168.0.209:5001`)
3. **CORS configuration** needs to properly handle cross-origin requests from network devices

## Solution

### Step 1: Find Your Mac's IP Address

**Option A: System Settings**
1. Open **System Settings** (or System Preferences)
2. Go to **Network**
3. Select your active connection (WiFi or Ethernet)
4. Your IP address is shown (e.g., `192.168.0.209`)

**Option B: Terminal Command**
```bash
# WiFi IP
ipconfig getifaddr en0

# Ethernet IP
ipconfig getifaddr en1

# Or see all network interfaces
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### Step 2: Update Frontend Configuration

You have two options:

#### Option A: Temporary Testing (Quick)
1. Open `client/.env`
2. Replace the current line with your Mac's IP:
   ```env
   VITE_API_URL=http://192.168.0.209:5001/api
   ```
   *(Replace `192.168.0.209` with YOUR actual IP address)*

3. Restart the frontend server:
   ```bash
   cd client
   npm run dev
   ```

#### Option B: Environment-Based (Recommended for Production)
Use the `.env.network` file:
```bash
cd client
cp .env.network .env
# Edit .env to update the IP address to your Mac's IP
npm run dev
```

### Step 3: Verify Backend is Accessible

1. Check backend server is running:
   ```bash
   cd server
   npm run dev
   ```

2. You should see:
   ```
   ✅ Server running on port 5001
   🌍 Accessible on your network at:
      http://192.168.0.209:5001
      http://172.16.0.2:5001
   ```

3. Test from Windows/Android device browser:
   - Open: `http://192.168.0.209:5001` (use your IP)
   - You should see: `{"success":true,"message":"VYBE API is running"}`

### Step 4: Access Frontend from Other Devices

**Important:** You need to access the frontend using the network IP too!

1. Find your frontend's network URL (shown when you run `npm run dev`):
   ```
   ➜  Local:   http://localhost:3000/
   ➜  Network: http://192.168.0.209:3000/
   ```

2. From Windows/Android, open:
   ```
   http://192.168.0.209:3000/
   ```
   *(Replace with your actual IP)*

### Step 5: Verify Admin Permissions

Run this script to check all admin users:
```bash
cd server
node verifyAdmins.js
```

This will show:
- All users with admin role
- Their status (active/inactive)
- Regular users who might need admin access

If you need to promote a user to admin, use:
```bash
node createAdmin.js
```

## Important Notes

### Firewall Settings
Make sure your Mac's firewall allows incoming connections:
1. **System Settings** → **Network** → **Firewall**
2. Allow connections for Node.js or disable firewall temporarily for testing

### Same Network Requirement
- All devices (Mac, Windows PC, Android) must be on the **same WiFi network**
- Check that devices are not on a guest network with client isolation

### HTTPS vs HTTP
- Local development uses `http://` (not `https://`)
- Some features may not work without HTTPS on mobile devices (but file upload should work)

### IP Address Changes
- Your Mac's IP address may change when:
  - Restarting your router
  - Reconnecting to WiFi
  - Using a different network
- Always verify the IP address matches in both frontend `.env` and the actual network

## Testing Checklist

From Windows/Android device:

- [ ] Can access backend: `http://YOUR_IP:5001`
- [ ] Can access frontend: `http://YOUR_IP:3000`
- [ ] Can log in as admin
- [ ] Can view admin dashboard
- [ ] Can upload products with images
- [ ] Upload progress shows in console
- [ ] Product appears in product list

## Backend Changes Made

The following improvements were applied to `server/server.js`:

1. **Enhanced CORS Configuration**
   - Allows `https://` and `http://` protocols
   - Supports 127.0.0.1 and localhost
   - Handles all local network IP ranges
   - More permissive headers for file uploads

2. **Better Request Logging**
   - Shows origin of each request
   - Displays auth headers and cookies
   - Logs content-type for debugging

3. **Improved Admin Routes**
   - Better error messages for permission issues
   - Logs user role for debugging
   - Shows request origin for cross-origin debugging

## For Production Deployment

When deploying to a live server:

1. **Use Production URLs**
   ```env
   # client/.env
   VITE_API_URL=https://your-backend-domain.com/api
   ```

2. **Update CORS in server.js**
   ```javascript
   const allowedOrigins = [
     'https://your-frontend-domain.com',
     'https://www.your-frontend-domain.com'
   ];
   ```

3. **Use Environment Variables**
   ```env
   # server/.env
   CLIENT_URL=https://your-frontend-domain.com
   ```

## Troubleshooting

### Still getting "Cannot connect to server"?

1. **Check if backend is accessible:**
   ```bash
   # From Mac
   curl http://localhost:5001
   
   # From Windows/Android (in browser)
   http://192.168.0.209:5001
   ```

2. **Check network connectivity:**
   - Ping your Mac from Windows: `ping 192.168.0.209`
   - Make sure no VPN is active
   - Disable any proxy settings

3. **Check browser console:**
   - Open DevTools (F12)
   - Go to Network tab
   - Try uploading a product
   - Look for failed requests and their error messages

4. **Check backend logs:**
   - Watch the terminal where `npm run dev` is running
   - Should see request logs when you try to upload
   - If no logs appear, the request isn't reaching the server

### Upload timeout errors?

1. **Reduce image sizes:**
   - Compress images before uploading
   - Max 5MB per image recommended
   - Use tools like TinyPNG or ImageOptim

2. **Check WiFi signal:**
   - Move closer to router
   - Use 5GHz WiFi instead of 2.4GHz if available

3. **Increase timeout:**
   - Already set to 3 minutes (180000ms) in `client/src/api/index.js`
   - Can increase if needed for very large files

### "Access denied. Admin privileges required"?

1. **Verify user role:**
   ```bash
   cd server
   node verifyAdmins.js
   ```

2. **Check if logged in:**
   - Clear browser cache and cookies
   - Log out and log back in
   - Check localStorage has 'token'

3. **Promote user to admin:**
   ```bash
   cd server
   node createAdmin.js
   ```

## Summary

**Quick Fix Steps:**
1. Find your Mac's IP: `ipconfig getifaddr en0`
2. Update `client/.env`: `VITE_API_URL=http://YOUR_IP:5001/api`
3. Restart frontend: `cd client && npm run dev`
4. Access from other devices using: `http://YOUR_IP:3000`
5. Verify admin role: `cd server && node verifyAdmins.js`

**The key insight:** You must access BOTH frontend and backend using the network IP address from external devices, not localhost!
