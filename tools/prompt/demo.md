# ToggleWear — Retail Clothing Website

## Overview

Build a fully functional online clothing store called **ToggleWear**. The app uses a **vanilla JavaScript frontend** and a **Python backend**. Feature flags managed by **LaunchDarkly** control the visual design theme. Product and order data is stored in **Amazon DynamoDB**. Use the LaunchDarkly MCP server and the DynamoDB MCP server to create all cloud resources as part of the build — do not use placeholders for flags or tables.

---

## MCP Server Usage

- Use the **LaunchDarkly MCP server** to:
  - Create all feature flags in the `kevinc-new-demo-app` project
  - Configure flag prerequisites
  - Set up any targeting rules needed for the simulated users
- Use the **Amazon DynamoDB MCP server** to:
  - Create all required tables in the `us-east-1` region
  - Define key schemas, attribute definitions, and any necessary indexes

---

## LaunchDarkly Configuration

### Project
- **Project key:** `kevinc-new-demo-app`
- **SDK keys:** Use placeholders named `YOUR_LD_CLIENT_SIDE_KEY` and `YOUR_LD_SERVER_SIDE_KEY`

### Feature Flags
Create **5 feature flags**. The fifth flag is a **prerequisite** for the first four — flags 1–4 should only evaluate when flag 5 is on.

| Flag # | Key (suggested) | Controls |
|--------|----------------|----------|
| 1 | `modern-hero-banner` | Home page hero section |
| 2 | `modern-navigation` | Top navigation style |
| 3 | `modern-product-cards` | Product card layout |
| 4 | `modern-typography-palette` | Fonts and color palette |
| 5 | `modern-theme-enabled` | Master toggle (prerequisite for flags 1–4) |

- When all flags are **off** → early 2000s design is shown
- When all flags are **on** → modern design is shown
- Implement **flag subscription** (streaming/real-time updates) in both the frontend JS SDK and the backend Python SDK so the UI reacts instantly to flag changes without a page refresh

### User Contexts
Implement a simulated login — no username/password. A dropdown lets the user select one of three people. When selected, call the LaunchDarkly `identify` method to update the SDK context.

Each user should have a **multi-context** with two contexts: `user` and `device`.

**Robert** (Customer)
- User: `{ key: "user-robert-001", name: "Robert", role: "customer", state: "Texas", country: "US" }`
- Device: `{ key: "device-robert-001", type: "desktop", os: "Windows 11", browser: "Chrome" }`

**Jennifer** (Customer)
- User: `{ key: "user-jennifer-002", name: "Jennifer", role: "customer", state: "California", country: "US" }`
- Device: `{ key: "device-jennifer-002", type: "mobile", os: "iOS 17", browser: "Safari" }`

**Alex** (Developer)
- User: `{ key: "user-alex-003", name: "Alex", role: "developer", state: "Oregon", country: "US" }`
- Device: `{ key: "device-alex-003", type: "laptop", os: "macOS Sonoma", browser: "Firefox" }`

### Session Replay & Observability
- Integrate **LaunchDarkly Session Replay** on the frontend
- Integrate **LaunchDarkly Observability** on both the frontend and backend

---

## Design: Two Themes

The site should use **light, fresh colors** as its base. The two themes share the same content and page structure — only the visual design changes.

### Early 2000s Theme (flags off)
- Bold, primary colors (navy, red, white)
- Table-based or rigid grid layout aesthetic
- Web-safe fonts (Arial, Times New Roman, Verdana)
- Beveled buttons, thick borders, drop shadows
- Busy navigation with visible underlined links
- Banner/marquee-style homepage elements

### Modern Theme (flags on)
- Soft, airy color palette (white, light grays, muted earth tones)
- Clean card-based layouts with generous whitespace
- Modern sans-serif fonts (Inter, DM Sans, or similar from Google Fonts)
- Subtle shadows, rounded corners, smooth hover transitions
- Sticky minimal nav bar
- Full-bleed hero section with a strong CTA

---

## Pages

### 1. Home Page
- Hero section with tagline and CTA ("Shop Now")
- Featured categories section
- Featured products section
- Footer with links and newsletter signup

### 2. Shop Page
Display browsable product categories. Clicking a category shows its products as a grid of product cards.

**Men's Categories** (20 products each):
1. Jackets & Vests
2. Fleece & Sweaters
3. Shirts & Tops
4. Pants & Shorts
5. Base Layers

**Women's Categories** (20 products each):
1. Jackets & Vests
2. Fleece & Sweaters
3. Tops & T-Shirts
4. Pants & Leggings
5. Dresses & Skirts

Use Patagonia's site for product name and description inspiration. Source free product images from Unsplash, Pixabay, or Pexels — use real image URLs, not placeholders.

### 3. Product Page
Displayed when a product card is clicked. Must include:
- Product image
- Product name and description
- Price
- Size selector
- **Add to Cart** button

### 4. Shopping Cart
- Persistent cart (synced between frontend and backend/DynamoDB)
- Accessible from a cart icon in the nav
- Shows items, quantities, subtotal
- "Proceed to Checkout" button

### 5. Checkout Page
Pre-fill with the following data:

**Shipping & Billing Address:**
> LaunchDarkly HQ
> 1 Embarcadero Center, Suite 1900
> San Francisco, CA 94111

**Payment (fake Visa):**
> Card Number: 4111 1111 1111 1111
> Expiry: 12/28 | CVV: 123

On checkout completion:
- Save the order to DynamoDB
- Show an order confirmation page with an order number

### 6. About Page
Company story, mission, and team section. Content can be AI-generated but should feel authentic to an outdoor/lifestyle clothing brand.

### 7. Contact Page
Contact form (name, email, message) and store info. Form submissions do not need to be stored unless easy to add.

---

## Backend (Python)

- REST API serving all product, cart, and order data
- LaunchDarkly **Python server SDK** initialized and subscribed to flag changes
- Endpoints needed (at minimum):
  - `GET /api/products` — all products or by category
  - `GET /api/products/:id` — single product
  - `GET /api/cart/:userId` — fetch cart
  - `POST /api/cart/:userId` — add/update cart item
  - `DELETE /api/cart/:userId/:itemId` — remove cart item
  - `POST /api/orders` — place order
  - `GET /api/flags` — return current flag states for the given user context (called by frontend on identify)

---

## Database (DynamoDB, us-east-1)

Use the DynamoDB MCP server to create the following tables:

| Table | Primary Key | Notes |
|-------|------------|-------|
| `togglewear-products` | `productId` (S) | Includes category, name, description, price, imageUrl, gender |
| `togglewear-orders` | `orderId` (S) | Includes userId, items, total, address, timestamp, status |
| `togglewear-carts` | `userId` (S) | Stores cart items per user |
| `togglewear-customers` | `userId` (S) | Stores Robert, Jennifer, Alex profile data |

Seed `togglewear-products` and `togglewear-customers` with all data as part of the build.

---

## Additional Requirements

- The app structure should be clean and organized (e.g., `/frontend`, `/backend`, `/scripts` folders)
- Include a `README.md` with:
  - Project overview
  - How to set SDK keys
  - How to run the frontend and backend
  - Description of each feature flag and how to toggle the theme
- Do not hardcode SDK keys — use environment variables loaded from a `.env` file
- If deployment approach becomes clear during the build, include a note in the README with recommended next steps

---

*A few things to finalize before sending this prompt:*
1. **What should happen if no user is logged in?** (Anonymous context, or force login?)
2. **Do you want any LaunchDarkly targeting rules set up?** (e.g., Alex the developer always sees the modern theme regardless of flags)
3. **Any additional pages** you mentioned wanting to add — what are they?
