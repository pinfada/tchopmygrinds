import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { store } from './store/store'
import App from './App'
import 'leaflet/dist/leaflet.css'
import './index.css'
import { currenciesAPI } from './services/api'
import { setCurrencyRegistry } from './lib/currencyRegistry'
import { getRouterBasename } from './lib/railsData'

// Refresh the currency registry from the API as soon as the app boots.
// Fire-and-forget: the registry already has localStorage-cached or baked-in
// fallback values, so the UI never stalls waiting for this. A failed fetch
// is silent on purpose — the last good list keeps working offline.
currenciesAPI
  .list()
  .then((res) => {
    const list = res?.data?.currencies
    if (Array.isArray(list)) setCurrencyRegistry(list)
  })
  .catch(() => {
    // Ignored — registry already hydrated from localStorage / FALLBACK.
  })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter basename={getRouterBasename()}>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
