require 'rails_helper'

# Regression spec for the production encoding bug fixed in commits f30ebfb
# and 17256fe. The mailer's `safe_encoding` helper must scrub non-UTF-8
# bytes from the subject; if mail() still raises Encoding::UndefinedConversionError
# (e.g. the body template fails), the rescue clause must send a fallback
# subject without re-raising.
RSpec.describe MessageMailer, type: :mailer do
  let(:sender)   { FactoryBot.create(:user, name: "Sender") }
  let(:receiver) { FactoryBot.create(:user, name: "Receiver") }

  describe '#safe_encoding (helper)' do
    let(:mailer) { described_class.new }

    it 'returns nil unchanged' do
      expect(mailer.send(:safe_encoding, nil)).to be_nil
    end

    it 'force-encodes a byte string to UTF-8 and scrubs invalid bytes' do
      bad = "Bad\xFFName".dup.force_encoding("ASCII-8BIT")
      cleaned = mailer.send(:safe_encoding, bad)

      expect(cleaned.encoding).to eq(Encoding::UTF_8)
      expect(cleaned).to be_valid_encoding
      expect(cleaned).to include("?")
    end

    it 'passes valid UTF-8 through' do
      expect(mailer.send(:safe_encoding, "déjà vu")).to eq("déjà vu")
    end
  end

  describe 'fallback subject when mail() raises Encoding error' do
    it 'sends a plain ASCII subject instead of re-raising' do
      message = Message.create!(
        sender: sender, receiver: receiver, content: "Hello", message_type: :general
      )

      call_count = 0
      allow_any_instance_of(MessageMailer).to receive(:mail).and_wrap_original do |original, **opts|
        call_count += 1
        raise Encoding::UndefinedConversionError, "synthetic" if call_count == 1
        # Second call: return a Mail::Message stub that responds to deliver
        Mail::Message.new(opts.merge(body: "fallback")).tap { |m| m.delivery_method :test }
      end

      expect {
        MessageMailer.new_message_notification(message).deliver_now
      }.not_to raise_error
    end
  end
end
