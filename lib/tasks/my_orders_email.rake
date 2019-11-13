namespace :my_orders_email do
  desc "Recupération des commandes passées"
  task populate: :environment do
    send_orders_email
  end
  
  def send_orders_email
    @orders = Order.all
    UserMailer.my_orders_email(@orders).deliver!
  end

end
