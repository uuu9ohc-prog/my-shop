import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { OrderProvider } from './state/OrderContext.jsx'
import './styles/tokens.css'
import './styles/site.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <OrderProvider>
        <App />
      </OrderProvider>
    </BrowserRouter>
  </StrictMode>,
)
