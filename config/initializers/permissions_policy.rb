# Disable browser features the SPA does not need. The buyer's location is
# read once per session via the standard JS API; we keep geolocation enabled
# for same-origin only. Camera/microphone/USB are denied outright.

Rails.application.config.permissions_policy do |policy|
  policy.camera       :none
  policy.microphone   :none
  policy.usb          :none
  policy.gyroscope    :none
  policy.accelerometer :none
  policy.magnetometer :none
  policy.payment      :self
  policy.fullscreen   :self
  policy.geolocation  :self
end
