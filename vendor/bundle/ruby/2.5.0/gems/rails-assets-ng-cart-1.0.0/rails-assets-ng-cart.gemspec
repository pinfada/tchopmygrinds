# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'rails-assets-ng-cart/version'

Gem::Specification.new do |spec|
  spec.name          = "rails-assets-ng-cart"
  spec.version       = RailsAssetsNgCart::VERSION
  spec.authors       = ["rails-assets.org"]
  spec.description   = "Shopping Cart built for AngularJS"
  spec.summary       = "Shopping Cart built for AngularJS"
  spec.homepage      = "http://ngcart.snapjay.com/"
  spec.license       = "MIT"

  spec.files         = `find ./* -type f | cut -b 3-`.split($/)
  spec.require_paths = ["lib"]

  spec.add_dependency "rails-assets-angular", ">= 1.2"
  spec.add_development_dependency "bundler", "~> 1.3"
  spec.add_development_dependency "rake"
end
