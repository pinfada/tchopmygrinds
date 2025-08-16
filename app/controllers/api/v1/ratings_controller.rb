class Api::V1::RatingsController < Api::V1::BaseController
  before_action :authenticate_user!
  before_action :set_rateable, only: [:index, :create]
  before_action :set_rating, only: [:show, :update, :destroy, :mark_helpful]

  # GET /api/v1/ratings?rateable_type=Commerce&rateable_id=1
  def index
    @ratings = @rateable.ratings.public_ratings.includes(:user)
                        .page(params[:page])
                        .per(params[:per_page] || 10)
                        .recent

    # Filtres optionnels
    @ratings = @ratings.by_rating(params[:rating]) if params[:rating].present?
    @ratings = @ratings.verified if params[:verified] == 'true'

    render json: {
      status: 'success',
      data: {
        ratings: @ratings.map do |rating|
          rating_json(rating)
        end,
        meta: {
          current_page: @ratings.current_page,
          total_pages: @ratings.total_pages,
          total_count: @ratings.total_count,
          per_page: @ratings.limit_value
        },
        stats: rateable_stats
      }
    }
  end

  # GET /api/v1/ratings/1
  def show
    render json: {
      status: 'success',
      data: {
        rating: detailed_rating_json(@rating)
      }
    }
  end

  # POST /api/v1/ratings
  def create
    # Vérifier si l'utilisateur peut évaluer cet élément
    existing_rating = current_user.ratings.find_by(
      rateable_type: params[:rateable_type],
      rateable_id: params[:rateable_id]
    )

    if existing_rating
      return render json: {
        status: 'error',
        message: 'Vous avez déjà évalué cet élément'
      }, status: :unprocessable_entity
    end

    @rating = current_user.ratings.build(rating_params)
    @rating.rateable = @rateable

    # Vérifier si l'utilisateur a une commande liée (pour la vérification)
    if params[:order_id].present?
      order = current_user.orders.find_by(id: params[:order_id])
      @rating.order = order if order&.can_be_rated_for?(@rateable)
    end

    if @rating.save
      render json: {
        status: 'success',
        message: 'Évaluation ajoutée avec succès',
        data: {
          rating: rating_json(@rating)
        }
      }, status: :created
    else
      render json: {
        status: 'error',
        message: 'Erreur lors de la création de l\'évaluation',
        errors: @rating.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/v1/ratings/1
  def update
    unless @rating.user == current_user
      return render json: {
        status: 'error',
        message: 'Non autorisé'
      }, status: :forbidden
    end

    # On ne peut modifier que dans les 24h après création
    if @rating.created_at < 24.hours.ago
      return render json: {
        status: 'error',
        message: 'Modification non autorisée après 24h'
      }, status: :forbidden
    end

    if @rating.update(rating_params.except(:rateable_type, :rateable_id))
      render json: {
        status: 'success',
        message: 'Évaluation mise à jour',
        data: {
          rating: rating_json(@rating)
        }
      }
    else
      render json: {
        status: 'error',
        message: 'Erreur lors de la mise à jour',
        errors: @rating.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/ratings/1
  def destroy
    unless @rating.user == current_user || current_user.admin?
      return render json: {
        status: 'error',
        message: 'Non autorisé'
      }, status: :forbidden
    end

    @rating.destroy
    render json: {
      status: 'success',
      message: 'Évaluation supprimée'
    }
  end

  # POST /api/v1/ratings/1/helpful
  def mark_helpful
    # Empêcher l'auto-vote
    if @rating.user == current_user
      return render json: {
        status: 'error',
        message: 'Vous ne pouvez pas marquer votre propre évaluation comme utile'
      }, status: :forbidden
    end

    @rating.increment!(:helpful_count)
    
    render json: {
      status: 'success',
      message: 'Merci pour votre feedback',
      data: {
        helpful_count: @rating.helpful_count
      }
    }
  end

  # GET /api/v1/ratings/my_ratings
  def my_ratings
    @ratings = current_user.ratings.includes(:rateable)
                          .page(params[:page])
                          .per(params[:per_page] || 10)
                          .recent

    render json: {
      status: 'success',
      data: {
        ratings: @ratings.map do |rating|
          my_rating_json(rating)
        end,
        meta: {
          current_page: @ratings.current_page,
          total_pages: @ratings.total_pages,
          total_count: @ratings.total_count,
          per_page: @ratings.limit_value
        }
      }
    }
  end

  private

  def set_rateable
    rateable_type = params[:rateable_type]
    rateable_id = params[:rateable_id]

    unless %w[Commerce Product].include?(rateable_type)
      return render json: {
        status: 'error',
        message: 'Type d\'objet non supporté'
      }, status: :bad_request
    end

    @rateable = rateable_type.constantize.find_by(id: rateable_id)
    
    unless @rateable
      return render json: {
        status: 'error',
        message: "#{rateable_type} non trouvé"
      }, status: :not_found
    end
  end

  def set_rating
    @rating = Rating.find_by(id: params[:id])
    
    unless @rating
      return render json: {
        status: 'error',
        message: 'Évaluation non trouvée'
      }, status: :not_found
    end
  end

  def rating_params
    params.require(:rating).permit(:rating, :comment, :rateable_type, :rateable_id)
  end

  def rating_json(rating)
    {
      id: rating.id,
      rating: rating.rating,
      comment: rating.comment,
      verified: rating.verified,
      helpful_count: rating.helpful_count,
      created_at: rating.created_at,
      user: {
        id: rating.user.id,
        name: rating.user.name,
        initials: rating.user.name.split.map(&:first).join.upcase
      }
    }
  end

  def detailed_rating_json(rating)
    rating_json(rating).merge({
      updated_at: rating.updated_at,
      can_edit: rating.user == current_user && rating.created_at > 24.hours.ago,
      can_delete: rating.user == current_user || current_user.admin?
    })
  end

  def my_rating_json(rating)
    {
      id: rating.id,
      rating: rating.rating,
      comment: rating.comment,
      verified: rating.verified,
      moderated: rating.moderated,
      helpful_count: rating.helpful_count,
      created_at: rating.created_at,
      updated_at: rating.updated_at,
      rateable: {
        type: rating.rateable_type,
        id: rating.rateable_id,
        name: rating.rateable.respond_to?(:name) ? rating.rateable.name : "#{rating.rateable_type} ##{rating.rateable_id}"
      }
    }
  end

  def rateable_stats
    {
      average_rating: @rateable.average_rating,
      total_ratings: @rateable.ratings_count,
      verified_ratings: @rateable.verified_ratings_count,
      distribution: @rateable.ratings_distribution
    }
  end
end