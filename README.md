# Serviqo — Multi-Vendor Service Marketplace

A full-stack marketplace application with a React frontend and ASP.NET Core Web API backend.

---

## Tech Stack

| Layer    | Technology                                    |
|----------|-----------------------------------------------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, Framer Motion |
| Backend  | ASP.NET Core 8, Entity Framework Core, SQLite (dev) / SQL Server |
| Auth     | ASP.NET Identity + JWT                        |
| Database | SQLite for local development, optional SQL Server |

---

## Project Structure

```
Marketplace/
├── frontend/   — React/Vite application
└── backend/    — ASP.NET Core Web API
```

---

## Backend Setup

### Prerequisites
- .NET 8 SDK
- EF Core tools: `dotnet tool install --global dotnet-ef`

### Run the API

```bash
cd backend

# Restore packages
dotnet restore

# Start the API (runs on http://localhost:5000)
dotnet run
```

The seeder automatically creates:
- Roles: Admin, Vendor, Customer
- 8 categories with realistic public image URLs
- 20 vendor accounts
- 50 customer accounts
- 60 services
- A large demo set of orders and reviews

Seeded demo accounts:
- Admin: `admin@marketplace.com` / `Admin#Serviqo2026!`
- Vendor: `vendor01@marketplace.com` / `Vendor#Serviqo2026!`
- Customer: `liam.haddad@marketplace.com` / `Customer#Serviqo2026!`

API docs available at: `http://localhost:5000/swagger`

Development now defaults to a local SQLite file (`backend/marketplace.db`) so the app can start without SQL Server. If you want to use SQL Server instead, set `"DatabaseProvider": "SqlServer"` in `backend/appsettings.json` and update `DefaultConnection`.

---

## Frontend Setup

### Prerequisites
- Node.js 18+

### Run the App

```bash
cd frontend

# Install dependencies
npm install

# Start dev server (runs on http://localhost:5173)
npm run dev
```

The Vite dev server proxies `/api` requests to `http://localhost:5000`.

---

## Roles & Access

| Role     | Access                                            |
|----------|---------------------------------------------------|
| Customer | Browse services, place orders, leave reviews      |
| Vendor   | Create/manage services, manage incoming orders    |
| Admin    | All of the above + manage users, categories, stats|

### Create accounts
- Visit `/register` and choose role (Customer or Vendor)
- Passwords must be at least 12 characters and include uppercase, lowercase, a number, and a symbol
- Admin, vendor, and customer demo accounts are seeded automatically

---

## Key API Endpoints

```
POST /api/auth/register
POST /api/auth/login

GET  /api/categories
POST /api/categories          [Admin]
DELETE /api/categories/{id}   [Admin]

GET  /api/services            (paginated, filterable, sortable)
GET  /api/services/{id}
POST /api/services            [Vendor]
PUT  /api/services/{id}       [Vendor/Admin]
DELETE /api/services/{id}     [Vendor/Admin]

GET  /api/orders              [Auth]
POST /api/orders              [Customer]
PUT  /api/orders/{id}/status  [Vendor/Admin]

POST /api/reviews             [Customer]
GET  /api/reviews/service/{id}

GET  /api/vendor/services     [Vendor]
GET  /api/vendor/orders       [Vendor]
GET  /api/vendor/stats        [Vendor]

GET  /api/admin/stats         [Admin]
GET  /api/admin/users         [Admin]
GET  /api/admin/orders        [Admin]
PUT  /api/admin/users/{id}/role     [Admin]
PUT  /api/admin/users/{id}/toggle   [Admin]
```

---

## Frontend Pages

| Path              | Description                          |
|-------------------|--------------------------------------|
| `/`               | Home — hero, categories, top services |
| `/services`       | Browse — search, filter, sort, paginate |
| `/services/:id`   | Service detail — info, reviews, order |
| `/login`          | Sign in                              |
| `/register`       | Create account (Customer or Vendor)  |
| `/customer`       | Customer orders + review modal       |
| `/vendor`         | Vendor overview stats                |
| `/vendor/services`| Manage services (CRUD)               |
| `/vendor/orders`  | Manage incoming orders               |
| `/admin`          | Platform stats + recent orders       |
| `/admin/users`    | Manage users and roles               |
| `/admin/orders`   | All orders with status filter        |
| `/admin/categories`| Manage categories                  |
