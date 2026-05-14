class Api::V1::FavoritesController < Api::V1::BaseController
  # `authenticate_user_from_token!` already runs via BaseController before_action.

  # GET /api/v1/favorites
  # Returns the list of commerces the current user has favorited.
  def index
    favorites = current_user.favorites.includes(:commerce).order(created_at: :desc)
    render_success(
      favorites: favorites.map { |f| favorite_payload(f) },
      total: favorites.length
    )
  end

  # POST /api/v1/favorites { commerce_id: 42 }
  # Idempotent: creating a favorite that already exists returns the existing one.
  def create
    commerce = Commerce.find_by(id: params[:commerce_id])
    return render_not_found('Commerce') unless commerce

    favorite = current_user.favorites.find_or_create_by(commerce_id: commerce.id)

    if favorite.persisted?
      render_success(favorite_payload(favorite), message: 'Ajouté aux favoris', status: :created)
    else
      render_error(favorite.errors.full_messages.join(', '))
    end
  end

  # DELETE /api/v1/favorites/:id
  # `:id` is interpreted as commerce_id for convenience: the frontend tracks
  # commerces by id, not favorite rows. Returns 204 even if the favorite did
  # not exist (idempotent unfavorite).
  def destroy
    current_user.favorites.where(commerce_id: params[:id]).destroy_all
    head :no_content
  end

  private

  def favorite_payload(favorite)
    commerce = favorite.commerce
    {
      id: favorite.id,
      commerce_id: commerce.id,
      created_at: favorite.created_at.iso8601,
      commerce: {
        id: commerce.id,
        name: commerce.name,
        latitude: commerce.latitude,
        longitude: commerce.longitude,
        address: commerce.adress1,
        city: commerce.city,
        country: commerce.country,
        category: commerce.category,
        image_url: commerce.image_url,
        rating: commerce.rating,
        verified: commerce.verified
      }
    }
  end
end
