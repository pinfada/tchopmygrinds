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
      <div className={`bg-white rounded-lg shadow-md p-6 text-center ${className}`}>
        <p className="text-gray-600">Connectez-vous pour voir vos manifestations d'intérêt</p>
      </div>
    );
  }

  if (loading && interests.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              🔔 Mes manifestations d'intérêt
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {totalCount} manifestation{totalCount !== 1 ? 's' : ''} d'intérêt
            </p>
          </div>
          
          {showCreateButton && (
            <button
              onClick={onCreateClick}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            >
              ➕ Nouvelle manifestation
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-6 bg-red-50 border-b border-red-200">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="divide-y divide-gray-200">
        {interests.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-gray-400 text-4xl mb-4">🔍</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Aucune manifestation d'intérêt
            </h4>
            <p className="text-gray-600 mb-4">
              Vous n'avez pas encore manifesté votre intérêt pour des produits.
            </p>
            {showCreateButton && onCreateClick && (
              <button
                onClick={onCreateClick}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Créer une manifestation d'intérêt
              </button>
            )}
          </div>
        ) : (
          interests.map((interest) => (
            <div key={interest.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="text-md font-medium text-gray-900">
                      {interest.product_name}
                    </h4>
                    
                    {interest.fulfilled ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✅ Satisfait
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        ⏳ En attente
                      </span>
                    )}
                    
                    {interest.email_sent && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        📧 Notifié
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>📍 Rayon de recherche: {interest.search_radius} km</p>
                    <p>🕐 Créé {formatDate(interest.created_at)}</p>
                    
                    {interest.message && (
                      <p className="bg-gray-100 p-2 rounded text-sm italic">
                        💬 "{interest.message}"
                      </p>
                    )}
                    
                    {interest.fulfilled_at && (
                      <p className="text-green-600">
                        ✅ Satisfait le {formatDate(interest.fulfilled_at)}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="ml-4 flex items-center space-x-2">
                  {!interest.fulfilled && (
                    <button
                      onClick={() => handleDelete(interest.id)}
                      disabled={deletingIds.has(interest.id)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md disabled:opacity-50"
                      title="Supprimer"
                    >
                      {deletingIds.has(interest.id) ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {currentPage} sur {totalPages}
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
            >
              Précédent
            </button>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductInterestList;