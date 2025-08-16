class MessageMailer < ApplicationMailer
  default from: 'noreply@tchopmygrinds.com'

  def new_message_notification(message)
    @message = message
    @sender = message.sender
    @receiver = message.receiver
    @product = message.product
    @commerce = message.commerce

    # Protection contre les erreurs d'encodage
    begin
      mail(
        to: safe_encoding(@receiver.email),
        subject: safe_encoding(new_message_subject)
      )
    rescue Encoding::UndefinedConversionError => e
      Rails.logger.error "Erreur d'encodage dans MessageMailer: #{e.message}"
      # Envoyer un email basique sans caractères spéciaux
      mail(
        to: @receiver.email,
        subject: "Nouveau message - TchopMyGrinds"
      )
    end
  end

  private

  def safe_encoding(text)
    return text if text.nil?
    text.to_s.force_encoding('UTF-8').scrub('?')
  end

  def new_message_subject
    case @message.message_type
    when 'product_inquiry'
      "Nouveau message concernant #{@product&.name || 'un produit'}"
    when 'order_related'
      "Message concernant votre commande"
    when 'support'
      "Message du support - #{@message.subject}"
    else
      "Nouveau message de #{@sender.name}"
    end
  end
end