# ESTORA — Modern Real Estate Portal

> **"Find a place that feels like home."**

ESTORA is an enterprise-grade, full-stack real estate web platform developed as a **Final-Year Computer Science & Engineering (CSE) Capstone / Portfolio Project**. The system models a production-level property marketplace connecting property seekers, verified real estate agents, and administrative moderators with end-to-end data persistence, stateless JWT security, and responsive UI/UX.

---

## 🏛️ System Architecture

ESTORA is architected following industry-standard multi-tiered separation of concerns:

```
[ Frontend: HTML5 / CSS3 / Vanilla JS ES6+ / Chart.js ]
                        │
                        │ HTTP / JSON (REST APIs with JWT Bearer Auth)
                        ▼
[ Backend: Java 17 + Spring Boot 3 / Node.js Express ]
   ├── Security Filter (JWT Authentication & BCrypt)
   ├── REST Controllers (Auth, Properties, Favorites, Inquiries, Admin, Agent)
   ├── Service Layer (Business Logic, Validation, Analytics Aggregation)
   └── Data Access Layer (Spring Data JPA / Hibernate ORM)
                        │
                        │ JDBC / SQL
                        ▼
[ Relational Database: MySQL 8.0 / real_estate_portal ]
   ├── users (RBAC: USER, AGENT, ADMIN)
   ├── properties (Pricing, physical specs, geometry, status)
   ├── property_images (High-resolution gallery assets)
   ├── property_amenities (Normalized amenities mapping)
   ├── favorites (User saved homes with unique composite keys)
   └── inquiries (Lead capture, agent assignment, status lifecycle)
```

---

## 💻 Technology Stack

### Frontend
- **HTML5 & CSS3**: Modern design system using CSS custom properties, responsive grid, flexbox, and typography.
- **Vanilla JavaScript (ES6+)**: Modular architecture (`api.js`, `auth.js`, `properties.js`, `favorites.js`, `dashboard.js`, `agent.js`, `admin.js`).
- **Chart.js 4.4**: Interactive visual charts for category distributions, city volume, and monthly user/listing growth.
- **Font Awesome 6**: Vector icons for property specifications, amenities, and user controls.

### Backend
- **Java 17 & Spring Boot 3.2**: Core enterprise REST API framework.
- **Spring Security 6 & JJWT**: Stateless bearer token authentication, request authorization, and BCrypt password encryption.
- **Spring Data JPA & Hibernate**: Object-relational mapping, transactional queries, and pagination.
- **Maven**: Build and dependency management.
- **Express / Node.js**: Embedded high-performance server supporting zero-config container preview and full REST API parity.

### Database
- **MySQL 8.0**: Relational database with foreign key constraints, indexing, and normalized entities.

---

## 🔑 Pre-Seeded Demo Accounts (1-Click Login)

You can test all 3 system roles directly via `login.html`:

| Role | Email | Password | Access & Capabilities |
|---|---|---|---|
| **Super Admin** | `admin@estora.com` | `password123` | Analytics, approve/reject listings, feature listings, manage users & agent verifications |
| **Verified Agent** | `agent@estora.com` | `password123` | Add/edit properties, manage active portfolio, view client leads, update lead status |
| **Buyer / User** | `user@estora.com` | `password123` | Browse properties, filter by BHK/budget, save favorites, submit tour inquiries |

---

## 📂 Project Directory Structure

```
├── backend/                                # Java Spring Boot Enterprise Application
│   ├── pom.xml                             # Maven Dependencies
│   └── src/main/java/com/estora/
│       ├── EstoraApplication.java          # Spring Boot Main Entrypoint
│       ├── config/                         # Security & CORS Configuration
│       │   ├── SecurityConfig.java
│       │   ├── CorsConfig.java
│       │   └── JwtAuthenticationFilter.java
│       ├── controller/                     # REST API Endpoints
│       │   ├── AuthController.java
│       │   ├── PropertyController.java
│       │   ├── FavoriteController.java
│       │   ├── InquiryController.java
│       │   ├── UserController.java
│       │   ├── AgentController.java
│       │   └── AdminController.java
│       ├── model/                          # JPA Entities
│       │   ├── User.java
│       │   ├── Property.java
│       │   ├── PropertyImage.java
│       │   ├── Favorite.java
│       │   └── Inquiry.java
│       ├── repository/                     # Spring Data Repositories
│       ├── service/                        # Business Logic & Analytics
│       └── util/                           # JWT Token Provider
│
├── frontend/                               # Framework-free Client Application
│   ├── css/
│   │   ├── style.css                       # Design System & Main Styles
│   │   ├── admin.css                       # Dashboard & Analytics Layouts
│   │   └── responsive.css                  # Mobile / Tablet Breakpoints
│   ├── js/
│   │   ├── utils.js                        # Toast Notifications, Formatters, Helpers
│   │   ├── api.js                          # Fetch API Client & JWT Interceptor
│   │   ├── auth.js                         # Session & Authentication State
│   │   ├── properties.js                   # Catalog & Filtering Engine
│   │   ├── favorites.js                    # Bookmarking Manager
│   │   ├── dashboard.js                    # User Profile & Inquiry Views
│   │   ├── agent.js                        # Agent Portfolio & Lead Management
│   │   └── admin.js                        # Admin Operations & Chart.js Visuals
│   ├── index.html                          # Landing Page with Hero Search & Featured
│   ├── properties.html                     # Catalog with Multi-Filter Sidebar
│   ├── property-details.html               # Gallery, Specifications, EMI Calculator, Inquiry Form
│   ├── agents.html                         # Verified Advisors Directory
│   ├── about.html                          # Architecture & Brand Story
│   ├── login.html                          # Sign In with 1-Click Demo Login
│   ├── register.html                       # Account Registration (Buyer / Agent)
│   ├── dashboard.html                      # User Profile & Security Settings
│   ├── favorites.html                      # User Saved Properties
│   ├── inquiries.html                      # User Inquiry History
│   ├── agent/
│   │   ├── dashboard.html                  # Agent Metrics & Listings
│   │   ├── add-property.html               # Add Property Form with Amenities
│   │   └── edit-property.html              # Edit Property Form
│   └── admin/
│       ├── dashboard.html                  # Executive Charts & Approval Queue
│       ├── properties.html                 # Property Catalog Moderation
│       ├── users.html                      # User Management & Status Controls
│       ├── agents.html                     # Agent Verification Roster
│       └── inquiries.html                  # Central Inquiries & Lead Log
│
├── server.ts                               # Full-stack Node/Express Application Server
└── package.json                            # Scripts & Dependencies
```

---

## 🚀 Running the Project

### Option A: Running the Bundled Full-Stack Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

### Option B: Running the Java Spring Boot Backend
1. Ensure MySQL is running and create the database:
   ```sql
   CREATE DATABASE real_estate_portal;
   ```
2. Update database credentials in `backend/src/main/resources/application.properties`.
3. Build and run via Maven:
   ```bash
   cd backend
   mvn clean spring-boot:run
   ```
4. Backend will start on `http://localhost:8080` with all REST APIs active.

---

## 🔒 Security Specifications
- **Password Encryption**: Spring Security `BCryptPasswordEncoder` (10 rounds).
- **Stateless Tokens**: Signed HMAC-SHA256 JWT tokens containing `userId`, `email`, and `role`.
- **Role-Based Access Control (RBAC)**:
  - `USER`: Browse, search, save favorites, submit inquiries, view personal dashboard.
  - `AGENT`: All User capabilities + create, edit, delete own property listings, manage buyer inquiries.
  - `ADMIN`: Full platform access: approve/reject listings, toggle featured status, suspend users, verify agents, view analytics.
