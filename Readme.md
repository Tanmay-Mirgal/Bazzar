# 🛒 BAZZAR — Premium Full-Stack E-Commerce Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.3.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-DB-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![JWT Auth](https://img.shields.io/badge/JWT-Security-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)](https://jwt.io/)
[![Render Keep-Alive](https://img.shields.io/badge/Render-Keep--Alive_Cron-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)

**BAZZAR** is a modern, high-performance, full-stack E-Commerce application built with **Next.js (App Router, Turbopack)** on the frontend and **Spring Boot (Java 17, JPA/Hibernate, Security)** on the backend, backed by a **PostgreSQL** relational database.

---

## ✨ Key Features

### 🛍️ Storefront & User Experience
- **Amazon-Style Rotating Hero Banner**: Auto-play slideshow displaying real trending store catalog products with promotional discount badges (`25% OFF Code: BAZZAR10`), star ratings, live prices in ₹, and instant product deal links.
- **Horizontal Category Carousel**: Smooth scrollable category navigation with authentic imagery for Electronics, Clothing, Books, and Accessories.
- **2-Column Mobile-First Responsive Design**: Optimized 2-product per row grid (`grid-cols-2`) on mobile devices for clean, readable shopping on all screen sizes.
- **Dynamic Catalog Search & Filters**: Instant keyword search, category filtering, price range sorting (Low to High, High to Low), and active filter clear tags.
- **Product Detail View**: High-resolution image galleries, quantity selection, stock status badges (`Sold Out`, `Only X Left`, `In Stock`), expandable specs accordion, and related product recommendations.
- **Persistent Shopping Cart & Wishlist**: Client-side state managed via Zustand, synced across devices upon authentication.

### 🛡️ Admin Operations Portal
- **100% Real Database Analytics**: Live calculation of Total Sales Revenue, Total Customer Orders, Active Catalog Items, and Unique Buyer Accounts.
- **Store Operations Dashboard**: Overview dashboard featuring sales trends, recent transactions list, and automated **Low-Stock Warning Alerts**.
- **Catalog Management**: Searchable product inventory table with live price/stock edit modals and instant database product deletion.
- **Product Publishing**: Clean admin form to publish new items directly to the PostgreSQL database with category bindings.
- **Customer Order Tracking**: Full transaction history with customer details, order references (`#101`), total amounts, and delivery status tags.

### ⚡ Backend Architecture & Reliability
- **Stateless JWT Authentication**: Secure user registration, authentication, role-based access control (`ROLE_USER`, `ROLE_ADMIN`), and password hashing with BCrypt.
- **Render Keep-Alive Cron Job**: Integrated Spring `@Scheduled` cron runner executing every 10 minutes (`GET /api/health`), preventing free-tier Render application containers from going idle or spinning down after 15 minutes of inactivity.
- **Database Seeding**: Automatic initial database populator seeding categories and catalog products on first boot.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: Next.js 16 (React 19) with App Router & Turbopack
- **Language**: TypeScript
- **Styling**: Vanilla CSS Design Tokens & Tailwind CSS
- **Icons**: Lucide React
- **State Management**: Zustand
- **HTTP Client**: Native Fetch with Custom API Adapter (`apiFetch`)
- **Notifications**: Sonner Toast

### **Backend**
- **Framework**: Spring Boot 3.x
- **Language**: Java 17
- **Database**: PostgreSQL (JPA / Hibernate)
- **Security**: Spring Security + JWT (JSON Web Tokens)
- **Scheduling**: Spring Scheduling (`@EnableScheduling`)
- **Build Tool**: Apache Maven (`mvnw`)

---

## 📁 Project Structure

```
Bazzar/
├── frontend/                     # Next.js Frontend Application
│   ├── src/
│   │   ├── app/                  # App Router Pages (Home, Products, Admin, Cart, Wishlist, Auth)
│   │   ├── components/           # UI & Feature Components (Home, Product, Layout, UI)
│   │   ├── lib/api/              # API Service Clients (Auth, Products, Orders, Categories)
│   │   ├── store/                # Zustand Stores (Cart, Wishlist)
│   │   └── types/                # TypeScript Interfaces & Models
│   └── package.json
│
├── backend/                      # Spring Boot Backend Application
│   ├── src/main/java/com/bazzar/
│   │   ├── config/               # Security, CORS & Keep-Alive Configurations
│   │   ├── controller/           # REST Controllers (Auth, Product, Category, Order, Health)
│   │   ├── dto/                  # Request & Response DTOs
│   │   ├── entity/               # JPA Database Entities (User, Product, Category, Order)
│   │   ├── repository/           # Spring Data JPA Repositories
│   │   ├── security/             # JWT Utilities & Authentication Filters
│   │   └── service/              # Business Logic & KeepAliveScheduler Cron Job
│   ├── src/main/resources/       # application.properties
│   └── pom.xml
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Java JDK 17** or higher
- **Node.js 18** or higher (`npm` included)
- **PostgreSQL** database instance running locally or on cloud (e.g. Supabase / Neon / Render Postgres)

---

### 1️⃣ Setting Up the Backend

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Configure Database Connection** in `src/main/resources/application.properties` or `.env`:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/bazzar_db
   spring.datasource.username=postgres
   spring.datasource.password=your_password
   spring.jpa.hibernate.ddl-auto=update
   
   jwt.secret=9a4f2c8d7e1b3a5f6c8d9e2f4a6b8c0d1e3f5a7b9c2d4e6f8a0b3c5d7e9f1a2b
   jwt.expiration=86400000
   ```

3. **Run Spring Boot Backend**:
   - Windows PowerShell:
     ```powershell
     $env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-17.0.19.10-hotspot"
     .\mvnw.cmd spring-boot:run
     ```
   - Linux / macOS:
     ```bash
     ./mvnw spring-boot:run
     ```
   The backend API will start on **`http://localhost:8080`**.

---

### 2️⃣ Setting Up the Frontend

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
   NEXT_PUBLIC_API_URL=http://localhost:8080/api
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open **`http://localhost:3000`** in your browser to view BAZZAR.

---

## 🔌 API Reference Highlights

| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Public | Register new customer account |
| `/api/auth/login` | `POST` | Public | Authenticate user & return JWT token |
| `/api/auth/me` | `GET` | User | Get current logged-in user details |
| `/api/products` | `GET` | Public | List & search catalog products |
| `/api/products/{id}` | `GET` | Public | Fetch single product details |
| `/api/products` | `POST` | Admin | Create & publish new catalog item |
| `/api/products/{id}` | `PUT` | Admin | Update product price, title, or stock |
| `/api/products/{id}` | `DELETE` | Admin | Remove product from store catalog |
| `/api/categories` | `GET` | Public | Fetch store product categories |
| `/api/orders` | `POST` | User | Place customer order |
| `/api/orders/all` | `GET` | Admin | Fetch all store customer transactions |
| `/api/health` | `GET` | Public | Service health check & Render keep-alive ping |

---

## 🌐 Production Deployment (Render / Vercel)

- **Backend (Render)**: Deploy `backend/` as a Web Service. Set environment variable `RENDER_EXTERNAL_URL=https://your-backend.onrender.com`. The integrated `KeepAliveScheduler` will automatically ping `/api/health` every 10 minutes to prevent container sleep.
- **Frontend (Vercel)**: Deploy `frontend/` to Vercel and configure `NEXT_PUBLIC_API_URL` pointing to your deployed backend URL.

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
