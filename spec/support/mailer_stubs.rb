# Neutralizes mailers that run synchronously in model callbacks
# (User#after_create -> UserMailer.welcome_message.deliver_now).
# We don't want test runs to render mail templates or hit SendGrid.
RSpec.configure do |config|
  config.before(:each) do
    allow(UserMailer).to receive(:welcome_message).and_return(
      double("ActionMailer::MessageDelivery", deliver_now: true, deliver_later: true)
    )
  end
end
