class PagesController < ApplicationController
  def home
  	@titre = "Accueil"
  end

  def contact
  	@titre = "Contact"
  end

  def Propos
  	@titre = "Propos"
  end

  def Aide
  	@titre = "Aide"
  end
end
