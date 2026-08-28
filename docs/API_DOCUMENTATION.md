# ESTORA Luxury Real Estate Portal - REST API & Architecture Documentation

## 1. System Overview & Architecture

```
                       ESTORA FRONTEND
               HTML5 + CSS3 (Luxury Theme) + Vanilla JS (ES6+)
                               │
                               │ REST API / JSON (Bearer JWT)
                               ▼
               ┌─────────────────────────────────┐
               │    SPRING BOOT 3 REST API       │
               │                                 │
               │ • Controllers (REST Endpoints)  │
               │ • Services (Business Logic)     │
               │ • Repositories (Spring Data)    │
               │ • Spring Security + JWT Filter  │
               │ • Bean Validation & Advices     │
               │ • OpenAPI 3.0 / Swagger UI      │
               └────────────────┬────────────────┘
                                │
                                │ JPA / Hibernate 6 (MySQL Dialect)
                                ▼
               ┌─────────────────────────────────┐
               │        MySQL 8.x DATABASE       │
               │                                 │
               │ • users (USER, AGENT, ADMIN)    │
               │ • properties (Architectural)    │
               │ • property_images               │
               │ • amenities & mapping           │
               │ • favorites (User Bookmarks)    │
               │ • inquiries (Tour & Contact)    │
               │ • reviews (Advisor Ratings)     │
               └─────────────────────────────────┘
```

---

## 2. Technology Stack & Specifications

| Layer | Component | Version / Details |
|---|---|---|
| **Runtime & JDK** | Java SE Development Kit | Java 17 LTS |
| **Framework** | Spring Boot | 3.2.3 |
| **Persistence Tier** | Spring Data JPA / Hibernate | 6.x with Connection Pooling (HikariCP) |
| **Relational Database** | MySQL | 8.0+ (InnoDB, utf8mb4) |
| **Security Protocol** | Spring Security 6 + JJWT | Stateless Bearer JWT Token + BCrypt (10 rounds) |
| **API Documentation** | Springdoc OpenAPI | Swagger UI 2.3.0 (`/swagger-ui/index.html`) |
| **Build & Tooling** | Apache Maven | Maven 3.8+ / `pom.xml` |

---

## 3. Database Schema & Tables

### 1. `users`
- `id` BIGINT PRIMARY KEY AUTO_INCREMENT
- `name` VARCHAR(100) NOT NULL
- `email` VARCHAR(150) NOT NULL UNIQUE
- `phone` VARCHAR(30)
- `password` VARCHAR(255) NOT NULL (BCrypt encrypted)
- `role` ENUM('USER', 'AGENT', 'ADMIN') NOT NULL DEFAULT 'USER'
- `status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE'
- `agency` VARCHAR(150)
- `is_verified` BOOLEAN DEFAULT FALSE
- `avatar_url` VARCHAR(500)
- `created_at` TIMESTAMP, `updated_at` TIMESTAMP

### 2. `properties`
- `id` BIGINT PRIMARY KEY AUTO_INCREMENT
- `title` VARCHAR(255) NOT NULL
- `description` TEXT
- `price` DECIMAL(15,2) NOT NULL
- `property_type` ENUM('APARTMENT', 'VILLA', 'HOUSE', 'PLOT', 'COMMERCIAL', 'OFFICE') NOT NULL
- `listing_type` ENUM('BUY', 'RENT') NOT NULL
- `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'SOLD', 'RENTED') NOT NULL DEFAULT 'APPROVED'
- `city` VARCHAR(100) NOT NULL
- `locality` VARCHAR(150) NOT NULL
- `address` VARCHAR(500) NOT NULL
- `bedrooms` INT DEFAULT 0
- `bathrooms` INT DEFAULT 0
- `area` DECIMAL(12,2) NOT NULL (sqft)
- `parking` INT DEFAULT 0
- `furnishing` ENUM('FURNISHED', 'SEMI_FURNISHED', 'UNFURNISHED')
- `featured` BOOLEAN DEFAULT FALSE
- `exclusive` BOOLEAN DEFAULT FALSE
- `agent_id` BIGINT NOT NULL (FK -> users.id)
- `created_at` TIMESTAMP, `updated_at` TIMESTAMP

### 3. `property_images`
- `id` BIGINT PRIMARY KEY AUTO_INCREMENT
- `property_id` BIGINT NOT NULL (FK -> properties.id)
- `image_url` VARCHAR(1000) NOT NULL
- `is_primary` BOOLEAN DEFAULT FALSE
- `display_order` INT DEFAULT 0

### 4. `amenities` & `property_amenities`
- `amenities.id`, `amenities.name` UNIQUE
- `property_amenities`: Composite PK (`property_id`, `amenity_id`)

### 5. `favorites`
- `id` BIGINT PRIMARY KEY AUTO_INCREMENT
- `user_id` BIGINT NOT NULL (FK -> users.id)
- `property_id` BIGINT NOT NULL (FK -> properties.id)
- `created_at` TIMESTAMP
- UNIQUE KEY (`user_id`, `property_id`)

### 6. `inquiries`
- `id` BIGINT PRIMARY KEY AUTO_INCREMENT
- `user_id` BIGINT (FK -> users.id)
- `property_id` BIGINT NOT NULL (FK -> properties.id)
- `agent_id` BIGINT NOT NULL (FK -> users.id)
- `name`, `email`, `phone`, `message`
- `status` ENUM('NEW', 'CONTACTED', 'CLOSED') DEFAULT 'NEW'

### 7. `reviews`
- `id` BIGINT PRIMARY KEY AUTO_INCREMENT
- `user_id` BIGINT NOT NULL (FK -> users.id)
- `agent_id` BIGINT NOT NULL (FK -> users.id)
- `rating` INT NOT NULL (1 to 5)
- `comment` TEXT

---

## 4. Role-Based Access Control (RBAC)

| Endpoint / Capability | Public | USER | AGENT | ADMIN |
|---|:---:|:---:|:---:|:---:|
| Browse & Search Properties | ✅ | ✅ | ✅ | ✅ |
| View Property Detail & Gallery | ✅ | ✅ | ✅ | ✅ |
| Register / Login | ✅ | ✅ | ✅ | ✅ |
| Save / Remove Favorites | ❌ | ✅ | ✅ | ✅ |
| Submit Inquiries / Request Tour | ❌ | ✅ | ✅ | ✅ |
| Submit Agent Review | ❌ | ✅ | ✅ | ✅ |
| Create New Property Listing | ❌ | ❌ | ✅ | ✅ |
| Upload Property Photos | ❌ | ❌ | ✅ | ✅ |
| Edit / Delete Own Property | ❌ | ❌ | ✅ | ✅ |
| Manage Inquiries for Own Properties | ❌ | ❌ | ✅ | ✅ |
| Approve / Reject Any Property | ❌ | ❌ | ❌ | ✅ |
| Manage All Users & Agents | ❌ | ❌ | ❌ | ✅ |
| View System Dashboard Analytics | ❌ | ❌ | ❌ | ✅ |

---

## 5. Seed Credentials for Testing

All seeded test accounts use the password: `password123`

| Role | Email | Name | Focus / Enclave |
|---|---|---|---|
| **ADMIN** | `admin@estora.com` | Estora Admin | Global HQ / Platform Control |
| **AGENT** | `agent@estora.com` | Aarav Sharma | Bandra West & Mumbai Coastal |
| **AGENT** | `priya.kulkarni@estora.com` | Priya Kulkarni | Worli & South Mumbai |
| **AGENT** | `vikram.m@estora.com` | Vikram Malhotra | Indiranagar, Bengaluru |
| **USER** | `user@estora.com` | Rohan Verma | Buyer / Investor Account |
| **USER** | `meera.r@estora.com` | Meera Reddy | Client Account |

---

## 6. Key REST Endpoints & Sample Payloads

### 1. Authentication
- `POST /api/auth/register`
```json
{
  "name": "Arjun Kapoor",
  "email": "arjun.k@estora.com",
  "password": "password123",
  "phone": "+91 98200 44332",
  "role": "USER"
}
```

- `POST /api/auth/login`
```json
{
  "email": "user@estora.com",
  "password": "password123"
}
```

- `GET /api/auth/me` (Header: `Authorization: Bearer <TOKEN>`)

### 2. Properties & Search
- `GET /api/properties?page=0&size=12&sortBy=createdAt&sortDirection=DESC`
- `GET /api/properties/search?query=Bandra`
- `GET /api/properties/filter?city=Mumbai&listingType=BUY&minPrice=10000000&bedrooms=3`
- `GET /api/properties/featured`
- `GET /api/properties/{id}`

- `POST /api/properties` (AGENT/ADMIN only)
```json
{
  "title": "Malabar Hill Signature Sea Suite",
  "description": "Unrivaled oceanfront residence with double-height salon.",
  "price": 45000000.00,
  "propertyType": "APARTMENT",
  "listingType": "BUY",
  "city": "Mumbai",
  "locality": "Malabar Hill",
  "address": "Walkeshwar Road, Malabar Hill, Mumbai 400006",
  "bedrooms": 4,
  "bathrooms": 4,
  "area": 3200.00,
  "parking": 2,
  "furnishing": "FURNISHED",
  "featured": true,
  "amenities": ["Parking", "Swimming Pool", "Gym", "Security", "Lift"],
  "imageUrls": ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"]
}
```

### 3. Favorites
- `GET /api/favorites`
- `POST /api/favorites/{propertyId}`
- `DELETE /api/favorites/{propertyId}`
- `GET /api/favorites/{propertyId}/check`

### 4. Inquiries & Contact Concierge
- `POST /api/inquiries`
```json
{
  "propertyId": 1,
  "agentId": 2,
  "name": "Rohan Verma",
  "email": "user@estora.com",
  "phone": "+91 97123 77889",
  "message": "We would like to schedule a private viewing for this Saturday."
}
```
- `GET /api/inquiries/my` (Client inquiries)
- `GET /api/inquiries/agent` (Agent property inquiries)
- `PUT /api/inquiries/{id}/status` (Body: `{"status": "CONTACTED"}`)

### 5. Agent Reviews
- `GET /api/agents/{agentId}/reviews`
- `POST /api/agents/{agentId}/reviews`
```json
{
  "rating": 5,
  "comment": "Exceptional market advisory and discreet transaction handling."
}
```

### 6. Admin Management
- `GET /api/admin/dashboard`
- `GET /api/admin/users?page=0&size=20`
- `PUT /api/admin/users/{id}/status` (Body: `{"status": "ACTIVE"}`)
- `PUT /api/admin/properties/{id}/approve`

---

## 7. How to Run Locally with Maven & MySQL

```bash
# 1. Create MySQL database
mysql -u root -p
mysql> CREATE DATABASE estora_db;
mysql> exit;

# 2. Configure environment variables (or application.properties)
export DB_URL="jdbc:mysql://localhost:3306/estora_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true"
export DB_USERNAME="root"
export DB_PASSWORD="yourpassword"
export JWT_SECRET="estoraSuperSecretKeyWithMinimum256BitsLengthForSecureHMACSHA256Algorithms12345"

# 3. Build and execute Spring Boot
cd backend
mvn clean spring-boot:run

# 4. Access Swagger UI Documentation
http://localhost:8080/swagger-ui/index.html
```
