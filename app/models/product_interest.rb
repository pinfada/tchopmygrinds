class ProductInterest < ApplicationRecord
  belongs_to :user
  
  validates :product_name, presence: true
  validates :user_latitude, presence: true
  validates :user_longitude, presence: true
  validates :search_radius, presence: true, numericality: { greater_than: 0 }
  
  # Scopes utiles
  scope :active, -> { where(fulfilled: false) }
  scope :in_area, ->(lat, lng, radius = 50) {
    where(
      "6371 * acos(cos(radians(?)) * cos(radians(user_latitude)) * 
       cos(radians(user_longitude) - radians(?)) + 
       sin(radians(?)) * sin(radians(user_latitude))) <= ?",
      lat, lng, lat, radius
    )
  }
  scope :for_product, ->(product_name) { 
    where("LOWER(product_name) LIKE LOWER(?)", "%#{product_name}%") 
  }
  
  # Marquer comme satisfait
  def fulfill!
    update!(fulfilled: true, fulfilled_at: Time.current)
  end
  
  # Distance depuis une position donnée
  def distance_from(lat, lng)
    return nil unless user_latitude && user_longitude
    
    rad_per_deg = Math::PI / 180
    rkm = 6371
    rm = rkm * 1000
    
    dlat_rad = (lat - user_latitude) * rad_per_deg
    dlong_rad = (lng - user_longitude) * rad_per_deg
    
    lat1_rad = user_latitude * rad_per_deg
    lat2_rad = lat * rad_per_deg
    
    a = Math.sin(dlat_rad/2)**2 + Math.cos(lat1_rad) * Math.cos(lat2_rad) * Math.sin(dlong_rad/2)**2
    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    
    rkm * c # Distance en kilomètres
  end
end