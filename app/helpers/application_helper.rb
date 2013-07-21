module ApplicationHelper
  # Retourner un titre basé sur la page.
  def full_title(titre)
    base_titre = "Premiere app tuto ruby on rails"
    if titre.empty?
      base_titre
   # Dans le cas ou le titre est renseigné
    else
      "#{base_titre} | #{@titre}"
    end
  end
end
