class CommercesController < ApplicationController
#  before_action :authenticate_user!, :except => [:show, :index, :search]
  authorize_resource
  before_action :set_commerce, only: [:show, :edit, :update, :destroy]
  before_action :set_user, only: [:create, :new]

  respond_to :json

  def index
    userid = params[:user_id]
    if userid.present? 
      @user = User.find(userid)
      @commerces = @user.commerces
    else
      @commerces = Commerce.all
    end
    respond_with(@commerces)
  end

  def show
    respond_with(@commerce)
  end

  def new
#   @commerce = Commerce.new
    @commerce = @user.commerces.new
    respond_with(@commerce)
  end

  def edit
    respond_with(@commerce)
  end

  def create
#   @commerce = Commerce.create(commerce_params)
    @commerce = @user.commerces.create(commerce_params)
    @commerce.save
    redirect_to root_url
#    respond_with(@commerce)
  end

  def update
    @commerce.update(commerce_params)
    respond_with(@commerce)
  end

  def destroy
    @commerce.destroy
    respond_with(@commerce)
  end

  def search
    search_name = params[:name_query]
    if search_name.present? 
#      commerces = Commerce.where('name LIKE ?',"%#{search_name}%").exists?
      recupcommerce = Commerce.where('name LIKE ?',"%#{search_name}%")
      commerces = recupcommerce.exists?
      respond_with commerces
    end
  end

  # GET /commerces/listcommerce
  # Recuperation de la liste des commerces à proximité '10km' en fonction :
  # - Des coordonnées de l'utilisateur
  def listcommerce
    lat_name = params[:lat_query]
    lng_name = params[:lng_query]
    if lat_name.present? && lng_name.present?
      recupcommerce = Commerce.includes(:categorizations).near([lat_name, lng_name], 50, units: :km, order: "")
      #respond_with recupcommerce
      if recupcommerce
        render json: recupcommerce, status: :ok
      else
        render json: {}, status: :not_found
      end
    end
  end

  private
    def set_commerce
      @commerce = Commerce.find(params[:id])
    end

    def set_user
     @user = User.find(params[:user_id])
    end

    def commerce_params
      params.require(:commerce).permit(:name, :adress1, :adress2, :details, :postal, :country, :latitude, :longitude, :city, :user_id, product_ids: []) if params[:commerce]
    end

end
