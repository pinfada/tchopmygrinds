class SitemapController < ApplicationController
  # Public sitemap, no auth required.
  skip_before_action :verify_authenticity_token, raise: false

  STATIC_ROUTES = [
    { path: '/',          changefreq: 'daily',  priority: '1.0' },
    { path: '/commerces', changefreq: 'daily',  priority: '0.9' },
    { path: '/products',  changefreq: 'daily',  priority: '0.9' },
  ].freeze

  CACHE_TTL  = 1.hour
  PER_TYPE   = 5_000

  def show
    expires_in CACHE_TTL, public: true
    @host = sitemap_host

    @entries = build_entries

    respond_to do |format|
      format.xml { render layout: false }
      format.any { render xml: render_to_string(template: 'sitemap/show', formats: [:xml]) }
    end
  end

  private

  def build_entries
    static = STATIC_ROUTES.map do |r|
      { loc: absolute(r[:path]), changefreq: r[:changefreq], priority: r[:priority] }
    end

    commerces = Commerce
      .order(updated_at: :desc)
      .limit(PER_TYPE)
      .pluck(:id, :updated_at)
      .map do |id, updated_at|
        {
          loc: absolute("/commerces/#{id}"),
          lastmod: updated_at&.iso8601,
          changefreq: 'weekly',
          priority: '0.7'
        }
      end

    products = Product
      .order(updated_at: :desc)
      .limit(PER_TYPE)
      .pluck(:id, :updated_at)
      .map do |id, updated_at|
        {
          loc: absolute("/products/#{id}"),
          lastmod: updated_at&.iso8601,
          changefreq: 'weekly',
          priority: '0.6'
        }
      end

    static + commerces + products
  end

  def absolute(path)
    "#{@host}#{path}"
  end

  def sitemap_host
    ENV['SITE_URL'].presence&.chomp('/') || "#{request.protocol}#{request.host_with_port}"
  end
end
