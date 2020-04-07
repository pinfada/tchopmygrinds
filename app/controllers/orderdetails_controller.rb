class OrderdetailsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_order
  before_action :set_orderdetail, only: [:show, :edit, :update, :destroy]
  respond_to :html, :json

  # GET /orderdetails
  # GET /orderdetails.json
  def index
    userid = params[:user_id]
    orderid = params[:order_id]
    if userid.present? && orderid.present?
      @user = User.find(userid)
      @order = Order.find(orderid)
      orders = @user.orders
      @orderdetails = @order.orderdetails
      #orders.each do |order|
      #  @orderdetails = Orderdetail.where(order_id: order.id)
      #end
    else
      @orderdetails = Orderdetail.all
    end

    #respond_with(@orderdetails)
    if @orderdetails
      render json: @orderdetails, status: :ok
    else
      render json: {}, status: :not_found
    end

  end

  # GET /orderdetails/1
  # GET /orderdetails/1.json
  def show
  end

  # GET /orderdetails/new
  def new
    @orderdetail = Orderdetail.new
    respond_with(@orderdetail)
  end

  # GET /orderdetails/1/edit
  def edit
    @orderdetail = Orderdetails.update(orderdetail_params)
    if @orderdetail
      render json: @orderdetail, status: :ok
    else
      render json: {}, status: :not_found
    end
    #respond_with(@orderdetail)
  end

  # POST /orderdetails
  # POST /orderdetails.json
  def create
    @orderdetail = Orderdetails.create(orderdetail_params)
    respond_with(@orderdetail)

    # respond_to do |format|
    #   if @orderdetail.save
    #     format.html { redirect_to @orderdetail, notice: 'Orderdetail was successfully created.' }
    #     format.json { render :show, status: :created, location: @orderdetail }
    #   else
    #     format.html { render :new }
    #     format.json { render json: @orderdetail.errors, status: :unprocessable_entity }
    #   end
    # end
  end

  # PATCH/PUT /orderdetails/1
  # PATCH/PUT /orderdetails/1.json
  def update
    respond_with(@orderdetail)
    #respond_to do |format|
    #  if @orderdetail.update(orderdetail_params)
    #    format.html { redirect_to @orderdetail, notice: 'Orderdetail was successfully updated.' }
    #    format.json { render :show, status: :ok, location: @orderdetail }
    #  else
    #    format.html { render :edit }
    #    format.json { render json: @orderdetail.errors, status: :unprocessable_entity }
    #  end
    #end
  end

  # DELETE /orderdetails/1
  # DELETE /orderdetails/1.json
  def destroy
    @orderdetail.destroy
    respond_to do |format|
      format.html { redirect_to orderdetails_url, notice: 'Orderdetail was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_orderdetail
      @orderdetail = Orderdetail.find(params[:id])
    end

    def set_order
      @order = Order.find(params[:order_id])
    end

    def set_product
      @product = Product.find(params[:product_id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def orderdetail_params
      params.require(:orderdetail).permit(:unitprice, :quantity, :discount, order_attributes: order_params, product_attributes: product_params)
    end
    
    def product_params
      [:product_id]
    end
    
    def order_params
      [:order_id]
    end
    
end
