// Simple routes helper compatible with Rails asset pipeline
// Replaces js-routes with a simpler implementation

window.Routes = {
  // Helper function to build URLs
  buildUrl: function(path, params) {
    if (!params) return path;
    
    var url = path;
    var queryParams = [];
    
    for (var key in params) {
      if (params.hasOwnProperty(key)) {
        // Replace path parameters like :id
        if (url.indexOf(':' + key) !== -1) {
          url = url.replace(':' + key, encodeURIComponent(params[key]));
        } else {
          // Add as query parameter
          queryParams.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
        }
      }
    }
    
    if (queryParams.length > 0) {
      url += (url.indexOf('?') === -1 ? '?' : '&') + queryParams.join('&');
    }
    
    return url;
  },
  
  // Main application routes
  root_path: function(params) {
    return this.buildUrl('/', params);
  },
  
  pages_home_path: function(params) {
    return this.buildUrl('/', params);
  },
  
  // Products routes
  products_path: function(params) {
    return this.buildUrl('/products', params);
  },
  
  product_path: function(id, params) {
    var pathParams = { id: id };
    if (params) {
      for (var key in params) {
        pathParams[key] = params[key];
      }
    }
    return this.buildUrl('/products/:id', pathParams);
  },
  
  new_product_path: function(params) {
    return this.buildUrl('/products/new', params);
  },
  
  edit_product_path: function(id, params) {
    var pathParams = { id: id };
    if (params) {
      for (var key in params) {
        pathParams[key] = params[key];
      }
    }
    return this.buildUrl('/products/:id/edit', pathParams);
  },
  
  // Commerces routes
  commerces_path: function(params) {
    return this.buildUrl('/commerces', params);
  },
  
  commerce_path: function(id, params) {
    var pathParams = { id: id };
    if (params) {
      for (var key in params) {
        pathParams[key] = params[key];
      }
    }
    return this.buildUrl('/commerces/:id', pathParams);
  },
  
  commerces_listcommerce_path: function(params) {
    return this.buildUrl('/commerces/listcommerce', params);
  },
  
  // Orders routes
  orders_path: function(params) {
    return this.buildUrl('/orders', params);
  },
  
  order_path: function(id, params) {
    var pathParams = { id: id };
    if (params) {
      for (var key in params) {
        pathParams[key] = params[key];
      }
    }
    return this.buildUrl('/orders/:id', pathParams);
  },
  
  new_order_path: function(params) {
    return this.buildUrl('/orders/new', params);
  },
  
  // Addresses routes
  addresses_path: function(params) {
    return this.buildUrl('/addresses', params);
  },
  
  address_path: function(id, params) {
    var pathParams = { id: id };
    if (params) {
      for (var key in params) {
        pathParams[key] = params[key];
      }
    }
    return this.buildUrl('/addresses/:id', pathParams);
  },
  
  // Users/Devise routes
  new_user_session_path: function(params) {
    return this.buildUrl('/users/sign_in', params);
  },
  
  user_session_path: function(params) {
    return this.buildUrl('/users/sign_in', params);
  },
  
  destroy_user_session_path: function(params) {
    return this.buildUrl('/users/sign_out', params);
  },
  
  new_user_registration_path: function(params) {
    return this.buildUrl('/users/sign_up', params);
  },
  
  user_registration_path: function(params) {
    return this.buildUrl('/users', params);
  },
  
  edit_user_registration_path: function(params) {
    return this.buildUrl('/users/edit', params);
  },
  
  // Utility routes
  pages_serveraddress_path: function(params) {
    return this.buildUrl('/pages/serveraddress', params);
  },
  
  pages_agrimer_path: function(params) {
    return this.buildUrl('/pages/agrimer', params);
  },
  
  // Newsletter route
  newsletters_path: function(params) {
    return this.buildUrl('/newsletters', params);
  }
};

// Backward compatibility
if (typeof window !== 'undefined') {
  window.Routes = Routes;
}