class UserMailer < ApplicationMailer
  require 'sendgrid-ruby'
  include SendGrid
  #def welcome_email(user)
  #  @user = user
  #  @url  = 'https://stat-exo1-pinfada.c9.io/sign_in'
  #  # email_with_name = %("#{@user.name}" <#{@user.email}>)
  #  mail(to: @user.email, subject: 'Bienvenu sur Tchopmygrinds',
  #       cc: 'admin@tchopmygrinds.com', subject: 'Bienvenu sur Tchopmygrinds'
  #      )
  #end
  def welcome_message(user)
    @user = user
    sendgrid_category "Welcome"
    mail :to => user.email, :subject => "Welcome #{user.name} on tchopmygrinds :-)"
  end

  def goodbye_message(user)
    sendgrid_disable :ganalytics
    mail :to => user.email, :subject => "A bientôt sur tchopmygrinds :-("
  end
  
  def order_confirmation(user, order)
    @user = user
    @order = order
    order.each do |order_id|
      @products = order_id.products
    end
    mail(to: @user.email, subject: 'Votre commande a été reçu',
         cc: 'hello@tchopmygrinds.com'
        )
  end

  def change_status_mail(user, status, order_id)
    @user = user
    @status = status
    @order_id = order_id
    mail(to: @user.email, subject: 'Statut commande mis à jour',
         cc: 'hello@tchopmygrinds.com'
      )
  end
  
  def password_reset(user)
    @user = user
    mail :to => user.email, :subject => "Mot de passe réinitialisé"
  end

  def newsletter_mailer
    @newsletter = Newsletter.all
    emails = @newsletter.collect(&:email).join(", ")
    mail(to: emails, subject: "Hi, this is a test mail.")
  end

  # Notification de produit disponible immédiatement
  def immediate_product_availability(product_interest, product)
    @user = product_interest.user
    @product_interest = product_interest
    @product = product
    @commerce = product.commerce
    @distance = product_interest.distance_from(@commerce.latitude, @commerce.longitude)&.round(2)
    
    sendgrid_category "Product Available"
    mail(
      to: @user.email,
      subject: "✅ #{@product.name} est maintenant disponible près de vous !"
    )
  end

  # Notification de produit disponible (suite à manifestation d'intérêt)
  def product_available_notification(product_interest, product)
    @user = product_interest.user
    @product_interest = product_interest
    @product = product
    @commerce = product.commerce
    @distance = product_interest.distance_from(@commerce.latitude, @commerce.longitude)&.round(2)
    
    sendgrid_category "Product Interest Fulfilled"
    mail(
      to: @user.email,
      subject: "🎉 Bonne nouvelle ! #{@product.name} est disponible"
    )
  end

end
