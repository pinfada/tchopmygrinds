# exit on error
set -o errexit

bundle install
# Précompiler les actifs Rails (y compris les styles Tailwind)
bundle exec rails assets:precompile
# Nettoyer les anciens actifs
bundle exec rails assets:clean
# Exécuter les migrations de base de données
bundle exec rails db:migrate