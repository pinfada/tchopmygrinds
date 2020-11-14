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

  def agrimer
    @data = File.read("#{Rails.root}/public/agrimer.json")
    render :json => @data
  end

  def serveraddress
    #require 'socket'
    #ip = Socket.ip_address_list.detect{|intf| intf.ipv4_private?}
    ip = Net::HTTP.get(URI.parse('http://checkip.amazonaws.com/')).squish
    @data = ip.to_json
    puts "User IP : #{@data}"
    render :json => @data
  end

end
