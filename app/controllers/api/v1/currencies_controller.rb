class Api::V1::CurrenciesController < Api::V1::BaseController
  # Public endpoint — the registry drives price formatting on every product
  # card, so blocking it behind auth would gate the entire UI shell.
  skip_before_action :authenticate_user_from_token!, only: [:index]

  # The BaseController defaults to `Cache-Control: private, no-store` because
  # most API responses are user-scoped. Currency data is the opposite: stable,
  # public, identical for every visitor — overriding *after* `set_response_headers`
  # ran is the only place where the override sticks.
  after_action :set_public_cache_headers, only: [:index]

  # GET /api/v1/currencies
  #
  # Returns the list of supported currencies. Stable, low-cardinality (3-5
  # rows): no pagination, no filters. The frontend caches this in
  # localStorage and refreshes on cold load.
  def index
    currencies = Currency.order(:code).map do |c|
      { code: c.code, label: c.label, decimals: c.decimals, suffix: c.suffix }
    end
    render_success({ currencies: currencies })
  end

  private

  # Allow shared caches (CDN, browser) to hold the registry for 5 minutes,
  # then serve stale for an hour while revalidating in the background.
  # ETag/Last-Modified are added by Rails' `fresh_when` helpers if we want
  # them later; for now max-age is enough since the payload is ~200 bytes.
  def set_public_cache_headers
    response.headers['Cache-Control'] = 'public, max-age=300, stale-while-revalidate=3600'
    response.headers.delete('Pragma')
  end
end
