namespace :email_tasks do
  desc 'weekly newsletter email'
  task weekly_newsletter_email: :environment do
    UserMailer.newsletter_mailer.deliver!
  end
end