# -*- encoding: utf-8 -*-
# stub: rails-assets-ngGeolocation 0.0.8 ruby lib

Gem::Specification.new do |s|
  s.name = "rails-assets-ngGeolocation".freeze
  s.version = "0.0.8"

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["rails-assets.org".freeze]
  s.date = "2015-08-14"
  s.description = "AngularJS support for HTML5 Geolocation".freeze
  s.homepage = "https://github.com/ninjatronic/ngGeolocation".freeze
  s.rubygems_version = "2.7.6.2".freeze
  s.summary = "AngularJS support for HTML5 Geolocation".freeze

  s.installed_by_version = "2.7.6.2" if s.respond_to? :installed_by_version

  if s.respond_to? :specification_version then
    s.specification_version = 4

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_runtime_dependency(%q<rails-assets-angular>.freeze, [">= 1.0.8"])
      s.add_development_dependency(%q<bundler>.freeze, ["~> 1.3"])
      s.add_development_dependency(%q<rake>.freeze, [">= 0"])
    else
      s.add_dependency(%q<rails-assets-angular>.freeze, [">= 1.0.8"])
      s.add_dependency(%q<bundler>.freeze, ["~> 1.3"])
      s.add_dependency(%q<rake>.freeze, [">= 0"])
    end
  else
    s.add_dependency(%q<rails-assets-angular>.freeze, [">= 1.0.8"])
    s.add_dependency(%q<bundler>.freeze, ["~> 1.3"])
    s.add_dependency(%q<rake>.freeze, [">= 0"])
  end
end
