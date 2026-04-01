
import React from 'react'
import BeamDesign from './BeamDesign'
import SavedDesign from './SavedDesign'
import TankFoundation from './TankFoundation'
import SavedTankDesigns from './SavedTankDesigns'
import WindLoadCalc from './WindLoadCalc'
import SavedWindLoad from './SavedWindLoad'
import Sidebar from '../components/Sidebar'
import { Routes, Route } from 'react-router-dom'

const homePage = () => (
    <div>
        <div className="flex flex-col lg:flex-row bg-[#f8fafc] min-h-screen font-sans w-full">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <BeamDesign />
                {/* <Routes>
            <Route path="/beam-design" element={<BeamDesign />} />
            <Route path="/saved-designs" element={<SavedDesign />} />
            <Route path="/tank-foundation" element={<TankFoundation />} />
            <Route path="/saved-tank-designs" element={<SavedTankDesigns />} />
            <Route path="/wind-load-calc" element={<WindLoadCalc />} />
            <Route path="/saved-windload" element={<SavedWindLoad />} />
        </Routes> */}
            </div>
        </div>
    </div>
)

export default homePage