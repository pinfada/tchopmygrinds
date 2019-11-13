class CommercesController < ApplicationController
#  before_action :authenticate_user!, :except => [:show, :index, :search]
  authorize_resource
  before_action :set_commerce, only: [:show, :edit, :update, :destroy]

  respond_to :html, :json

  def index
    @commerces = Commerce.all
    respond_with(@commerces)
  end

  def show
    respond_with(@commerce)
  end

  def new
    @commerce = Commerce.new
    respond_with(@commerce)
  end

  def edit
    respond_with(@commerce)
  end

  def create
    @commerce = Commerce.create(commerce_params)
    @commerce.save
    respond_with(@commerce)
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
    if search_name
#      commerces = Commerce.where('name LIKE ?',"%#{search_name}%").exists?
      recupcommerce = Commerce.where('name LIKE ?',"%#{search_name}%")
      commerces = recupcommerce.exists?
      respond_with commerces
    end
  end

  private
    def set_commerce
      @commerce = Commerce.find(params[:id])
    end

    def commerce_params
      params.require(:commerce).permit(:name, :adress1, :adress2, :details, :postal, :country, :latitude, :longitude, :city, product_ids: []) if params[:commerce]
    end

end
