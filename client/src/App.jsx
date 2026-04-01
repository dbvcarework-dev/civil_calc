
import { Routes, Route } from 'react-router-dom'
import BeamDesign from './pages/BeamDesign'
import SavedDesign from './pages/SavedDesign'
import TankFoundation from './pages/TankFoundation'
import SavedTankDesigns from './pages/SavedTankDesigns'
import WindLoadCalc from './pages/WindLoadCalc'
import SavedWindLoad from './pages/SavedWindLoad'
import Sidebar from './components/Sidebar'



const App = () => {
  return (
    <div className="flex flex-col lg:flex-row bg-[#f8fafc] min-h-screen font-sans w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Routes>
          <Route path="/" element={<BeamDesign />} />
          <Route path="/saved-designs" element={<SavedDesign />} />
          <Route path="/tank-foundation" element={<TankFoundation />} />
          <Route path="/saved-tank-designs" element={<SavedTankDesigns />} />
          <Route path="/wind-load-calc" element={<WindLoadCalc />} />
          <Route path="/saved-windload" element={<SavedWindLoad />} />
        </Routes>
      </div>
    </div>
  )
}

export default App