# Données de RÉFÉRENCE, jouées par `rails db:seed` et automatiquement par
# `db:prepare` / `db:setup` sur une base fraîchement créée. Ce fichier doit
# rester **idempotent** et **non destructeur** : il tourne sur des bases vides
# comme sur des bases déjà en service.
#
# Les jeux de données de démonstration vivent ailleurs et se jouent
# explicitement (`rails runner db/seeds_api.rb`, `db/seeds_modern.rb`,
# `db/seeds_simple.rb`).

# Le registre de devises est une donnée de référence, pas une donnée de test :
# sans lui, la validation d'inclusion de Commerce rejette toute création de
# commerce. Il a été inséré par la migration CreateCurrencies, mais une base
# montée par `db:schema:load` n'a jamais rejoué cette insertion — voir
# Currency::CANONICAL.
Currency.bootstrap!
puts "💶 Registre des devises : #{Currency.codes.join(', ')}"
