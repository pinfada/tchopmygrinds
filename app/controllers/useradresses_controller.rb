class UseradressesController < ApplicationController
  authorize_resource
  before_action :set_user
  before_action :set_useradress, only: [:show, :edit, :update, :destroy]

  # GET /useradresses
  # GET /useradresses.json
  def index
    #@useradresses = Useradresse.all
    @useradresses = @user.useradresses
  end

  # GET /useradresses/1
  # GET /useradresses/1.json
  def show
  end

  # GET /useradresses/new
  def new
    #@useradress = Useradresse.new
    @useradress = @user.useradresses.new
  end

  # GET /useradresses/1/edit
  def edit
  end

  # POST /useradresses
  # POST /useradresses.json
  def create
    #@useradress = Useradresse.new(useradress_params)
    @useradress = @user.useradresses.create(useradress_params)

    respond_to do |format|
      if @useradress.save
        format.html { redirect_to @useradress, notice: 'Useradresse was successfully created.' }
        format.json { render :show, status: :created, location: @useradress }
      else
        format.html { render :new }
        format.json { render json: @useradress.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /useradresses/1
  # PATCH/PUT /useradresses/1.json
  def update
    respond_to do |format|
      if @useradress.update(useradress_params)
        format.html { redirect_to @useradress, notice: 'Useradresse was successfully updated.' }
        format.json { render :show, status: :ok, location: @useradress }
      else
        format.html { render :edit }
        format.json { render json: @useradress.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /useradresses/1
  # DELETE /useradresses/1.json
  def destroy
    @useradress.destroy
    respond_to do |format|
      format.html { redirect_to useradresses_url, notice: 'Useradresse was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private

    def set_user
      @user = User.find(params[:user_id])
    end
    
    # Use callbacks to share common setup or constraints between actions.
    def set_useradress
      @useradress = Useradresse.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def useradress_params
      params.fetch(:useradress, {})
    end
end
