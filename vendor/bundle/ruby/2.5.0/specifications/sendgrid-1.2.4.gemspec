# -*- encoding: utf-8 -*-
# stub: sendgrid 1.2.4 ruby lib

Gem::Specification.new do |s|
  s.name = "sendgrid".freeze
  s.version = "1.2.4"

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Stephen Blankenship".freeze, "Marc Tremblay".freeze, "Bob Burbach".freeze]
  s.date = "2016-01-08"
  s.description = "This gem allows simple integration between ActionMailer and SendGrid. \n                         SendGrid is an email deliverability API that is affordable and has lots of bells and whistles.".freeze
  s.email = "stephenrb@gmail.com".freeze
  s.extra_rdoc_files = ["LICENSE".freeze, "README.md".freeze]
  s.files = ["LICENSE".freeze, "README.md".freeze]
  s.homepage = "http://github.com/stephenb/sendgrid".freeze
  s.rubygems_version = "2.7.6.2".freeze
  s.summary = "A gem that allows simple integration of ActionMailer with SendGrid (http://sendgrid.com)".freeze

  s.installed_by_version = "2.7.6.2" if s.respond_to? :installed_by_version

  if s.respond_to? :specification_version then
    s.specification_version = 3

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_runtime_dependency(%q<json>.freeze, [">= 0"])
      s.add_development_dependency(%q<shoulda>.freeze, [">= 0"])
      s.add_development_dependency(%q<bundler>.freeze, ["~> 1.0.0"])
      s.add_development_dependency(%q<jeweler>.freeze, ["~> 1.5.1"])
      s.add_runtime_dependency(%q<json>.freeze, [">= 0"])
    else
      s.add_dependency(%q<json>.freeze, [">= 0"])
      s.add_dependency(%q<shoulda>.freeze, [">= 0"])
      s.add_dependency(%q<bundler>.freeze, ["~> 1.0.0"])
      s.add_dependency(%q<jeweler>.freeze, ["~> 1.5.1"])
      s.add_dependency(%q<json>.freeze, [">= 0"])
    end
  else
    s.add_dependency(%q<json>.freeze, [">= 0"])
    s.add_dependency(%q<shoulda>.freeze, [">= 0"])
    s.add_dependency(%q<bundler>.freeze, ["~> 1.0.0"])
    s.add_dependency(%q<jeweler>.freeze, ["~> 1.5.1"])
    s.add_dependency(%q<json>.freeze, [">= 0"])
  end
end
