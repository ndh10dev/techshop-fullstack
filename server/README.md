## TechShop Backend (Express + MySQL)

### 1) Setup MySQL database

- Create the database + tables by running `schema.sql` in MySQL.
- Or let Sequelize create/update tables:

```bash
cd server
npm run db:sync
```

### 2) Configure environment variables

Create `server/.env` from `server/.env.example` and fill in:

- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET`

### 3) Install + run

```bash
cd server
npm install
npm run dev
```

Server runs on `http://localhost:5000`.

### 4) API routes

#### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (auth)
- `POST /api/auth/admin` (ADMIN only) → create new admin account

#### Products
- `GET /api/products` (guests see only `quantity > 0`, admins see all when sending token)
- `GET /api/products/:id`
- `POST /api/products` (ADMIN)
- `PUT /api/products/:id` (ADMIN)
- `DELETE /api/products/:id` (ADMIN)

#### Reviews
- `GET /api/products/:productId/reviews`
- `POST /api/products/:productId/reviews` (auth)

#### Orders
- `POST /api/orders` (auth) → creates order + **validates stock** + **decrements product quantities**
- `GET /api/orders/mine` (auth)
- `GET /api/orders` (ADMIN) → all orders

#### Posts (blog/news)
- `GET /api/posts`
- `GET /api/posts/:id`
- `POST /api/posts` (ADMIN)
- `PUT /api/posts/:id` (ADMIN)
- `DELETE /api/posts/:id` (ADMIN)

### 5) Order logic (stock reduction)
- Validates each item quantity before creating the order
- Uses a DB transaction and row locks to prevent negative stock
- If stock is insufficient, the API returns an error and does not create the order

### 6) Future features (planned)
- Reviews endpoints (alternative route shape):
  - `GET /api/reviews/:productId`
  - `POST /api/reviews`
- Contact endpoint:
  - `POST /api/contacts`

### 7) First admin account

Admins can only be created by admins. To bootstrap your **first** admin, insert one row directly in MySQL:

1) Generate a bcrypt hash (from the `server` folder):

```bash
node -e "import bcrypt from 'bcryptjs'; console.log(await bcrypt.hash('Admin@12345', 10))"
```

2) Insert into DB (replace the hash value):

```sql
INSERT INTO users (username, email, password, role)
VALUES ('Admin', 'admin@techshop.local', '<bcrypt_hash_here>', 'ADMIN');
```

