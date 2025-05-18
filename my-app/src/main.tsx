import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import StepList from './Components/Promo/StepList.tsx'
import FeatureList from './Components/Promo/FeatureList.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FeatureList />
  </StrictMode>,
)
