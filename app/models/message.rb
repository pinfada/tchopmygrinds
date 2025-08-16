class Message < ApplicationRecord
  # Relations
  belongs_to :sender, class_name: 'User'
  belongs_to :receiver, class_name: 'User'
  belongs_to :product, optional: true
  belongs_to :commerce, optional: true

  # Enums
  enum message_type: {
    general: 0,
    product_inquiry: 1,
    order_related: 2,
    support: 3
  }

  # Validations
  validates :content, presence: true, length: { minimum: 1, maximum: 2000 }
  validates :conversation_id, presence: true
  validates :sender_id, :receiver_id, presence: true
  validate :sender_and_receiver_are_different
  
  # Nettoyage de l'encodage avant validation
  before_validation :clean_encoding

  # Scopes
  scope :unread, -> { where(read_at: nil) }
  scope :read, -> { where.not(read_at: nil) }
  scope :recent, -> { order(created_at: :desc) }
  scope :in_conversation, ->(conversation_id) { where(conversation_id: conversation_id) }
  scope :between_users, ->(user1_id, user2_id) {
    where(
      "(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)",
      user1_id, user2_id, user2_id, user1_id
    )
  }

  # Callbacks
  before_validation :generate_conversation_id, if: :new_record?
  after_create :send_notification

  # Instance methods
  def read?
    read_at.present?
  end

  def unread?
    !read?
  end

  def mark_as_read!
    update!(read_at: Time.current) unless read?
  end

  def conversation_partner(current_user)
    current_user == sender ? receiver : sender
  end

  def can_be_read_by?(user)
    sender == user || receiver == user
  end

  def formatted_time
    if created_at.today?
      created_at.strftime('%H:%M')
    elsif created_at > 1.week.ago
      created_at.strftime('%a %H:%M')
    else
      created_at.strftime('%d/%m %H:%M')
    end
  end

  # Class methods
  def self.conversation_between(user1, user2)
    between_users(user1.id, user2.id).recent
  end

  def self.conversations_for_user(user)
    where("sender_id = ? OR receiver_id = ?", user.id, user.id)
      .group(:conversation_id)
      .order("MAX(created_at) DESC")
  end

  private

  def generate_conversation_id
    return if conversation_id.present?
    
    # Générer un ID de conversation basé sur les IDs des utilisateurs (ordre déterministe)
    user_ids = [sender_id, receiver_id].sort
    self.conversation_id = "conv_#{user_ids.join('_')}_#{SecureRandom.hex(4)}"
  end

  def sender_and_receiver_are_different
    if sender_id == receiver_id
      errors.add(:receiver_id, "ne peut pas etre identique a l'expediteur")
    end
  end

  def send_notification
    # Envoyer une notification par email au destinataire (avec gestion d'erreur d'encodage)
    begin
      MessageMailer.new_message_notification(self).deliver_later if receiver.present?
    rescue Encoding::UndefinedConversionError => e
      Rails.logger.error "Erreur d'encodage email: #{e.message}"
      # Ne pas faire échouer la création du message pour un problème d'email
    end
  end

  def clean_encoding
    # Nettoyer l'encodage du contenu
    if content.present?
      self.content = content.force_encoding('UTF-8').scrub('?')
    end
    
    if subject.present?
      self.subject = subject.force_encoding('UTF-8').scrub('?')
    end
  end
end
