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

  # GET /commerces/listcommerce
  # Recuperation de la liste des commerces en fonction :
  # - Des coordonnées de l'utilisateur
  # - Du produit
  def listcommerce
    recuproduct = []
    search_name = params[:name_query]
    lat_name = params[:lat_query]
    lng_name = params[:lng_query]
    if search_name.present? && lat_name.present? && lng_name.present?
      @product = Product.find_by(name: search_name)
      commerces = @product.commerces
      recupcommerce = commerces.includes(:categorizations).near([lat_name, lng_name], 10, units: :km, order: "")
      recupcommerce.each do |commerce|
      	produit = commerce.products.where(name: search_name)
      	distance = commerce.distance_to([lat_name, lng_name])
      	recuproduct.push({name: commerce.name, distance: distance, prix: produit[0].unitprice, stock: produit[0].unitsinstock})
      end
      respond_with recuproduct
    end
    #@commerces = produit.commerces.near([47.4742699, -0.5490779], 50, units: :km)
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
