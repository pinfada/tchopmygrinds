import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from '../components/ui';

const UnauthorizedPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center px-4 py-8 sm:py-12">
      <Card className="max-w-md w-full">
        <Card.Body className="text-center py-12">
          <div className="text-red-500 text-6xl mb-6">🚫</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            Accès Non Autorisé
          </h1>
          <p className="text-slate-600 mb-8">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <div className="space-y-4">
            <Button as={Link} to="/" className="w-full">
              Retour à l'accueil
            </Button>
            <Button variant="secondary" as={Link} to="/auth" className="w-full">
              Se connecter avec un autre compte
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default UnauthorizedPage;