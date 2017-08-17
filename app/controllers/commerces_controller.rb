class CommercesController < ApplicationController
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
  end

  def create
    @commerce = Commerce.new(commerce_params)
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
      query = params[:query]
      commerces = Commerce.where('name LIKE ?',"%#{query}%").exists?
      respond_with commerces
    end

  private
    def set_commerce
      @commerce = Commerce.find(params[:id])
    end

    def commerce_params
      params.require(:commerce).permit(:name, :adress1, :adress2, :details, :postal, :country, :latitude, :longitude, :city, product_ids: [])
    end
end
