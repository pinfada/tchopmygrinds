import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { 
  fetchProductInterests, 
  deleteProductInterest, 
  setCurrentPage 
} from '../../store/slices/productInterestSlice';
import { addNotification } from '../../store/slices/notificationSlice';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, Button, Badge, Alert } from '../ui';

interface ProductInterestListProps {
  className?: string;
  showCreateButton?: boolean;
  onCreateClick?: () => void;
}

const ProductInterestList: React.FC<ProductInterestListProps> = ({
  className = '',
  showCreateButton = true,
  onCreateClick
}) => {
  const dispatch = useAppDispatch();
  const { 
    interests, 
    loading, 
    error, 
    currentPage, 
    totalPages, 
    totalCount 
  } = useAppSelector(state => state.productInterest);
  const { user } = useAppSelector(state => state.auth);

  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (user) {
      dispatch(fetchProductInterests({ page: currentPage }));
    }
  }, [dispatch, user, currentPage]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette manifestation d\'intérêt ?')) {
      setDeletingIds(prev => new Set(prev).add(id));
      
      try {
        await dispatch(deleteProductInterest(id)).unwrap();
        dispatch(addNotification({
          type: 'success',
          message: 'Manifestation d\'intérêt supprimée'
        }));
      } catch (error) {
        dispatch(addNotification({
          type: 'error',
          message: 'Erreur lors de la suppression'
        }));
      } finally {
        setDeletingIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    }
  };

  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
  };

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { 
      addSuffix: true, 
      locale: fr 
    });
  };

  if (!user) {
    return (
      <Card className={className}>
        <Card.Body className="text-center py-12">
          <div className="text-slate-400 text-5xl mb-4">👤</div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Connexion requise</h3>
          <p className="text-slate-600 mb-6">Connectez-vous pour voir vos manifestations d'intérêt</p>
          <Button onClick={() => window.location.href = '/auth'}>Se connecter</Button>
        </Card.Body>
      </Card>
    );
  }

  if (loading && interests.length === 0) {
    return (
      <Card className={className}>
        <Card.Body>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-md"></div>
            ))}
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <Card.Header>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              🔔 Mes manifestations d'intérêt
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              {totalCount} manifestation{totalCount !== 1 ? 's' : ''} d'intérêt
            </p>
          </div>
          
          {showCreateButton && (
            <Button
              onClick={onCreateClick}
              size="sm"
              className="shrink-0"
            >
              ➕ Nouvelle manifestation
            </Button>
          )}
        </div>
      </Card.Header>

      <Card.Body>
        {error && (
          <div className="mb-6">
            <Alert variant="error">
              {error}
            </Alert>
          </div>
        )}

        <div className="space-y-6">
        {interests.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-slate-400 text-5xl mb-4">🔍</div>
            <h4 className="text-lg font-semibold text-slate-900 mb-2">
              Aucune manifestation d'intérêt
            </h4>
            <p className="text-slate-600 mb-6">
              Vous n'avez pas encore manifesté votre intérêt pour des produits.
            </p>
            {showCreateButton && onCreateClick && (
              <Button onClick={onCreateClick}>
                Créer une manifestation d'intérêt
              </Button>
            )}
          </div>
        ) : (
          interests.map((interest) => (
            <div key={interest.id} className="p-6 border border-slate-200 rounded-lg hover:border-slate-300 hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h4 className="text-md font-semibold text-slate-900">
                      {interest.product_name}
                    </h4>
                    
                    {interest.fulfilled ? (
                      <Badge variant="success">
                        ✅ Satisfait
                      </Badge>
                    ) : (
                      <Badge variant="warning">
                        ⏳ En attente
                      </Badge>
                    )}
                    
                    {interest.email_sent && (
                      <Badge variant="info">
                        📧 Notifié
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm text-slate-600">
                    <p>📍 Rayon de recherche: {interest.search_radius} km</p>
                    <p>🕐 Créé {formatDate(interest.created_at)}</p>
                    
                    {interest.message && (
                      <div className="bg-slate-50 p-3 rounded-md border-l-4 border-brand-200">
                        <p className="text-sm italic text-slate-700">
                          💬 "{interest.message}"
                        </p>
                      </div>
                    )}
                    
                    {interest.fulfilled_at && (
                      <p className="text-brand-600 font-medium">
                        ✅ Satisfait le {formatDate(interest.fulfilled_at)}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="ml-4 flex items-center space-x-2">
                  {!interest.fulfilled && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(interest.id)}
                      loading={deletingIds.has(interest.id)}
                      disabled={deletingIds.has(interest.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        </div>
      </Card.Body>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card.Footer className="justify-between">
          <div className="text-sm text-slate-600">
            Page {currentPage} sur {totalPages}
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
            >
              Précédent
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
            >
              Suivant
            </Button>
          </div>
        </Card.Footer>
      )}
    </Card>
  );
};

export default ProductInterestList;