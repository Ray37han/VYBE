# ORDER PIPELINE – SETUP & DEPLOYMENT GUIDE

## System Overview

```
Customer → /quick-checkout → POST /api/pipeline/create
                              ├── MongoDB (PipelineOrder)
                              ├── Google Sheets (VYBE_ORDERS_DATABASE)
                              └── WhatsApp (CallMeBot)
                                        ↓
                              /admin/delivery (Delivery Dashboard)
                                        ↓
                              POST /api/pipeline/orders/:id/courier
                              → Pathao / Steadfast / RedX API
```

---

## 1. LOCAL DEVELOPMENT

### Start backend
```bash
cd server
npm run dev
# Runs on http://localhost:5001
```

### Start frontend
```bash
cd client
npm run dev
# Runs on http://localhost:5173
```

### Test a checkout
Open your browser at:
```
http://localhost:5173/quick-checkout?name=Oversized+Hoodie&price=1390&productId=VYBE-001
```

Or test via cURL:
```bash
curl -X POST http://localhost:5001/api/pipeline/create \
  -H 'Content-Type: application/json' \
  -d '{
    "customerName": "Rahul Ahmed",
    "phone": "01712345678",
    "district": "Dhaka",
    "address": "House 5, Road 10, Dhanmondi",
    "productName": "Oversized Hoodie",
    "price": 1390,
    "quantity": 1,
    "paymentMethod": "Cash On Delivery"
  }'
```

### Admin delivery dashboard
Login as admin and visit:
```
http://localhost:5173/admin/delivery
```

---

## 2. GOOGLE SHEETS SETUP (one-time)

### Step 1 – Create Apps Script
1. Go to https://script.google.com
2. Create a new project → name it `VYBE_ORDERS`
3. Delete all default code
4. Paste the entire content of `scripts/google-apps-script.js`
5. Click **Save** (Ctrl+S)

### Step 2 – Deploy as Web App
1. Click **Deploy** → **New deployment**
2. Select type: **Web App**
3. Execute as: **Me**
4. Who has access: **Anyone**
5. Click **Deploy**
6. Copy the Web App URL (looks like `https://script.google.com/macros/s/XXXXXXX/exec`)

### Step 3 – Set in .env
```env
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

### Step 4 – Test
```bash
curl -X POST "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec" \
  -H "Content-Type: application/json" \
  -d '{"orderId":"VYBE-TEST-0001","customerName":"Test","phone":"01712345678"}'
```

The script auto-creates a Google Sheet named `VYBE_ORDERS_DATABASE` in your Drive.

---

## 3. WHATSAPP SETUP (one-time, takes 2 minutes)

1. On your phone/WhatsApp, save this number: **+34 644 59 78 10** as **CallMeBot**
2. Send the exact message: `I allow callmebot to send me messages`
3. You'll receive a reply with your API key, e.g. `12345`
4. Set in .env:
```env
CALLMEBOT_PHONE=+8801711234567   # Your WhatsApp number with country code
CALLMEBOT_API_KEY=12345           # The key from their reply
```

**Note:** The free tier allows ~500 messages/month. For high volume, consider upgrading.

---

## 4. COURIER API SETUP

### Steadfast (Recommended – simplest setup)
1. Register at https://portal.steadfast.com.bd
2. Go to **API Settings**
3. Generate API Key and Secret
4. Set in .env:
```env
STEADFAST_API_KEY=your_key
STEADFAST_API_SECRET=your_secret
```

### Pathao
1. Register at https://merchant.pathao.com
2. Go to **Settings → API Access**
3. Get Client ID, Client Secret, username, password
4. Create a store and get the Store ID
5. Set in .env:
```env
PATHAO_CLIENT_ID=
PATHAO_CLIENT_SECRET=
PATHAO_USERNAME=
PATHAO_PASSWORD=
PATHAO_STORE_ID=
```

### RedX
1. Register at https://redx.com.bd
2. Request Open API access
3. Set in .env:
```env
REDX_API_KEY=your_bearer_token
```

---

## 5. CHECKOUT URL FROM PRODUCT PAGE

Link from any product page to checkout with pre-filled data:

```jsx
// In your product pages, link like this:
<a href={`/quick-checkout?productId=${product._id}&name=${product.name}&price=${product.price}`}>
  Buy Now
</a>
```

Or in React Router:
```jsx
navigate(`/quick-checkout?name=${productName}&price=${price}&productId=${id}`)
```

---

## 6. ENVIRONMENT VARIABLES REFERENCE

```env
# --- Pipeline: Google Sheets ---
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/...exec

# --- Pipeline: WhatsApp ---
CALLMEBOT_PHONE=+8801XXXXXXXXX
CALLMEBOT_API_KEY=YOUR_KEY

# --- Courier: Pathao ---
PATHAO_BASE_URL=https://hermes.pathao.com
PATHAO_CLIENT_ID=
PATHAO_CLIENT_SECRET=
PATHAO_USERNAME=
PATHAO_PASSWORD=
PATHAO_STORE_ID=

# --- Courier: Steadfast ---
STEADFAST_BASE_URL=https://portal.steadfast.com.bd
STEADFAST_API_KEY=
STEADFAST_API_SECRET=

# --- Courier: RedX ---
REDX_BASE_URL=https://openapi.redx.com.bd
REDX_API_KEY=
```

---

## 7. FOLDER STRUCTURE (new files only)

```
vybe-mern/
├── server/
│   ├── models/
│   │   └── PipelineOrder.js         ← MongoDB model + daily ID counter
│   ├── routes/
│   │   └── pipeline.js              ← All pipeline API routes
│   ├── services/
│   │   ├── googleSheets.js          ← Google Sheets integration
│   │   ├── whatsapp.js              ← CallMeBot WhatsApp integration
│   │   └── courier/
│   │       ├── index.js             ← Unified courier adapter
│   │       ├── pathao.js            ← Pathao adapter
│   │       ├── steadfast.js         ← Steadfast adapter
│   │       └── redx.js             ← RedX adapter
│   └── .env                         ← Updated with pipeline vars
│
├── client/src/
│   ├── pages/
│   │   ├── QuickCheckout.jsx        ← /quick-checkout  (public)
│   │   ├── OrderConfirmed.jsx       ← /order-confirmed (public)
│   │   └── admin/
│   │       └── DeliveryDashboard.jsx ← /admin/delivery (admin only)
│   └── App.jsx                       ← Updated with new routes
│
└── scripts/
    └── google-apps-script.js        ← Paste into Google Apps Script editor
```

---

## 8. API ENDPOINTS REFERENCE

### Public
```
POST /api/pipeline/create
  Body: { customerName, phone, email?, district, address, orderNotes?,
          productId?, productName, quantity, price, paymentMethod, pageUrl? }
  Rate limit: 5 per IP per hour
```

### Admin (JWT required)
```
GET  /api/pipeline/orders?status=&phone=&orderId=&page=&limit=
GET  /api/pipeline/orders/:orderId
PATCH /api/pipeline/orders/:orderId/status   Body: { status, adminNote? }
POST  /api/pipeline/orders/:orderId/courier  Body: { courier: "Steadfast" }
```

### Order Status Flow
```
Pending → Confirmed → Processing → Shipped → Delivered
                                          ↘ Cancelled (any stage)
```

---

## 9. SECURITY NOTES

- Rate limit: 5 orders/IP/hour (both express-rate-limit and DB-level double check)
- Phone validated server-side: `^01[3-9]\d{8}$`
- District validated against allowlist (64 Bangladesh districts)
- Payment method validated against allowlist
- Admin endpoints protected by JWT + admin role check
- Google Sheets URL and WhatsApp credentials never exposed to client
- Failures in Sheets/WhatsApp don't block order creation (graceful degradation)

---

## 10. PRODUCTION DEPLOYMENT

### Railway / Render
Add all env vars from Section 6 to your deployment settings.

### Test in production
```bash
curl -X POST https://your-backend.railway.app/api/pipeline/create \
  -H 'Content-Type: application/json' \
  -d '{"customerName":"Test","phone":"01712345678","district":"Dhaka","address":"Test","productName":"Test Product","price":100,"quantity":1,"paymentMethod":"Cash On Delivery"}'
```
