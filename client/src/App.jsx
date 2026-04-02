
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import BeamDesign from './pages/BeamDesign'
import SavedDesign from './pages/SavedDesign'
import TankFoundation from './pages/TankFoundation'
import SavedTankDesigns from './pages/SavedTankDesigns'
import WindLoadCalc from './pages/WindLoadCalc'
import SavedWindLoad from './pages/SavedWindLoad'
import Sidebar from './components/Sidebar'
import AuthPage from './pages/AuthPage'

// ── Layout Component ──────────────────────────────────
const MainLayout = () => {
  return (
    <div className="flex flex-col lg:flex-row bg-[#f8fafc] min-h-screen font-sans w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Outlet />
      </div>
    </div>
  )
}

const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<AuthPage />} />
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/signup" element={<Navigate to="/" replace />} />

      {/* App Routes (Protected-ready structure) */}
      <Route path="/app" element={<MainLayout />}>
        {/* Default to Beam Design */}
        <Route index element={<Navigate to="beam-design" replace />} />

        {/* Beam Design Group */}
        <Route path="beam-design">
          <Route index element={<BeamDesign />} />
          <Route path="saved" element={<SavedDesign />} />
        </Route>

        {/* Tank Foundation Group */}
        <Route path="tank-foundation">
          <Route index element={<TankFoundation />} />
          <Route path="saved" element={<SavedTankDesigns />} />
        </Route>

        {/* Wind Load Group */}
        <Route path="wind-load-calc">
          <Route index element={<WindLoadCalc />} />
          <Route path="saved" element={<SavedWindLoad />} />
        </Route>
      </Route>

      {/* Catch-all Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App