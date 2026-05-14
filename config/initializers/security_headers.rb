# Default security headers added to every Rails response. CSP is configured
# separately in content_security_policy.rb (production only). These headers
# are safe in all environments.

Rails.application.config.action_dispatch.default_headers = (
  Rails.application.config.action_dispatch.default_headers || {}
).merge(
  'X-Content-Type-Options' => 'nosniff',
  'X-Frame-Options'        => 'DENY',
  'Referrer-Policy'        => 'strict-origin-when-cross-origin',
  'X-XSS-Protection'       => '0' # modern browsers ignore this; explicit "0" disables legacy heuristics
)
