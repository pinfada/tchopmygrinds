class User < ApplicationRecord
  enum statut_type: { itinerant: 0, sedentary: 1, others: 2 }
  has_many :orders, dependent: :destroy
  has_many :orderdetails, through: :orders
  has_many :commerces
  has_many :addresses
  has_many :product_interests, dependent: :destroy
  has_many :favorites, dependent: :destroy
  has_many :favorite_commerces, through: :favorites, source: :commerce
  has_many :ratings, dependent: :destroy
  has_many :sent_messages, class_name: 'Message', foreign_key: 'sender_id', dependent: :destroy
  has_many :received_messages, class_name: 'Message', foreign_key: 'receiver_id', dependent: :destroy
	before_save { self.email = email.downcase }
	# WhatsApp click-to-chat (wa.me) requires the number in pure digits with
	# country code. We normalize on assignment so callers can pass "+237 699..."
	# or "237-699-..." and we store "237699...".
	before_validation :normalize_whatsapp_phone
	VALID_EMAIL_REGEX = /\A[\w+\-.]+@[a-z\d\-.]+\.[a-z]+\z/i
	# 8–15 digits per E.164. Leading 0 means a national format that wa.me
	# cannot route — reject so the merchant gets feedback instead of a dead CTA.
	VALID_WHATSAPP_REGEX = /\A[1-9]\d{7,14}\z/
	validates :email, presence: true,
				format: { with: VALID_EMAIL_REGEX },
				uniqueness: { case_sensitive: false }
	validates :name, presence: true, length: { maximum: 50 }
	validates :whatsapp_phone,
		format: {
			with: VALID_WHATSAPP_REGEX,
			message: "doit être au format international (8 à 15 chiffres, sans 0 initial). Ex : 237699112233"
		},
		allow_blank: true
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable,
         :jwt_authenticatable, jwt_revocation_strategy: JwtDenylist

  # after_commit (not after_create) so a SendGrid outage cannot roll back a
  # successful sign-up. deliver_later pushes the mailer onto the job queue.
  after_commit :send_welcome_email, on: :create
         
  def send_password_reset
    generate_token(:password_reset_token)
    self.password_reset_sent_at = Time.zone.now
    save!
    UserMailer.password_reset(self).deliver
  end

  def generate_token(column)
    begin
      self[column] = SecureRandom.urlsafe_base64
    end while User.exists?(column => self[column])
  end

  def admin?
    admin == true
  end

  def all_messages
    Message.where("sender_id = ? OR receiver_id = ?", id, id)
  end

  def unread_messages_count
    received_messages.unread.count
  end

  def conversations
    Message.conversations_for_user(self)
  end

  def conversation_with(other_user)
    Message.conversation_between(self, other_user)
  end

  def can_message?(other_user)
    return false if other_user == self
    return false unless other_user.is_a?(User)
    true
  end

  private

  def send_welcome_email
    UserMailer.welcome_message(self).deliver_later
  end

  def normalize_whatsapp_phone
    return if whatsapp_phone.nil?
    digits = whatsapp_phone.to_s.gsub(/\D/, '')
    self.whatsapp_phone = digits.empty? ? nil : digits
  end
         
end
