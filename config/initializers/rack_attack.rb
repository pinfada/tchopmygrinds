# Rate-limit hot abuse vectors. Storage is whatever Rack::Attack defaults to
# (Rails.cache: in-memory in dev/test, ideally Redis or Memcached in prod —
# the existing redis gem is already in the Gemfile).
#
# Disabled in test to keep the spec suite hermetic; specs that want to verify
# throttle behaviour can re-enable Rack::Attack.enabled = true locally.

require 'rack/attack'

Rack::Attack.enabled = !Rails.env.test?

class Rack::Attack
  # Trust the X-Forwarded-For chain on Render (single reverse proxy). If the
  # deployment changes, revisit how `req.ip` is derived.
  Rack::Attack.throttled_responder = lambda do |request|
    [
      429,
      { 'Content-Type' => 'application/json' },
      [{ error: true, message: 'Trop de requêtes — réessayez plus tard.', code: 'RATE_LIMITED' }.to_json]
    ]
  end

  # --- Authentication endpoints -------------------------------------------
  # Brute force protection on login: 5 attempts/minute/IP, 20/hour/IP.
  throttle('auth/login by IP', limit: 5, period: 1.minute) do |req|
    req.ip if req.path == '/api/v1/auth/login' && req.post?
  end

  throttle('auth/login by IP slow', limit: 20, period: 1.hour) do |req|
    req.ip if req.path == '/api/v1/auth/login' && req.post?
  end

  # Account-creation flood: 5/hour/IP. Stops mass sign-up scripts.
  throttle('auth/register by IP', limit: 5, period: 1.hour) do |req|
    req.ip if req.path == '/api/v1/auth/register' && req.post?
  end

  # --- ProductInterest mass-notification protection -----------------------
  # A buyer can create N manifestations per hour. The endpoint can trigger
  # email notifications to merchants on save, so we throttle by user when
  # known, otherwise by IP.
  throttle('product_interests/create', limit: 10, period: 1.hour) do |req|
    if req.path == '/api/v1/product_interests' && req.post?
      auth = req.env['HTTP_AUTHORIZATION'].to_s
      # Use the raw bearer-token fingerprint as the key (avoids hot-parsing JWT).
      auth.presence || req.ip
    end
  end
end
