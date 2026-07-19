# SimpleShop Frontend

Next.js 14 App Router frontend for the SimpleShop e-commerce final exam.

## Technology stack

- Next.js 14 and React 18
- Tailwind CSS
- Axios shared API client
- React Hot Toast
- JWT session state stored in the browser for this exam project

## Install and run locally

```powershell
npm install
Copy-Item .env.local.example .env.local
npm run dev
```

Open `http://localhost:3000`.

All API calls use the shared client in `src/lib/api.js`. Configure the backend base URL in `.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:5000
```

The localhost fallback is used only in Development. A Production build fails with a clear error when `NEXT_PUBLIC_API_URL` is missing. Do not place JWT signing keys, database passwords, or other server secrets in any `NEXT_PUBLIC_*` variable.

## Commands

```powershell
npm run dev
npm run lint
npm run build
npm run start
```

`package-lock.json` identifies npm as the package manager.

## Main routes

Public routes:

- `/`: category listing.
- `/products`: active product listing.
- `/products/[id]`: product detail.
- `/category/[id]`: products in a category.
- `/search`: product name, category, minimum-price, and maximum-price filters.
- `/login` and `/register`: authentication.

Authenticated User routes:

- `/cart`: persisted account cart, quantity updates, confirmed removal, and confirmed checkout.
- `/orders`: the signed-in user's order history and status.
- `/orders/[id]`: owner-only order detail and status.
- `/admin/categories`: manage the signed-in user's Categories.
- `/admin/products`: manage the signed-in user's Products.

Admin routes:

- `/admin`: dashboard.
- `/admin/categories`: manage all Categories.
- `/admin/products`: manage all Products.
- `/admin/login`: compatibility redirect to `/login`.

Protected pages use client-side guards and redirect unauthenticated visitors to Login. The API remains the security boundary and enforces JWT roles and ownership. Invalid or expired tokens are removed, followed by a Login redirect and an explanatory message.

## UI behavior

- Product browse/detail/search remain available without authentication.
- Search validates non-negative prices and ensures minimum price does not exceed maximum price.
- Cart removal, checkout, Category deletion, and Product deactivation use a shared confirmation dialog.
- Confirm/submit controls are disabled while their request is running to prevent duplicate submissions.
- API failures produce a toast or visible error state; empty product/order/cart results have explicit empty states.
- Layouts use responsive Tailwind grids, wrapping navigation, horizontally scrollable tables, and mobile-first cart/order rows.

## Prepare for Vercel

1. Import this frontend repository into Vercel.
2. Set `NEXT_PUBLIC_API_URL` to the deployed Render API origin, without a trailing slash.
3. Add the Vercel origin to the backend's `CORS_ALLOWED_ORIGINS` value.
4. Use `npm run build` as the Production build command.
5. Verify `/products/[id]` and `/orders/[id]` after deployment.

Real `.env` and `.env.local` files are ignored. Only placeholder example files should be committed. This repository is prepared for Vercel but does not deploy automatically.
