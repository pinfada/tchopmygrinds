# Prevent test specs from hitting real geocoding APIs. Commerce#after_validation
# triggers Geocoder lookups whenever adress1 is touched.
require 'geocoder'

Geocoder.configure(lookup: :test, ip_lookup: :test)

Geocoder::Lookup::Test.set_default_stub(
  [
    {
      'latitude'     => 0.0,
      'longitude'    => 0.0,
      'address'      => 'Test Address',
      'state'        => 'Test',
      'state_code'   => 'TS',
      'country'      => 'Testland',
      'country_code' => 'TL',
      'postal_code'  => '00000',
      'city'         => 'Testville'
    }
  ]
)
