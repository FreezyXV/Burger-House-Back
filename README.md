# Burger Town - Backend API

## Table of Contents
- [Overview](#overview)
- [How the Backend Works - Complete Guide](#how-the-backend-works---complete-guide)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Database Models](#database-models)
- [API Routes](#api-routes)
- [Authentication & Authorization](#authentication--authorization)
- [Data Flow Patterns](#data-flow-patterns)
- [Installation](#installation)
- [Deployment](#deployment)
- [Important Notes](#important-notes)

---

## Overview

The **Burger Town** backend is a RESTful API built with **Node.js** and **Express**. It manages all operations for a burger restaurant application: products, menus, users, and orders.

**Key Features:**
- User authentication and management (customers and administrators)
- Complete CRUD operations for products (burgers, drinks, sides, sauces, desserts)
- Complete CRUD operations for menus (product combinations)
- Order management with status tracking
- JWT-protected routes for sensitive operations
- MongoDB Atlas cloud database

---

## How the Backend Works - Complete Guide

### 1. Backend's Role in the Ecosystem

The backend is the **heart of the application**, acting as an intermediary between the frontend (user interface) and the database.

```
┌─────────────────────────────────────────────────────────────┐
│                    COMPLETE ARCHITECTURE                     │
└─────────────────────────────────────────────────────────────┘

Frontend (React + Vite)
  │ Hosted on Vercel
  │ https://burger-house-front.vercel.app
  │
  ├─ Local state management (useState, localStorage)
  ├─ Routing with React Router
  └─ API calls with fetch/axios
      │
      ↓ HTTP Requests (GET, POST, PUT, DELETE)
      │
Backend API (Node.js + Express)  ← YOU ARE HERE
  │ Hosted on Render
  │ https://burger-house-back.onrender.com
  │
  ├─ CORS Middleware (allows frontend requests)
  ├─ Auth Middleware (verifies JWT for protected routes)
  ├─ Routes + Controllers (business logic)
  └─ Mongoose Models (data structure)
      │
      ↓ Mongoose Queries (find, create, update, delete)
      │
Database (MongoDB Atlas)
  │ Cloud-hosted MongoDB
  │ Cluster: ClusterZero
  │ Database: burgerDB
  │
  └─ Collections:
      ├─ users
      ├─ products
      ├─ menus
      └─ orders
```

### 2. Request Lifecycle - Complete Example

**Scenario: A user wants to see all available burgers**

```
STEP 1: Request Reception
──────────────────────────
Frontend sends:
GET https://burger-house-back.onrender.com/api/products?type=Burgers

STEP 2: Routing (routes/productRoutes.js)
──────────────────────────────────────────
Express receives the request and directs it to the corresponding route:
router.get('/', productController.getAllProducts)

STEP 3: Controller (controllers/productController.js)
──────────────────────────────────────────────────────
The controller executes business logic:
- Retrieves query parameter: type = "Burgers"
- Calls Mongoose model to query the database

STEP 4: Model (models/product.js)
──────────────────────────────────
Mongoose executes MongoDB query:
Product.find({ type: "Burgers" })

STEP 5: Database (MongoDB Atlas)
────────────────────────────────
MongoDB searches all documents in "products" collection
where the "type" field equals "Burgers"

STEP 6: Data Return
───────────────────
Data flows back up the chain:
MongoDB → Mongoose → Controller → Express → Frontend

JSON Response:
[
  { _id: "...", title: "Classic Burger", price: 8.50, ... },
  { _id: "...", title: "Cheese Burger", price: 9.00, ... },
  ...
]
```

### 3. JWT Authentication - How It Works

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database

    Note over User,Database: Registration Flow
    User->>Frontend: Fills registration form
    Frontend->>Backend: POST /api/users/register
    Backend->>Backend: Validate data
    Backend->>Backend: Hash password (bcrypt)
    Backend->>Database: Save user
    Database-->>Backend: User created
    Backend-->>Frontend: Success response
    Frontend-->>User: Registration successful

    Note over User,Database: Login Flow
    User->>Frontend: Enters credentials
    Frontend->>Backend: POST /api/users/login
    Backend->>Database: Find user by username
    Database-->>Backend: User data
    Backend->>Backend: Compare password hash
    Backend->>Backend: Generate JWT token
    Backend-->>Frontend: {token, user}
    Frontend->>Frontend: Store token in localStorage
    Frontend-->>User: Login successful

    Note over User,Database: Protected Route Access
    User->>Frontend: Creates new product
    Frontend->>Backend: POST /api/products/add<br/>Header: Authorization Bearer <token>
    Backend->>Backend: Auth middleware validates token
    Backend->>Backend: RequireAdmin checks permissions
    Backend->>Database: Create product
    Database-->>Backend: Product created
    Backend-->>Frontend: Product data
    Frontend-->>User: Product created successfully
```

**A. User Registration:**
```
Frontend → POST /api/users/register
           Body: { username, password, email, ... }
             ↓
Backend receives data
             ↓
userController.registerUser() is called
             ↓
1. Validates data (express-validator)
2. Checks if user already exists
3. Hashes password with bcrypt:
   password "password123" → "$2a$10$XYZ..." (irreversible)
4. Creates user in MongoDB
5. Returns success
```

**B. User Login:**
```
Frontend → POST /api/users/login
           Body: { username, password }
             ↓
Backend verifies credentials
             ↓
1. Finds user by username
2. Compares hashed password with bcrypt.compare()
3. If valid, generates JWT token:
   Token = jwt.sign(
     { userId: user._id, isAdmin: user.isAdmin },
     JWT_SECRET,
     { expiresIn: '7d' }
   )
4. Returns token to frontend
             ↓
Frontend stores token in localStorage
```

**C. Protected Route Access:**
```
Frontend → POST /api/products/add (create a product)
           Headers: { Authorization: "Bearer <token>" }
           Body: { title, price, ... }
             ↓
Backend applies auth.js middleware
             ↓
Auth middleware:
1. Extracts token from Authorization header
2. Verifies token with jwt.verify(token, JWT_SECRET)
3. If valid, decodes data: { userId, isAdmin }
4. Adds this info to req.user
5. Passes to next controller
             ↓
productController.createProduct():
- Checks req.user.isAdmin === true
- If yes, creates product
- If no, returns 403 Forbidden error
```

### 4. Order Management - Complete Workflow

```mermaid
flowchart TD
    A[User adds items to cart] --> B[User clicks 'Order']
    B --> C[Frontend: POST /api/orders/add]
    C --> D{Auth Middleware}
    D -->|Valid Token| E[orderController.submitBackOrder]
    D -->|Invalid Token| F[Return 401 Unauthorized]
    E --> G{Validate Order Data}
    G -->|Invalid| H[Return 400 Bad Request]
    G -->|Valid| I[Create Order Document]
    I --> J[Save to MongoDB]
    J --> K[Return Order Confirmation]
    K --> L[Frontend displays success]
    L --> M[Clear cart]
```

**Request Example:**
```
Client places order from cart
             ↓
Frontend → POST /api/orders/add
           Body: {
             items: [
               { itemRef: "product_id_1", onModel: "Product", quantity: 2 },
               { itemRef: "menu_id_5", onModel: "Menu", quantity: 1 }
             ],
             totalPrice: 35.50
           }
             ↓
orderController.submitBackOrder():

1. Data validation:
   - items is non-empty array?
   - totalPrice is valid number?
   - user is authenticated?

2. Create Order document:
   const newOrder = new Order({
     customer: req.user.id,
     items: items.map(item => ({
       itemRef: ObjectId(item.itemRef),
       onModel: item.onModel,
       quantity: item.quantity
     })),
     totalPrice: totalPrice,
     status: "pending"
   });

3. Save to MongoDB:
   await newOrder.save()

4. Response to frontend:
   { success: true, order: newOrder }
             ↓
Frontend displays confirmation and clears cart
```

### 5. Security - Protection Layers

```mermaid
graph TD
    A[Client Request] --> B[Layer 1: Input Validation]
    B --> C[Layer 2: CORS Check]
    C --> D[Layer 3: JWT Authentication]
    D --> E[Layer 4: Authorization Check]
    E --> F[Layer 5: Password Hashing]
    F --> G[Business Logic Execution]
    G --> H[Database Operation]
    H --> I[Response to Client]

    style B fill:#ff6b6b
    style C fill:#feca57
    style D fill:#48dbfb
    style E fill:#1dd1a1
    style F fill:#ee5a6f
```

**Layer 1: Input Validation (express-validator)**
```javascript
// Example: Product creation validation
router.post('/add',
  body('title').notEmpty().withMessage('Title is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  // ...
  productController.createProduct
);
```

**Layer 2: CORS (Cross-Origin Resource Sharing)**
```javascript
// Only authorized frontend can call API
app.use(cors({
  origin: ["https://burger-house-front.vercel.app", "http://localhost:5173"]
}));
```

**Layer 3: Authentication (JWT)**
```javascript
// Only logged-in users can access
router.post('/add', auth, productController.createProduct);
```

**Layer 4: Authorization (permission check)**
```javascript
// In controller
if (!req.user.isAdmin) {
  return res.status(403).json({ error: "Access denied" });
}
```

**Layer 5: Password Hashing (bcrypt)**
```javascript
// Never store passwords in plain text!
const hashedPassword = await bcrypt.hash(password, 10);
```

### 6. Database Relationships - MongoDB Structure

```mermaid
erDiagram
    USER ||--o{ ORDER : places
    ORDER ||--|{ ORDER_ITEM : contains
    PRODUCT ||--o{ ORDER_ITEM : "referenced by"
    MENU ||--o{ ORDER_ITEM : "referenced by"
    MENU }o--o{ PRODUCT : includes

    USER {
        ObjectId _id PK
        string username UK
        string password
        string email
        boolean isAdmin
        string name
    }

    PRODUCT {
        ObjectId _id PK
        string title
        number price
        string type
        string imageSrc
        boolean inStock
    }

    MENU {
        ObjectId _id PK
        string title
        number price
        string size
        string imageSrc
        ObjectId[] products FK
    }

    ORDER {
        ObjectId _id PK
        ObjectId customer FK
        number totalPrice
        string status
        date createdAt
    }

    ORDER_ITEM {
        ObjectId itemRef FK
        string onModel
        number quantity
        object selectedOptions
    }
```

**Example of Data Relations:**
```
Collection "users"
┌─────────────────────────┐
│ _id: ObjectId("abc123") │
│ username: "john_doe"    │
│ password: "$2a$10$..."  │ ← Hashed, never plain text
│ isAdmin: false          │
└─────────────────────────┘
          ↑
          │ Referenced by
          │
Collection "orders"
┌──────────────────────────────────┐
│ _id: ObjectId("order123")        │
│ customer: ObjectId("abc123") ────┘ (Reference to User)
│ items: [                         │
│   {                              │
│     itemRef: ObjectId("burger1"),│ ─→ Reference to Product
│     onModel: "Product",          │
│     quantity: 2                  │
│   },                             │
│   {                              │
│     itemRef: ObjectId("menu5"),  │ ─→ Reference to Menu
│     onModel: "Menu",             │
│     quantity: 1                  │
│   }                              │
│ ],                               │
│ totalPrice: 35.50,               │
│ status: "pending"                │
└──────────────────────────────────┘
```

### 7. Environment Variables - Configuration

```env
# .env file (NEVER commit to Git!)

PORT=2233
# Port on which the server listens

MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/burgerDB
# MongoDB Atlas connection string
# Format: mongodb+srv://<username>:<password>@<cluster>/<database>

JWT_SECRET=my_super_long_and_complex_secret_key_123456
# Key to sign JWTs (must be VERY secure)
# If someone gets this key, they can create valid tokens!

ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:5173
# Comma-separated list of allowed CORS origins
```

### 8. Deployment on Render - How It Works

```mermaid
graph LR
    A[Local Development<br/>localhost:2233] --> B[Git Commit]
    B --> C[Push to GitHub]
    C --> D[Render Platform]
    D --> E[Detects Changes]
    E --> F[Build Docker Image]
    F --> G[Start Container]
    G --> H[Configure Environment]
    H --> I[Enable HTTPS]
    I --> J[Deploy to Production<br/>burger-house-back.onrender.com]

    style A fill:#e1f5fe
    style J fill:#a5d6a7
```

**Deployment Process:**
```
Local Development (http://localhost:2233)
             ↓
Commit changes to Git
             ↓
Push to GitHub repository
             ↓
Render:
1. Detects new commit automatically
2. Builds Docker image with Node.js and dependencies
3. Starts container
4. Configures environment variables (Render secrets)
5. Enables HTTPS automatically
6. Assigns URL: https://burger-house-back.onrender.com
             ↓
Application accessible worldwide with:
- HTTPS enabled (automatic SSL certificate)
- Automatic restart on errors
- Auto-scaling based on traffic
- Logs accessible via Render dashboard
```

### 9. Key Takeaways

- The backend does NOT store sessions (stateless via JWT)
- Each request is independent and must contain token if protected
- MongoDB stores data as flexible JSON documents
- Mongoose adds validation and structure layer to documents
- Passwords are ALWAYS hashed before storage (bcrypt)
- CORS protects API from unauthorized access from other domains
- Environment variables (.env) keep secrets out of code
- MVC pattern (Model-View-Controller) organizes code logically

**This backend API is the central pillar enabling the Burger Town application to function securely, scalably, and maintainably.**

---

## Architecture

The application follows an **MVC (Model-View-Controller)** architecture with clear organization:

```
Back/
├── src/
│   ├── index.js              # Application entry point
│   ├── config/
│   │   └── connectDB.js      # MongoDB connection with retry logic
│   ├── models/               # Mongoose schemas (data structure)
│   │   ├── user.js           # User model
│   │   ├── product.js        # Product model
│   │   ├── menu.js           # Menu model
│   │   ├── order.js          # Order model
│   │   └── orderItem.js      # Order item model
│   ├── controllers/          # Business logic (processing)
│   │   ├── userController.js
│   │   ├── productController.js
│   │   ├── menuController.js
│   │   └── orderController.js
│   ├── routes/               # API endpoint definitions
│   │   ├── userRoutes.js
│   │   ├── productRoutes.js
│   │   ├── menuRoutes.js
│   │   └── orderRoutes.js
│   ├── middlewares/          # Middlewares (auth, validation...)
│   │   ├── auth.js           # JWT authentication middleware
│   │   ├── requireAdmin.js   # Admin authorization middleware
│   │   └── errorHandler.js   # Global error handler
│   └── scripts/              # Utility scripts
│       ├── fakeData.js       # Database seeding
│       ├── updateProducts.js
│       └── updateMenus.js
├── .env                      # Environment variables
├── .env.example              # Environment template
├── package.json
└── Dockerfile
```

### Request Flow Diagram

```mermaid
flowchart TD
    A[Client/Frontend] -->|HTTP Request| B[Express Server]
    B --> C[CORS Middleware]
    C --> D[JSON Body Parser]
    D --> E{Route Matching}
    E -->|/api/users| F[User Routes]
    E -->|/api/products| G[Product Routes]
    E -->|/api/menus| H[Menu Routes]
    E -->|/api/orders| I[Order Routes]
    F --> J{Protected Route?}
    G --> J
    H --> J
    I --> J
    J -->|Yes| K[Auth Middleware]
    J -->|No| L[Controller]
    K -->|Valid Token| M{Admin Required?}
    K -->|Invalid Token| N[401 Unauthorized]
    M -->|Yes| O[RequireAdmin Middleware]
    M -->|No| L
    O -->|Is Admin| L
    O -->|Not Admin| P[403 Forbidden]
    L --> Q[Mongoose Model]
    Q --> R[(MongoDB Atlas)]
    R --> S[JSON Response]
    S --> A

    style A fill:#e3f2fd
    style R fill:#fff3e0
    style N fill:#ffcdd2
    style P fill:#ffcdd2
    style S fill:#c8e6c9
```

---

## Technology Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **Node.js** | JavaScript runtime environment | 18.x |
| **Express** | Minimalist web framework for REST API | 4.18.2 |
| **MongoDB** | NoSQL document-oriented database | Cloud |
| **Mongoose** | ODM (Object Data Modeling) for MongoDB | 8.1.1 |
| **JWT (jsonwebtoken)** | Authentication token generation and verification | 9.0.2 |
| **bcryptjs** | Secure password hashing | 2.4.3 |
| **cors** | Cross-origin request handling | 2.8.5 |
| **dotenv** | Environment variable loading | 16.4.1 |
| **express-validator** | Input data validation | 7.0.1 |
| **nodemailer** | Email sending (notifications, confirmations) | 6.9.13 |
| **nodemon** | Auto-restart on file changes (development) | 2.0.22 |

---

## Database Models

### 1. User (User)
Represents an application user (customer or administrator).

```javascript
{
  username: String (unique, required),
  password: String (hashed, required),
  name: String (required),
  surname: String,
  email: String (required),
  phone: String,
  address: String,
  zipcode: String,
  city: String,
  dateOfBirth: Date,
  isAdmin: Boolean (default: false),
  resetPasswordToken: String,
  resetPasswordExpires: Date
}
```

**Indexes:** Unique on `username`

### 2. Product (Product)
Represents an individual menu product.

```javascript
{
  title: String (required),
  description: String,
  price: Number,
  inStock: Boolean (default: true),
  imageSrc: String (image URL, required),
  type: String (enum: ["Burgers", "Boissons", "Accompagnements", "Sauces", "Glaces"])
}
```

**Categories:** 5 product types for menu organization

### 3. Menu (Menu)
Represents a menu composed of multiple products.

```javascript
{
  title: String (required),
  description: String,
  price: Number,
  inStock: Boolean (default: true),
  imageSrc: String (image URL, required),
  type: String (always "Menu"),
  size: String (enum: ["medium", "large"], default: "medium"),
  products: [ObjectId] (references to products included in menu)
}
```

**Relationships:** One-to-many with Products (embedded references)

### 4. Order (Order)
Represents an order placed by a customer.

```javascript
{
  items: [OrderItem] (list of ordered items),
  totalPrice: Number (required),
  status: String (enum: ["pending", "processed", "ready"], default: "pending"),
  customer: ObjectId (reference to user),
  timestamps: true (automatic createdAt, updatedAt)
}
```

**Timestamps:** Automatically managed by Mongoose

### 5. OrderItem (Order Item)
Represents an item in an order (can be a product or menu).

```javascript
{
  itemRef: ObjectId (dynamic reference, required),
  onModel: String (enum: ["Menu", "Product"] - indicates item type, required),
  quantity: Number (minimum: 1, required),
  selectedOptions: {
    size: String (enum: ["medium", "large"])
  }
}
```

**Note:** The system uses the **polymorphic** pattern with `refPath` to allow an OrderItem to reference either a Menu or a Product.

---

## API Routes

### User Routes (`/api/users`)

| Method | Route | Auth | Admin | Description |
|--------|-------|------|-------|-------------|
| POST | `/register` | ❌ | ❌ | Register new user |
| POST | `/login` | ❌ | ❌ | Login (returns JWT) |
| GET | `/` | ✅ | ✅ | List all users |
| GET | `/:id` | ✅ | ❌ | Get user by ID (self or admin) |
| PUT | `/:id` | ✅ | ❌ | Update user (self or admin) |
| DELETE | `/:id` | ✅ | ✅ | Delete user |
| PUT | `/change-password/:userId` | ✅ | ❌ | Change password |
| POST | `/forgot-password` | ❌ | ❌ | Request password reset token |
| POST | `/reset-password` | ❌ | ❌ | Reset password with token |

### Product Routes (`/api/products`)

| Method | Route | Auth | Admin | Description |
|--------|-------|------|-------|-------------|
| GET | `/` | ❌ | ❌ | List all products (filterable by type) |
| GET | `/:id` | ❌ | ❌ | Get product by ID |
| POST | `/add` | ✅ | ✅ | Create new product |
| PUT | `/modify/:id` | ✅ | ✅ | Update product |
| DELETE | `/delete/:id` | ✅ | ✅ | Delete product |

**Query Filtering Example:**
```bash
GET /api/products?type=Burgers
# Returns only products where type === "Burgers"
```

### Menu Routes (`/api/menus`)

| Method | Route | Auth | Admin | Description |
|--------|-------|------|-------|-------------|
| GET | `/` | ❌ | ❌ | List all menus |
| GET | `/:id` | ❌ | ❌ | Get menu by ID with populated products |
| POST | `/add` | ✅ | ✅ | Create new menu |
| PUT | `/modify/:id` | ✅ | ✅ | Update menu |
| DELETE | `/delete/:id` | ✅ | ✅ | Delete menu |

### Order Routes (`/api/orders`)

| Method | Route | Auth | Admin | Description |
|--------|-------|------|-------|-------------|
| GET | `/` | ✅ | ❌ | Get orders (all if admin, own if user) |
| POST | `/add` | ✅ | ❌ | Submit new order |

**Note:** Routes marked ✅ Auth require a valid JWT token in the `Authorization: Bearer <token>` header.

---

## Authentication & Authorization

The application uses **JWT (JSON Web Tokens)** to secure sensitive routes.

### Authentication Process

```mermaid
graph TD
    A[User Registration/Login] --> B{Registration or Login?}
    B -->|Registration| C[POST /api/users/register]
    B -->|Login| D[POST /api/users/login]
    C --> E[Validate Data]
    E --> F[Hash Password with bcrypt]
    F --> G[Save User to MongoDB]
    G --> H[Return Success]
    D --> I[Find User by Username]
    I --> J{User Exists?}
    J -->|No| K[Return 401 Invalid Credentials]
    J -->|Yes| L[Compare Password Hash]
    L --> M{Password Valid?}
    M -->|No| K
    M -->|Yes| N[Generate JWT Token]
    N --> O[Return Token + User Data]
    O --> P[Frontend Stores Token in localStorage]

    style C fill:#bbdefb
    style D fill:#bbdefb
    style N fill:#c8e6c9
    style K fill:#ffcdd2
```

**1. Registration/Login:**
- User registers (`/api/users/register`) or logs in (`/api/users/login`)
- Password is hashed with **bcryptjs** (10 salt rounds) before storage
- On success, server generates a **JWT** containing:
  ```javascript
  {
    userId: user._id,
    isAdmin: user.isAdmin
  }
  ```
- Token is signed with secret key `JWT_SECRET` (defined in `.env`)
- Token expires in 7 days

**2. Token Usage:**
- Frontend stores token (localStorage)
- For each request to protected route, token is sent in header:
  ```
  Authorization: Bearer <token>
  ```

**3. Verification:**
- Middleware [auth.js](src/middlewares/auth.js) intercepts requests to protected routes
- Verifies token validity with `jwt.verify()`
- If valid, extracts user information and adds to `req.user`
- If invalid/missing, returns 401 Unauthorized error

### Middleware Example

```javascript
// Example usage in routes
router.post('/add', auth, requireAdmin, productController.createProduct);
//                  ↑     ↑
//                  │     Admin authorization check
//                  Auth middleware verifies token
```

**Authorization Levels:**

- **Public Routes:** Product/menu listing, user registration/login
- **Authenticated Routes:** View/update own profile, submit orders
- **Admin-Only Routes:** Create/update/delete products/menus, view all users/orders

---

## Data Flow Patterns

### Standard Request Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant E as Express
    participant M as Middleware
    participant R as Router
    participant Ctrl as Controller
    participant Model as Mongoose Model
    participant DB as MongoDB

    C->>E: HTTP Request
    E->>E: CORS Middleware
    E->>E: JSON Body Parser
    E->>R: Route Matching
    R->>M: Auth Middleware (if protected)
    M->>M: Verify JWT Token
    M->>M: Attach req.user
    M->>Ctrl: Pass Request
    Ctrl->>Ctrl: Business Logic
    Ctrl->>Model: Query/Modify Data
    Model->>DB: Execute Query
    DB-->>Model: Return Data
    Model-->>Ctrl: Return Results
    Ctrl-->>E: JSON Response
    E-->>C: HTTP Response
```

### Complete Example: Order Submission

**1. Frontend:** User clicks "Place Order"
```javascript
// Front/src/pages/CartAndOrderSummary.jsx
const response = await fetch('https://burger-house-back.onrender.com/api/orders/add', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ items, totalPrice })
});
```

**2. Backend:** Request reception
```javascript
// Back/src/routes/orderRoutes.js
router.post('/add', auth, orderController.submitBackOrder);
```

**3. Controller:** Order processing
```javascript
// Back/src/controllers/orderController.js
const newOrder = new Order({
  items,
  totalPrice,
  customer: req.user.id,
  status: "pending"
});
await newOrder.save(); // Save to MongoDB
```

**4. MongoDB:** Store order in `orders` collection

**5. Response:** Backend returns created order to frontend

---

## Installation

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB Atlas** account (or local MongoDB instance)

### Steps

**1. Clone the repository**
```bash
cd Back
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure environment variables**

Create a `.env` file in the `Back/` root directory:
```env
PORT=2233
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/burgerDB?retryWrites=true&w=majority
JWT_SECRET=your_very_long_and_complex_secret_key_here
ALLOWED_ORIGINS=https://your-frontend-url.vercel.app,http://localhost:5173
NODE_ENV=development
```

- `PORT`: Port on which server listens
- `MONGO_URI`: MongoDB Atlas connection string
- `JWT_SECRET`: Secret key to sign JWTs (must be secure)
- `ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins
- `NODE_ENV`: Environment mode (development/production)

**4. Start the server**

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

**5. Verify functionality**

Open browser or Postman and test:
```
http://localhost:2233/
```

Expected response: `"Welcome to the Burger Shop API!"`

**6. Test API endpoints**

```bash
# Get all products
curl http://localhost:2233/api/products

# Register user
curl -X POST http://localhost:2233/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123","name":"Test","email":"test@example.com"}'

# Login
curl -X POST http://localhost:2233/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'
```

---

## Deployment

The application is deployed on **Render** (cloud platform).

### Render Configuration

Render automatically detects the project configuration from your repository:
- Detects Dockerfile for containerized deployment
- Reads environment variables from Render dashboard
- Auto-deploys on git push to main branch

**Key Configuration:**
- **Build Command:** Docker build (automatic)
- **Start Command:** `npm run start` (from Dockerfile)
- **Port:** 2233 (internal), 443 (HTTPS external)
- **Health Check:** `/healthz` endpoint

### Deploy to Render

**1. Create Render Account**
Visit https://render.com and sign up

**2. Connect GitHub Repository**
- Click "New +" → "Web Service"
- Connect your GitHub account
- Select the backend repository
- Render auto-detects Dockerfile

**3. Configure Service**
```
Name: burger-house-back
Region: Choose closest to users (e.g., Frankfurt, Oregon)
Branch: main
Root Directory: Back/
```

**4. Set Environment Variables**
In Render dashboard, add:
```
MONGO_URI = mongodb+srv://username:password@cluster.mongodb.net/burgerDB
JWT_SECRET = your_super_secret_key_here
ALLOWED_ORIGINS = https://your-frontend.vercel.app,http://localhost:5173
NODE_ENV = production
```

**5. Deploy**
Click "Create Web Service" - Render will:
- Build Docker image
- Deploy container
- Assign URL
- Enable HTTPS automatically

**6. Monitor Deployment**
- View build logs in real-time
- Check deployment status
- Access logs from dashboard

**7. Check Health**
```bash
curl https://burger-house-back.onrender.com/healthz
```

### Production URL
Once deployed, the API is accessible at:
```
https://burger-house-back.onrender.com
```

### Automatic Deployments

Render automatically redeploys when you push to GitHub:
```bash
git add .
git commit -m "Update backend"
git push origin main
# Render automatically detects and deploys
```

### Docker Deployment

The application includes a multi-stage Dockerfile for containerization:

```dockerfile
# Stage 1: Build
FROM node:23.9.0-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Production
FROM node:23.9.0-slim
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY . .
EXPOSE 8080
CMD ["npm", "run", "start"]
```

---

## Important Notes

### Security Best Practices
- **Never commit `.env` file** (use `.gitignore`)
- **Always hash passwords** with bcrypt (never plain text)
- **CORS configuration** restricts API access to authorized origins
- **Input validation** with express-validator prevents injection attacks
- **JWT secrets** must be long, random, and secure
- **Environment separation** uses different credentials for dev/prod

### Database Seeding

Use the provided seeding script to populate database with test data:

```bash
node src/scripts/fakeData.js
```

This creates:
- 3 users (1 admin, 2 customers)
- 15 products (3 per category)
- 5 menus with random product combinations

**Note:** Seeding uses local MongoDB connection. Update connection string in script for cloud database.

### Error Handling

Global error handler middleware catches all exceptions:

```javascript
// src/middlewares/errorHandler.js
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});
```

### Monitoring and Debugging

**Check server status:**
```bash
# Local
npm run dev
# Open: http://localhost:2233
# Should display: "Welcome to the Burger Shop API!"

# Production
curl https://burger-house-back.fly.dev
```

**View logs:**
```bash
# Production (Fly.io)
flyctl logs

# Development
# Errors display directly in terminal
```

### Key Architectural Principles

1. **MVC Pattern:** Clear separation of concerns
2. **Stateless Architecture:** No sessions, JWT enables horizontal scaling
3. **RESTful Design:** Standard HTTP methods for CRUD operations
4. **Database Resilience:** Connection retry logic prevents transient failures
5. **Polymorphic References:** OrderItems can reference Products or Menus
6. **Environment-Based Config:** Supports multiple deployment environments

---

## Support

For questions or issues:
- Check server logs with `npm run dev`
- Consult MongoDB documentation: https://docs.mongodb.com
- Consult Express documentation: https://expressjs.com
- Consult Mongoose documentation: https://mongoosejs.com

---

**Happy coding!**
