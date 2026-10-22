# 🪔 Utsav (उत्सव) — Indian Festival Themes for Shopify

**Utsav** is a complete, production-ready Shopify App designed specifically for Indian D2C e-commerce brands. In Western markets, merchants decorate their storefronts for Halloween, Black Friday, and Christmas using dedicated apps. **Utsav** brings the same magic to Indian e-commerce, offering culturally authentic, high-converting visual themes, particle effects, promotional countdown banners, and scheduled campaigns for all major Indian festivals.

---

## 🌟 Supported Festivals

| Festival | Category | Key Visuals & Particle Effects | Palette | Tier |
|---|---|---|---|---|
| **Diwali** (दीपावली) | Lights & Prosperity | Floating Diyas, Firecracker Sparkles, Golden Glow, Lakshmi Footsteps | Gold, Maroon, Amber | **Free** |
| **Holi** (होली) | Colors & Joy | Organic Gulal Splashes, Vibrant Powders, Water Baloon bursts | Gulal Pink, Turmeric, Cyan, Neon Violet | **Free** |
| **Independence & Republic Day** (स्वतंत्रता दिवस) | Patriotic | Tricolor Confetti, Saffron-White-Green Sparkles, Ashoka Chakra accents | Deep Saffron, Navy, White, India Green | **Free** |
| **Navratri & Durga Puja** (नवरात्रि) | Divine Energy & Dance | Dandiya Sticks, Trishul motifs, Dhunuchi incense smoke, Marigold petals | Royal Crimson, Marigold Orange, Sacred Gold | **Pro** |
| **Eid al-Fitr & Eid al-Adha** (ईद) | Elegance & Celebration | Crescent Moon, Golden Lanterns (Fanous), Star Dust, Emerald glow | Royal Emerald, Champagne Gold, Pearl | **Pro** |
| **Makar Sankranti & Pongal** (पोंगल) | Harvest & Sunshine | Colorful Flying Kites, Harvest Grain, Sugarcane & Clay Pot motifs | Sunshine Yellow, Terracotta, Fresh Green | **Pro** |
| **Raksha Bandhan** (रक्षाबंधन) | Sibling Love | Silken Rakhi Motifs, Golden Shimmer, Love Hearts, Sweet Modaks | Rose Pink, Silk Gold, Ruby Red | **Pro** |
| **Ganesh Chaturthi** (गणेश चतुर्थी) | Wisdom & Blessings | Modak Confetti, Hibiscus Flowers, Durva Grass, Mangalmurti aura | Vermilion Sindoor, Modak Yellow, Royal Purple | **Pro** |
| **Onam** (ओणम) | Royal Harvest | Grand Pookkalam floral carpet petals, Boat Race ripples, Kasavu gold | Kasavu White & Gold, Leaf Green, Vibrant Yellow | **Pro** |

---

## 🏗️ Architecture & Tech Stack

```
fx-india/
├── app/                                 # Shopify Embedded Admin App (Remix + Polaris)
│   ├── routes/
│   │   ├── app._index.jsx               # Dashboard: Active theme, upcoming festivals, quick stats
│   │   ├── app.festivals.jsx            # Festival Catalog & Filterable Grid
│   │   ├── app.festivals.$id.jsx        # Customizer: Banner copy, discount code, colors, particle speed, live preview
│   │   ├── app.schedule.jsx             # Festival Scheduler: Auto-activate on date/time & auto-revert
│   │   ├── app.billing.jsx              # Pricing & Plan management (Free vs Pro at ₹1,499/mo)
│   │   └── app.jsx                      # App shell with Polaris navigation
│   ├── data/
│   │   └── festivals.js                 # Festival metadata, dates, cultural copy, and animation configs
│   ├── db.server.js                     # Prisma SQLite Client
│   └── shopify.server.js                # Shopify Remix SDK Auth & Sessions
├── extensions/
│   └── utsav-app-block/                 # Shopify Theme App Extension (OS 2.0)
│       ├── blocks/
│       │   └── festival-banner.liquid   # Merchant customizable Liquid App Block
│       ├── assets/
│       │   ├── festival-themes.css      # CSS variables, animations, glassmorphism, rangoli borders
│       │   └── festive-effects.js       # Ultra-lightweight particle engine (Diyas, Gulal, Petals, Kites)
│       └── shopify.extension.toml       # Theme extension manifest
├── prisma/
│   └── schema.prisma                    # Database schema: Shop, FestivalSettings, Schedule, Subscriptions
├── shopify.app.toml                     # Shopify App configuration (Scopes, URLs, Webhooks)
└── vite.config.js                       # Vite + Remix build configuration
```

---

## ⚡ Core Features

1. **Zero Theme Code Modifications (App Embed Block)**:
   - Built using Shopify's modern Theme App Extensions (OS 2.0).
   - Can be toggled on/off instantly from the Shopify Theme Editor without leaving orphan code behind.

2. **Ultra-Lightweight Canvas Particle Engine**:
   - Zero external animation libraries (no jQuery, no bulky Three.js).
   - High-performance, hardware-accelerated 60 FPS HTML5 Canvas particles.
   - Respects user battery and `prefers-reduced-motion`. Automatically pauses when the tab is inactive.

3. **High-Converting Promotional Banner**:
   - Sticky top announcement bar matching the active festival's cultural aesthetics.
   - Live Countdown Timer to create purchase urgency.
   - 1-Click Coupon Code Copy with haptic feedback/visual confirmation tooltip.
   - Customizable Call-To-Action button linking to specific sales collections.

4. **Auto-Scheduler (Smart Festival Calendar)**:
   - Schedule festival themes to activate automatically (e.g., 3 days before Diwali) and auto-revert when the festival ends.
   - Never worry about taking down festival decorations manually.

5. **Merchant Customizer with Live Interactive Preview**:
   - Real-time preview modal in the Shopify Admin.
   - Customize banner title, subtitle, coupon code, particle density, sound toggle, and accent colors.

6. **Indian D2C Monetization (Freemium)**:
   - **Free Plan**: Diwali, Holi, and Independence Day (India's big 3).
   - **Pro Plan (₹1,499 / month or ₹9,999 / year)**: Access to all 9+ regional festivals, custom particle upload, priority support, and multi-festival scheduling.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js >= 18.20.0
- Shopify CLI: `npm install -g @shopify/cli`
- A Shopify Partner Account and Development Store

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update with your Shopify App credentials from your Partner Dashboard:
```env
SHOPIFY_API_KEY="your_partner_client_id"
SHOPIFY_API_SECRET="your_partner_client_secret"
SHOPIFY_APP_URL="https://your-app-tunnel-url"
SCOPES="read_themes,write_themes,read_script_tags,write_script_tags"
DATABASE_URL="file:./dev.sqlite"
```

### 3. Database Setup
```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
# or: shopify app dev
```
Shopify CLI will automatically provision a Cloudflare or ngrok tunnel and provide an installation link for your development store.

### 5. Build for Production
```bash
npm run build
```

---

## 🛒 How Merchants Use the App

1. Install **Utsav** from the Shopify App Store.
2. Go to **Utsav Dashboard** in Shopify Admin.
3. Browse the **Festival Catalog** and click **Customize** on any festival (e.g., Diwali or Holi).
4. Enter promotional text, discount code (e.g., `DIWALI30`), and adjust particle effects.
5. Click **Activate Festival Theme**.
6. Open Shopify **Online Store > Themes > Customize**, enable the **Utsav Festival Banner** App Block in the Theme Settings, and click **Save**.
7. The merchant's storefront is instantly transformed with festive energy!

---

## 📜 License
MIT License. Built with ❤️ for Indian D2C brands.
