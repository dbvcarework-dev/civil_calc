import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import WindLoadInput from '../../components/windLoadInput';
import WindLoadResult from '../../components/windLoadResult';
import { calculateWindLoad } from '../../utils/windLoadCalc';

const DEFAULT_INPUTS = {
    projectName: null,
    H: null,
    W: null,
    L: null,
    city: null,
    designLife: null,
    structureType: null,
    terrainCategory: null,
    k2Custom: null,
    k3Type: null,
    k3Custom: null,
    k4Type: null,
    kd: null,
    kcType: null,
    cpi: null,
    cpeA: null,
    cpeB: null,
    cpeC: null,
    cpeD: null,
};

const WindLoadCalc = () => {
    const [inputs, setInputs] = useState(DEFAULT_INPUTS);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState({ text: '', type: '' });
    const navigate = useNavigate();

    const handleChange = (key, value) => {
        setInputs(prev => ({ ...prev, [key]: value }));
    };

    const results = useMemo(() => {
        return calculateWindLoad(inputs);
    }, [inputs]);

    const handleSave = async () => {
        setIsSaving(true);
        setSaveMessage({ text: '', type: '' });

        try {
            await axios.post('/api/windload', {
                project_name: inputs.projectName || 'Untitled Wind Load',
                inputs,
                results
            });
            setSaveMessage({ text: 'Design saved successfully!', type: 'success' });
            setTimeout(() => setSaveMessage({ text: '', type: '' }), 3000);
        } catch (error) {
            console.error('Error saving wind load design:', error);
            setSaveMessage({ text: 'Failed to save design.', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
            {/* Header — matches TankFoundation/BeamDesign */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto pl-14 pr-4 sm:pl-16 sm:pr-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
                            WL
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Wind Load Calculator</h1>
                            <p className="text-sm text-gray-500 font-medium">IS : 875 (Part-3) · Wind Loads on Buildings &amp; Structures</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="ml-auto">
                            <a href="/app/wind-load-calc/saved"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white hover:bg-gray-50 text-gray-700 transition-all duration-200 border border-gray-200 shadow-sm">
                                ← Saved Designs
                            </a>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={!results || isSaving}
                            className={`
                                inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-white
                                disabled:opacity-40 disabled:cursor-not-allowed
                                ${saveMessage.type === 'success' ? 'bg-emerald-600 hover:bg-emerald-500' :
                                    saveMessage.type === 'error' ? 'bg-red-600 hover:bg-red-500' :
                                        'bg-indigo-600 hover:bg-indigo-500'}
                            `}
                        >
                            {saveMessage.type === 'success'
                                ? <><span>✓</span><span className="hidden sm:inline">Saved!</span></>
                                : saveMessage.type === 'error'
                                    ? <><span>✗</span><span className="hidden sm:inline">Failed</span></>
                                    : isSaving
                                        ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin flex-shrink-0"></span><span className="hidden sm:inline">Saving…</span></>
                                        : <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V8l-4-4H8z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 4v4H8V4" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a2 2 0 100 4 2 2 0 000-4z" />
                                            </svg>
                                            <span className="hidden sm:inline">Save</span>
                                        </>
                            }
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* Left — Inputs */}
                    <div className="w-full lg:w-7/12 xl:w-2/3 shrink-0">
                        <WindLoadInput inputs={inputs} onChange={handleChange} results={results} />
                    </div>

                    {/* Right — Results (sticky) */}
                    <div className="w-full lg:w-5/12 xl:w-1/3 lg:sticky lg:top-28">
                        {results ? (
                            <WindLoadResult results={results} inputs={inputs} />
                        ) : (
                            <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl mb-4 border border-gray-100">
                                    💨
                                </div>
                                <h3 className="text-gray-900 font-bold text-lg">No Wind Data</h3>
                                <p className="text-gray-500 text-sm max-w-[240px] mx-auto mt-2 leading-relaxed">
                                    Enter the building height and dimensions to calculate the wind pressure.
                                </p>
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
};

export default WindLoadCalc;
