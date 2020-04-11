class AddressesController < ApplicationController
  authorize_resource
  
  before_action :set_address, only: [:show, :edit, :update, :destroy]
  before_action :set_user, only: [:create, :new]
  respond_to :html, :json

  # GET /addresses
  # GET /addresses.json
  def index
    #@addresses = Address.all
    #@addresses = @user.addresses
    #respond_with(@addresses)

    userid = params[:user_id]
    if userid.present? 
      @user = User.find(userid)
      @addresses = @user.addresses
    else
      @addresses = Address.all.order("created_at ASC")
    end

    #respond_with(@addresses)
    if @addresses
      render json: @addresses, status: :ok
    else
      render json: {}, status: :not_found
    end

  end

  # GET /addresses/1
  # GET /addresses/1.json
  def show
  end

  # GET /addresses/new
  def new
    #@address = addresse.new
    @address = @user.addresses.new
    respond_with(@address)
  end

  # GET /addresses/1/edit
  def edit
  end

  # POST /addresses
  # POST /addresses.json
  def create
    #@address = addresse.new(address_params)
    @address = @user.addresses.create(address_params)
    respond_with(@address)

  end

  # PATCH/PUT /addresses/1
  # PATCH/PUT /addresses/1.json
  def update
    respond_to do |format|
      if @address.update(address_params)
        format.html { redirect_to @address, notice: 'addresse was successfully updated.' }
        format.json { render :show, status: :ok, location: @address }
      else
        format.html { render :edit }
        format.json { render json: @address.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /addresses/1
  # DELETE /addresses/1.json
  def destroy
    @address.destroy
    respond_to do |format|
      format.html { redirect_to addresses_url, notice: 'addresse was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private

    def set_user
      @user = User.find(params[:user_id])
    end
    
    # Use callbacks to share common setup or constraints between actions.
    def set_address
      @address = Address.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def address_params
      params.require(:address).permit(:address1, :address2, :country, :city, :zipcode, :state, :latitude, :longitude, :user_id)
    end
end
