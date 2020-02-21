class ApplicationMailer < ActionMailer::Base
  include SendGrid
  default from: 'hello@tchopmygrinds.com'
  layout 'mailer'
end

