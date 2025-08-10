class ProductsController < ApplicationController
  # before_action :authenticate_user!
  authorize_resource
  #before_action :searchnear
  before_action :set_product, only: [:show, :edit, :update, :destroy]
  before_action :set_commerce, only: [:create, :new]

  respond_to :json
  # GET /products
  # GET /products.json
  def index
    #@products = Product.all.order("created_at ASC")
    #products = Product.all.group(:name)
    #@products = products.sum(:unitsinstock)
    commerceid = params[:commerce_id]
    if commerceid.present? 
      @commerce = Commerce.find(commerceid)
      @products = @commerce.products
    else
      @products = Product.all.order("created_at ASC")
    end
    
    respond_with(@products)
  end

  # GET /products/1
  # GET /products/1.json
  def show
    respond_with(@product)
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
  # NOUVELLE MÉTHODE : Recherche avancée de produits avec suggestions
  def search_nearby
    query = params[:q]
    lat = params[:lat]&.to_f  
    lng = params[:lng]&.to_f
    radius = params[:radius]&.to_i || 25
    limit = params[:limit]&.to_i || 50
    
    if query.blank?
      # Retourner les produits populaires si pas de requête
      popular_products = Product.joins(:orderdetails)
                               .group(:nom)
                               .order('COUNT(orderdetails.id) DESC')
                               .limit(10)
                               .pluck(:nom)
      
      render json: { suggestions: popular_products }, status: :ok
      return
    end
    
    # Recherche textuelle flexible
    products = Product.where("LOWER(nom) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?)", 
                            "%#{query}%", "%#{query}%")
                     .where("unitsinstock > 0")
                     .limit(limit)
    
    if lat && lng
      # Recherche géolocalisée
      results = []
      
      products.each do |product|
        product.commerces.near([lat, lng], radius, units: :km).each do |commerce|
          results << {
            productId: product.id,
            productName: product.nom,
            productDescription: product.description,
            prix: product.unitprice,
            stock: product.unitsinstock,
            
            commerceId: commerce.id,
            commerceName: commerce.nom,
            ville: commerce.ville,
            distance: commerce.distance_to([lat, lng]).round(2),
            commerceType: commerce.user&.statut_type
          }
        end
      end
      
      results.sort_by! { |r| r[:distance] }
      render json: results, status: :ok
    else
      # Recherche simple sans géolocalisation
      render json: products.as_json(include: { commerces: { only: [:id, :nom, :ville] } }), status: :ok
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_product
      @product = Product.find(params[:id])
    end

    def set_commerce
     @commerce = Commerce.find(params[:commerce_id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def product_params
      params.require(:product).permit(:name, :quantityperunit, :unitprice, :unitsinstock, :unitsonorder, :commerce_id)
    end

end
