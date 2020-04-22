# -*- encoding: utf-8 -*-
# stub: minitest-rails-capybara 3.0.2 ruby lib

Gem::Specification.new do |s|
  s.name = "minitest-rails-capybara".freeze
  s.version = "3.0.2"

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Mike Moore".freeze]
  s.date = "2019-09-10"
  s.description = "Adds Capybara feature tests in Minitest and Rails.".freeze
  s.email = ["mike@blowmage.com".freeze]
  s.extra_rdoc_files = ["CHANGELOG.rdoc".freeze, "Manifest.txt".freeze, "README.rdoc".freeze]
  s.files = ["CHANGELOG.rdoc".freeze, "Manifest.txt".freeze, "README.rdoc".freeze]
  s.homepage = "http://blowmage.com/minitest-rails-capybara".freeze
  s.licenses = ["MIT".freeze]
  s.rdoc_options = ["--main".freeze, "README.rdoc".freeze]
  s.rubygems_version = "2.7.6.2".freeze
  s.summary = "Capybara integration for Minitest and Rails".freeze

  s.installed_by_version = "2.7.6.2" if s.respond_to? :installed_by_version

  if s.respond_to? :specification_version then
    s.specification_version = 4

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_runtime_dependency(%q<minitest-rails>.freeze, ["~> 3.0"])
      s.add_runtime_dependency(%q<capybara>.freeze, ["<= 4", ">= 2.7"])
      s.add_runtime_dependency(%q<minitest-capybara>.freeze, ["~> 0.8"])
      s.add_runtime_dependency(%q<minitest-metadata>.freeze, ["~> 0.6"])
      s.add_development_dependency(%q<rdoc>.freeze, ["< 7", ">= 4.0"])
      s.add_development_dependency(%q<hoe>.freeze, ["~> 3.18"])
    else
      s.add_dependency(%q<minitest-rails>.freeze, ["~> 3.0"])
      s.add_dependency(%q<capybara>.freeze, ["<= 4", ">= 2.7"])
      s.add_dependency(%q<minitest-capybara>.freeze, ["~> 0.8"])
      s.add_dependency(%q<minitest-metadata>.freeze, ["~> 0.6"])
      s.add_dependency(%q<rdoc>.freeze, ["< 7", ">= 4.0"])
      s.add_dependency(%q<hoe>.freeze, ["~> 3.18"])
    end
  else
    s.add_dependency(%q<minitest-rails>.freeze, ["~> 3.0"])
    s.add_dependency(%q<capybara>.freeze, ["<= 4", ">= 2.7"])
    s.add_dependency(%q<minitest-capybara>.freeze, ["~> 0.8"])
    s.add_dependency(%q<minitest-metadata>.freeze, ["~> 0.6"])
    s.add_dependency(%q<rdoc>.freeze, ["< 7", ">= 4.0"])
    s.add_dependency(%q<hoe>.freeze, ["~> 3.18"])
  end
end
