import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { 
  fetchMerchantProductInterests,
  notifyProductAvailability,
  setMerchantCurrentPage 
} from '../../store/slices/productInterestSlice';
import { addNotification } from '../../store/slices/notificationSlice';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MerchantInterestDashboardProps {
  className?: string;
}

const MerchantInterestDashboard: React.FC<MerchantInterestDashboardProps> = ({
  className = ''
}) => {
  const dispatch = useAppDispatch();
  const { 
    merchantInterests, 
    merchantLoading, 
    merchantError,
    merchantCurrentPage,
    merchantTotalPages,
    merchantTotalCount
  } = useAppSelector(state => state.productInterest);
  const { user } = useAppSelector(state => state.auth);
  const { products } = useAppSelector(state => state.product);

  const [notifyingProducts, setNotifyingProducts] = useState<Set<number>>(new Set());
  const [selectedRadius, setSelectedRadius] = useState(50);

  // Vérifier si l'utilisateur est un marchand
  const isMerchant = user?.statut_type === 'itinerant' || user?.statut_type === 'sedentary';

  useEffect(() => {
    if (isMerchant) {
      dispatch(fetchMerchantProductInterests({ page: merchantCurrentPage }));
    }
  }, [dispatch, isMerchant, merchantCurrentPage]);

  const handleNotifyAvailability = async (productId: number, productName: string) => {
    setNotifyingProducts(prev => new Set(prev).add(productId));
    
    try {
      const result = await dispatch(notifyProductAvailability({ 
        productId, 
        radius: selectedRadius 
      })).unwrap();
      
      dispatch(addNotification({
        type: 'success',
        message: `${result.interests_notified} notifications envoyées pour "${productName}"`
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: typeof error === 'string' ? error : 'Erreur lors de l\'envoi des notifications'
      }));
    } finally {
      setNotifyingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handlePageChange = (page: number) => {
    dispatch(setMerchantCurrentPage(page));
  };

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { 
      addSuffix: true, 
      locale: fr 
    });
  };

  const groupInterestsByProduct = () => {
    const grouped: { [key: string]: typeof merchantInterests } = {};
    merchantInterests.forEach(interest => {
      const productName = interest.product_name.toLowerCase();
      if (!grouped[productName]) {
        grouped[productName] = [];
      }
      grouped[productName].push(interest);
    });
    return grouped;
  };

  const getMatchingProducts = (productName: string) => {
    return products.filter(product => 
      product.name.toLowerCase().includes(productName.toLowerCase()) && 
      product.unitsinstock > 0
    );
  };

  if (!isMerchant) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 text-center ${className}`}>
        <div className="text-gray-400 text-4xl mb-4">🏪</div>
        <h4 className="text-lg font-medium text-gray-900 mb-2">
          Accès marchand requis
        </h4>
        <p className="text-gray-600">
          Cette section est réservée aux marchands pour gérer les manifestations d'intérêt.
        </p>
      </div>
    );
  }

  if (merchantLoading && merchantInterests.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const groupedInterests = groupInterestsByProduct();

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              📋 Manifestations d'intérêt pour mes produits
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {merchantTotalCount} manifestation{merchantTotalCount !== 1 ? 's' : ''} d'intérêt active{merchantTotalCount !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">
              Rayon de notification:
            </label>
            <select
              value={selectedRadius}
              onChange={(e) => setSelectedRadius(parseInt(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value={25}>25 km</option>
              <option value={50}>50 km</option>
              <option value={75}>75 km</option>
              <option value={100}>100 km</option>
            </select>
          </div>
        </div>
      </div>

      {merchantError && (
        <div className="p-6 bg-red-50 border-b border-red-200">
          <p className="text-sm text-red-800">{merchantError}</p>
        </div>
      )}

      <div className="divide-y divide-gray-200">
        {Object.keys(groupedInterests).length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-gray-400 text-4xl mb-4">📝</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Aucune manifestation d'intérêt
            </h4>
            <p className="text-gray-600">
              Il n'y a actuellement aucune manifestation d'intérêt pour vos produits.
            </p>
          </div>
        ) : (
          Object.entries(groupedInterests).map(([productName, interests]) => {
            const matchingProducts = getMatchingProducts(productName);
            
            return (
              <div key={productName} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-2">
                      🔍 {interests[0].product_name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {interests.length} personne{interests.length !== 1 ? 's' : ''} intéressée{interests.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  {matchingProducts.length > 0 && (
                    <div className="text-right">
                      <p className="text-sm text-green-600 mb-2">
                        ✅ {matchingProducts.length} produit{matchingProducts.length !== 1 ? 's' : ''} en stock
                      </p>
                      {matchingProducts.map(product => (
                        <button
                          key={product.id}
                          onClick={() => handleNotifyAvailability(product.id, product.name)}
                          disabled={notifyingProducts.has(product.id)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed mb-1 block"
                        >
                          {notifyingProducts.has(product.id) ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white inline-block mr-1"></div>
                              Notification...
                            </>
                          ) : (
                            `📧 Notifier pour "${product.name}"`
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {interests.map((interest) => (
                    <div key={interest.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            👤 {interest.user.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {interest.user.email}
                          </p>
                        </div>
                        {interest.distance && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {interest.distance} km
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-xs text-gray-600">
                        <p>📍 Rayon: {interest.search_radius} km</p>
                        <p>🕐 {formatDate(interest.created_at)}</p>
                        
                        {interest.message && (
                          <p className="bg-white p-2 rounded text-xs italic mt-2">
                            💬 "{interest.message}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {matchingProducts.length === 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Aucun produit correspondant en stock. Ajoutez "{productName}" à votre inventaire pour notifier ces clients.
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {merchantTotalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {merchantCurrentPage} sur {merchantTotalPages}
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(merchantCurrentPage - 1)}
              disabled={merchantCurrentPage === 1 || merchantLoading}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
            >
              Précédent
            </button>
            
            <button
              onClick={() => handlePageChange(merchantCurrentPage + 1)}
              disabled={merchantCurrentPage === merchantTotalPages || merchantLoading}
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

export default MerchantInterestDashboard;