# AuraStream - Premium Video & Image Sharing

AuraStream is a next-generation, premium content sharing platform built with modern web technologies. It features a highly polished dark-mode aesthetic with glassmorphism, responsive grid layouts, and buttery-smooth micro-animations. 

The application utilizes an advanced "nocookie" embedding technique to deliver a vastly reduced-ad streaming experience directly sourced from YouTube.

## Features
- 🚀 **Lightning Fast**: Built with React (Vite) for near-instant navigation and load times.
- 🎨 **Premium UI/UX**: Dark mode by default, utilizing carefully selected gradient accents, glass-panel components, and the clean `Outfit` font.
- 🎬 **Unified Feed**: Seamlessly interleaves video content and community-style image posts.
- 📺 **Ad-Reduced Player**: Wraps video content inside a custom player using nocookie technology for a focused, premium viewing experience.
- ⚡ **Serverless Ready**: The backend API is optimized as a Vercel Serverless Function with graceful Redis degradation for caching.
- 🔍 **SEO Optimized**: Pre-configured with meta tags, Open Graph (OG) social cards, and `robots.txt` to rank immediately on Google Search.

## Tech Stack
- **Frontend**: React, TypeScript, Vite, CSS Modules
- **Backend / API**: Node.js Serverless Functions
- **Caching**: Redis (Optional)
- **Deployment**: Vercel

## Running Locally

1. Clone the repository
2. Install dependencies for the frontend:
   ```bash
   cd frontend
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Deploying to Vercel

1. Link this repository to your Vercel account.
2. Vercel will automatically detect the `vercel.json` configuration.
3. Ensure the **Framework Preset** in Vercel is set to "Vite".
4. Deploy! The `/api/feed` endpoint will automatically deploy as a Serverless Function.
