class PagesController < ApplicationController
#  before_action :authenticate_user!, :except => [:home]
#  authorize_resource :class => false
  respond_to :html
  
  def home
  	@titre = "Accueil"
  	respond_with(@titre)
  end

  def contact
  	@titre = "Contact"
  	respond_with(@titre)
  end

  def propos
  	@titre = "Propos"
  	respond_with(@titre)
  end

  def aide
  	@titre = "Aide"
  	respond_with(@titre)
  end
  
  def cart
  	@titre = "Panier"
  	respond_with(@titre)
  end
end
