# 🔧 Fixit — Home Service Marketplace

A full-stack MERN (MongoDB, Express, React, Node.js) home service marketplace platform, similar to Urban Company. Users can book services, providers can manage bookings, and admins can oversee the entire platform.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **npm**

---

## ⚙️ Backend Setup

### 1. Navigate to backend
```bash
cd backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create `.env` in the `backend/` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/fixit
JWT_SECRET=fixit_super_secret_jwt_key_2024
JWT_EXPIRE=30d
NODE_ENV=development
```

### 4. Seed the database (optional but recommended)
```bash
npm run seed
```
This creates:
- Admin: `admin@fixit.com` / `admin123`
- User: `user@fixit.com` / `user1234`
- Provider: `ramesh@fixit.com` / `provider123`
- 8 categories + 6 sample services

### 5. Start the backend server
```bash
npm run dev   # Development (with nodemon)
npm start     # Production
```
Backend runs on: `http://localhost:5000`

---

## 🎨 Frontend Setup

### 1. Navigate to frontend
```bash
cd frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the development server
```bash
npm run dev
```
Frontend runs on: `http://localhost:5173` (or next available port)

The frontend proxies API requests to `http://localhost:5000` automatically.

---

## 📡 API Routes Reference

### Auth
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/auth/register` | Public | Register user/provider |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Private | Get current user |
| PUT | `/api/auth/profile` | Private | Update profile |
| PUT | `/api/auth/password` | Private | Change password |

### Categories
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/categories` | Public | Get all categories |
| POST | `/api/categories` | Admin | Create category |
| PUT | `/api/categories/:id` | Admin | Update category |
| DELETE | `/api/categories/:id` | Admin | Delete category |

### Services
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/services` | Public | Get services (search, filter, sort, paginate) |
| GET | `/api/services/featured` | Public | Get top-rated services |
| GET | `/api/services/my-services` | Provider | Get own services |
| GET | `/api/services/:id` | Public | Get single service |
| POST | `/api/services` | Provider | Create service |
| PUT | `/api/services/:id` | Provider/Admin | Update service |
| DELETE | `/api/services/:id` | Provider/Admin | Delete service |

### Bookings
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/bookings` | User | Create booking |
| GET | `/api/bookings/my-bookings` | User | Get user's bookings |
| GET | `/api/bookings/provider-bookings` | Provider | Get provider's bookings |
| GET | `/api/bookings/:id` | Private | Get single booking |
| PUT | `/api/bookings/:id/status` | Provider/Admin | Update booking status |
| PUT | `/api/bookings/:id/cancel` | User | Cancel booking |
| POST | `/api/bookings/:id/review` | User | Add review |

### Admin
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/admin/analytics` | Admin | Dashboard analytics |
| GET | `/api/admin/users` | Admin | List all users |
| PUT | `/api/admin/users/:id/toggle-active` | Admin | Activate/Deactivate user |
| DELETE | `/api/admin/users/:id` | Admin | Delete user |
| GET | `/api/admin/providers/pending` | Admin | Pending provider approvals |
| PUT | `/api/admin/providers/:id/approval` | Admin | Approve/Reject provider |
| GET | `/api/admin/bookings` | Admin | All bookings |

---

## 📁 Project Structure

```
pro/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── categoryController.js
│   │   ├── serviceController.js
│   │   ├── bookingController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js               # JWT verify + RBAC
│   │   └── error.js              # Global error handler
│   ├── models/
│   │   ├── User.js               # User/Provider/Admin schema
│   │   ├── Category.js
│   │   ├── Service.js
│   │   └── Booking.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── serviceRoutes.js
│   │   ├── bookingRoutes.js
│   │   └── adminRoutes.js
│   ├── utils/
│   │   └── tokenUtils.js         # JWT generation helper
│   ├── seed.js                   # Database seeder
│   ├── server.js                 # Express entry point
│   └── .env                      # Environment variables
│
└── frontend/
    └── src/
        ├── components/
        │   ├── common/
        │   │   ├── Navbar.jsx
        │   │   ├── Footer.jsx
        │   │   ├── Loader.jsx
        │   │   └── ProtectedRoute.jsx
        │   └── services/
        │       └── ServiceCard.jsx
        ├── pages/
        │   ├── HomePage.jsx
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   ├── ServicesPage.jsx
        │   ├── ServiceDetailPage.jsx
        │   ├── UserDashboard.jsx
        │   ├── ProviderDashboard.jsx
        │   └── AdminDashboard.jsx
        ├── redux/
        │   ├── store.js
        │   └── slices/
        │       ├── authSlice.js
        │       ├── servicesSlice.js
        │       └── bookingsSlice.js
        ├── services/
        │   └── api.js            # Axios instance
        ├── App.jsx               # Routing + layout
        └── index.css             # Global styles + design system
```

---

## 🎨 Design System

- **Theme:** Dark mode with indigo/purple gradient palette
- **Font:** Inter (Google Fonts)
- **Effects:** Glassmorphism, smooth animations, micro-interactions
- **Responsive:** Mobile-first design for all breakpoints

## 🔐 Roles & Access

| Role | Access |
|------|--------|
| User | Browse services, book, cancel, review |
| Provider | Manage own services, accept/reject/complete bookings |
| Admin | Everything — full platform management |

## 🧪 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@fixit.com | admin123 |
| User | user@fixit.com | user1234 |
| Provider | ramesh@fixit.com | provider123 |
