# exit on error
set -o errexit

# Forcer l'encodage UTF-8 pour éviter les erreurs sur Render
export LANG=C.UTF-8
export LC_ALL=C.UTF-8
# Fige l'encodage externe Ruby dès le démarrage du process (sinon Sprockets/terser
# lit certains JS vendor en ASCII-8BIT et casse sur les octets UTF-8 multi-bytes,
# ex. "\xC2" présent dans rails_admin/popper.js et bootstrap.js).
export RUBYOPT="-EUTF-8"

bundle install
# Installer les dépendances frontend, puis générer les assets React/Vite utilisés par pages/react_app.html.erb
npm ci --include=dev
npm run build:react
# Précompiler les actifs Rails (y compris les styles Tailwind)
bundle exec rails assets:precompile
# Nettoyer les anciens actifs
bundle exec rails assets:clean
# Exécuter les migrations de base de données
bundle exec rails db:migrate
