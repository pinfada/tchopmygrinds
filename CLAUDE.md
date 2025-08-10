# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TchopMyGrinds is a location-based e-commerce platform connecting local merchants with customers. It's built as a Ruby on Rails application with an AngularJS frontend, focusing on geolocation-based commerce discovery within a 50km radius.

## Development Commands

### Environment Setup
```bash
# Install dependencies
bundle install
yarn install --check-files  # or bower install for legacy frontend deps

# Database setup
rails db:setup
rails db:migrate
rails db:seed
```

### Running the Application
```bash
# Development server
rails server

# Console access
rails console

# Database console
rails dbconsole
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

### Backend Structure (Rails 6.0)
- **Authentication**: Devise with role-based authorization (CanCanCan)
- **Geolocation**: Geocoder gem for location-based queries and proximity searches
- **Database**: PostgreSQL with spatial capabilities for latitude/longitude storage
- **Email**: SendGrid integration with comprehensive notification system
- **Admin Interface**: RailsAdmin for backend management

### Frontend Structure (AngularJS 1.8)
- **Main Module**: `marketApp` located in `app/assets/javascripts/app.js.erb`
- **Controllers**: Organized in `app/assets/partials/controllers/`
- **Services**: Location services, commerce data, cart management in `app/assets/partials/services/`
- **Templates**: Modular HTML templates in `app/assets/javascripts/Templates/`
- **Mapping**: Leaflet.js integration for interactive maps with geolocation

### Key Models and Relationships
```
User (merchant/buyer) ←→ Commerce (shop) ←→ Product (inventory)
User ←→ Order ←→ OrderDetail ←→ Product
User ←→ Address (delivery locations)
```

### Core Controllers
- **CommercesController**: Location-based merchant search (`/commerces/listcommerce`)
- **ProductsController**: Product catalog with location filtering
- **OrdersController**: E-commerce workflow with status management
- **PagesController**: Main SPA bootstrap and utility endpoints (`/serveraddress`, `/agrimer`)

## Development Guidelines

### Working with Location Features
- All location queries use Geocoder gem with 50km radius searches
- Commerce and Address models have geocoding capabilities
- Frontend uses browser geolocation API integrated with Angular services

### User Roles and Authorization
Three user types:
- `itinerant`: Mobile merchants
- `sedentary`: Fixed-location merchants  
- `others`: Regular buyers
- Authorization handled by CanCanCan abilities in `app/models/ability.rb`

### Frontend Development
- AngularJS controllers are in CoffeeScript (`.coffee` files)
- Templates use Bootstrap 3.4.1 with custom SCSS
- Shopping cart functionality provided by ngCart module
- Maps use Leaflet with custom marker management

### API Development
- Controllers respond to JSON with `respond_to :json`
- Location-based endpoints expect lat/lng parameters
- All commerce/product endpoints include distance calculations

### Email System
- UserMailer handles order notifications and status changes
- Templates in `app/views/user_mailer/`
- Order status changes trigger automatic emails
- Newsletter functionality available via NewslettersController

### Database Migrations
- Schema includes spatial columns for geolocation
- Custom migrations for role management and order workflow
- Categorizations table handles many-to-many Product-Commerce relationships

## Deployment Configuration

### Render.com Setup
- **Build Command**: `./bin/render-build.sh`
- **Start Command**: `bundle exec rails server`  
- **Environment Variables**: `RAILS_MASTER_KEY`, `DATABASE_URL`
- **Database**: PostgreSQL free tier

### Asset Pipeline
- Rails asset pipeline with Bower integration
- Assets precompiled during deployment
- Frontend dependencies managed via Bower in `vendor/assets/bower_components/`

## Testing Setup
- **Framework**: RSpec with basic configuration in `.rspec`
- **Coverage**: Minimal test coverage currently implemented
- **Test Database**: Uses database_cleaner for test isolation
- Controller tests located in `spec/controllers/`