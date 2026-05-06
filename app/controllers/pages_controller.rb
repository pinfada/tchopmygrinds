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

  def fail
  	@titre = "Fail"
  	respond_with(@titre)
  end

  def serveraddress
    #require 'socket'
    #ip = Socket.ip_address_list.detect{|intf| intf.ipv4_private?}
    ip = Net::HTTP.get(URI.parse('http://checkip.amazonaws.com/')).squish
    @data = ip.to_json
    puts "User IP : #{@data}"
    render :json => @data
  end

  def react_app
    @titre = "TchopMyGrinds"
    @vite_assets = react_vite_assets
    render 'react_app', layout: false
  end

  private

  def react_vite_assets
    index_path = Rails.root.join('public', 'dist', 'index.html')
    unless File.exist?(index_path)
      raise "React build not found at #{index_path}. Run `npm run build:react` before starting Rails in production."
    end

    index_html = File.read(index_path, mode: 'r:UTF-8')

    {
      stylesheets: index_html.scan(%r{<link[^>]+href=["'](?:/dist)?/assets/([^"']+\.css)["'][^>]*>}).flatten.map do |asset_name|
        "/dist/assets/#{asset_name}"
      end,
      scripts: index_html.scan(%r{<script[^>]+src=["'](?:/dist)?/assets/([^"']+\.js)["'][^>]*>}).flatten.map do |asset_name|
        "/dist/assets/#{asset_name}"
      end
    }
  end

end
