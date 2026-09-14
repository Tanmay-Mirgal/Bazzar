# 🛒 BAZZAR — Production-Grade Hyperlocal 10/15-Minute E-Commerce Platform

[![Next.js 16](https://img.shields.io/badge/Next.js-16.3.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Spring Boot 3](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-DB-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Hyperlocal Engine](https://img.shields.io/badge/Hyperlocal-10--Min_Flash-10B981?style=for-the-badge&logo=zap&logoColor=white)](#-hyperlocal-1015-minute-delivery-engine)
[![Razorpay](https://img.shields.io/badge/Razorpay-Gateway-0C2340?style=for-the-badge&logo=razorpay&logoColor=white)](https://razorpay.com/)
[![Shiprocket](https://img.shields.io/badge/Shiprocket-Logistics-E05638?style=for-the-badge&logo=shipping&logoColor=white)](https://www.shiprocket.in/)
[![Clerk Auth](https://img.shields.io/badge/Clerk-Authentication-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)](https://clerk.com/)

**BAZZAR** is a next-generation, high-performance **Hyperlocal Quick-Commerce & Multi-Seller E-Commerce Platform**. Designed with enterprise-grade architecture, Bazzar features a custom **Dynamic Radial Spectrum Expansion Engine** that calculates 10-to-15 minute flash delivery SLAs from nearest dark stores, backed by server-authoritative fee enforcement, interactive GIS turn-by-turn order tracking, and multi-vendor marketplace governance.

---

## ⚡ Hyperlocal 10/15-Minute Delivery Engine

At the core of Bazzar is a production-ready **Concentric Ring Geo-Fencing Engine** that dynamically evaluates local dark stores to offer instant flash delivery.

```
       ┌────────────────────────────────────────────────────────┐
       │   TIER 1: 0 – 2.0 km  │  ⚡ FLASH 10-MIN  │  ₹29 Fee    │
       ├────────────────────────────────────────────────────────┤
       │   TIER 2: 2.0 – 5.0 km│  🚀 FAST 20-MIN   │  ₹19 Fee    │
       ├────────────────────────────────────────────────────────┤
       │   TIER 3: 5.0–10.0 km │  🚚 QUICK 45-MIN  │  ₹9 Fee     │
       ├────────────────────────────────────────────────────────┤
       │   TIER 4: > 10.0 km   │  📦 COURIER       │ Calculated  │
       └────────────────────────────────────────────────────────┘
```

### Key Technical Mechanisms

1. **Basket-Level 100% Inventory Evaluation**
   - Before qualifying a candidate dark store for Tier 1 (10-Min) or Tier 2 (20-Min), the engine evaluates **100% item availability** across all cart items. If any item is missing, the engine automatically triggers dynamic spectrum expansion to wider radial rings.

2. **Multi-Factor Dark Store Candidate Weighted Scoring**
   Candidate stores are scored and ranked using a multi-variable algorithmic formula:
   
   $$\text{Score} = \left(W_{\text{dist}} \times \left(1 - \frac{d}{R_{\text{max}}}\right)\right) + \left(W_{\text{avail}} \times \text{AvailRatio}\right) + \left(W_{\text{rel}} \times S_{\text{rel}}\right) + \left(W_{\text{prep}} \times \left(1 - \frac{T_{\text{prep}}}{30}\right)\right)$$

   - **Distance Weight ($W_{\text{dist}}$ = 40%)**: Proximity to customer GPS coordinates (Haversine formula).
   - **Availability Weight ($W_{\text{avail}}$ = 30%)**: Ratio of basket items stocked in store inventory.
   - **Reliability Weight ($W_{\text{rel}}$ = 15%)**: Historical dark store fulfillment SLA completion rate ($0.0 - 1.0$).
   - **Preparation Time ($W_{\text{prep}}$ = 15%)**: Active store dispatch velocity & queue congestion.

3. **Server-Authoritative Fee & SLA Enforcement**
   - Clients cannot bypass delivery fees or manipulate countdown timers. All fees and delivery deadlines (`deliveryDeadline`) are recalculated on the backend during order placement inside Spring `@Transactional` blocks.

---

## 🌟 Key Features

### 🛒 Hyperlocal Shopping & User Experience
- **Top Location Selector Badge**: Displays current active delivery area (e.g. `⚡ BKC, Mumbai (10-Min Flash)`) with instant HTML5 GPS auto-detection, pincode search, and preset city hubs.
- **Dynamic Product Card Badges**: Real-time `⚡ 10-MIN FLASH` overlay tags on products stocked in nearby radial dark stores.
- **Checkout Speed Selector**: Live fee breakdown and ETA guarantees synced directly with the backend Hyperlocal engine.
- **Amazon-Style Rotating Hero & Category Carousels**: Vibrant banner promotions, discount codes (`BAZZAR10`), and smooth horizontal category navigation.

### 🗺️ Live Interactive Order Radar & Tracking
- **Turn-by-Turn OSRM Navigation**: Interactive Leaflet GIS map drawing exact turn-by-turn road driving polyline routes between dark store pick-up points and customer drop-off coordinates.
- **Server-Authoritative Countdown Timer**: High-impact dark mode live countdown card displaying remaining minutes (`14:32` mins) until delivery deadline.
- **Real-Time Concentric Ring Radar**: Visual indicators reflecting current dispatch status, candidate store ring, and courier assignment.

### 🏢 Multi-Seller Marketplace & Super Admin Portal
- **Seller Application System**: User application workflow (`become-seller`) with approval/rejection lifecycle managed by Super Admins.
- **Store Admin Portal**: Dedicated seller dashboard with inventory management, product publishing, stock alert warnings, and store order status updates.
- **Super Admin Governance**: Full administrative oversight, application reviews, catalog moderation, and platform-wide analytics.

### 💳 Secure Payments & Express Logistics
- **Razorpay 256-Bit SSL Gateway**: Complete online payment integration with instant signature verification and automatic sandbox fallback.
- **Cash on Delivery (COD) & Shiprocket Sync**: Automatic AWB code generation, courier allocation, and shipment manifestation for COD and national orders.

---

## 🛠️ Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend Framework** | Next.js 16 (React 19, App Router, Turbopack) |
| **Styling & Icons** | Tailwind CSS 3.4, Vanilla CSS Tokens, Lucide React |
| **State Management** | Zustand with persistent LocalStorage middleware |
| **Authentication** | Clerk Next.js SDK + Spring Boot JWT Bearer authentication |
| **Maps & Routing** | Leaflet.js, OpenStreetMap Tiles, OSRM turn-by-turn API |
| **Backend Framework** | Spring Boot 3.x, Java 17 HotSpot JDK |
| **Database & ORM** | PostgreSQL, Spring Data JPA / Hibernate |
| **Payment Gateway** | Razorpay SDK (Checkout.js + Spring API) |
| **Logistics API** | Shiprocket REST Integration |
| **Build & Tooling** | Apache Maven (`mvnw`), Node.js / `npm` |

---

## 📁 Project Directory Structure

```
Bazzar/
├── backend/                                   # Spring Boot Backend Project
│   ├── src/main/java/com/bazzar/
│   │   ├── config/                            # Security, CORS, Clerk JWT Resolver
│   │   ├── controller/                        # REST Controllers
│   │   │   ├── HyperlocalController.java      # Dynamic SLA & Store Estimate APIs
│   │   │   ├── OrderController.java           # Order placement & status APIs
│   │   │   ├── ProductController.java         # Catalog & Search APIs
│   │   │   └── StoreAdminController.java      # Seller application & inventory APIs
│   │   ├── dto/
│   │   │   └── hyperlocal/                    # Delivery estimate & Store DTOs
│   │   ├── entity/                            # JPA Entities (Store, Order, DeliverySpeedTier, User)
│   │   ├── repository/                        # Spring Data JPA Repositories
│   │   └── service/                           # Core Business Services
│   │       ├── DeliveryFeeServiceImpl.java    # Centralized fee calculator
│   │       ├── DistanceCalculationServiceImpl.java # Haversine & road distance engine
│   │       ├── HyperlocalServiceImpl.java     # Radial spectrum expansion & weighted scoring
│   │       ├── OrderService.java              # Server-authoritative order placement
│   │       └── ShiprocketService.java         # Courier shipment & tracking sync
│   └── src/main/resources/
│       └── application.yml                    # Hyperlocal radii, fees & weights config
│
├── frontend/                                  # Next.js Frontend Application
│   ├── src/
│   │   ├── app/                               # Next.js App Router Pages
│   │   │   ├── checkout/page.tsx              # Hyperlocal express checkout & fee selector
│   │   │   ├── orders/[id]/page.tsx           # Order details & live countdown radar
│   │   │   ├── become-seller/page.tsx         # Seller application portal
│   │   │   └── store-admin/                   # Seller dashboard & inventory editor
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── location-modal.tsx         # Geolocation & Pincode selector modal
│   │   │   │   └── navbar.tsx                 # Header location badge & cart drawer
│   │   │   ├── product/
│   │   │   │   └── product-card.tsx           # Product card with 10-MIN FLASH badges
│   │   │   └── tracking/
│   │   │       ├── hyperlocal-radar-card.tsx  # Server countdown & ring radar card
│   │   │       └── live-tracking-map.tsx      # Leaflet + OSRM road navigation map
│   │   ├── lib/api/
│   │   │   ├── hyperlocal.ts                  # Hyperlocal API client
│   │   │   └── orders.ts                      # Orders & Razorpay API client
│   │   └── store/
│   │       ├── user-location-store.ts         # Zustand location store
│   │       └── cart-store.ts                  # Zustand shopping cart store
│   └── package.json
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Java JDK 17** (or Microsoft OpenJDK 17)
- **Node.js 18+** & `npm`
- **PostgreSQL** database instance running locally (`localhost:5432`) or on cloud.

---

### 1️⃣ Backend Setup (Spring Boot)

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Configure Database & Secrets** in `src/main/resources/application.yml` or environment variables:
   ```yaml
   spring:
     datasource:
       url: jdbc:postgresql://localhost:5432/bazzar
       username: postgres
       password: your_password

   hyperlocal:
     radii:
       tier1-max-km: 2.0
       tier2-max-km: 5.0
       tier3-max-km: 10.0
     fees:
       tier1-flash: 29.00
       tier2-fast: 19.00
       tier3-standard: 9.00
   ```

3. **Compile and Run Backend**:
   - Windows PowerShell:
     ```powershell
     $env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-17.0.19.10-hotspot"
     .\mvnw.cmd spring-boot:run
     ```
   - Linux / macOS:
     ```bash
     ./mvnw spring-boot:run
     ```
   Backend API server will start on **`http://localhost:8080`**.

---

### 2️⃣ Frontend Setup (Next.js)

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables** in `.env.local`:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open **`http://localhost:3000`** in your browser.

---

## 🔌 Core API Directory

| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/api/hyperlocal/estimate` | `GET` | Public | Evaluates concentric rings, calculates SLA & delivery fee |
| `/api/hyperlocal/nearby-stores` | `GET` | Public | Fetches active dark stores within specified radius |
| `/api/orders` | `POST` | User | Places order with backend SLA deadline & fee validation |
| `/api/orders/{id}` | `GET` | User | Fetches order details with deadline & fulfillment status |
| `/api/orders/{id}/tracking` | `GET` | User | Returns real-time tracking checkpoints & OSRM coordinates |
| `/api/orders/razorpay/create` | `POST` | User | Generates Razorpay payment order |
| `/api/orders/razorpay/verify` | `POST` | User | Verifies Razorpay payment signature & confirms order |
| `/api/store-admin/application` | `POST` | User | Submits seller onboarding application |
| `/api/products` | `GET` | Public | Lists catalog products with keyword search & category filters |

---

## 📝 License

Distributed under the **MIT License**. See `LICENSE` for details.
