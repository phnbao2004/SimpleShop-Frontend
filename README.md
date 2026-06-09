# SimpleShop Frontend — Next.js

Storefront + admin back-office for the PRN232 assignment. Talks to the
ASP.NET Core Web API backend.

## Setup

```bash
npm install
cp .env.local.example .env.local   # then edit NEXT_PUBLIC_API_URL
npm run dev
```

Open http://localhost:3000

`NEXT_PUBLIC_API_URL` must point to your backend:
- Local: `http://localhost:5000`
- Production: your Render URL, e.g. `https://simpleshop-api.onrender.com`

## Pages

Public:
- `/` — category cards
- `/category/[id]` — products in a category
- `/products/[id]` — product detail
- `/search` — search by name, category, price range

Admin (JWT required):
- `/admin/login` — login (admin@simpleshop.com / @@Admin123@@)
- `/admin` — dashboard stats
- `/admin/categories` — CRUD via modal, delete confirm dialog
- `/admin/products` — CRUD via modal, soft-delete confirm dialog

## Features
- Tailwind CSS UI, responsive
- axios client with JWT bearer interceptor
- react-hot-toast notifications
- Loading spinners on every API call
- Client-side form validation with inline error messages
- Confirmation dialogs before delete

## Deploy to Vercel
1. Push this folder to its own GitHub repo.
2. Import into Vercel.
3. Set env var `NEXT_PUBLIC_API_URL` to your Render backend URL.
4. Add the resulting Vercel domain to the backend CORS allowed origins.
