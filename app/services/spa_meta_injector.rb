# Computes SEO meta (title, description, canonical, Open Graph, JSON-LD)
# for SPA routes served by PagesController#react_app, so that the FIRST
# HTML response Googlebot and link-preview crawlers receive is already
# populated. The client-side useSeo hook still runs and may overwrite
# these on SPA navigation; the value here is for cold loads / crawlers.
class SpaMetaInjector
  DEFAULT_TITLE       = 'TchopMyGrinds — Marketplace local de produits exotiques'
  DEFAULT_DESCRIPTION = "Achetez vos produits frais et exotiques auprès de commerçants locaux géolocalisés à moins de 50 km. Livraison ou retrait."
  DEFAULT_IMAGE_PATH  = '/og-cover.jpg'
  CACHE_TTL           = 10.minutes

  Result = Struct.new(
    :title, :description, :canonical, :og_type, :image, :noindex, :jsonld,
    keyword_init: true
  )

  def initialize(request)
    @request = request
    @path    = request.path
    @host    = ENV['SITE_URL'].presence&.chomp('/') || "#{request.protocol}#{request.host_with_port}"
  end

  def call
    Rails.cache.fetch(cache_key, expires_in: CACHE_TTL) { build }
  end

  private

  attr_reader :path, :host, :request

  def cache_key
    "spa_meta:v2:#{path}"
  end

  def build
    case path
    when '/'              then home
    when '/commerces'     then commerce_list
    when '/products'      then product_list
    when %r{\A/commerces/(\d+)\z} then commerce_detail(Regexp.last_match(1).to_i)
    when %r{\A/products/(\d+)\z}  then product_detail(Regexp.last_match(1).to_i)
    when '/cart', '/checkout', '/orders', '/profile', '/auth', '/dashboard',
         '/interests', '/messages', '/unauthorized'
      private_default
    else
      generic_default
    end
  end

  # --- Public routes -------------------------------------------------------

  def home
    Result.new(
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      canonical: absolute('/'),
      og_type: 'website',
      image: absolute(DEFAULT_IMAGE_PATH),
      noindex: false,
      jsonld: [breadcrumb([{ name: 'Accueil', path: '/' }])]
    )
  end

  def commerce_list
    Result.new(
      title: 'Commerces locaux près de chez vous — TchopMyGrinds',
      description: 'Découvrez les commerces locaux (fixes et ambulants) qui vendent des produits frais à moins de 50 km. Filtrez par catégorie, note et type.',
      canonical: absolute('/commerces'),
      og_type: 'website',
      image: absolute(DEFAULT_IMAGE_PATH),
      noindex: false,
      jsonld: [breadcrumb([{ name: 'Accueil', path: '/' }, { name: 'Commerces', path: '/commerces' }])]
    )
  end

  def product_list
    Result.new(
      title: 'Produits frais — TchopMyGrinds',
      description: 'Parcourez le catalogue des produits disponibles chez les commerçants locaux : bananes plantain, fruits, légumes, tubercules et épices. Achetez en circuit court.',
      canonical: absolute('/products'),
      og_type: 'website',
      image: absolute(DEFAULT_IMAGE_PATH),
      noindex: false,
      jsonld: [breadcrumb([{ name: 'Accueil', path: '/' }, { name: 'Produits', path: '/products' }])]
    )
  end

  def commerce_detail(id)
    commerce = Commerce.find_by(id: id)
    return generic_default unless commerce

    name        = commerce.name.to_s
    description = (commerce.details.presence || "#{name} — commerce local sur TchopMyGrinds. Produits frais.").to_s.truncate(160, separator: ' ')

    business_type = commerce.respond_to?(:type) && commerce.type.to_s == 'itinerant' ? 'Organization' : 'LocalBusiness'

    business = {
      '@context' => 'https://schema.org',
      '@type'    => business_type,
      '@id'      => "#{host}/commerces/#{commerce.id}#business",
      'name'     => name,
      'description' => commerce.details.presence,
      'telephone'   => commerce.phone.presence,
      'url'         => "#{host}/commerces/#{commerce.id}",
      'image'       => commerce.image_url.presence
    }.compact

    if commerce.adress1.present? || commerce.city.present?
      business['address'] = {
        '@type'           => 'PostalAddress',
        'streetAddress'   => commerce.adress1.presence,
        'addressLocality' => commerce.city.presence,
        'postalCode'      => commerce.postal.presence,
        'addressCountry'  => commerce.country.presence
      }.compact
    end

    if commerce.latitude && commerce.longitude
      business['geo'] = {
        '@type'    => 'GeoCoordinates',
        'latitude'  => commerce.latitude,
        'longitude' => commerce.longitude
      }
    end

    if commerce.rating_count.to_i > 0 && commerce.rating.to_f > 0
      business['aggregateRating'] = {
        '@type'       => 'AggregateRating',
        'ratingValue' => commerce.rating,
        'reviewCount' => commerce.rating_count
      }
    end

    Result.new(
      title: "#{name} — Commerce local sur TchopMyGrinds",
      description: description,
      canonical: absolute("/commerces/#{commerce.id}"),
      og_type: 'website',
      image: commerce.image_url.presence || absolute(DEFAULT_IMAGE_PATH),
      noindex: false,
      jsonld: [
        breadcrumb([
          { name: 'Accueil',  path: '/' },
          { name: 'Commerces', path: '/commerces' },
          { name: name,       path: "/commerces/#{commerce.id}" }
        ]),
        business
      ]
    )
  end

  def product_detail(id)
    product = Product.includes(:commerce).find_by(id: id)
    return generic_default unless product

    commerce_name = product.commerce&.name.to_s
    name          = product.name.to_s
    description   = (product.description.presence ||
                     "#{name} (#{product.quantityperunit}) chez #{commerce_name.presence || 'un commerçant local'}.").to_s.truncate(160, separator: ' ')

    offer = {
      '@type'         => 'Offer',
      'price'         => product.unitprice,
      'priceCurrency' => 'EUR',
      'availability'  => (product.available && product.unitsinstock.to_i > 0) \
        ? 'https://schema.org/InStock' \
        : 'https://schema.org/OutOfStock',
      'url'           => "#{host}/products/#{product.id}"
    }
    offer['seller'] = { '@type' => 'Organization', 'name' => commerce_name } if commerce_name.present?

    product_jsonld = {
      '@context'    => 'https://schema.org',
      '@type'       => 'Product',
      '@id'         => "#{host}/products/#{product.id}#product",
      'name'        => name,
      'description' => product.description.presence,
      'image'       => product.image_url.presence ? absolute(product.image_url) : nil,
      'category'    => product.category.presence,
      'offers'      => offer
    }.compact

    Result.new(
      title: [name, commerce_name.presence, 'TchopMyGrinds'].compact.join(' — '),
      description: description,
      canonical: absolute("/products/#{product.id}"),
      og_type: 'product',
      image: product.image_url.presence ? absolute(product.image_url) : absolute(DEFAULT_IMAGE_PATH),
      noindex: false,
      jsonld: [
        breadcrumb([
          { name: 'Accueil',  path: '/' },
          { name: 'Produits', path: '/products' },
          { name: name,       path: "/products/#{product.id}" }
        ]),
        product_jsonld
      ]
    )
  end

  # --- Private / fallback --------------------------------------------------

  def private_default
    Result.new(
      title: 'TchopMyGrinds',
      description: DEFAULT_DESCRIPTION,
      canonical: absolute(path),
      og_type: 'website',
      image: absolute(DEFAULT_IMAGE_PATH),
      noindex: true,
      jsonld: []
    )
  end

  def generic_default
    Result.new(
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      canonical: absolute(path),
      og_type: 'website',
      image: absolute(DEFAULT_IMAGE_PATH),
      noindex: false,
      jsonld: []
    )
  end

  # --- Helpers -------------------------------------------------------------

  def breadcrumb(items)
    {
      '@context'        => 'https://schema.org',
      '@type'           => 'BreadcrumbList',
      'itemListElement' => items.each_with_index.map do |item, idx|
        {
          '@type'    => 'ListItem',
          'position' => idx + 1,
          'name'     => item[:name],
          'item'     => absolute(item[:path])
        }
      end
    }
  end

  def absolute(p)
    return host if p.blank?
    p.start_with?('http') ? p : "#{host}#{p.start_with?('/') ? '' : '/'}#{p}"
  end
end
