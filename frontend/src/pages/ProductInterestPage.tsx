import React, { useState } from 'react';
import { useAppSelector } from '../hooks/redux';
import Layout from '../components/Layout';
import { Modal } from '../components/ui/Modal';
import { 
  ProductInterestForm, 
  ProductInterestList, 
  MerchantInterestDashboard 
} from '../components/ProductInterest';

const ProductInterestPage: React.FC = () => {
  const { user } = useAppSelector(state => state.auth);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'interests' | 'merchant'>('interests');

  // Vérifier si l'utilisateur est un marchand
  const isMerchant = user?.statut_type === 'itinerant' || user?.statut_type === 'sedentary';

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🔔 Manifestations d'intérêt
            </h1>
            <p className="text-gray-600">
              {isMerchant 
                ? "Gérez vos manifestations d'intérêt et notifiez vos clients de la disponibilité de vos produits"
                : "Manifestez votre intérêt pour des produits et recevez des notifications quand ils sont disponibles"
              }
            </p>
          </div>

          {/* Tabs pour les marchands */}
          {isMerchant && (
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('interests')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'interests'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    👤 Mes manifestations
                  </button>
                  <button
                    onClick={() => setActiveTab('merchant')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'merchant'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    🏪 Dashboard marchand
                  </button>
                </nav>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="space-y-6">
            {(!isMerchant || activeTab === 'interests') && (
              <>
                {/* Quick Create Button */}
                <div className="text-center">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    ➕ Nouvelle manifestation d'intérêt
                  </button>
                </div>

                {/* User Interests List */}
                <ProductInterestList 
                  onCreateClick={() => setShowCreateModal(true)}
                  showCreateButton={false}
                />
              </>
            )}

            {/* Merchant Dashboard */}
            {isMerchant && activeTab === 'merchant' && (
              <MerchantInterestDashboard />
            )}
          </div>

          {/* Create Modal */}
          <Modal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            title="Nouvelle manifestation d'intérêt"
            size="md"
          >
            <ProductInterestForm
              onSuccess={handleCreateSuccess}
              onCancel={() => setShowCreateModal(false)}
            />
          </Modal>
        </div>
      </div>
    </Layout>
  );
};

export default ProductInterestPage;