# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'rails-assets-ngGeolocation/version'

Gem::Specification.new do |spec|
  spec.name          = "rails-assets-ngGeolocation"
  spec.version       = RailsAssetsNggeolocation::VERSION
  spec.authors       = ["rails-assets.org"]
  spec.description   = "AngularJS support for HTML5 Geolocation"
  spec.summary       = "AngularJS support for HTML5 Geolocation"
  spec.homepage      = "https://github.com/ninjatronic/ngGeolocation"

  spec.files         = `find ./* -type f | cut -b 3-`.split($/)
  spec.require_paths = ["lib"]

  spec.add_dependency "rails-assets-angular", ">= 1.0.8"
  spec.add_development_dependency "bundler", "~> 1.3"
  spec.add_development_dependency "rake"
end
