# Restaurant Delivery Platform

Production-style full-stack food ordering system with real-time order updates, live rider location tracking, role-based dashboards, and online payment flow.

## Table of Contents

1. Project Overview
2. Core Features
3. Tech Stack
4. Architecture and Folder Structure
5. Prerequisites
6. Environment Variables
7. Local Setup
8. Run the Program
9. Seed Admin and Rider Accounts
10. Default Login Credentials
11. API Summary
12. Available Scripts
13. Troubleshooting

## Project Overview

This project provides three major experiences in one system:

- Customer app: browse menu, add to cart, checkout, track order status, view rider map, leave reviews.
- Admin console: manage categories and menu items, upload images, update shop settings, manage order pipeline.
- Delivery rider panel: update live location while delivering orders.

The app is split into:

- client: React + Vite frontend.
- server: Node.js + Express API with MongoDB, Redis cache, Socket.io, Cloudinary, Razorpay.

## Core Features

### Customer Features

- User registration, login, profile, and address support.
- Browse categories and menu items with offers and availability.
- Cart management with quantity updates and subtotal calculation.
- Checkout flow with Razorpay test-mode payment integration.
- Order history and order details.
- Real-time order status updates through Socket.io.
- Live rider location tracking on map during out-for-delivery stage.
- Ratings and reviews after orders.

### Admin Features

- Secure admin-only routes with role-based access.
- Category CRUD and menu item CRUD.
- Cloudinary image upload for menu items.
- Shop settings management (open/close, timings, notice/banner).
- Active order dashboard and order history.
- Order status update pipeline:
	- paid -> preparing -> ready -> out_for_delivery -> delivered

### Delivery Rider Features

- Delivery-role protected APIs.
- Live GPS location updates for active deliveries.
- Real-time customer map sync through Socket.io rooms.

### Platform and Reliability Features

- Global error handler + not found middleware.
- Rate limiting for general API and auth endpoints.
- Security middleware via Helmet + CORS controls.
- Redis caching for frequently read menu/shop data.
- Health endpoint: /health

## Tech Stack

### Frontend

- React 19 + Vite
- Tailwind CSS
- React Router
- Axios
- Socket.io Client
- Leaflet + React Leaflet
- React Hook Form

### Backend

- Node.js (ES modules)
- Express
- MongoDB + Mongoose
- Redis (ioredis)
- Socket.io
- JSON Web Token (JWT)
- Cloudinary + Multer
- Razorpay

## Architecture and Folder Structure

Top-level structure:

```text
RestaurantDelivery/
	client/    # React frontend
	server/    # Express backend
	README.md
	Plan.md
	Execution_Phases.md
```

Backend highlights:

- src/config: db/env/redis/cloudinary setup
- src/models: data models (User, Order, Menu, ShopSettings, Reviews, RiderLocation)
- src/controllers + src/routes: API layer
- src/middleware: auth, role checks, validation, error handling, rate limiters
- src/sockets: order + location real-time events
- src/seed/seed.js: admin/rider/settings bootstrap

Frontend highlights:

- src/pages: customer, admin, delivery page modules
- src/components: reusable UI and domain components
- src/context: auth and cart providers
- src/hooks: auth, cart, socket, location hooks
- src/services: API integrations per domain

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB connection string
- Redis credentials (Upstash or equivalent)

Optional but recommended for complete flow:

- Razorpay test keys
- Cloudinary keys

## Environment Variables

Create these files:

- server/.env
- client/.env

### server/.env

```env
# App
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# Database
MONGO_URI=your_mongodb_connection_string

# Auth
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Redis
REDIS_URL=your_redis_url
REDIS_TOKEN=your_redis_token

# Cloudinary (optional for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay (optional for payment flow)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Seed accounts (optional, defaults shown)
ADMIN_EMAIL=admin@restaurant.com
ADMIN_PASSWORD=Admin@123
DELIVERY_EMAIL=rider@restaurant.com
DELIVERY_PASSWORD=Rider@123
```

Note: The backend enforces these variables at startup:

- MONGO_URI
- JWT_SECRET
- REDIS_URL
- REDIS_TOKEN

### client/.env

```env
VITE_API_URL=http://localhost:5000
VITE_RESTAURANT_NAME=The Restaurant
VITE_RESTAURANT_LAT=28.6139
VITE_RESTAURANT_LNG=77.2090
```

## Local Setup

From project root:

```bash
cd server
npm install

cd ../client
npm install
```

## Run the Program

Open two terminals from project root.

Terminal 1 (Backend):

```bash
cd server
npm run dev
```

Terminal 2 (Frontend):

```bash
cd client
npm run dev
```

Local URLs:

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Health check: http://localhost:5000/health

## Seed Admin and Rider Accounts

Run seeding after setting server .env and installing backend dependencies.

Option 1 (inside server folder):

```bash
cd server
npm run seed
```

Option 2 (from project root):

```bash
npm --prefix server run seed
```

What seed does:

- Creates one admin user if no admin exists.
- Creates one delivery rider if no delivery user exists.
- Creates default shop settings if not present.

The script is idempotent for these checks, so running it again will skip already-created records.

## Default Login Credentials

If not overridden in server .env:

- Admin
	- Email: admin@restaurant.com
	- Password: Admin@123
- Rider
	- Email: rider@restaurant.com
	- Password: Rider@123

## API Summary

Base URL: http://localhost:5000/api

- Auth
	- POST /auth/register
	- POST /auth/login
	- GET /auth/me
	- PATCH /auth/me
	- POST /auth/address
- Menu
	- GET /menu
	- GET /menu/categories
	- GET /menu/shop-settings
- Orders and Payment
	- GET /orders/mine
	- GET /orders/:id
	- POST /payment/create-order
	- POST /payment/verify
- Admin
	- Category/menu CRUD
	- GET /admin/orders
	- GET /admin/orders/history
	- PATCH /admin/orders/:id/status
	- PATCH /admin/shop/settings
- Location
	- POST /locations/update (delivery role)
	- GET /locations/rider
- Reviews
	- GET /reviews
	- POST /reviews
	- GET /reviews/order/:orderId

## Available Scripts

Server scripts:

- npm run dev: start backend with nodemon
- npm start: start backend with node
- npm run seed: seed admin, rider, shop settings

Client scripts:

- npm run dev: start Vite dev server
- npm run build: production build
- npm run preview: preview production build
- npm run lint: lint frontend

## Troubleshooting

### npm run seed fails from project root

Use one of these:

- cd server && npm run seed
- npm --prefix server run seed

Reason: seed script is defined in server/package.json, not root package.json.

### Backend exits immediately on startup

Check required server env variables:

- MONGO_URI
- JWT_SECRET
- REDIS_URL
- REDIS_TOKEN

### CORS or frontend API errors

- Ensure CLIENT_URL in server/.env matches your frontend URL.
- Ensure VITE_API_URL in client/.env points to backend URL.

### Payment or image upload not working

- Verify Razorpay and Cloudinary environment variables are set.
- Restart backend after editing env values.
