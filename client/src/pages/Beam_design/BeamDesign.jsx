import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { calculateBeam } from '../../utils/beamCalc'
import ResultsPanel from '../../components/ResultsPanel'
import InputForm from '../../components/inputForm'
import BeamConfigModal from './BeamConfigModal'
import defaultConfig from '../../config/beamTables.json'

const DEFAULT_INPUTS = {
    beamName: null, bendingMomentDirection: null,
    Mu: null, Vu: null, cover: null, fck: null, fy: null,
    b: null, D: null,
    bar1Count: null, bar1Dia: null, bar2Count: null, bar2Dia: null,
    stirrupDia: null, stirrupLegs: null, providedStirrupSpacing: null,
    sfrCount: null, sfrDia: null,
    tcRatio1: null, tcRatio2: null,
}

export default function BeamDesign() {
    const [inputs, setInputs] = useState(() => {
        try {
            const saved = sessionStorage.getItem('beamCalcDraft');
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.error('Failed to load draft:', e);
        }
        return DEFAULT_INPUTS;
    });

    const [isSaving, setIsSaving] = useState(false)
    const [saveStatus, setSaveStatus] = useState(null)  // 'ok' | 'error' | null
    const [showConfig, setShowConfig] = useState(false)

    const [config, setConfig] = useState(null);


    useEffect(() => {
        async function load() {
            const res = await axios.get(
                "http://localhost:3000/api/beamconfig",
                { withCredentials: true }
            );
            setConfig(res.data);
        }

        load();
    }, []);

    const finalConfig = {
        mulimFactor: config?.mulimFactor || defaultConfig.MULIM_FACTOR,
        tcTable: config?.tcTable || defaultConfig.TC_TABLE,
        tcMax: config?.tcMax || defaultConfig.TC_MAX
    };

    // console.log("final config: ", finalConfig);

    useEffect(() => {
        sessionStorage.setItem('beamCalcDraft', JSON.stringify(inputs));
    }, [inputs]);


    const results = useMemo(() => {
        return calculateBeam(inputs, finalConfig);
    }, [inputs, finalConfig]);

    function handleSave() {
        if (!results) return
        setIsSaving(true)
        setSaveStatus(null)

        axios.post('/api/saveddesigns', { inputs, results, finalConfig })
            .then(() => {
                setSaveStatus('ok')
                sessionStorage.removeItem('beamCalcDraft')
            })
            .catch((err) => {
                console.error('Save failed:', err.message)
                setSaveStatus('error')
            })
            .finally(() => {
                setIsSaving(false)
                setTimeout(() => setSaveStatus(null), 3000)
            })
    }


    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="border-b border-gray-200 bg-white/80 backdrop-blur sticky top-0 z-10">
                <div className="max-w-7xl mx-auto pl-14 pr-4 sm:pl-16 sm:pr-6 lg:px-8 py-4 flex items-center gap-3 sm:gap-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        RC
                    </div>
                    <div>
                        <h1 className="text-base font-semibold text-gray-900 leading-tight">RCC Beam Design</h1>
                        <p className="text-xs text-gray-500">Limit State Method · IS 456 : 2000</p>
                    </div>

                    <div className="ml-auto flex items-center gap-3">
                        <div className="ml-auto">
                            <a href="/app/beam-design/saved"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white hover:bg-gray-50 text-gray-700 transition-all duration-200 border border-gray-200 shadow-sm">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-4 h-4 flex-shrink-0"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>

                                <span className='hidden md:inline'> Saved Designs</span>
                            </a>
                        </div>
                        <button
                            onClick={() => setShowConfig(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white hover:bg-gray-50 text-gray-700 transition-all duration-200 border border-gray-200 shadow-sm"
                            title="Configuration"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="hidden sm:inline">Config</span>
                        </button>

                        {/* Save Design button */}
                        <button
                            onClick={handleSave}
                            disabled={!results || isSaving}
                            className={`
                                inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-white
                                disabled:opacity-40 disabled:cursor-not-allowed
                                ${saveStatus === 'ok' ? 'bg-emerald-600 hover:bg-emerald-500' :
                                    saveStatus === 'error' ? 'bg-red-600 hover:bg-red-500' :
                                        'bg-blue-600 hover:bg-blue-500'}
                            `}
                        >
                            {saveStatus === 'ok'
                                ? <><span>✓</span><span className="hidden sm:inline">Saved!</span></>
                                : saveStatus === 'error'
                                    ? <><span>✗</span><span className="hidden sm:inline">Failed</span></>
                                    : isSaving
                                        ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin flex-shrink-0"></span><span className="hidden sm:inline">Saving…</span></>
                                        : <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V8l-4-4H8z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 4v4H8V4" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a2 2 0 100 4 2 2 0 000-4z" />
                                            </svg>
                                            <span className="hidden sm:inline">Save Design</span>
                                        </>
                            }
                        </button>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    <InputForm inputs={inputs} onChange={setInputs} />
                    {results
                        ? <ResultsPanel inputs={inputs} results={results} />
                        : (
                            <div className="section-card flex flex-col items-center justify-center gap-4 py-16 text-center">
                                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl border border-gray-200">📐</div>
                                <div>
                                    <p className="text-gray-900 font-semibold text-sm">No results yet</p>
                                    <p className="text-gray-500 text-xs mt-1">Fill in the inputs on the left to see the IS 456 design results here.</p>
                                </div>
                            </div>
                        )
                    }
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-200 mt-12 py-4 text-center text-xs text-gray-500">
                IS 456 : 2000 · Limit State Method · For academic / verification use only
            </footer>

            {/* Configuration Modal */}
            <BeamConfigModal beamTable={finalConfig} setBeamTable={setConfig} isOpen={showConfig} onClose={() => setShowConfig(false)} />
        </div>
    )
}