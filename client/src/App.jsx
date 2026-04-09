
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import BeamDesign from './pages/Beam_design/BeamDesign'
import SavedDesign from './pages/Beam_design/BeamSummaryView'
import BeamDetailedView from './pages/Beam_design/BeamDetailedView'
import TankFoundation from './pages/Tank_foundation/tankFoundation'
import SavedTankDesigns from './pages/Tank_foundation/TankFoundationSummary'
import TankFoundationDetailed from './pages/Tank_foundation/TankFoundationDetailed'
import WindLoadCalc from './pages/Wind_load/windLoadCalc'
import SavedWindLoad from './pages/Wind_load/WindLoadSummary'
import WindLoadDetailedView from './pages/Wind_load/WindLoadDetailed'
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
          <Route path=":id" element={<BeamDetailedView />} />
        </Route>

        {/* Tank Foundation Group */}
        <Route path="tank-foundation">
          <Route index element={<TankFoundation />} />
          <Route path="saved" element={<SavedTankDesigns />} />
          <Route path=":id" element={<TankFoundationDetailed />} />
        </Route>

        {/* Wind Load Group */}
        <Route path="wind-load-calc">
          <Route index element={<WindLoadCalc />} />
          <Route path="saved" element={<SavedWindLoad />} />
          <Route path=":id" element={<WindLoadDetailedView />} />
        </Route>
      </Route>

      {/* Catch-all Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App