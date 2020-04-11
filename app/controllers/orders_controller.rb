class OrdersController < ApplicationController
  #before_action :authenticate_user!
  authorize_resource
  #before_action :set_user
  before_action :set_product, only: [:create]
  before_action :set_order, only: [:show, :edit, :update, :destroy]
  
  respond_to :json

  # GET /orders
  # GET /orders.json
  def index
    userid = params[:user_id]
    if userid.present? 
      @user = User.find(userid)
      @orders = @user.orders
    else
      @orders = Order.all.order("created_at ASC")
    end
    if @orders
      render json: @orders, status: :ok
    else
      render json: {}, status: :not_found
    end
    #respond_with(@orders)
  end

  # GET /orders/1
  # GET /orders/1.json
  def show
    #@order = @user.orders.find(params[:id])
    respond_with(@order)
  end

  # GET /orders/new
  def new
  # @order = Order.new
    @order = @user.orders.new
    respond_with(@order)
  end

  # GET /orders/1/edit
  def edit
  end

  # POST /orders
  # POST /orders.json
  def create
  # @order = Order.new(order_params)
    @order = @product.orders.create(order_params)
    #respond_with(@order)
    #redirect_to root_url
    if @order
      render json: @order, status: :ok
    else
      render json: {}, status: :not_found
    end
  end

  # PATCH/PUT /orders/1
  # PATCH/PUT /orders/1.json
  def update
    respond_with(@order)
  end

  # DELETE /orders/1
  # DELETE /orders/1.json
  def destroy
    @order.destroy
    respond_with(@order)
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_order
      @order = Order.find(params[:id])
    end
    
    def set_user
      @user = User.find(params[:user_id])
    end

    def set_product
      @product = Product.find(params[:product_id])
    end
    
    # Never trust parameters from the scary internet, only allow the white list through.
    def order_params
      params.require(:order).permit(:orderdate, :requiredate, :shippedate, :status, :user_id, :payment_address_id, :delivery_address_id)
    end
    
end
