# -*- encoding: utf-8 -*-
# stub: rails_layout 1.0.42 ruby lib

Gem::Specification.new do |s|
  s.name = "rails_layout".freeze
  s.version = "1.0.42"

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Daniel Kehoe".freeze]
  s.date = "2018-02-09"
  s.description = "Generates Rails application layout files for use with various front-end frameworks.".freeze
  s.email = ["daniel@danielkehoe.com".freeze]
  s.homepage = "http://github.com/RailsApps/rails_layout/".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "2.7.6.2".freeze
  s.summary = "Rails generator creates application layout files for Bootstrap and other frameworks.".freeze

  s.installed_by_version = "2.7.6.2" if s.respond_to? :installed_by_version

  if s.respond_to? :specification_version then
    s.specification_version = 4

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_development_dependency(%q<bundler>.freeze, ["~> 1.3"])
      s.add_development_dependency(%q<rake>.freeze, [">= 0"])
    else
      s.add_dependency(%q<bundler>.freeze, ["~> 1.3"])
      s.add_dependency(%q<rake>.freeze, [">= 0"])
    end
  else
    s.add_dependency(%q<bundler>.freeze, ["~> 1.3"])
    s.add_dependency(%q<rake>.freeze, [">= 0"])
  end
end
