# -*- encoding: utf-8 -*-
# stub: minitest-capybara 0.9.0 ruby lib

Gem::Specification.new do |s|
  s.name = "minitest-capybara".freeze
  s.version = "0.9.0"

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Wojciech Mach".freeze]
  s.date = "2018-09-29"
  s.description = "Capybara matchers support for minitest unit and spec".freeze
  s.email = ["wojtek@wojtekmach.pl".freeze]
  s.homepage = "".freeze
  s.rubyforge_project = "minitest-capybara".freeze
  s.rubygems_version = "2.7.6.2".freeze
  s.summary = "Capybara matchers support for minitest unit and spec".freeze

  s.installed_by_version = "2.7.6.2" if s.respond_to? :installed_by_version

  if s.respond_to? :specification_version then
    s.specification_version = 4

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_runtime_dependency(%q<capybara>.freeze, [">= 0"])
      s.add_runtime_dependency(%q<rake>.freeze, [">= 0"])
      s.add_runtime_dependency(%q<minitest>.freeze, ["~> 5.0"])
    else
      s.add_dependency(%q<capybara>.freeze, [">= 0"])
      s.add_dependency(%q<rake>.freeze, [">= 0"])
      s.add_dependency(%q<minitest>.freeze, ["~> 5.0"])
    end
  else
    s.add_dependency(%q<capybara>.freeze, [">= 0"])
    s.add_dependency(%q<rake>.freeze, [">= 0"])
    s.add_dependency(%q<minitest>.freeze, ["~> 5.0"])
  end
end
