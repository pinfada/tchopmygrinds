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
import { Card, Button, Badge, Alert } from '../ui';

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
      <Card className={className}>
        <Card.Body className="text-center py-12">
          <div className="text-slate-400 text-5xl mb-4">🏪</div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Accès marchand requis
          </h3>
          <p className="text-slate-600 mb-6">
            Cette section est réservée aux marchands pour gérer les manifestations d'intérêt.
          </p>
          <Button onClick={() => window.location.href = '/dashboard'}>Tableau de bord marchand</Button>
        </Card.Body>
      </Card>
    );
  }

  if (merchantLoading && merchantInterests.length === 0) {
    return (
      <Card className={className}>
        <Card.Body>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-100 rounded-md"></div>
            ))}
          </div>
        </Card.Body>
      </Card>
    );
  }

  const groupedInterests = groupInterestsByProduct();

  return (
    <Card className={className}>
      <Card.Header>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              📋 Manifestations d'intérêt pour mes produits
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              {merchantTotalCount} manifestation{merchantTotalCount !== 1 ? 's' : ''} d'intérêt active{merchantTotalCount !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <label className="text-sm text-slate-600 font-medium">
              Rayon de notification:
            </label>
            <select
              value={selectedRadius}
              onChange={(e) => setSelectedRadius(parseInt(e.target.value))}
              className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
            >
              <option value={25}>25 km</option>
              <option value={50}>50 km</option>
              <option value={75}>75 km</option>
              <option value={100}>100 km</option>
            </select>
          </div>
        </div>
      </Card.Header>

      <Card.Body>
        {merchantError && (
          <div className="mb-6">
            <Alert variant="error">
              {merchantError}
            </Alert>
          </div>
        )}

        <div className="space-y-8">
        {Object.keys(groupedInterests).length === 0 ? (
          <div className="text-center py-12">
            <div className="text-slate-400 text-5xl mb-4">📝</div>
            <h4 className="text-lg font-semibold text-slate-900 mb-2">
              Aucune manifestation d'intérêt
            </h4>
            <p className="text-slate-600">
              Il n'y a actuellement aucune manifestation d'intérêt pour vos produits.
            </p>
          </div>
        ) : (
          Object.entries(groupedInterests).map(([productName, interests]) => {
            const matchingProducts = getMatchingProducts(productName);
            
            return (
              <div key={productName} className="p-6 border border-slate-200 rounded-lg">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 mb-2">
                      🔍 {interests[0].product_name}
                    </h4>
                    <p className="text-sm text-slate-600">
                      {interests.length} personne{interests.length !== 1 ? 's' : ''} intéressée{interests.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  {matchingProducts.length > 0 && (
                    <div className="text-right">
                      <Badge variant="success" className="mb-3">
                        ✅ {matchingProducts.length} produit{matchingProducts.length !== 1 ? 's' : ''} en stock
                      </Badge>
                      <div className="space-y-2">
                        {matchingProducts.map(product => (
                          <Button
                            key={product.id}
                            size="sm"
                            onClick={() => handleNotifyAvailability(product.id, product.name)}
                            loading={notifyingProducts.has(product.id)}
                            disabled={notifyingProducts.has(product.id)}
                            className="block w-full"
                          >
                            {notifyingProducts.has(product.id) ? (
                              'Notification...'
                            ) : (
                              `📧 Notifier pour "${product.name}"`
                            )}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {interests.map((interest) => (
                    <div key={interest.id} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">
                            👤 {interest.user.name}
                          </p>
                          <p className="text-xs text-slate-600">
                            {interest.user.email}
                          </p>
                        </div>
                        {interest.distance && (
                          <Badge variant="info" className="text-xs">
                            {interest.distance} km
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2 text-xs text-slate-600">
                        <p>📍 Rayon: {interest.search_radius} km</p>
                        <p>🕐 {formatDate(interest.created_at)}</p>
                        
                        {interest.message && (
                          <div className="bg-white p-3 rounded-md border border-slate-200 mt-3">
                            <p className="text-xs italic text-slate-700">
                              💬 "{interest.message}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {matchingProducts.length === 0 && (
                  <div className="mt-6">
                    <Alert variant="warning">
                      ⚠️ Aucun produit correspondant en stock. Ajoutez "{productName}" à votre inventaire pour notifier ces clients.
                    </Alert>
                  </div>
                )}
              </div>
            );
          })
        )}
        </div>
      </Card.Body>

      {/* Pagination */}
      {merchantTotalPages > 1 && (
        <Card.Footer className="justify-between">
          <div className="text-sm text-slate-600">
            Page {merchantCurrentPage} sur {merchantTotalPages}
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handlePageChange(merchantCurrentPage - 1)}
              disabled={merchantCurrentPage === 1 || merchantLoading}
            >
              Précédent
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handlePageChange(merchantCurrentPage + 1)}
              disabled={merchantCurrentPage === merchantTotalPages || merchantLoading}
            >
              Suivant
            </Button>
          </div>
        </Card.Footer>
      )}
    </Card>
  );
};

export default MerchantInterestDashboard;