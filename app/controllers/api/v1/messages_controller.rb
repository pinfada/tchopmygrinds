class Api::V1::MessagesController < Api::V1::BaseController
  before_action :authenticate_user!
  before_action :set_message, only: [:show, :mark_as_read, :destroy]
  before_action :set_conversation_partner, only: [:create, :index]

  # GET /api/v1/messages
  def index
    if params[:conversation_id].present?
      # Récupérer les messages d'une conversation spécifique
      @messages = current_user.all_messages
                             .in_conversation(params[:conversation_id])
                             .includes(:sender, :receiver, :product, :commerce)
                             .recent
                             .limit(50)
    elsif params[:user_id].present?
      # Récupérer la conversation avec un utilisateur spécifique
      other_user = User.find(params[:user_id])
      @messages = current_user.conversation_with(other_user)
                             .includes(:sender, :receiver, :product, :commerce)
                             .limit(50)
    else
      # Récupérer toutes les conversations de l'utilisateur
      @conversations = current_user.conversations
                                  .includes(:sender, :receiver, :product, :commerce)
                                  .limit(20)
      
      render_success({
        conversations: @conversations.map { |msg| conversation_summary(msg) }
      })
      return
    end

    # Marquer les messages comme lus automatiquement
    unread_messages = @messages.where(receiver: current_user, read_at: nil)
    unread_messages.update_all(read_at: Time.current) if unread_messages.exists?

    render_success({
      messages: @messages.map { |msg| message_data(msg) },
      pagination: {
        total: @messages.count,
        limit: 50
      }
    })
  end

  # GET /api/v1/messages/:id
  def show
    unless @message.can_be_read_by?(current_user)
      render_error('Accès non autorisé', :forbidden)
      return
    end

    # Marquer comme lu si c'est le destinataire
    @message.mark_as_read! if @message.receiver == current_user

    render_success({
      message: message_data(@message)
    })
  end

  # POST /api/v1/messages
  def create
    @message = current_user.sent_messages.build(message_params)
    
    # Vérifier que l'utilisateur peut envoyer un message au destinataire
    unless current_user.can_message?(@message.receiver)
      render_error('Impossible d\'envoyer un message à cet utilisateur', :forbidden)
      return
    end

    if @message.save
      render_success({
        message: message_data(@message)
      }, message: 'Message envoyé avec succès', status: :created)
    else
      render_error(@message.errors.full_messages.join(', '))
    end
  end

  # PATCH /api/v1/messages/:id/mark_as_read
  def mark_as_read
    unless @message.receiver == current_user
      render_error('Seul le destinataire peut marquer le message comme lu', :forbidden)
      return
    end

    if @message.mark_as_read!
      render_success({
        message: message_data(@message)
      }, message: 'Message marqué comme lu')
    else
      render_error('Erreur lors de la mise à jour du message')
    end
  end

  # DELETE /api/v1/messages/:id
  def destroy
    unless @message.sender == current_user
      render_error('Seul l\'expéditeur peut supprimer le message', :forbidden)
      return
    end

    if @message.destroy
      render_success(nil, message: 'Message supprimé avec succès')
    else
      render_error('Erreur lors de la suppression du message')
    end
  end

  # GET /api/v1/messages/conversations
  def conversations
    @conversations = current_user.conversations
                                .includes(:sender, :receiver, :product, :commerce)
                                .limit(20)

    render_success({
      conversations: @conversations.map { |msg| conversation_summary(msg) },
      unread_count: current_user.unread_messages_count
    })
  end

  # GET /api/v1/messages/unread_count
  def unread_count
    render_success({
      unread_count: current_user.unread_messages_count
    })
  end

  # POST /api/v1/messages/start_conversation
  def start_conversation
    if params[:receiver_id].blank?
      render_error('receiver_id requis', :unprocessable_entity)
      return
    end

    receiver = User.find_by(id: params[:receiver_id])
    unless receiver
      render_not_found('Utilisateur destinataire')
      return
    end

    unless current_user.can_message?(receiver)
      render_error('Impossible de démarrer une conversation avec cet utilisateur', :forbidden)
      return
    end

    # Vérifier si une conversation existe déjà
    existing_conversation = current_user.conversation_with(receiver).first
    
    if existing_conversation
      render_success({
        conversation_id: existing_conversation.conversation_id,
        existing: true
      }, message: 'Conversation existante trouvée')
    else
      # Créer une nouvelle conversation (sera créée lors du premier message)
      user_ids = [current_user.id, receiver.id].sort
      conversation_id = "conv_#{user_ids.join('_')}_#{SecureRandom.hex(4)}"
      
      render_success({
        conversation_id: conversation_id,
        existing: false,
        receiver: user_basic_data(receiver)
      }, message: 'Nouvelle conversation initialisée')
    end
  end

  private

  def set_message
    @message = Message.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_error('Message non trouvé', :not_found)
  end

  def set_conversation_partner
    if params[:receiver_id].present?
      @receiver = User.find(params[:receiver_id])
    end
  rescue ActiveRecord::RecordNotFound
    render_error('Utilisateur destinataire non trouvé', :not_found)
  end

  def message_params
    params.require(:message).permit(:content, :subject, :receiver_id, :product_id, :commerce_id, :message_type, :conversation_id)
  end

  def message_data(message)
    {
      id: message.id,
      content: message.content,
      subject: message.subject,
      sender: user_basic_data(message.sender),
      receiver: user_basic_data(message.receiver),
      product: message.product ? product_basic_data(message.product) : nil,
      commerce: message.commerce ? commerce_basic_data(message.commerce) : nil,
      message_type: message.message_type,
      conversation_id: message.conversation_id,
      read_at: message.read_at&.iso8601,
      formatted_time: message.formatted_time,
      is_read: message.read?,
      created_at: message.created_at.iso8601,
      updated_at: message.updated_at.iso8601
    }
  end

  def conversation_summary(message)
    partner = message.conversation_partner(current_user)
    last_message = Message.in_conversation(message.conversation_id).recent.first
    
    {
      conversation_id: message.conversation_id,
      partner: user_basic_data(partner),
      last_message: {
        content: last_message.content.truncate(100),
        sender_name: last_message.sender.name,
        created_at: last_message.created_at.iso8601,
        formatted_time: last_message.formatted_time,
        is_read: last_message.read?
      },
      unread_count: Message.in_conversation(message.conversation_id)
                           .where(receiver: current_user, read_at: nil)
                           .count,
      product: last_message.product ? product_basic_data(last_message.product) : nil,
      commerce: last_message.commerce ? commerce_basic_data(last_message.commerce) : nil
    }
  end

  def user_basic_data(user)
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.statut_type,
      avatar: user.avatar_url
    }
  end

  def product_basic_data(product)
    {
      id: product.id,
      name: product.name,
      unitprice: product.unitprice,
      available: product.available
    }
  end

  def commerce_basic_data(commerce)
    {
      id: commerce.id,
      name: commerce.name,
      category: commerce.category,
      verified: commerce.verified
    }
  end
end