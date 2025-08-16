class Api::V1::Admin::RatingsController < Api::V1::BaseController
  before_action :ensure_admin
  before_action :set_rating, only: [:show, :approve, :reject, :destroy]

  # GET /api/v1/admin/ratings
  def index
    @ratings = Rating.includes(:user, :rateable)
                    .order(created_at: :desc)
                    .page(params[:page])
                    .per(20)

    # Filtrage par statut
    if params[:status].present?
      @ratings = @ratings.where(status: params[:status])
    end

    # Filtrage par type d'entité
    if params[:entity_type].present?
      @ratings = @ratings.where(rateable_type: params[:entity_type].classify)
    end

    render json: {
      ratings: @ratings.map do |rating|
        {
          id: rating.id,
          score: rating.score,
          comment: rating.comment,
          status: rating.status,
          created_at: rating.created_at,
          updated_at: rating.updated_at,
          user: {
            id: rating.user.id,
            name: "#{rating.user.prenom} #{rating.user.nom}",
            email: rating.user.email
          },
          rateable: {
            id: rating.rateable.id,
            type: rating.rateable_type,
            name: rating.rateable.respond_to?(:name) ? rating.rateable.name : rating.rateable.to_s
          }
        }
      end,
      meta: {
        current_page: @ratings.current_page,
        per_page: @ratings.limit_value,
        total_pages: @ratings.total_pages,
        total_count: @ratings.total_count
      }
    }
  end

  # GET /api/v1/admin/ratings/:id
  def show
    render json: {
      id: @rating.id,
      score: @rating.score,
      comment: @rating.comment,
      status: @rating.status,
      created_at: @rating.created_at,
      updated_at: @rating.updated_at,
      user: {
        id: @rating.user.id,
        name: "#{@rating.user.prenom} #{@rating.user.nom}",
        email: @rating.user.email
      },
      rateable: {
        id: @rating.rateable.id,
        type: @rating.rateable_type,
        name: @rating.rateable.respond_to?(:name) ? @rating.rateable.name : @rating.rateable.to_s
      }
    }
  end

  # PATCH /api/v1/admin/ratings/:id/approve
  def approve
    if @rating.update(status: 'approved', moderated_at: Time.current, moderated_by: current_user.id)
      render json: { message: 'Avis approuvé avec succès' }
    else
      render json: { errors: @rating.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH /api/v1/admin/ratings/:id/reject
  def reject
    if @rating.update(status: 'rejected', moderated_at: Time.current, moderated_by: current_user.id)
      render json: { message: 'Avis rejeté avec succès' }
    else
      render json: { errors: @rating.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/admin/ratings/:id
  def destroy
    if @rating.destroy
      render json: { message: 'Avis supprimé avec succès' }
    else
      render json: { errors: @rating.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # GET /api/v1/admin/ratings/stats
  def stats
    total_ratings = Rating.count
    pending_ratings = Rating.where(status: 'pending').count
    approved_ratings = Rating.where(status: 'approved').count
    rejected_ratings = Rating.where(status: 'rejected').count

    render json: {
      total: total_ratings,
      pending: pending_ratings,
      approved: approved_ratings,
      rejected: rejected_ratings,
      approval_rate: total_ratings > 0 ? (approved_ratings.to_f / total_ratings * 100).round(2) : 0
    }
  end

  private

  def set_rating
    @rating = Rating.find(params[:id])
  end

  def ensure_admin
    return render_unauthorized unless current_user
    
    unless current_user.admin?
      render json: { error: 'Accès refusé - droits administrateur requis' }, status: :forbidden
    end
  end
end