# -*- encoding: utf-8 -*-
# stub: angular-rails-templates 1.1.0 ruby lib

Gem::Specification.new do |s|
  s.name = "angular-rails-templates".freeze
  s.version = "1.1.0"

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Damien Mathieu".freeze, "pitr".freeze, "whitehat101".freeze]
  s.date = "2020-04-08"
  s.email = ["pitr.vern@gmail.com".freeze]
  s.homepage = "https://github.com/pitr/angular-rails-templates".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "2.7.6.2".freeze
  s.summary = "Use your angular templates with rails' asset pipeline".freeze

  s.installed_by_version = "2.7.6.2" if s.respond_to? :installed_by_version

  if s.respond_to? :specification_version then
    s.specification_version = 4

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_runtime_dependency(%q<railties>.freeze, ["< 7", ">= 4.2"])
      s.add_runtime_dependency(%q<sprockets>.freeze, ["< 5", ">= 3.0"])
      s.add_runtime_dependency(%q<tilt>.freeze, [">= 0"])
      s.add_development_dependency(%q<minitest>.freeze, [">= 0"])
      s.add_development_dependency(%q<capybara>.freeze, [">= 0"])
      s.add_development_dependency(%q<uglifier>.freeze, [">= 0"])
    else
      s.add_dependency(%q<railties>.freeze, ["< 7", ">= 4.2"])
      s.add_dependency(%q<sprockets>.freeze, ["< 5", ">= 3.0"])
      s.add_dependency(%q<tilt>.freeze, [">= 0"])
      s.add_dependency(%q<minitest>.freeze, [">= 0"])
      s.add_dependency(%q<capybara>.freeze, [">= 0"])
      s.add_dependency(%q<uglifier>.freeze, [">= 0"])
    end
  else
    s.add_dependency(%q<railties>.freeze, ["< 7", ">= 4.2"])
    s.add_dependency(%q<sprockets>.freeze, ["< 5", ">= 3.0"])
    s.add_dependency(%q<tilt>.freeze, [">= 0"])
    s.add_dependency(%q<minitest>.freeze, [">= 0"])
    s.add_dependency(%q<capybara>.freeze, [">= 0"])
    s.add_dependency(%q<uglifier>.freeze, [">= 0"])
  end
end
