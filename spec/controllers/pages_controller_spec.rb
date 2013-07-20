require 'spec_helper'

describe PagesController do
  render_views

  describe "GET 'home'" do
    it "returns http success" do
      get 'home'
      response.should be_success
    end

    it "devrait avoir le bon titre" do
      get 'home'
      expect(response.body).to have_title("| Accueil")
    end
  end

  describe "GET 'contact'" do
    it "returns http success" do
      get 'contact'
      response.should be_success
    end

    it "devrait avoir le bon titre" do
      get 'contact'
      expect(response.body).to have_title("| Contact")
    end
  end

  describe "GET 'Propos'" do
    it "returns http success" do
      get 'Propos'
      response.should be_success
    end

    it "devrait avoir le bon titre" do
      get 'Propos'
      expect(response.body).to have_title("| Propos")
    end
  end

  describe "GET 'Aide'" do
    it "returns http success" do
      get 'Aide'
      response.should be_success
    end

    it "devrait avoir le bon titre" do
      get 'Aide'
      expect(response.body).to have_title("| Aide")
    end
  end

end
