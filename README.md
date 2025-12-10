# COSC Casino - Frontend# COSC Casino - FrontendThis is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).



A Next.js frontend for the COSC Casino educational gambling platform.



## Tech StackA Next.js frontend for the COSC Casino educational gambling platform.## Getting Started



- **Next.js 16** - React framework with App Router

- **React 19** - UI library

- **Tailwind CSS 4** - Styling## Tech StackFirst, run the development server:

- **TypeScript** - Type safety



## Quick Start

- **Next.js 16** - React framework with App Router```bash

```bash

# Install dependencies- **React 19** - UI librarynpm run dev

./deploy.sh install

- **Tailwind CSS 4** - Styling# or

# Start development server

./deploy.sh dev- **TypeScript** - Type safetyyarn dev

```

# or

Frontend runs at: **http://localhost:3000**

## Quick Startpnpm dev

## Available Commands

# or

| Command | Description |

|---------|-------------|```bashbun dev

| `./deploy.sh install` | Install npm dependencies |

| `./deploy.sh dev` | Start development server |# Install dependencies```

| `./deploy.sh build` | Build for production |

| `./deploy.sh prod` | Start production server |./deploy.sh install

| `./deploy.sh lint` | Run ESLint |

| `./deploy.sh status` | Check server status |Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.



## Manual Commands# Start development server



```bash./deploy.sh devYou can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

npm install          # Install dependencies

npm run dev          # Start dev server```

npm run build        # Production build

npm run start        # Start production serverThis project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

npm run lint         # Run linter

```Frontend runs at: **http://localhost:3000**



## Project Structure## Learn More



```## Available Commands

src/

├── app/                    # App Router pagesTo learn more about Next.js, take a look at the following resources:

│   ├── page.tsx           # Home page

│   ├── layout.tsx         # Root layout| Command | Description |

│   ├── globals.css        # Global styles

│   ├── login/             # Login page|---------|-------------|- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.

│   ├── register/          # Register page

│   ├── admin/             # Admin panel| `./deploy.sh install` | Install npm dependencies |- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

│   └── games/             # Game pages

│       ├── blackjack/| `./deploy.sh dev` | Start development server |

│       ├── poker/

│       ├── roulette/| `./deploy.sh build` | Build for production |You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

│       ├── dice/

│       └── minesweeper/| `./deploy.sh prod` | Start production server |

├── components/            # React components

│   ├── Navbar.tsx| `./deploy.sh lint` | Run ESLint |## Deploy on Vercel

│   ├── BottomNav.tsx

│   ├── BankruptModal.tsx| `./deploy.sh status` | Check server status |

│   ├── CoinRequestModal.tsx

│   ├── GameComponents.tsxThe easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

│   └── PWAInstallPrompt.tsx

├── contexts/              # React contexts## Manual Commands

│   └── AuthContext.tsx

└── lib/                   # UtilitiesCheck out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

    └── api.ts             # API client

``````bash

npm install          # Install dependencies

## Environment Variablesnpm run dev          # Start dev server

npm run build        # Production build

Create `.env.local`:npm run start        # Start production server

npm run lint         # Run linter

```env```

NEXT_PUBLIC_API_URL=http://localhost:8000/api

```## Project Structure



## Features```

src/

- 🎰 5 Casino Games (Blackjack, Poker, Roulette, Dice, Minesweeper)├── app/                    # App Router pages

- 🔐 JWT Authentication│   ├── page.tsx           # Home page

- 💰 Coin System with Request Feature│   ├── layout.tsx         # Root layout

- 📱 Mobile Responsive + PWA Support│   ├── globals.css        # Global styles

- 🎨 Smooth Animations│   ├── login/             # Login page

- 👤 Admin Panel for Coin Requests│   ├── register/          # Register page

│   ├── admin/             # Admin panel

## Games│   └── games/             # Game pages

│       ├── blackjack/

| Game | Description |│       ├── poker/

|------|-------------|│       ├── roulette/

| Blackjack | Classic 21 card game |│       ├── dice/

| Poker | Video poker (Jacks or Better) |│       └── minesweeper/

| Roulette | European roulette with wheel animation |├── components/            # React components

| Dice | Two dice with multiple bet types |│   ├── Navbar.tsx

| Minesweeper | Grid-based multiplier game |│   ├── BottomNav.tsx

│   ├── BankruptModal.tsx

## Backend Connection│   ├── CoinRequestModal.tsx

│   ├── GameComponents.tsx

Make sure the backend is running at `http://localhost:8000` before starting the frontend.│   └── PWAInstallPrompt.tsx

├── contexts/              # React contexts

```bash│   └── AuthContext.tsx

# In gambling-be/gambling_be directory:└── lib/                   # Utilities

./deploy.sh dev    └── api.ts             # API client

``````



## Production Build## Environment Variables



```bashCreate `.env.local`:

# Build

./deploy.sh build```env

NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Start production server```

./deploy.sh prod

```## Features



## License- 🎰 5 Casino Games (Blackjack, Poker, Roulette, Dice, Minesweeper)

- 🔐 JWT Authentication

Educational use only.- 💰 Coin System with Request Feature

- 📱 Mobile Responsive + PWA Support
- 🎨 Smooth Animations
- 👤 Admin Panel for Coin Requests

## Games

| Game | Description |
|------|-------------|
| Blackjack | Classic 21 card game |
| Poker | Video poker (Jacks or Better) |
| Roulette | European roulette with wheel animation |
| Dice | Two dice with multiple bet types |
| Minesweeper | Grid-based multiplier game |

## Backend Connection

Make sure the backend is running at `http://localhost:8000` before starting the frontend.

```bash
# In gambling-be/gambling_be directory:
./deploy.sh dev
```

## Production Build

```bash
# Build
npm run build

# Start production server
npm run start
```

## License

Educational use only.
