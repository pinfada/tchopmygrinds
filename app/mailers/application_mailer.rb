class ApplicationMailer < ActionMailer::Base
  include SendGrid
  default from: 'from@tchopmygrinds.com'
  layout 'mailer'
end

