# 🍷 Wine Sommelier Chatbot - Global Version

An AI-powered virtual sommelier chat application that can be customized for any wine shop or business. Built with Next.js, React, TypeScript, and the Google Gemini API.

## ✨ Features

- Intelligent Virtual Sommelier — personalized wine recommendations
- Business-agnostic — configurable for any store or brand
- Google Gemini API integration for advanced language generation
- Real-time streaming responses for a fluid chat experience
- Optional coupon system for promotions and discounts
- Customizable UI (colors, logos, texts) using Tailwind CSS
- Multilanguage support
- Remote CSV-based catalog (Google Drive)

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Open `.env.local` and add your Gemini API key:

```
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
```

> Note: For development Next.js will load `.env.local` over `.env`.

### 3. Customize configuration

Edit `config.ts` to adapt the sommelier to your business (name, branding, CSV URL, coupons, etc.).

### 4. Run the dev server

```bash
npm run dev
```

Open http://localhost:3000 (or the port shown in the console).

---

## ⚙️ Global Configuration (`config.ts`)

Key configuration sections:

- `business` — organization name, location, website, social links
- `sommelier` — assistant name, personality and language
- `api` — provider and model selection (e.g. `gemini-2.5-flash`)
- `wines` — remote CSV URL, delimiter and column mappings
- `coupons` — optional coupon system settings
- `prompts` — UI labels and error messages

Example snippets (edit as needed):

```typescript
business: {
  name: "Your Wine Shop",
  location: "Your Country",
  website: "https://yourshop.example",
}

sommelier: {
  name: "GustaVino",
  personality: "friendly and helpful",
  language: "en",
}

api: {
  provider: "gemini",
  model: "gemini-2.5-flash",
  apiKey: process.env.GEMINI_API_KEY,
}

wines: {
  csvUrl: "https://drive.google.com/uc?export=download&id=YOUR_ID",
  delimiter: ";",
  columns: { name: "Nombre producto", type: "Tipo de vino", price: "Precio", image: "Imagen" },
}
```

---

## 📊 Preparing Your Wine CSV

The app expects a CSV hosted on Google Drive (or another accessible URL). Required columns include:

- `Nombre producto` (product name)
- `Tipo de vino` (type: red/white/rosé/sparkling)
- `País` (country)
- `Tipo de Uva` (grape)
- `Precio` (price)
- `Gusto` (taste)
- `Maridaje` (pairing suggestions)
- `Combinaciones` (related products)
- `Tiendas` (stores)
- `Imagen` (image URL)

Upload your CSV to Google Drive, make it shareable and use the `uc?export=download&id=FILE_ID` URL in `config.ts`.

---

## 💳 Coupon System

If `coupons.enabled` is `true`, the project uses `app/data/coupons.csv` to allocate coupons. Example format:

```csv
codigo;estado;asignado;fechaUso
CUPON001;disponible;;;
CUPON002;disponible;;;
```

Columns:

- `codigo` — coupon code
- `estado` — available / used
- `asignado` — conversation/user id
- `fechaUso` — ISO timestamp when used

The app handles concurrency using a lock file when assigning coupons.

---

## 🔧 Commands

```bash
npm run dev      # Start development server (localhost)
npm run build    # Build for production
npm start        # Run built app
npm run lint     # Run ESLint
```

---

## 📁 Project Structure

```
├── app/
│   ├── api/gemini/route.ts      # Server endpoint for Gemini
│   ├── components/Chat.tsx      # Chat UI component
│   ├── data/coupons.csv         # Coupon data file
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Main page
├── config.ts                    # Global configuration
├── .env.local.example           # Example env file (do not commit keys)
├── package.json                 # Dependencies and scripts
└── README.md                    # This file
```

---

## 🌐 Deploying to Vercel

Push to GitHub and connect the repo to Vercel. In Vercel's project settings, add the `GEMINI_API_KEY` as an environment variable and redeploy.

```bash
git push origin main
```

---

## ⚙️ Advanced Tips

- To change the Gemini model, edit `config.ts` `api.model`.
- To disable coupons, set `coupons.enabled = false`.
- To change language, set `sommelier.language` to `en`, `es`, `fr`, etc.

---

## 🐛 Troubleshooting

- `GEMINI_API_KEY not defined`: ensure `.env.local` exists and contains `GEMINI_API_KEY`.
- `CSV download failed`: verify your Google Drive link and that the file is shareable.
- `Coupons not working`: make sure `app/data/coupons.csv` exists and `coupons.enabled` is true.

---

## 📚 Resources

- Next.js: https://nextjs.org/docs
- Google Gemini API: https://ai.google.dev
- TypeScript: https://www.typescriptlang.org/docs/
- Tailwind CSS: https://tailwindcss.com/docs

---

## 📄 License

MIT

---

## 🤝 Contributing

Contributions welcome — please open a pull request.

Made with ❤️ for wine and tech lovers.
