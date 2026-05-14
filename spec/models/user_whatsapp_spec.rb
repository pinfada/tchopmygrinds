require 'rails_helper'

RSpec.describe User, 'whatsapp_phone' do
  let(:base_attrs) do
    {
      email: "wa#{SecureRandom.hex(2)}@example.test",
      password: 'Password123!',
      name: 'WA Tester',
      statut_type: :sedentary,
    }
  end

  it 'allows the field to stay blank' do
    expect(User.new(base_attrs.merge(whatsapp_phone: nil))).to be_valid
    expect(User.new(base_attrs.merge(whatsapp_phone: ''))).to be_valid
  end

  it 'normalizes the input to digits-only on save' do
    u = User.create!(base_attrs.merge(whatsapp_phone: '+237 699 11-22-33'))
    expect(u.reload.whatsapp_phone).to eq('237699112233')
  end

  it 'accepts an 8-15 digit international number' do
    expect(User.new(base_attrs.merge(whatsapp_phone: '12345678'))).to be_valid
    expect(User.new(base_attrs.merge(whatsapp_phone: '237699112233'))).to be_valid
    expect(User.new(base_attrs.merge(whatsapp_phone: '123456789012345'))).to be_valid # 15 digits
  end

  it 'rejects numbers that begin with 0 (national format)' do
    u = User.new(base_attrs.merge(whatsapp_phone: '0699112233'))
    expect(u).to be_invalid
    expect(u.errors[:whatsapp_phone].first).to include('international')
  end

  it 'rejects numbers shorter than 8 digits' do
    u = User.new(base_attrs.merge(whatsapp_phone: '1234567'))
    expect(u).to be_invalid
  end

  it 'rejects numbers longer than 15 digits' do
    u = User.new(base_attrs.merge(whatsapp_phone: '1234567890123456'))
    expect(u).to be_invalid
  end
end
