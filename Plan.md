# Restaurant App — Project Plan

## Overview

A full-stack restaurant ordering platform with real-time order tracking and live delivery location. Customers can browse the menu, add items to cart, pay online, and watch their order status update live. Admins manage the menu, orders, and shop settings. A hardcoded delivery rider broadcasts their GPS location to the customer tracking page.

**Tech Stack**
- Frontend: React (Vite) + Tailwind CSS + Socket.io-client + Leaflet.js
- Backend: Node.js + Express + Socket.io
- Database: MongoDB Atlas (free M0 tier — GeoJSON + 2dsphere index for location)
- Cache: Upstash Redis (serverless, no Docker)
- Storage: Cloudinary (menu images)
- Payment: Razorpay (test mode, free)
- Maps: Leaflet.js + OpenStreetMap (free, no API key billing)
- Deployment: Vercel (client) + Render (server) + MongoDB Atlas + Upstash

---

## Project Structure

```
restaurant-app/
├── .gitignore
├── README.md
├── .env.example
│
├── server/
│   ├── package.json
│   ├── .env
│   ├── app.js
│   ├── server.js
│   └── src/
│       ├── config/
│       │   ├── db.js
│       │   ├── redis.js
│       │   ├── cloudinary.js
│       │   └── env.js
│       │
│       ├── models/
│       │   ├── User.model.js
│       │   ├── MenuCategory.model.js
│       │   ├── MenuItem.model.js
│       │   ├── Order.model.js
│       │   ├── ShopSettings.model.js
│       │   ├── RiderLocation.model.js
│       │   └── Review.model.js
│       │
│       ├── routes/
│       │   ├── auth.routes.js
│       │   ├── menu.routes.js
│       │   ├── order.routes.js
│       │   ├── payment.routes.js
│       │   ├── location.routes.js
│       │   ├── review.routes.js
│       │   └── admin.routes.js
│       │
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   ├── menu.controller.js
│       │   ├── order.controller.js
│       │   ├── payment.controller.js
│       │   ├── location.controller.js
│       │   ├── review.controller.js
│       │   └── admin.controller.js
│       │
│       ├── middleware/
│       │   ├── auth.js
│       │   ├── role.js
│       │   ├── rateLimiter.js
│       │   ├── validate.js
│       │   └── errorHandler.js
│       │
│       ├── sockets/
│       │   ├── orderSocket.js
│       │   └── locationSocket.js
│       │
│       ├── utils/
│       │   ├── helpers.js
│       │   ├── cacheHelpers.js
│       │   └── razorpayHelpers.js
│       │
│       └── seed/
│           └── seed.js
│
└── client/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        │
        ├── pages/
        │   ├── Home.jsx
        │   ├── MenuPage.jsx
        │   ├── CartPage.jsx
        │   ├── CheckoutPage.jsx
        │   ├── OrderTracking.jsx
        │   ├── OrderHistory.jsx
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── NotFound.jsx
        │   ├── admin/
        │   │   ├── AdminDashboard.jsx
        │   │   ├── AdminOrders.jsx
        │   │   ├── AdminMenuManager.jsx
        │   │   └── AdminShopSettings.jsx
        │   └── delivery/
        │       └── DeliveryDashboard.jsx
        │
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   ├── ProtectedRoute.jsx
        │   ├── ShopClosedBanner.jsx
        │   ├── menu/
        │   │   ├── MenuCard.jsx
        │   │   ├── CategoryTabs.jsx
        │   │   └── OfferBadge.jsx
        │   ├── cart/
        │   │   ├── CartDrawer.jsx
        │   │   ├── CartItem.jsx
        │   │   └── CartSummary.jsx
        │   ├── order/
        │   │   ├── StatusTimeline.jsx
        │   │   ├── OrderCard.jsx
        │   │   └── LiveMap.jsx
        │   ├── admin/
        │   │   ├── OrderTable.jsx
        │   │   ├── MenuItemForm.jsx
        │   │   ├── CategoryForm.jsx
        │   │   └── StatusDropdown.jsx
        │   └── ui/
        │       ├── Button.jsx
        │       ├── Input.jsx
        │       ├── Modal.jsx
        │       ├── Spinner.jsx
        │       ├── Toast.jsx
        │       └── SkeletonCard.jsx
        │
        ├── context/
        │   ├── AuthContext.jsx
        │   └── CartContext.jsx
        │
        ├── hooks/
        │   ├── useSocket.js
        │   ├── useLocation.js
        │   ├── useCart.js
        │   └── useAuth.js
        │
        ├── services/
        │   ├── api.js
        │   ├── auth.service.js
        │   ├── menu.service.js
        │   ├── order.service.js
        │   └── payment.service.js
        │
        ├── utils/
        │   ├── constants.js
        │   ├── formatters.js
        │   └── validators.js
        │
        └── assets/
            ├── images/
            └── icons/
```

---

## Database Schema

### users
```
_id, name, email, passwordHash, role (customer | admin | delivery),
phone, addresses[], createdAt
```

### menuCategories
```
_id, name, description, image, isActive, displayOrder, createdAt
```

### menuItems
```
_id, categoryId (ref), name, description, price, originalPrice,
images[], isAvailable, isSpecial, offerLabel, prepTime, createdAt
```

### orders
```
_id, userId (ref), items[{ itemId, name, price, qty }],
subtotal, deliveryFee, total,
deliveryAddress { line1, city, coords: GeoJSON Point },
chefInstructions, status (pending | paid | preparing | ready | out_for_delivery | delivered),
paymentId, paymentStatus (pending | completed | failed),
riderId (ref), createdAt, updatedAt
```

### shopSettings
```
_id, isOpen, openTime, closeTime, banner, specialNotice
```

### riderLocation
```
_id, riderId (ref), location { type: "Point", coordinates: [lng, lat] }, updatedAt
-- 2dsphere index on location field
```

### reviews
```
_id, orderId (ref), userId (ref), rating (1–5), comment, createdAt
```

---

## API Routes Reference

### Auth
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | /api/auth/register | Public | Register new customer |
| POST | /api/auth/login | Public | Login, returns JWT |
| GET | /api/auth/me | Auth | Get current user profile |

### Menu
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | /api/menu | Public | All categories + active items (Redis cached) |
| GET | /api/menu/categories | Public | List categories only |
| GET | /api/menu/items/:categoryId | Public | Items in a category |
| GET | /api/shop/settings | Public | Shop open/close status |

### Admin — Menu Management
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | /api/admin/menu/categories | Admin | Create category |
| PATCH | /api/admin/menu/categories/:id | Admin | Update category |
| DELETE | /api/admin/menu/categories/:id | Admin | Delete category |
| POST | /api/admin/menu/items | Admin | Create menu item (with image upload) |
| PATCH | /api/admin/menu/items/:id | Admin | Update item (price, offers, availability) |
| DELETE | /api/admin/menu/items/:id | Admin | Delete item |
| PATCH | /api/admin/shop/settings | Admin | Toggle open/close, set times |

### Orders
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | /api/payment/create-order | Auth | Create Razorpay order, returns order ID |
| POST | /api/payment/verify | Auth | Verify payment signature, create Order doc |
| GET | /api/orders/mine | Auth | Customer's own order history |
| GET | /api/orders/:id | Auth | Single order (must belong to user) |
| GET | /api/admin/orders | Admin | All active orders |
| GET | /api/admin/orders/history | Admin | All past orders + revenue |
| PATCH | /api/admin/orders/:id/status | Admin | Set preparing / out_for_delivery / delivered |

### Location
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | /api/location/update | Delivery | Upsert rider GPS, broadcast to rooms |
| GET | /api/location/rider | Auth | REST fallback for current rider position |

### Reviews
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | /api/reviews | Auth | Submit review (only for delivered orders) |
| GET | /api/reviews | Public | Get all reviews |

---

## Real-time Events (Socket.io)

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| joinOrderRoom | { orderId, token } | Customer joins their order's private room |

### Server → Client
| Event | Room | Payload | Description |
|-------|------|---------|-------------|
| order_status_update | order_\<orderId\> | { status, updatedAt } | Admin changed order status |
| rider_location | order_\<orderId\> | { lat, lng } | Rider GPS update (only when out_for_delivery) |

### Access control
The server verifies the JWT passed in the Socket.io handshake auth before allowing `joinOrderRoom`. It also confirms the `orderId` belongs to `req.user._id`. A customer in room `order_abc123` never receives events from `order_xyz789`.

---

## Redis Caching Strategy

| Key | Value | TTL | Invalidated on |
|-----|-------|-----|----------------|
| menu:all | Full menu JSON | 5 min | Any admin write to menu |
| shop:settings | Open/close + times | 30 s | Admin shop settings update |
| session:\<userId\> | JWT metadata | 7 days | Logout |
| cart:\<userId\> | Cart items (optional) | 1 day | Checkout complete |

---

## Execution Plan — 8 Phases

---

### Phase 1 — Foundation: Scaffold + Models + Auth API

**Goal:** A working Express server connected to MongoDB Atlas with all Mongoose models defined and a fully functional JWT authentication system.

**Why first:** Everything else depends on a database connection, defined schemas, and the ability to identify who is making each request. Auth middleware (`auth.js`, `role.js`) is imported by every subsequent route. Getting this right once here means no refactoring later.

**Server tasks:**
- Initialise `server/` with `npm init`, install: `express mongoose dotenv bcryptjs jsonwebtoken cors helmet express-rate-limit express-validator multer`
- Create `app.js` — mount global middleware (cors, helmet, json parser, rate limiter), register all route files, attach global error handler at the bottom
- Create `server.js` — create the HTTP server from `app`, connect to MongoDB, start listening. Keep separate from `app.js` so Socket.io can attach to the same `httpServer` in Phase 5 without touching `app.js`
- `src/config/db.js` — `mongoose.connect()` with Atlas URI from `.env`, log success/failure
- `src/config/env.js` — centralised validation of all required env vars at startup. App should crash with a clear message if `MONGO_URI` or `JWT_SECRET` is missing
- `src/models/User.model.js` — fields: name, email, passwordHash, role (enum: customer, admin, delivery), phone, addresses array. Pre-save hook to hash password with bcrypt
- `src/models/MenuCategory.model.js` — name, description, image (Cloudinary URL), isActive, displayOrder
- `src/models/MenuItem.model.js` — categoryId (ref), name, description, price, originalPrice, images array, isAvailable, isSpecial, offerLabel, prepTime
- `src/models/Order.model.js` — userId (ref), items array, subtotal, deliveryFee, total, deliveryAddress (with GeoJSON coords), chefInstructions, status (enum), paymentId, paymentStatus, riderId (ref), timestamps
- `src/models/ShopSettings.model.js` — isOpen, openTime, closeTime, banner, specialNotice. This collection will always have exactly one document
- `src/models/RiderLocation.model.js` — riderId (ref), location (GeoJSON Point). Add `{ type: '2dsphere' }` index on the location field
- `src/models/Review.model.js` — orderId (ref), userId (ref), rating (1–5), comment, timestamps
- `src/routes/auth.routes.js` + `src/controllers/auth.controller.js`:
  - `POST /api/auth/register` — validate input, check email uniqueness, hash password, create User, return JWT
  - `POST /api/auth/login` — find user by email, compare password with bcrypt, return JWT
  - `GET /api/auth/me` — requireAuth middleware, return `req.user` without passwordHash
- `src/middleware/auth.js` — extract Bearer token from Authorization header, verify with `jwt.verify()`, attach decoded user to `req.user`, call next or return 401
- `src/middleware/role.js` — factory function `requireRole(...roles)` that checks `req.user.role` is in the allowed list, returns 403 if not
- `src/middleware/errorHandler.js` — `(err, req, res, next)` global handler. Returns `{ success: false, message }` with appropriate status code. In development, include `err.stack`
- `src/seed/seed.js` — insert admin account, delivery guy account (hardcoded credentials), and one default ShopSettings document. Run once with `node src/seed/seed.js`

**Test checkpoint:** `POST /api/auth/register` creates a user in Atlas. `POST /api/auth/login` returns a JWT. `GET /api/auth/me` with the token returns user data. Unauthenticated request to `/api/auth/me` returns 401.

---

### Phase 2 — Menu API + Admin CRUD + Redis Cache

**Goal:** Public menu endpoints serving real data, admin endpoints to manage that data, and Redis caching so the menu doesn't hit MongoDB on every request.

**Why second:** The menu is the only data public (unauthenticated) users need. Having it working before the frontend means Phase 3 displays real data from day one. The Redis layer is added now because it's easiest to wire the cache while actively writing the route — retrofitting later is more error-prone.

**Server tasks:**
- Install: `ioredis cloudinary multer`
- `src/config/redis.js` — initialise `ioredis` client using Upstash `REDIS_URL` and `REDIS_TOKEN` from `.env`. Export the client instance
- `src/config/cloudinary.js` — configure Cloudinary with `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. Export a multer-storage-cloudinary instance for use in admin image upload routes
- `src/utils/cacheHelpers.js` — two helper functions: `getCache(key)` and `setCache(key, value, ttl)` wrapping `redis.get/set` with JSON parse/stringify. Also `invalidateMenuCache()` which calls `redis.del('menu:all')`
- `src/routes/menu.routes.js` + `src/controllers/menu.controller.js`:
  - `GET /api/menu` — check Redis for `menu:all`, if hit return parsed JSON, if miss query MongoDB (all active categories with their available items), store result with 300s TTL, return
  - `GET /api/menu/categories` — query MongoDB directly (no cache needed, low traffic)
  - `GET /api/menu/items/:categoryId` — query MenuItem where categoryId matches and isAvailable is true
  - `GET /api/shop/settings` — check Redis for `shop:settings` (30s TTL), return the single ShopSettings document
- `src/routes/admin.routes.js` + `src/controllers/admin.controller.js` (menu section):
  - All routes wrapped with `requireAuth` then `requireRole('admin')`
  - `POST /api/admin/menu/categories` — validate name, create MenuCategory, call `invalidateMenuCache()`
  - `PATCH /api/admin/menu/categories/:id` — update fields, call `invalidateMenuCache()`
  - `DELETE /api/admin/menu/categories/:id` — soft delete (set isActive: false) or hard delete, call `invalidateMenuCache()`
  - `POST /api/admin/menu/items` — multer middleware for image upload to Cloudinary, create MenuItem with Cloudinary URL, call `invalidateMenuCache()`
  - `PATCH /api/admin/menu/items/:id` — update any field including price, isSpecial, offerLabel, isAvailable, call `invalidateMenuCache()`
  - `DELETE /api/admin/menu/items/:id` — delete item, call `invalidateMenuCache()`
  - `PATCH /api/admin/shop/settings` — update ShopSettings document, call `redis.del('shop:settings')`

**Test checkpoint:** `GET /api/menu` returns empty arrays (no categories yet). Create a category via `POST /api/admin/menu/categories` (with admin JWT). `GET /api/menu` returns the new category. Call `GET /api/menu` again — second call should be served from Redis (verify by checking Upstash dashboard for key `menu:all`).

---

### Phase 3 — React Client: Auth + Menu Browse + Cart

**Goal:** A fully working browser UI where users can register, log in, browse the menu, and manage a cart — without any ordering yet.

**Why third:** The server has real data (Phases 1 and 2). Building the frontend now means zero mocking — every API call returns real responses. This phase also surfaces any CORS misconfigurations or API shape mismatches early, before payment complexity is added.

**Client tasks:**
- Bootstrap with `npm create vite@latest client -- --template react`, install: `tailwindcss postcss autoprefixer react-router-dom axios react-hook-form lucide-react react-hot-toast`
- `src/services/api.js` — Axios instance with `baseURL: import.meta.env.VITE_API_URL`. Request interceptor reads token from localStorage and attaches `Authorization: Bearer <token>` header. Response interceptor catches 401s and calls `logout()`
- `src/context/AuthContext.jsx` — provides `user`, `token`, `isAuthenticated`, `login(email, password)`, `register(name, email, password)`, `logout()`. Stores token in localStorage. On mount, reads token and calls `GET /api/auth/me` to rehydrate user state
- `src/context/CartContext.jsx` — provides `cartItems`, `addToCart(item)`, `removeFromCart(itemId)`, `updateQty(itemId, qty)`, `clearCart()`, `cartTotal`, `cartCount`. Persists to localStorage via `useEffect`. Cart works for unauthenticated users — they only hit the auth wall at checkout
- `src/hooks/useAuth.js` — `useContext(AuthContext)` shortcut
- `src/hooks/useCart.js` — `useContext(CartContext)` shortcut
- `src/App.jsx` — set up `react-router-dom` with all routes. Wrap in `AuthProvider` and `CartProvider`
- Route map:
  - `/` → Home.jsx
  - `/menu` → MenuPage.jsx
  - `/cart` → CartPage.jsx
  - `/checkout` → CheckoutPage.jsx (ProtectedRoute)
  - `/orders` → OrderHistory.jsx (ProtectedRoute)
  - `/orders/:id/track` → OrderTracking.jsx (ProtectedRoute)
  - `/login` → Login.jsx
  - `/register` → Register.jsx
  - `/admin/*` → Admin pages (ProtectedRoute + role check)
  - `/delivery` → DeliveryDashboard.jsx (ProtectedRoute + role check)
  - `*` → NotFound.jsx
- `src/components/ProtectedRoute.jsx` — checks `isAuthenticated`, redirects to `/login?redirect=<currentPath>` if not. Optional `requiredRole` prop for admin/delivery routes
- `src/pages/Login.jsx` — email + password form using `react-hook-form`. On success calls `auth.login()`, navigates to `redirect` query param or `/menu`
- `src/pages/Register.jsx` — name, email, password, confirm password. On success auto-logs in and navigates to `/menu`
- `src/pages/Home.jsx` — hero section with restaurant name and tagline, shop open/close banner (fetches `/api/shop/settings`), link to menu, reviews section (placeholder for Phase 7)
- `src/pages/MenuPage.jsx` — fetches `GET /api/menu`. Renders `CategoryTabs` (horizontal tab bar). On tab select, filters and renders `MenuCard` grid for that category. Shows `ShopClosedBanner` and disables all add-to-cart if shop is closed. Shows special offer badge on items where `isSpecial: true`
- `src/components/menu/MenuCard.jsx` — item image, name, description (truncated), price, offer badge. "Add to cart" button calls `addToCart(item)`. Shows current cart quantity for this item with +/- controls if already in cart
- `src/components/cart/CartDrawer.jsx` — slide-in drawer from the right. Lists `CartItem` components, shows `CartSummary` at bottom. "Checkout" button redirects to `/login` if not authenticated, else to `/checkout`
- `src/components/Navbar.jsx` — logo, nav links, cart icon with `cartCount` badge, login/logout button

**Test checkpoint:** Register a new user. Browse menu categories. Add items to cart. Refresh page — cart should persist. Click checkout — should redirect to login if not authenticated. Log in — should return to checkout page.

---

### Phase 4 — Payment Integration + Order Creation

**Goal:** The complete checkout flow — from cart to payment to confirmed order stored in MongoDB. This is the revenue-critical path.

**Why fourth:** Payment correctness depends on nothing from Phases 5–7. Razorpay has a specific three-step flow (create order → open modal → verify signature) that must be isolated and tested cleanly. Building real-time tracking on top of incorrectly created orders would be compounded technical debt.

**Server tasks:**
- Install: `razorpay`
- Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to `.env`. Get these from the Razorpay test dashboard
- `src/utils/razorpayHelpers.js` — initialise Razorpay instance. Export `createRazorpayOrder(amount)` and `verifySignature(orderId, paymentId, signature)` (HMAC-SHA256 using the secret)
- `src/routes/payment.routes.js` + `src/controllers/payment.controller.js`:
  - `POST /api/payment/create-order` — receive `{ cartItems, deliveryAddress, chefInstructions }`. Re-fetch item prices from MongoDB (never trust client prices). Calculate subtotal + delivery fee + total server-side. Call `createRazorpayOrder(totalInPaise)`. Return `{ razorpayOrderId, amount, currency: 'INR', keyId }`
  - `POST /api/payment/verify` — receive `{ razorpayPaymentId, razorpayOrderId, razorpaySignature, cartItems, deliveryAddress, chefInstructions }`. Call `verifySignature()`. If invalid, return 400. If valid, create the `Order` document in MongoDB with `status: 'paid'` and `paymentStatus: 'completed'`. Return `{ success: true, orderId }`
- `src/routes/order.routes.js` + `src/controllers/order.controller.js`:
  - `GET /api/orders/mine` — find all orders where `userId === req.user._id`, sorted by `createdAt` desc
  - `GET /api/orders/:id` — find order by id, verify `order.userId.toString() === req.user._id.toString()`, return 403 if not

**Client tasks:**
- Install: `react-leaflet` and `leaflet` (install now, use in Phase 6)
- Add Razorpay checkout script to `index.html`: `<script src="https://checkout.razorpay.com/v1/checkout.js"></script>`
- `src/services/payment.service.js` — `createOrder(payload)` calls `POST /api/payment/create-order`, `verifyPayment(payload)` calls `POST /api/payment/verify`
- `src/services/order.service.js` — `getMyOrders()`, `getOrderById(id)`
- `src/pages/CheckoutPage.jsx`:
  - Delivery address form: street, city, pincode, lat/lng (optional, for map centering later)
  - Chef instructions textarea
  - Order summary: list of cart items with quantities and prices, subtotal, delivery fee, total
  - "Pay ₹{total}" button — on click: call `payment.createOrder()`, on response open Razorpay modal with `new window.Razorpay({ key, amount, order_id, handler })`. In the `handler` callback (payment success): call `payment.verifyPayment()`, on success call `cart.clearCart()` and navigate to `/orders/${orderId}/track`
  - Handle Razorpay modal close/dismiss gracefully (show error toast)
- `src/pages/OrderTracking.jsx` (shell) — fetch `GET /api/orders/:id`. Display: order items, total, delivery address, current status as a static label. Status timeline will be made live in Phase 5
- `src/pages/OrderHistory.jsx` — fetch `GET /api/orders/mine`. Render a list of `OrderCard` components showing date, items summary, total, status badge, and a "Track" link

**Test checkpoint:** Go through checkout with Razorpay test card `4111 1111 1111 1111`. Verify the Order document appears in MongoDB Atlas with `status: 'paid'` and `paymentStatus: 'completed'`. Verify `GET /api/orders/mine` returns the order. Verify payment failure (wrong OTP) returns an error and no Order is created.

---

### Phase 5 — Real-time Order Status with Socket.io

**Goal:** Order status changes made by the admin instantly appear on the customer's tracking page without a page refresh.

**Why fifth:** Real-time only makes sense once real paid orders exist (Phase 4). Socket.io is attached to the same HTTP server created in Phase 1 — the `server.js` / `app.js` split from Phase 1 was specifically designed for this moment. No refactoring needed, just attach.

**Server tasks:**
- Install: `socket.io`
- `server.js` — wrap Express app with `http.createServer(app)`, attach Socket.io: `const io = new Server(httpServer, { cors: { origin: process.env.CLIENT_URL } })`. Export `io` for use in controllers
- `src/sockets/orderSocket.js` — on connection, authenticate the socket (verify JWT from `socket.handshake.auth.token`). Listen for `joinOrderRoom` event: validate that the requested `orderId` belongs to this user (query MongoDB), then `socket.join('order_' + orderId)`. Reject with an error event if validation fails
- `src/controllers/admin.controller.js` — add order management:
  - `GET /api/admin/orders` — all orders where status is not 'delivered', populate userId (name, phone), sort by createdAt desc
  - `GET /api/admin/orders/history` — all orders with status 'delivered'
  - `PATCH /api/admin/orders/:id/status` — validate status is one of the allowed transitions. Update order in MongoDB. Emit `io.to('order_' + orderId).emit('order_status_update', { status, updatedAt })`. Return updated order

**Client tasks:**
- `src/hooks/useSocket.js` — establishes Socket.io connection with `auth: { token: localStorage.getItem('token') }` in handshake options. Returns the `socket` instance. Handles connect/disconnect/reconnect lifecycle. Cleans up on unmount
- `src/pages/OrderTracking.jsx` (complete) — on mount: fetch order, call `socket.emit('joinOrderRoom', { orderId })`. Listen for `order_status_update`: update local `status` state. Render `StatusTimeline` with current status highlighted. Conditionally render `LiveMap` when status becomes 'out_for_delivery' (Phase 6 will make this functional)
- `src/components/order/StatusTimeline.jsx` — vertical stepper with five stages: Paid → Preparing → Ready → Out for Delivery → Delivered. Current stage is highlighted (filled circle + bold label). Past stages show a checkmark. Future stages are grayed out
- Admin pages:
  - `src/pages/admin/AdminDashboard.jsx` — summary cards: active orders count, today's revenue, menu item count, shop status toggle
  - `src/pages/admin/AdminOrders.jsx` — fetches `GET /api/admin/orders` on mount, polls every 30 seconds. Renders `OrderTable`
  - `src/components/admin/OrderTable.jsx` — table rows: order ID, customer name, items summary, total, current status, `StatusDropdown`
  - `src/components/admin/StatusDropdown.jsx` — dropdown with allowed next statuses. On select, calls `PATCH /api/admin/orders/:id/status`. Shows a loading spinner during the request
- Delivery portal:
  - `src/pages/delivery/DeliveryDashboard.jsx` — fetches orders with status 'out_for_delivery'. Shows the active delivery details. Location broadcasting UI added in Phase 6

**Test checkpoint:** Open OrderTracking page in one browser tab. In another tab, log in as admin and change the order status to 'preparing'. The first tab should update the StatusTimeline instantly without refresh.

---

### Phase 6 — Live Rider Location: GPS Broadcast + Leaflet Map

**Goal:** When an order is out for delivery, the customer's tracking page shows a live-updating map with the rider's position.

**Why sixth:** This phase directly extends the Socket.io room infrastructure from Phase 5. The rider location broadcast targets the same `order_<orderId>` rooms. Building this before Socket.io rooms exist would mean broadcasting to nowhere.

**Server tasks:**
- `src/routes/location.routes.js` + `src/controllers/location.controller.js`:
  - `POST /api/location/update` — `requireAuth` + `requireRole('delivery')`. Receive `{ lat, lng }`. Upsert the single `RiderLocation` document for this rider using `findOneAndUpdate` with `{ upsert: true }`. Query MongoDB for all orders with `status: 'out_for_delivery'`. For each, emit `io.to('order_' + order._id).emit('rider_location', { lat, lng })`. Return `{ success: true }`
  - `GET /api/location/rider` — `requireAuth`. Return current RiderLocation document (REST fallback for customers who lost the WebSocket connection)
- `src/sockets/locationSocket.js` — optional: handle location updates over WebSocket instead of REST if preferred (lower HTTP overhead for frequent updates)

**Client tasks:**
- `src/components/order/LiveMap.jsx` — renders a Leaflet map using `react-leaflet`. On mount, fetches `GET /api/location/rider` for the initial position. Listens to the `socket` prop for `rider_location` events and moves the rider marker to `{ lat, lng }`. Also renders a static marker for the restaurant's coordinates (hardcoded from `constants.js`). Map is centered on the rider, zoom level 15
- `src/pages/OrderTracking.jsx` — pass the `socket` instance to `<LiveMap socket={socket} />`. LiveMap only renders when `status === 'out_for_delivery'`
- `src/pages/delivery/DeliveryDashboard.jsx` — "Start Broadcasting" button calls `navigator.geolocation.watchPosition()`. On each position callback, POST to `/api/location/update` with `{ lat, lng }`. Show a green pulsing "Live" indicator while broadcasting. "Stop" button calls `clearWatch()` and stops posting. Show the active order details so the rider knows the delivery address

**Test checkpoint:** Log in as the delivery guy. Start broadcasting on DeliveryDashboard. Open OrderTracking for an order with status 'out_for_delivery' in another tab. The map should show a marker that moves as the browser's reported location changes. Use browser DevTools geolocation override to simulate movement.

---

### Phase 7 — Admin Dashboard: Shop Settings + Special Offers + Reviews

**Goal:** Complete the admin's operational control surfaces and add the reviews system.

**Why seventh:** These features layer on top of the complete, working core. Shop settings affect Phase 3's menu display but are not a blocker — you built with the shop permanently "open". Special offers are additive UI and data changes. Reviews require delivered orders, which only exist after Phases 4 and 5 are complete. Doing this phase earlier would mean building UI for states that don't exist yet.

**Server tasks:**
- Reviews:
  - `POST /api/reviews` — `requireAuth`. Verify the order exists, belongs to the user, and has `status: 'delivered'`. Prevent duplicate reviews (check if a review already exists for this orderId). Create Review document
  - `GET /api/reviews` — public. Return all reviews populated with user name and rating. Sort by createdAt desc
- Admin shop settings (already have the route from Phase 2, extend the UI):
  - Ensure `PATCH /api/admin/shop/settings` accepts `isOpen`, `openTime`, `closeTime`, `banner`, `specialNotice`

**Client tasks:**
- `src/pages/admin/AdminShopSettings.jsx`:
  - Toggle for shop open/close (calls `PATCH /api/admin/shop/settings` immediately on toggle)
  - Time pickers for opening and closing time
  - Banner text input (shown on Home page)
  - Special notice textarea
  - Save button
- `src/pages/admin/AdminMenuManager.jsx`:
  - Category list with edit/delete buttons
  - "Add Category" button opens a `CategoryForm` modal
  - Within each category, item list with edit/delete
  - "Add Item" button opens `MenuItemForm` modal
  - `MenuItemForm` includes: name, description, price, original price (for crossed-out display), image upload, isSpecial toggle, offer label text, isAvailable toggle, prep time
- `src/components/menu/OfferBadge.jsx` — rendered on MenuCard when `item.isSpecial`. Shows `item.offerLabel` in an amber pill. Shows `item.originalPrice` crossed out next to `item.price`
- Reviews on Home page:
  - `src/pages/Home.jsx` — fetch `GET /api/reviews`, display as a card grid with star rating, comment, and customer name (first name only)
- Leave a review:
  - `src/pages/OrderHistory.jsx` — for orders with `status: 'delivered'` that have no review yet, show a "Leave a Review" button that opens a modal with a star picker and comment textarea. On submit calls `POST /api/reviews`

**Test checkpoint:** Toggle shop closed from admin. Refresh MenuPage — should show the closed banner and disabled add-to-cart buttons. Mark a menu item as special with an offer label. MenuPage should show the offer badge and crossed-out original price. Complete a full order flow and leave a review. Review appears on Home page.

---

### Phase 8 — Polish, Error Handling, Guards + Deployment

**Goal:** A production-ready, hardened application deployed on free-tier infrastructure.

**Why last:** Polish and hardening are most effective on a finalized feature set. Adding exhaustive input validation to a route that changes shape in the next phase is wasted effort. Deployment comes last because you want a single stable, complete version going live.

**Server hardening:**
- Add `express-validator` validation chains to every POST and PATCH route that does not already have it. Every route that creates or modifies data should validate required fields, types, and lengths, returning clear `400 Bad Request` responses with field-level errors
- Ensure the global `errorHandler.js` catches every unhandled promise rejection — wrap all async controller functions in a `asyncHandler(fn)` utility to avoid repeating try/catch
- Add request logging with `morgan` in development mode
- Set `NODE_ENV=production` on Render and ensure `err.stack` is not leaked in error responses
- Review all routes for missing `requireAuth` or `requireRole` — no admin or delivery route should be reachable without the correct role

**Client hardening:**
- Add loading skeletons (`SkeletonCard.jsx`) to every page that fetches data. Nothing should show a blank white area while loading
- Add `react-hot-toast` notifications for: successful login, failed login, item added to cart, payment success, payment failure, status update received, review submitted
- Ensure all forms show inline validation errors (react-hook-form already handles this — wire up error displays if not done)
- Add a 404 page (`NotFound.jsx`) for unmatched routes
- Test the redirect flow: unauthenticated user clicks checkout → redirected to login with `?redirect=/checkout` → after login, returned to checkout with cart intact
- Test role guards: customer account accessing `/admin/*` → redirected to `/menu`

**Deployment steps:**
1. Push everything to a GitHub repository (monorepo with `server/` and `client/` at root)
2. MongoDB Atlas: create free M0 cluster, create a database user, whitelist all IPs (`0.0.0.0/0`), copy the connection string to `.env`
3. Upstash: create a Redis database, copy `REDIS_URL` and `REDIS_TOKEN` to `.env`
4. Cloudinary: create a free account, copy cloud name, API key, API secret to `.env`
5. Razorpay: create account, get test key ID and secret, add to `.env`
6. Render: new Web Service, point to the `server/` folder, set build command `npm install`, start command `node server.js`, add all environment variables from `.env` in the Render dashboard
7. Vercel: new Project, point to the `client/` folder, set framework to Vite, add `VITE_API_URL=https://<your-render-url>.onrender.com` as environment variable
8. UptimeRobot: create a free HTTP monitor pointing to `https://<your-render-url>.onrender.com/api/shop/settings`, interval 5 minutes. This prevents Render's free tier from spinning down the server
9. Run `node src/seed/seed.js` against the production Atlas cluster once to seed admin and delivery accounts

**Final end-to-end test checklist:**
- [ ] Register as a new customer
- [ ] Browse menu — categories and items load correctly
- [ ] Add items to cart, adjust quantities
- [ ] Toggle shop closed from admin — verify cart is disabled on menu page
- [ ] Toggle shop open again
- [ ] Proceed to checkout, fill address and chef instructions
- [ ] Complete payment with Razorpay test card
- [ ] Order appears in OrderTracking with status 'paid'
- [ ] Admin changes status to 'preparing' — customer's StatusTimeline updates live
- [ ] Admin changes status to 'out_for_delivery' — LiveMap appears on tracking page
- [ ] Delivery guy logs in, starts broadcasting location — customer map marker moves
- [ ] Admin marks as 'delivered'
- [ ] Customer leaves a review — review appears on Home page
- [ ] Admin can add/edit/delete categories and menu items
- [ ] All admin-only routes return 403 for customer accounts

---

## Environment Variables Reference

### server/.env
```
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/restaurant

JWT_SECRET=your_jwt_secret_min_32_chars
JWT_EXPIRES_IN=7d

REDIS_URL=rediss://<upstash-endpoint>:6380
REDIS_TOKEN=your_upstash_token

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

ADMIN_EMAIL=admin@restaurant.com
ADMIN_PASSWORD=secureadminpassword

DELIVERY_EMAIL=rider@restaurant.com
DELIVERY_PASSWORD=secureriderpassword
```

### client/.env
```
VITE_API_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
VITE_RESTAURANT_LAT=28.6139
VITE_RESTAURANT_LNG=77.2090
VITE_RESTAURANT_NAME=Your Restaurant Name
```

---

## Key Packages

### server/package.json dependencies
```json
{
  "express": "^4.18.2",
  "mongoose": "^8.0.0",
  "dotenv": "^16.3.1",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "cors": "^2.8.5",
  "helmet": "^7.1.0",
  "express-rate-limit": "^7.1.5",
  "express-validator": "^7.0.1",
  "socket.io": "^4.6.1",
  "ioredis": "^5.3.2",
  "razorpay": "^2.9.2",
  "multer": "^1.4.5-lts.1",
  "cloudinary": "^1.41.3",
  "multer-storage-cloudinary": "^4.0.0",
  "morgan": "^1.10.0"
}
```

### client/package.json dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.21.0",
  "axios": "^1.6.2",
  "socket.io-client": "^4.6.1",
  "react-leaflet": "^4.2.1",
  "leaflet": "^1.9.4",
  "react-hook-form": "^7.49.2",
  "react-hot-toast": "^2.4.1",
  "lucide-react": "^0.303.0",
  "tailwindcss": "^3.4.0",
  "postcss": "^8.4.32",
  "autoprefixer": "^10.4.16"
}
```

---

## Important Design Decisions

**Why `app.js` and `server.js` are separate:** `app.js` configures Express middleware and routes. `server.js` creates the HTTP server, connects to the database, and starts listening. This separation means Socket.io can attach to the raw `httpServer` in Phase 5 without touching `app.js`, and integration tests can import `app` without starting the server.

**Why the cart lives in `localStorage` not the database:** Cart operations are frequent and low-stakes. Persisting them in localStorage means they survive page refreshes, work before login, and require zero backend calls. The cart is only sent to the server once — at checkout — when it is re-validated against real database prices.

**Why item prices are re-fetched at checkout:** The client sends item IDs and quantities. The server re-fetches prices from MongoDB and recalculates the total. This prevents a malicious client from sending a manipulated price. Razorpay order is created with the server-calculated total, not the client's number.

**Why `RiderLocation` has no `orderId` or `customerId`:** The access control is in the Socket.io room, not the database. The server broadcasts the single rider's location to all rooms that currently have `status: 'out_for_delivery'`. Only customers who have joined their order's private room receive the event. The room ID (`order_<orderId>`) is the access key — only the authenticated order owner knows it.

**Why Upstash instead of a self-hosted Redis:** Upstash provides a serverless Redis with an HTTP API. No Docker, no server management, free tier is sufficient for this app, and it works with any hosting provider including Render's free tier.

**Why Leaflet + OpenStreetMap instead of Google Maps:** Completely free, no API key, no billing surprises. Leaflet is a mature open-source library with a solid React wrapper. For a restaurant delivery app, OpenStreetMap's map quality is more than sufficient.