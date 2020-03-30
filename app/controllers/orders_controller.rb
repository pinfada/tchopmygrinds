class OrdersController < ApplicationController
  #before_action :authenticate_user!
  authorize_resource
  before_action :set_user
  before_action :set_order, only: [:show, :edit, :update, :destroy]
  
  respond_to :html, :json

  # GET /orders
  # GET /orders.json
  def index
    userid = params[:user_id]
    if userid.present? 
      @user = User.find(userid)
      @orders = @user.orders
    else
      @orders = order.all.order("created_at ASC")
    end

    respond_with(@orders)
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
  end

  # GET /orders/1/edit
  def edit
  end

  # POST /orders
  # POST /orders.json
  def create
  # @order = Order.new(order_params)
    @order = @user.orders.create(order_params)

    respond_to do |format|
      if @order.save
        format.html { redirect_to @order, notice: 'Order was successfully created.' }
        format.json { render :show, status: :created, location: @order }
      else
        format.html { render :new }
        format.json { render json: @order.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /orders/1
  # PATCH/PUT /orders/1.json
  def update
    respond_to do |format|
      if @order.update(order_params)
        format.html { redirect_to @order, notice: 'Order was successfully updated.' }
        format.json { render :show, status: :ok, location: @order }
      else
        format.html { render :edit }
        format.json { render json: @order.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /orders/1
  # DELETE /orders/1.json
  def destroy
    @order.destroy
    respond_to do |format|
      format.html { redirect_to orders_url, notice: 'Order was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_order
      @order = Order.find(params[:id])
    end
    
    def set_user
      @user = User.find(params[:user_id])
    end
    
    # Never trust parameters from the scary internet, only allow the white list through.
    def order_params
      params.require(:order).permit(:OrderDate, :requiredate, :shippedate, :status, :user_id, :payment_address_id, :delivery_address_id)
    end
    
end
