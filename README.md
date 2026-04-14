# Serviqo — Multi-Vendor Service Marketplace

A full-stack marketplace application with a React frontend and ASP.NET Core Web API backend.

---

## Tech Stack

| Layer    | Technology                                    |
|----------|-----------------------------------------------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, Framer Motion |
| Backend  | ASP.NET Core 8, Entity Framework Core, SQL Server Express |
| Auth     | ASP.NET Identity + JWT                        |
| Database | SQL Server Express                             |

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
- SQL Server Express (`localhost\SQLEXPRESS`)
- EF Core tools: `dotnet tool install --global dotnet-ef`

### Run the API

```bash
cd backend

# Restore packages
dotnet restore

# Apply migrations & seed database
dotnet ef migrations add InitialCreate
dotnet ef database update

# Start the API (runs on http://localhost:5000)
dotnet run
```

The seeder automatically creates:
- Roles: Admin, Vendor, Customer
- Admin account: `admin@marketplace.com` / `Admin@123`
- 6 default categories

API docs available at: `http://localhost:5000/swagger`

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
- Admin is seeded automatically

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
