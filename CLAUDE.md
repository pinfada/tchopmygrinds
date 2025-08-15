# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TchopMyGrinds is a location-based e-commerce platform connecting local merchants with customers. It's built as a Ruby on Rails API backend with a modern React/TypeScript frontend, focusing on geolocation-based commerce discovery within a 50km radius. The project has been migrated from AngularJS to React with Redux state management.

## Current Architecture (Post-Migration)

**Backend**: Ruby on Rails 7.1.5 API with JWT authentication  
**Frontend**: React 18 + TypeScript + Redux Toolkit + Tailwind CSS  
**Database**: SQLite (development) / PostgreSQL (production)  
**Mapping**: Leaflet.js with custom markers and real-time tracking  
**Deployment**: Render.com

## Development Commands

### Environment Setup
```bash
# Install backend dependencies
bundle install

# Install frontend dependencies
cd frontend && npm install && cd ..

# Database setup
rails db:setup
rails db:migrate

# Seed with test data for React frontend
rails runner db/seeds_api.rb
```

### Running the Application
```bash
# Backend API server (Terminal 1)
rails server -p 3000

# Frontend development server (Terminal 2)  
cd frontend && npm run dev
# Accessible on http://localhost:3001

# Console access
rails console

# Database console
rails dbconsole
```

### Available Seeds
```bash
# Modern React-compatible data
rails runner db/seeds_api.rb       # Recommended for React frontend
rails runner db/seeds_modern.rb    # Large dataset with Faker
rails runner db/seeds_simple.rb    # Minimal dataset
```

### Testing
```bash
# Run RSpec tests
rspec

# Run specific test file
rspec spec/controllers/pages_controller_spec.rb
```

### Production Build (Render.com)
```bash
# Build script (in bin/render-build.sh)
bundle install
bundle exec rails assets:precompile
bundle exec rails assets:clean
bundle exec rails db:migrate
```

### Available Rake Tasks
Custom rake tasks are available in `lib/tasks/`:
- `rake address_tasks:*` - Address management utilities
- `rake email_tasks:*` - Email operation utilities  
- `rake user_tasks:*` - User management utilities

## Architecture Overview

### Backend Structure (Rails 7.1.5)
- **API Architecture**: RESTful API with `/api/v1` namespace
- **Authentication**: Devise-JWT with token-based authentication
- **Geolocation**: Geocoder gem for location-based queries and proximity searches
- **Database**: SQLite (dev) / PostgreSQL (prod) with spatial capabilities
- **Email**: SendGrid integration with comprehensive notification system
- **Admin Interface**: RailsAdmin for backend management
- **CORS**: Configured for React frontend integration

### Frontend Structure (React 18 + TypeScript)
- **Framework**: React with TypeScript and Vite build tool
- **State Management**: Redux Toolkit with 7 slices (auth, commerce, product, cart, location, order, notification)
- **API Client**: Axios with JWT interceptors and error handling
- **Routing**: React Router Dom v6 with protected routes
- **UI Framework**: Tailwind CSS with custom components
- **Mapping**: Leaflet.js with custom markers and real-time tracking
- **Services**: Location tracking, map settings, cart persistence

### Key Models and Relationships
```
User (merchant/buyer) ←→ Commerce (shop) ←→ Product (inventory)
User ←→ Order ←→ OrderDetail ←→ Product
User ←→ Address (delivery locations)
```

### Core API Controllers
- **Api::V1::CommercesController**: Location-based merchant search (`/api/v1/commerces/nearby`)
- **Api::V1::ProductsController**: Product catalog with search and filtering
- **Api::V1::OrdersController**: E-commerce workflow with status management
- **Api::V1::AuthController**: JWT authentication (login/register/logout)
- **PagesController**: Serves React SPA (`/` route)

## Development Guidelines

### Working with Location Features
- All location queries use Geocoder gem with configurable radius (default 50km)
- Commerce and Address models have geocoding capabilities  
- Frontend uses browser geolocation API integrated with Redux location slice
- Real-time tracking service for ambulant merchants with configurable intervals
- Map settings service for user-configurable refresh rates (5-60 minutes)

### User Roles and Authorization  
Three user types (`statut_type` enum):
- `itinerant`: Mobile merchants (red truck markers 🚚)
- `sedentary`: Fixed-location merchants (green shop markers 🏪)
- `others`: Regular buyers (blue user markers 👤)
- JWT-based authentication with role-based API access

### Frontend Development (React)
- **Components**: Organized in `frontend/src/components/` with TypeScript
- **Pages**: Route-based pages in `frontend/src/pages/`
- **Services**: API client, location tracking, map settings in `frontend/src/services/`
- **State**: Redux Toolkit slices in `frontend/src/store/slices/`
- **Styling**: Tailwind CSS with responsive design
- **Maps**: Leaflet with custom markers, popups, and real-time updates

### API Development
- **RESTful API**: Structured `/api/v1/` namespace with JSON responses
- **Authentication**: JWT token in Authorization header
- **Pagination**: Built-in pagination with meta information
- **Filtering**: Query parameters for search, category, distance, etc.
- **CORS**: Configured for localhost:3001 development

### Email System
- UserMailer handles order notifications and status changes
- Templates in `app/views/user_mailer/`
- Order status changes trigger automatic emails
- Newsletter functionality available via NewslettersController

### Database Migrations
- Schema includes spatial columns for geolocation
- Custom migrations for role management and order workflow
- Categorizations table handles many-to-many Product-Commerce relationships
- JWT denylist table for token revocation

## React Frontend Features

### Map Interaction & Real-time Tracking
- **Interactive Leaflet Map**: Custom markers for users, fixed and ambulant merchants
- **Real-time Tracking**: Configurable tracking intervals (10s-5min) for ambulant merchants
- **Auto-refresh**: Automatic map data refresh (5-60 minutes configurable)
- **Visual Indicators**: Online status, verified merchants, distance calculations
- **Map Settings**: User-configurable preferences with localStorage persistence

### State Management (Redux)
- **Auth Slice**: User authentication, JWT token management
- **Commerce Slice**: Nearby search, filtering, commerce details
- **Product Slice**: Product catalog, search, commerce products
- **Cart Slice**: Shopping cart with localStorage persistence
- **Location Slice**: Geolocation management and position tracking
- **Order Slice**: Order creation and management
- **Notification Slice**: Global notification system

### Modern UI Components
- **Modal System**: Overlay navigation with high z-index (9999+)
- **Responsive Sidebar**: Collapsible navigation with smooth transitions
- **Loading States**: Skeleton loaders and progress indicators
- **Error Handling**: Global error boundaries and user feedback
- **Accessibility**: ARIA labels and keyboard navigation support

## Deployment Configuration

### Render.com Setup
- **Build Command**: `./bin/render-build.sh` (includes frontend build)
- **Start Command**: `bundle exec rails server`  
- **Environment Variables**: `RAILS_MASTER_KEY`, `DATABASE_URL`, `NODE_ENV`
- **Database**: PostgreSQL with PostGIS extension for spatial queries
- **Static Files**: Vite-built frontend assets served by Rails

### Modern Asset Pipeline
- **Frontend**: Vite build tool with hot reload in development
- **Backend**: Rails serves compiled React SPA as static files
- **Production**: Assets optimized and cached with proper headers
- **Development**: CORS configured for separate frontend/backend servers

## Testing Setup
- **Backend**: RSpec with basic configuration in `.rspec`
- **Frontend**: Potential for Vitest/Jest testing (not yet implemented)
- **Coverage**: Minimal test coverage currently implemented
- **Test Database**: Uses database_cleaner for test isolation
- **API Tests**: Controller tests located in `spec/controllers/`

## Migration Status & Roadmap

### ✅ **Completed Features (75% Migration)**
- Core architecture (Redux, API, routing)
- Authentication and user management
- Geolocation and interactive mapping
- Commerce discovery and product browsing
- Shopping cart and basic ordering
- Real-time tracking for ambulant merchants
- Responsive UI with modern design

### ⚠️ **Partially Implemented**
- Order workflow (basic implementation, needs status management)
- User address management (API exists, UI integration needed)
- Email notifications (backend ready, frontend integration needed)

### ❌ **Missing Features (from AngularJS)**
- **Product Interest System**: Manifestation d'intérêt for out-of-stock products
- **Vendor Management**: Specialized modals for merchant operations
- **Reviews & Ratings**: Product and commerce rating system
- **Favorites/Wishlist**: User favorites functionality
- **Advanced Search**: Autocomplete and suggestion system
- **Messaging**: Vendor-customer communication
- **Newsletter**: Email marketing integration

### 🎯 **Priority Implementation Order**
1. **High Priority**: Product interest system, complete order workflow
2. **Medium Priority**: Reviews system, advanced vendor features
3. **Low Priority**: Messaging, newsletter, advanced search features

## Key Technical Decisions

### Why React over AngularJS
- **Modern ecosystem**: Better tooling, TypeScript support, active community
- **Performance**: Virtual DOM, better bundle splitting, faster loading
- **State management**: Redux provides predictable state updates
- **Mobile experience**: Better responsive design and touch interactions
- **Maintainability**: Component-based architecture, better code organization

### Architecture Choices
- **API-first design**: Clean separation of concerns, enables mobile app development
- **JWT authentication**: Stateless, scalable authentication
- **Redux Toolkit**: Simplified Redux with better developer experience
- **Tailwind CSS**: Utility-first CSS for rapid UI development
- **TypeScript**: Type safety and better developer experience