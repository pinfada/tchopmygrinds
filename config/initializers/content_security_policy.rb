# Content-Security-Policy is enabled in production only. Development keeps
# it off so Vite HMR (eval, inline) and rails-admin assets stay usable.
#
# The policy below is intentionally tight for the React SPA served by
# pages#react_app. If you embed third-party widgets (Stripe, maps, etc.),
# add their origins explicitly to the relevant directives.

if Rails.env.production?
  Rails.application.configure do
    config.content_security_policy do |policy|
      policy.default_src :self
      policy.font_src    :self, :https, :data
      policy.img_src     :self, :https, :data, :blob
      policy.object_src  :none
      policy.script_src  :self
      policy.style_src   :self, :https, :unsafe_inline # SPA frameworks frequently inline style attrs
      policy.connect_src :self, :https
      policy.frame_ancestors :none
      policy.base_uri    :self
      policy.form_action :self
    end

    # Per-request nonce, attached to script-src so inline <script nonce="..."> is
    # the only inline JS that runs.
    config.content_security_policy_nonce_generator = ->(request) { SecureRandom.base64(16) }
    config.content_security_policy_nonce_directives = %w(script-src)
  end
end
