# Bazzar Backend — Spring Boot REST API

A complete e-commerce REST API built with **Java 17**, **Spring Boot 3.4.2**, **Spring Security (JWT)**, **Spring Data JPA**, and **PostgreSQL (Neon)**.

---

## 🚀 Getting Started

### Prerequisites

- Java 17+ (or Java 21+ for exact spec match)
- Maven 3.9+ **OR** use the bundled Maven wrapper

### 1. Configure Environment Variables

Copy `.env.example` to `.env` (already provided) and fill in your values:

```env
SERVER_PORT=8080

DATABASE_URL=jdbc:postgresql://<your-neon-host>/neondb?sslmode=require
DATABASE_USERNAME=your_username
DATABASE_PASSWORD=your_password

JWT_SECRET=<64-char hex string>
JWT_EXPIRATION=86400000
```

### 2. Run the Application

**On Windows (with installed Maven):**
```bash
mvn spring-boot:run
```

**Or using the system Maven:**
```powershell
C:\tools\apache-maven-3.9.9\bin\mvn.cmd spring-boot:run
```

The API will be available at: `http://localhost:8080`

---

## 📋 API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register + get JWT |
| POST | `/api/auth/login` | Public | Login + get JWT |

### Products
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | Public | Get all products (supports `?search=` & `?category=`) |
| GET | `/api/products/{id}` | Public | Get product by ID |
| POST | `/api/products` | Required | Create product |
| PUT | `/api/products/{id}` | Required | Update product |
| DELETE | `/api/products/{id}` | Required | Delete product |

### Categories
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/categories` | Public | Get all categories |
| GET | `/api/categories/{id}` | Public | Get category by ID |
| POST | `/api/categories` | Required | Create category |
| PUT | `/api/categories/{id}` | Required | Update category |
| DELETE | `/api/categories/{id}` | Required | Delete category |

### Cart (Authenticated)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/cart` | Required | Get authenticated user's cart |
| POST | `/api/cart/items` | Required | Add item to cart |
| PUT | `/api/cart/items/{id}` | Required | Update cart item quantity |
| DELETE | `/api/cart/items/{id}` | Required | Remove cart item |

### Orders (Authenticated)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/orders` | Required | Place order from cart |
| GET | `/api/orders` | Required | Get all user's orders |
| GET | `/api/orders/{id}` | Required | Get specific order |

---

## 🔐 Authentication

Use Bearer token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

---

## 🏗️ Project Structure

```
src/main/java/com/bazzar/
├── BazzarApplication.java     # Entry point + dotenv loader
├── DataInitializer.java       # Seeds 4 categories + 12 products
├── config/                    # Security + CORS config
├── controller/                # REST controllers (thin)
├── service/                   # Business logic
├── repository/                # Spring Data JPA repositories
├── entity/                    # JPA entities
├── dto/                       # Request/Response DTOs
├── security/                  # JWT service + filter
└── exception/                 # Global exception handler
```

---

## 🗃️ Sample Data

On first startup, the app seeds:

**Categories:** Electronics, Clothing, Books, Accessories

**Products (12):** Wireless headphones, Smartphone, Laptop, Smartwatch, T-Shirt, Jeans, Hoodie, Clean Code book, Pragmatic Programmer book, Leather wallet, Sunglasses, Canvas backpack
