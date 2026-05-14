class Api::V1::RatingsController < Api::V1::BaseController
  # Reads are public — ratings of a commerce/product are visible to everyone,
  # the way they are on any other marketplace. Writes (create / update /
  # destroy / mark_helpful / my_ratings) still require an authenticated user.
  skip_before_action :authenticate_user_from_token!, only: [:index, :show]
  before_action :authenticate_user!, except: [:index, :show]
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
    # Vérifier si l'utilisateur peut évaluer cet élément. Same dual-shape
    # support as set_rateable — accept top-level OR nested under :rating.
    existing_rating = current_user.ratings.find_by(
      rateable_type: params[:rateable_type] || params.dig(:rating, :rateable_type),
      rateable_id: params[:rateable_id] || params.dig(:rating, :rateable_id)
    )

    if existing_rating
      return render json: {
        status: 'error',
        message: 'Vous avez déjà évalué cet élément'
      }, status: :unprocessable_entity
    end

    @rating = current_user.ratings.build(rating_params)
    @rating.rateable = @rateable
    # Match the marketplace default (Yelp/Google/TripAdvisor): user reviews
    # are public immediately. The `pending` status is reserved for ratings
    # flagged after the fact — until a moderation queue UI exists, leaving
    # it as the create-time default would silently hide every new review.
    @rating.status ||= :approved

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
  # Idempotent: a given user can mark a rating helpful at most once. The
  # `rating_votes` unique index is the source of truth; `helpful_count` is
  # a derived cache column we keep in sync for fast reads.
  def mark_helpful
    if @rating.user == current_user
      return render json: {
        status: 'error',
        message: 'Vous ne pouvez pas marquer votre propre évaluation comme utile'
      }, status: :forbidden
    end

    RatingVote.transaction do
      vote = RatingVote.find_or_create_by(rating: @rating, user: current_user)
      # find_or_create_by may have lost the race against another concurrent
      # POST. The unique index would raise; in that case the record exists
      # and we still want a 200 — the user's intent is satisfied.
      @rating.update_column(:helpful_count, @rating.rating_votes.count) if vote.persisted?
    end

    render json: {
      status: 'success',
      message: 'Merci pour votre feedback',
      data: { helpful_count: @rating.reload.helpful_count }
    }
  rescue ActiveRecord::RecordNotUnique
    render json: {
      status: 'success',
      message: 'Vote déjà enregistré',
      data: { helpful_count: @rating.reload.helpful_count }
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
    # Frontend nests these under `rating: { rateable_type, rateable_id, … }`;
    # legacy callers pass them at top level. Accept both.
    rateable_type = params[:rateable_type] || params.dig(:rating, :rateable_type)
    rateable_id = params[:rateable_id] || params.dig(:rating, :rateable_id)

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

  # API responses across the v1 namespace use camelCase timestamps
  # (`createdAt`/`updatedAt`). The React components consume that shape — when
  # this controller emitted snake_case the UI rendered "Invalid Date" on every
  # review. Keep snake_case aliases for older callers during the transition.
  def rating_json(rating)
    {
      id: rating.id,
      rating: rating.rating,
      comment: rating.comment,
      verified: rating.verified,
      helpful_count: rating.helpful_count,
      createdAt: rating.created_at&.iso8601,
      created_at: rating.created_at&.iso8601,
      user: {
        id: rating.user.id,
        name: rating.user.name,
        initials: rating.user.name.split.map(&:first).join.upcase
      }
    }
  end

  def detailed_rating_json(rating)
    rating_json(rating).merge({
      updatedAt: rating.updated_at&.iso8601,
      updated_at: rating.updated_at&.iso8601,
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
      createdAt: rating.created_at&.iso8601,
      created_at: rating.created_at&.iso8601,
      updatedAt: rating.updated_at&.iso8601,
      updated_at: rating.updated_at&.iso8601,
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