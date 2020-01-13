class UserMailer < ApplicationMailer
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
    mail :to => user.email, :subj ect => "A bientôt sur tchopmygrinds :-("
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
  
end
