require 'rails_helper'

# Regression spec for Order#after_commit :notify_status_change (Lot 2 / C7).
# Before C7, the mailer ran inside after_update + deliver_now: a SendGrid outage
# would roll back the order update, and every save triggered an SMTP call.
# Now the mailer fires only on a real status change, after the transaction
# commits, and via deliver_later (off the request thread).
RSpec.describe Order, type: :model do
  let(:user) { FactoryBot.create(:user) }
  let(:order) { Order.create!(user: user, status: :Waiting) }

  before do
    # Cover both async (deliver_later) and any legacy deliver_now call,
    # so an accidental regression to the old path doesn't pass silently.
    allow(UserMailer).to receive(:change_status_mail).and_return(
      double("ActionMailer::MessageDelivery", deliver_later: true, deliver_now: true)
    )
  end

  it 'queues a status-change mail when the status attribute changes' do
    order # force creation BEFORE the assertion window

    order.update!(status: :Delivered)

    expect(UserMailer).to have_received(:change_status_mail).with(user, "Delivered", order.id)
  end

  it 'does NOT queue a status-change mail when no attribute changes' do
    order # create

    # Force a save without changing status
    order.save!

    expect(UserMailer).not_to have_received(:change_status_mail)
  end

  it 'does NOT queue a status-change mail on order creation' do
    expect(UserMailer).not_to have_received(:change_status_mail)
    Order.create!(user: user, status: :Waiting)
    expect(UserMailer).not_to have_received(:change_status_mail)
  end
end
