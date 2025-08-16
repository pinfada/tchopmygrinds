import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { createProductInterest, clearErrors } from '../../store/slices/productInterestSlice';
import { addNotification } from '../../store/slices/notificationSlice';
import { Card, Button, Input, Alert } from '../ui';

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
    <Card className={className}>
      <Card.Header>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            🔍 Manifester votre intérêt
          </h3>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-600 p-1 rounded transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <p className="text-sm text-slate-600 mt-2">
          Vous ne trouvez pas un produit ? Manifestez votre intérêt et nous vous notifierons 
          dès qu'il sera disponible près de vous !
        </p>
      </Card.Header>

      <Card.Body>

        <form id="product-interest-form" onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Nom du produit *"
            type="text"
            name="product_name"
            value={formData.product_name}
            onChange={handleInputChange}
            placeholder="Ex: Tomates fraîches, Pain complet, etc."
            disabled={creating}
            required
          />

          <div>
            <label htmlFor="search_radius" className="block text-sm font-medium text-slate-700 mb-2">
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
              className="w-full h-2 bg-slate-200 rounded-pill appearance-none cursor-pointer accent-brand-500"
              disabled={creating}
            />
            <div className="flex justify-between text-xs text-slate-500 mt-2">
              <span>5 km</span>
              <span>100 km</span>
            </div>
          </div>

          <Input.Textarea
            label="Message complémentaire (optionnel)"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            placeholder="Précisez vos préférences (quantité, qualité, prix, etc.)"
            rows={3}
            disabled={creating}
          />

          {/* Position info */}
          <Alert variant="info">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm">
                  📍 Position: {position ? 'Détectée' : 'Non disponible'}
                </span>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={useCurrentLocation}
                  onChange={(e) => setUseCurrentLocation(e.target.checked)}
                  className="mr-2 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  disabled={!position || creating}
                />
                <span className="text-sm">Utiliser ma position</span>
              </label>
            </div>
            {position && (
              <p className="text-xs mt-2 opacity-75">
                Lat: {position.latitude.toFixed(4)}, Lng: {position.longitude.toFixed(4)}
              </p>
            )}
          </Alert>

          {createError && (
            <Alert variant="error">
              {createError}
            </Alert>
          )}

        </form>
      </Card.Body>
      
      <Card.Footer className="justify-between">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={creating}
          >
            Annuler
          </Button>
        )}
        
        <Button
          type="submit"
          form="product-interest-form"
          loading={creating}
          disabled={!position || !formData.product_name.trim()}
          className={onCancel ? '' : 'ml-auto'}
        >
          {creating ? 'Enregistrement...' : '🔔 Notifier quand disponible'}
        </Button>
      </Card.Footer>
    </Card>
  );
};

export default ProductInterestForm;