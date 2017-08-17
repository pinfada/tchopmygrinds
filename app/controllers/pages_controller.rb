class PagesController < ApplicationController
  respond_to :html, :json
  
  def home
  	@titre = "Accueil"
  end

  def contact
  	@titre = "Contact"
  end

  def propos
  	@titre = "Propos"
  end

  def aide
  	@titre = "Aide"
  end
end
