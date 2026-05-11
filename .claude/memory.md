# Project Memory — tchopmygrinds

Last updated: 2026-05-11

## What this project is
Location-based e-commerce platform connecting local merchants with customers within a 50 km radius. Rails 7.1.5 API backend + React 18 / TypeScript / Redux Toolkit / Tailwind frontend. Deployed on Render.com.

## User roles (`statut_type` enum)
- `itinerant` — mobile merchants (red truck markers)
- `sedentary` — fixed-location merchants (green shop markers)
- `others` — buyers (blue user markers)

## Core domain models
- `User` ↔ `Commerce` ↔ `Product`
- `User` ↔ `Order` ↔ `OrderDetail` ↔ `Product`
- `User` ↔ `Address` (delivery locations)
- `User` ↔ `ProductInterest` (manifestations d'intérêt → merchant dashboard)

## Auth & API
- Devise-JWT, token in `Authorization` header
- API namespace: `/api/v1/`
- CORS configured for `localhost:3001` in dev

## Geolocation
- Geocoder gem, default radius 50 km
- `Commerce` and `Address` are geocoded
- Frontend uses browser geolocation API → Redux `location` slice
- Real-time tracking service for ambulant merchants (configurable interval)

## Migration status (per CLAUDE.md)
~80% migrated from AngularJS to React. Missing surface area: full order workflow status, vendor management modals, reviews/ratings, favorites, advanced search autocomplete, messaging, newsletter integration.

## Conventions worth remembering
- Frontend lives in `frontend/`; backend serves the built SPA via `PagesController` at `/`
- Rails dev port 3000; Vite dev server port 3001
- Seeds: `rails runner db/seeds_api.rb` is the React-compatible one
- Tests: RSpec backend (`spec/`); no frontend test framework wired yet
- Build for Render: `bin/render-build.sh`
