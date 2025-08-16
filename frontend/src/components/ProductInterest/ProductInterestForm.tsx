import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { createProductInterest, clearErrors } from '../../store/slices/productInterestSlice';
import { addNotification } from '../../store/slices/notificationSlice';

interface ProductInterestFormProps {
  initialProductName?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

const ProductInterestForm: React.FC<ProductInterestFormProps> = ({
  initialProductName = '',
  onSuccess,
  onCancel,
  className = ''
}) => {
  const dispatch = useAppDispatch();
  const { creating, createError } = useAppSelector(state => state.productInterest);
  const { position } = useAppSelector(state => state.location);
  const { user } = useAppSelector(state => state.auth);

  const [formData, setFormData] = useState({
    product_name: initialProductName,
    message: '',
    search_radius: 25
  });

  const [useCurrentLocation, setUseCurrentLocation] = useState(true);

  useEffect(() => {
    if (initialProductName) {
      setFormData(prev => ({ ...prev, product_name: initialProductName }));
    }
  }, [initialProductName]);

  useEffect(() => {
    return () => {
      dispatch(clearErrors());
    };
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      dispatch(addNotification({
        type: 'error',
        message: 'Vous devez être connecté pour manifester votre intérêt'
      }));
      return;
    }

    if (!formData.product_name.trim()) {
      dispatch(addNotification({
        type: 'error',
        message: 'Veuillez spécifier le nom du produit'
      }));
      return;
    }

    // Utiliser la position actuelle si disponible et demandée
    let latitude, longitude;
    if (useCurrentLocation && position) {
      latitude = position.latitude;
      longitude = position.longitude;
    }

    if (!latitude || !longitude) {
      dispatch(addNotification({
        type: 'error',
        message: 'Position géographique requise pour créer une manifestation d\'intérêt'
      }));
      return;
    }

    try {
      await dispatch(createProductInterest({
        ...formData,
        latitude,
        longitude
      })).unwrap();

      dispatch(addNotification({
        type: 'success',
        message: 'Manifestation d\'intérêt enregistrée ! Nous vous notifierons dès qu\'un produit correspondant sera disponible.'
      }));

      // Reset form
      setFormData({
        product_name: '',
        message: '',
        search_radius: 25
      });

      onSuccess?.();
    } catch (error) {
      // Error handled by the slice
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'search_radius' ? parseInt(value) || 0 : value
    }));
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          🔍 Manifester votre intérêt
        </h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      <p className="text-sm text-gray-600 mb-6">
        Vous ne trouvez pas un produit ? Manifestez votre intérêt et nous vous notifierons 
        dès qu'il sera disponible près de vous !
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="product_name" className="block text-sm font-medium text-gray-700 mb-1">
            Nom du produit *
          </label>
          <input
            type="text"
            id="product_name"
            name="product_name"
            value={formData.product_name}
            onChange={handleInputChange}
            placeholder="Ex: Tomates fraîches, Pain complet, etc."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={creating}
            required
          />
        </div>

        <div>
          <label htmlFor="search_radius" className="block text-sm font-medium text-gray-700 mb-1">
            Rayon de recherche: {formData.search_radius} km
          </label>
          <input
            type="range"
            id="search_radius"
            name="search_radius"
            min="5"
            max="100"
            step="5"
            value={formData.search_radius}
            onChange={handleInputChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            disabled={creating}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>5 km</span>
            <span>100 km</span>
          </div>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Message complémentaire (optionnel)
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            placeholder="Précisez vos préférences (quantité, qualité, prix, etc.)"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            disabled={creating}
          />
        </div>

        {/* Position info */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm text-blue-800">
                📍 Position: {position ? 'Détectée' : 'Non disponible'}
              </span>
            </div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={useCurrentLocation}
                onChange={(e) => setUseCurrentLocation(e.target.checked)}
                className="mr-2"
                disabled={!position || creating}
              />
              <span className="text-sm text-blue-800">Utiliser ma position</span>
            </label>
          </div>
          {position && (
            <p className="text-xs text-blue-600 mt-1">
              Lat: {position.latitude.toFixed(4)}, Lng: {position.longitude.toFixed(4)}
            </p>
          )}
        </div>

        {createError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-800">{createError}</p>
          </div>
        )}

        <div className="flex space-x-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={creating}
            >
              Annuler
            </button>
          )}
          
          <button
            type="submit"
            disabled={creating || !position || !formData.product_name.trim()}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {creating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Enregistrement...
              </>
            ) : (
              '🔔 Notifier quand disponible'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductInterestForm;