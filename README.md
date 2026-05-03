# TechShop Frontend (React + Vite + TS)

## App flow
- **Home** → featured products (API)
- **Products** → browse / admin manage products (API)
- **Cart** → **Order** (API) → stock reduced on backend
- **Blog/News** → browse posts / admin manage posts (API)
- **Account** → login/register + show role from JWT

## Roles
- **GUEST**: can browse products (only in-stock), cannot add to cart
- **USER**: can add to cart + place orders
- **ADMIN**: can create/edit/delete products and posts

JWT is stored in `localStorage` as `authToken`.

## Data flow (API-based)
- Products:
  - `GET http://localhost:5000/api/products`
  - `POST/PUT/DELETE http://localhost:5000/api/products/...` (ADMIN, Bearer token)
- Orders:
  - `POST http://localhost:5000/api/orders` (USER, Bearer token)
- Posts:
  - `GET http://localhost:5000/api/posts`
  - `POST/DELETE http://localhost:5000/api/posts/...` (ADMIN, Bearer token)

## Prepared (future backend)
- Reviews UI is prepared for:
  - `GET http://localhost:5000/api/reviews/:productId`
  - `POST http://localhost:5000/api/reviews`
- Contact form is prepared for:
  - `POST http://localhost:5000/api/contacts`

## Run (frontend)
```bash
npm install
npm run dev
```
