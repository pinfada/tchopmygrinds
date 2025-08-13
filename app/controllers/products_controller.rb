class ProductsController < ApplicationController
  include ApiResponse
  include EnhancedErrorHandling
  
  authorize_resource
  before_action :set_product, only: [:show, :edit, :update, :destroy]
  before_action :set_commerce, only: [:create, :new]
  before_action :set_pagination_params, only: [:index, :search_nearby]

  respond_to :json
  # GET /products
  # GET /products.json
  def index
    with_logging do
      commerceid = params[:commerce_id]
      
      products_query = if commerceid.present? 
        @commerce = Commerce.find(commerceid)
        log_business_event('PRODUCTS_FILTERED_BY_COMMERCE', { commerce_id: commerceid })
        @commerce.products
      else
        Product.all
      end
      
      # Utiliser la pagination avec curseur pour de meilleures performances
      base_relation = products_query
        .includes(:commerces)
        .where("unitsinstock > 0")
      
      # Déterminer le type de pagination selon les paramètres
      if use_cursor_pagination?
        cursor_options = {
          page_size: @per_page,
          after: params[:after],
          before: params[:before],
          cursor_field: params[:sort_by]&.to_sym || :created_at,
          direction: params[:sort_direction]&.to_sym || :desc
        }
        
        result = paginate_with_cursor(base_relation, **cursor_options)
        
        # Sérialiser les données
        result[:data] = result[:data].map { |product| serialize_product(product) }
        
        log_business_event('PRODUCTS_LISTED_CURSOR', { 
          total_fetched: result[:data].size,
          page_size: @per_page,
          cursor_field: cursor_options[:cursor_field]
        })
        
        render_cursor_paginated(result)
      else
        # Pagination classique pour compatibilité
        @products = base_relation
          .page(@page)
          .per(@per_page)
          .order(:nom)
        
        log_business_event('PRODUCTS_LISTED', { 
          total_count: @products.total_count, 
          page: @page, 
          per_page: @per_page 
        })
        
        render_paginated(@products, method(:serialize_product))
      end
    end
  end

  # GET /products/1
  # GET /products/1.json
  def show
    with_logging do
      log_business_event('PRODUCT_VIEWED', { product_id: @product.id, product_name: @product.nom })
      render_success(serialize_product(@product))
    end
  end

  # GET /products/new
  def new
    # @product = Product.new
    @product = @commerce.products.new
    respond_with(@product)
  end

  # GET /products/1/edit
  def edit
    respond_with(@product)
  end

  # POST /products
  # POST /products.json
  def create
    # @product = Product.new(product_params)
    # @product.save
    @product = @commerce.products.create(product_params)
    respond_with(@product)

    #respond_to do |format|
    #  if @product.save
    #    format.html { redirect_to @product, notice: 'Product was successfully created.' }
    #    format.json { render :show, status: :created, location: @product }
    #  else
    #    format.html { render :new }
    #    format.json { render json: @product.errors, status: :unprocessable_entity }
    #  end
    #end
  end

  # PATCH/PUT /products/1
  # PATCH/PUT /products/1.json
  def update
    respond_to do |format|
      if @product.update(product_params)
        format.html { redirect_to @product, notice: 'Product was successfully updated.' }
        format.json { render :show, status: :ok, location: @product }
      else
        format.html { render :edit }
        format.json { render json: @product.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /products/1
  # DELETE /products/1.json
  def destroy
    @product.destroy
    respond_to do |format|
      format.html { redirect_to products_url, notice: 'Product was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  # GET /commerces/listproduct
  def listproduct
    search_name = params[:name_query]
    lat_name = params[:lat_query]
    lng_name = params[:lng_query]
    @product = Product.find_by(name: search_name)
    commerces = @product.commerces
    recupcommerce = commerces.includes(:categorizations).near([lat_name, lng_name], 10, units: :km, order: "")
    respond_with recupcommerce
    #@commerces = produit.commerces.near([47.4742699, -0.5490779], 50, units: :km)
  end

  # GET /products/listcommerce
  # AMÉLIORATION : Recherche géolocalisée optimisée de produits
  # Récupère les commerces vendant un produit spécifique dans un rayon donné
  def listcommerce
    search_name = params[:name_query]
    lat_name = params[:lat_query]&.to_f
    lng_name = params[:lng_query]&.to_f
    radius = params[:radius]&.to_i || 25 # Rayon par défaut : 25km
    
    if search_name.blank? || lat_name.nil? || lng_name.nil?
      render json: { error: "Paramètres manquants: name_query, lat_query, lng_query" }, status: :bad_request
      return
    end
    
    begin
      # Recherche flexible : nom exact puis recherche partielle
      products = Product.where("LOWER(nom) LIKE LOWER(?)", "%#{search_name.strip}%")
                       .where("unitsinstock > 0")
      
      if products.empty?
        render json: [], status: :ok
        return
      end
      
      results = []
      
      products.each do |product|
        # Récupérer les commerces vendant ce produit dans le rayon spécifié
        commerces_with_product = product.commerces
                                       .includes(:user, :categorizations)
                                       .near([lat_name, lng_name], radius, units: :km)
        
        commerces_with_product.each do |commerce|
          # Vérifier que le commerce a bien ce produit en stock
          categorization = commerce.categorizations.find_by(product: product)
          next unless categorization
          
          distance = commerce.distance_to([lat_name, lng_name])
          
          results << {
            # Informations commerce
            commerceId: commerce.id,
            name: commerce.nom,
            ville: commerce.ville,
            latitude: commerce.latitude,
            longitude: commerce.longitude,
            distance: distance.round(2),
            commerceType: commerce.user&.statut_type || 'sedentary',
            
            # Informations produit
            productId: product.id,
            productName: product.nom,
            prix: product.unitprice,
            stock: product.unitsinstock,
            
            # Meta informations
            searchQuery: search_name,
            userLatitude: lat_name,
            userLongitude: lng_name
          }
        end
      end
      
      # Trier par distance croissante
      results.sort_by! { |r| r[:distance] }
      
      render json: results, status: :ok
      
    rescue StandardError => e
      Rails.logger.error "Erreur dans listcommerce: #{e.message}"
      render json: { error: "Erreur interne du serveur" }, status: :internal_server_error
    end
  end

  # GET /products/search_nearby
  # NOUVELLE MÉTHODE : Recherche avancée de produits avec suggestions et pagination optimisée
  def search_nearby
    with_logging do
      query = params[:q]
      lat = params[:lat]&.to_f  
      lng = params[:lng]&.to_f
      radius = params[:radius]&.to_i || 25
      
      if query.blank?
        # Retourner les produits populaires si pas de requête
        popular_products = Product.joins(:orderdetails)
                                 .group(:nom)
                                 .order('COUNT(orderdetails.id) DESC')
                                 .limit(10)
                                 .pluck(:nom)
        
        log_business_event('POPULAR_PRODUCTS_REQUESTED', { count: popular_products.size })
        render_success({ suggestions: popular_products })
        return
      end
      
      # Recherche textuelle flexible
      base_relation = Product.where("LOWER(nom) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?)", 
                              "%#{query}%", "%#{query}%")
                       .where("unitsinstock > 0")
      
      if lat && lng
        # Utiliser la pagination géospatiale optimisée
        cursor_options = {
          page_size: params[:page_size]&.to_i || 20,
          after: params[:after],
          before: params[:before]
        }
        
        result = paginate_geospatial(
          base_relation.joins(:commerces),
          lat: lat,
          lng: lng, 
          radius: radius,
          **cursor_options
        )
        
        # Enrichir les données avec les informations de commerce
        enriched_data = result[:data].map do |product|
          # Trouver le commerce le plus proche pour ce produit
          closest_commerce = product.commerces
                                   .near([lat, lng], radius, units: :km)
                                   .first
          
          {
            productId: product.id,
            productName: product.nom,
            productDescription: product.description,
            prix: product.unitprice,
            stock: product.unitsinstock,
            quantite_par_unite: product.quantityperunit,
            
            commerceId: closest_commerce&.id,
            commerceName: closest_commerce&.nom,
            ville: closest_commerce&.ville,
            distance: closest_commerce&.distance_to([lat, lng])&.round(2),
            commerceType: closest_commerce&.user&.statut_type,
            
            searchQuery: query
          }
        end
        
        result[:data] = enriched_data
        
        log_business_event('PRODUCTS_SEARCH_GEOSPATIAL', { 
          query: query, 
          lat: lat, 
          lng: lng, 
          radius: radius,
          results_count: enriched_data.size
        })
        
        render_cursor_paginated(result)
      else
        # Recherche simple sans géolocalisation avec pagination curseur
        cursor_options = {
          page_size: params[:page_size]&.to_i || 20,
          after: params[:after],
          before: params[:before],
          cursor_field: :created_at,
          direction: :desc
        }
        
        result = paginate_search(
          base_relation,
          query: query,
          search_fields: ['nom', 'description'],
          **cursor_options
        )
        
        # Sérialiser avec informations basiques des commerces
        result[:data] = result[:data].map do |product|
          {
            productId: product.id,
            productName: product.nom,
            productDescription: product.description,
            prix: product.unitprice,
            stock: product.unitsinstock,
            quantite_par_unite: product.quantityperunit,
            commerces: product.commerces.select(:id, :nom, :ville).limit(3).as_json(only: [:id, :nom, :ville]),
            searchQuery: query
          }
        end
        
        log_business_event('PRODUCTS_SEARCH_TEXT', { 
          query: query, 
          results_count: result[:data].size 
        })
        
        render_cursor_paginated(result)
      end
    end
  end

  private
    def set_product
      @product = Product.find(params[:id])
    rescue ActiveRecord::RecordNotFound
      render_not_found("Product") and return
    end

    def set_commerce
      @commerce = Commerce.find(params[:commerce_id])
    rescue ActiveRecord::RecordNotFound
      render_not_found("Commerce") and return
    end
    
    def set_pagination_params
      @page = params[:page]&.to_i || 1
      @per_page = [params[:per_page]&.to_i || 20, 100].min # Max 100 items per page
    end
    
    # Détermine si on doit utiliser la pagination avec curseur
    def use_cursor_pagination?
      # Utiliser cursor si explicitement demandé ou pour de gros volumes
      params[:cursor].present? || 
      params[:after].present? || 
      params[:before].present? ||
      (@per_page > 50) # Pour de grandes pages, utiliser curseur
    end
    
    def serialize_product(product)
      {
        id: product.id,
        nom: product.nom,
        description: product.description,
        prix_unitaire: product.unitprice,
        stock: product.unitsinstock,
        quantite_par_unite: product.quantityperunit,
        commerces_count: product.commerces.count,
        created_at: product.created_at
      }
    end

    def product_params
      params.require(:product).permit(:nom, :quantityperunit, :unitprice, :unitsinstock, :unitsonorder, :commerce_id)
    end

end
