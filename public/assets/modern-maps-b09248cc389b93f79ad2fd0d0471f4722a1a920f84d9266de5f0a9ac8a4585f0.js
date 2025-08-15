/**
 * Modern Map Integration for TchopMyGrinds
 * Using OpenStreetMap with Leaflet - Free & Open Source
 * Optimized for banana plantain marketplace
 */

window.TchopMaps = (function() {
    'use strict';

    // Configuration
    const CONFIG = {
        DEFAULT_CENTER: [3.8480, 11.5021], // Yaoundé, Cameroon
        DEFAULT_ZOOM: 13,
        MIN_ZOOM: 8,
        MAX_ZOOM: 18,
        SEARCH_RADIUS: 50000, // 50km in meters
        TILE_SERVERS: {
            osm: {
                url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19
            },
            cartodb: {
                url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
                attribution: '© OpenStreetMap, © CartoDB',
                maxZoom: 19
            }
        },
        ICONS: {
            merchant: {
                fixed: '🏪',
                mobile: '🚐'
            },
            product: '🍌',
            user: '📍',
            search: '🔍'
        }
    };

    let mapInstance = null;
    let markersGroup = null;
    let userMarker = null;
    let searchCircle = null;

    /**
     * Initialize the map
     */
    function initMap(containerId, options = {}) {
        const settings = Object.assign({
            center: CONFIG.DEFAULT_CENTER,
            zoom: CONFIG.DEFAULT_ZOOM,
            tileServer: 'osm'
        }, options);

        // Create map instance
        mapInstance = L.map(containerId, {
            center: settings.center,
            zoom: settings.zoom,
            minZoom: CONFIG.MIN_ZOOM,
            maxZoom: CONFIG.MAX_ZOOM,
            zoomControl: true,
            attributionControl: true
        });

        // Add tile layer
        const tileConfig = CONFIG.TILE_SERVERS[settings.tileServer];
        L.tileLayer(tileConfig.url, {
            attribution: tileConfig.attribution,
            maxZoom: tileConfig.maxZoom,
            subdomains: 'abc'
        }).addTo(mapInstance);

        // Initialize marker groups
        markersGroup = L.layerGroup().addTo(mapInstance);

        // Add modern controls
        addModernControls();

        return mapInstance;
    }

    /**
     * Add modern map controls
     */
    function addModernControls() {
        // Custom zoom control styling
        const zoomControl = mapInstance.zoomControl;
        zoomControl.setPosition('bottomright');

        // Add geolocation control
        const geolocateControl = L.control({position: 'bottomright'});
        geolocateControl.onAdd = function(map) {
            const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
            div.innerHTML = '<a href="#" title="Ma position" role="button" aria-label="Localiser ma position">' +
                           '<span style="font-size: 18px;">📍</span></a>';
            
            L.DomEvent.on(div, 'click', function(e) {
                e.preventDefault();
                getCurrentLocation();
            });

            return div;
        };
        geolocateControl.addTo(mapInstance);
    }

    /**
     * Get user's current location
     */
    function getCurrentLocation() {
        if (!navigator.geolocation) {
            showNotification('La géolocalisation n\'est pas supportée par votre navigateur', 'error');
            return;
        }

        // Show loading
        showNotification('Localisation en cours...', 'info');

        navigator.geolocation.getCurrentPosition(
            function(position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const accuracy = position.coords.accuracy;

                // Update user marker
                setUserLocation([lat, lng], accuracy);
                
                // Center map on user location
                mapInstance.setView([lat, lng], 15);
                
                showNotification('Position trouvée!', 'success');
            },
            function(error) {
                let message = 'Erreur de géolocalisation';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        message = 'Permission de géolocalisation refusée';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = 'Position indisponible';
                        break;
                    case error.TIMEOUT:
                        message = 'Délai d\'attente dépassé';
                        break;
                }
                showNotification(message, 'error');
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
            }
        );
    }

    /**
     * Set user location marker
     */
    function setUserLocation(coords, accuracy) {
        // Remove existing user marker
        if (userMarker) {
            mapInstance.removeLayer(userMarker);
        }

        // Create user marker with accuracy circle
        const userIcon = L.divIcon({
            html: '<div class="user-marker">📍<div class="pulse"></div></div>',
            className: 'user-location-marker',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });

        userMarker = L.marker(coords, { icon: userIcon }).addTo(mapInstance);

        // Add accuracy circle if available
        if (accuracy && accuracy < 1000) {
            L.circle(coords, {
                radius: accuracy,
                color: '#007AFF',
                fillColor: '#007AFF',
                fillOpacity: 0.1,
                weight: 1,
                className: 'accuracy-circle'
            }).addTo(mapInstance);
        }
    }

    /**
     * Add merchants to map
     */
    function addMerchants(merchants) {
        // Clear existing markers
        markersGroup.clearLayers();

        merchants.forEach(function(merchant) {
            const icon = createMerchantIcon(merchant);
            const marker = L.marker([merchant.latitude, merchant.longitude], { icon: icon });
            
            // Create popup content
            const popupContent = createMerchantPopup(merchant);
            marker.bindPopup(popupContent, {
                maxWidth: 300,
                className: 'merchant-popup'
            });

            // Add click handler
            marker.on('click', function() {
                onMerchantClick(merchant);
            });

            markersGroup.addLayer(marker);
        });
    }

    /**
     * Create merchant icon
     */
    function createMerchantIcon(merchant) {
        const iconType = merchant.type === 'itinerant' ? 'mobile' : 'fixed';
        const emoji = CONFIG.ICONS.merchant[iconType];
        
        return L.divIcon({
            html: `<div class="merchant-marker ${iconType}">
                     <span class="emoji">${emoji}</span>
                     <div class="merchant-badge">${merchant.products_count || 0}</div>
                   </div>`,
            className: 'custom-marker',
            iconSize: [40, 40],
            iconAnchor: [20, 40]
        });
    }

    /**
     * Create merchant popup content
     */
    function createMerchantPopup(merchant) {
        const distance = merchant.distance ? `${merchant.distance.toFixed(1)} km` : '';
        
        return `
            <div class="merchant-popup-content">
                <h4>${merchant.nom || 'Commerce'}</h4>
                <p class="merchant-type">${merchant.type === 'itinerant' ? 'Ambulant' : 'Fixe'}</p>
                ${distance ? `<p class="distance">📍 ${distance}</p>` : ''}
                <p class="address">${merchant.ville || ''}</p>
                <div class="merchant-actions">
                    <button onclick="TchopMaps.viewMerchantProducts(${merchant.id})" class="btn btn-primary btn-sm">
                        Voir les produits
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Show search results on map
     */
    function showSearchResults(results, searchCenter, radius) {
        addMerchants(results);

        // Show search area
        if (searchCircle) {
            mapInstance.removeLayer(searchCircle);
        }

        searchCircle = L.circle(searchCenter, {
            radius: radius * 1000, // Convert km to meters
            color: '#28a745',
            fillColor: '#28a745',
            fillOpacity: 0.1,
            weight: 2,
            className: 'search-circle'
        }).addTo(mapInstance);

        // Fit map to show all results
        if (results.length > 0) {
            const group = new L.featureGroup(markersGroup.getLayers());
            if (group.getBounds().isValid()) {
                mapInstance.fitBounds(group.getBounds(), { padding: [20, 20] });
            }
        }
    }

    /**
     * Search products near location
     */
    function searchNearby(productName, location, radius) {
        showNotification(`Recherche de "${productName}" dans un rayon de ${radius}km...`, 'info');

        // API call would go here
        // For now, simulate search
        const mockResults = [
            {
                id: 1,
                nom: 'Marché Central',
                type: 'sedentaire',
                latitude: location[0] + 0.01,
                longitude: location[1] + 0.01,
                distance: 1.2,
                products_count: 5
            },
            {
                id: 2,
                nom: 'Vendeur Ambulant',
                type: 'itinerant',
                latitude: location[0] - 0.005,
                longitude: location[1] + 0.008,
                distance: 0.8,
                products_count: 3
            }
        ];

        showSearchResults(mockResults, location, radius);
    }

    /**
     * Notification system
     */
    function showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `map-notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto-hide
        setTimeout(function() {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, duration);
    }

    /**
     * Event handlers
     */
    function onMerchantClick(merchant) {
        console.log('Merchant clicked:', merchant);
        // Emit custom event
        document.dispatchEvent(new CustomEvent('merchantSelected', {
            detail: merchant
        }));
    }

    function viewMerchantProducts(merchantId) {
        console.log('View products for merchant:', merchantId);
        // This would integrate with your existing Angular controller
        document.dispatchEvent(new CustomEvent('viewMerchantProducts', {
            detail: { merchantId: merchantId }
        }));
    }

    // Public API
    return {
        init: initMap,
        getCurrentLocation: getCurrentLocation,
        setUserLocation: setUserLocation,
        addMerchants: addMerchants,
        searchNearby: searchNearby,
        showSearchResults: showSearchResults,
        viewMerchantProducts: viewMerchantProducts,
        getMap: function() { return mapInstance; },
        CONFIG: CONFIG
    };
})();
