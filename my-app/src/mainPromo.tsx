import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Promo from './Components/Promo/Promo.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Promo/>
  </StrictMode>,
)
