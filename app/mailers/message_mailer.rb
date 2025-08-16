class MessageMailer < ApplicationMailer
  default from: 'noreply@tchopmygrinds.com'

  def new_message_notification(message)
    @message = message
    @sender = message.sender
    @receiver = message.receiver
    @product = message.product
    @commerce = message.commerce

    mail(
      to: @receiver.email,
      subject: new_message_subject
    )
  end

  private

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