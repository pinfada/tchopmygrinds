# exit on error
set -o errexit

# Forcer l'encodage UTF-8 pour éviter les erreurs sur Render
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

bundle install
# Précompiler les actifs Rails (y compris les styles Tailwind)
bundle exec rails assets:precompile
# Nettoyer les anciens actifs
bundle exec rails assets:clean
# Exécuter les migrations de base de données
bundle exec rails db:migrate