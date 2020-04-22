# -*- encoding: utf-8 -*-
# stub: angular_rails_csrf 4.2.0 ruby lib

Gem::Specification.new do |s|
  s.name = "angular_rails_csrf".freeze
  s.version = "4.2.0"

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["James Sanders".freeze, "Ilya Bodrov".freeze]
  s.date = "2020-03-31"
  s.description = "AngularJS style CSRF protection for Rails".freeze
  s.email = ["sanderjd@gmail.com".freeze, "golosizpru@gmail.com".freeze]
  s.homepage = "https://github.com/jsanders/angular_rails_csrf".freeze
  s.licenses = ["MIT".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 2.3.0".freeze)
  s.rubygems_version = "2.7.6.2".freeze
  s.summary = "Support for AngularJS $http service style CSRF protection in Rails".freeze

  s.installed_by_version = "2.7.6.2" if s.respond_to? :installed_by_version

  if s.respond_to? :specification_version then
    s.specification_version = 4

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_development_dependency(%q<rake>.freeze, ["~> 13.0"])
      s.add_development_dependency(%q<test-unit>.freeze, ["~> 3.2"])
      s.add_development_dependency(%q<rails>.freeze, ["= 6.0.2.2"])
      s.add_runtime_dependency(%q<railties>.freeze, ["< 7", ">= 3"])
      s.add_development_dependency(%q<codecov>.freeze, ["~> 0.1"])
      s.add_development_dependency(%q<rubocop>.freeze, ["~> 0.60"])
      s.add_development_dependency(%q<rubocop-performance>.freeze, ["~> 1.5"])
      s.add_development_dependency(%q<simplecov>.freeze, ["~> 0.16"])
    else
      s.add_dependency(%q<rake>.freeze, ["~> 13.0"])
      s.add_dependency(%q<test-unit>.freeze, ["~> 3.2"])
      s.add_dependency(%q<rails>.freeze, ["= 6.0.2.2"])
      s.add_dependency(%q<railties>.freeze, ["< 7", ">= 3"])
      s.add_dependency(%q<codecov>.freeze, ["~> 0.1"])
      s.add_dependency(%q<rubocop>.freeze, ["~> 0.60"])
      s.add_dependency(%q<rubocop-performance>.freeze, ["~> 1.5"])
      s.add_dependency(%q<simplecov>.freeze, ["~> 0.16"])
    end
  else
    s.add_dependency(%q<rake>.freeze, ["~> 13.0"])
    s.add_dependency(%q<test-unit>.freeze, ["~> 3.2"])
    s.add_dependency(%q<rails>.freeze, ["= 6.0.2.2"])
    s.add_dependency(%q<railties>.freeze, ["< 7", ">= 3"])
    s.add_dependency(%q<codecov>.freeze, ["~> 0.1"])
    s.add_dependency(%q<rubocop>.freeze, ["~> 0.60"])
    s.add_dependency(%q<rubocop-performance>.freeze, ["~> 1.5"])
    s.add_dependency(%q<simplecov>.freeze, ["~> 0.16"])
  end
end
