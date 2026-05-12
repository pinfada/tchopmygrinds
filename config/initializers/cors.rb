# CORS configuration for TchopMyGrinds (React frontend + Rails API).
# JWT auth means no cookies, so `credentials: false` everywhere.
#
# Wildcard origins are NOT used. Each environment whitelists its own origins.
# Preflight (OPTIONS) is handled by rack-cors via the resource declarations
# below — controllers must not emit Access-Control-Allow-Origin themselves.

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  if Rails.env.production?
    allow do
      origins ENV.fetch("FRONTEND_URL", "https://tchopmygrinds.onrender.com")

      resource "/api/v1/*",
        headers: %w[Authorization Content-Type Accept Origin],
        methods: %i[get post put patch delete options head],
        credentials: false,
        expose: %w[Authorization],
        max_age: 86_400
    end
  else
    allow do
      # Development origins (Vite dev server) — 3002 is a fallback when 3001 is taken
      origins "http://localhost:3001", "http://127.0.0.1:3001",
              "http://localhost:3002", "http://127.0.0.1:3002"

      # Public consultation endpoints (no auth required)
      resource "/api/v1/commerces*",
        headers: :any,
        methods: %i[get options head],
        credentials: false,
        max_age: 86_400

      # Products: index/show are public, but create/update/destroy need auth.
      # rack-cors picks the FIRST matching resource, so we declare the full
      # method set here (per-action auth is still enforced in the controller).
      resource "/api/v1/products*",
        headers: %w[Authorization Content-Type Accept Origin],
        methods: %i[get post put patch delete options head],
        credentials: false,
        expose: %w[Authorization],
        max_age: 86_400

      # Auth endpoints — must expose the Authorization header so React reads JWT
      resource "/api/v1/auth*",
        headers: %w[Authorization Content-Type Accept Origin],
        methods: %i[get post patch delete options head],
        credentials: false,
        expose: %w[Authorization],
        max_age: 86_400

      # All other authenticated API endpoints
      resource "/api/v1/*",
        headers: %w[Authorization Content-Type Accept Origin],
        methods: %i[get post put patch delete options head],
        credentials: false,
        expose: %w[Authorization],
        max_age: 86_400
    end
  end
end
