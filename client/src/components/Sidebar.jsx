import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const navLinkClasses = ({ isActive }) =>
    `flex items-center px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${isActive
        ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100/50 relative after:absolute after:left-0 after:top-1/2 after:-translate-y-1/2 after:w-1 after:h-6 after:bg-emerald-600 after:rounded-r-md'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
    }`;

const subLinkClasses = ({ isActive }) =>
    `flex items-center pl-12 pr-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${isActive
        ? 'text-emerald-700 font-semibold'
        : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
    }`;

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`lg:hidden fixed top-[18px] left-3 z-[90] p-2 text-gray-600 bg-transparent hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-all focus:outline-none ${isOpen ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}`}
                aria-label="Open Sidebar"
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[60] lg:hidden transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar drawer */}
            <aside className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-100 flex flex-col h-screen shadow-2xl lg:shadow-[1px_0_10px_-2px_rgba(0,0,0,0.03)] z-[70] lg:sticky lg:top-0 shrink-0 transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                {/* Logo/Brand Area */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-gray-50 bg-white/50 backdrop-blur-sm shrink-0">
                    <div className="flex items-center">
                        <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mr-3.5 shadow-md shadow-emerald-500/20">
                            <span className="text-white font-bold text-lg leading-none">C</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-900 tracking-tight text-lg leading-none mb-1">CivilCalc</h1>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Engineering</p>
                        </div>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-4 py-6 overflow-y-auto custom-scrollbar">

                    {/* Section: RCC */}
                    <div className="mb-4">
                        <p className="px-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <span>RCC Structures</span>
                        </p>
                        <NavLink to="/app/beam-design" end onClick={() => setIsOpen(false)} className={navLinkClasses}>
                            <svg className="w-5 h-5 mr-3 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            Beam Design
                        </NavLink>

                    </div>

                    {/* Section: Foundation */}
                    <div className="mb-4">
                        <p className="px-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <span>Foundation</span>
                        </p>
                        <NavLink to="/app/tank-foundation" end onClick={() => setIsOpen(false)} className={navLinkClasses}>
                            <svg className="w-5 h-5 mr-3 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                            </svg>
                            Tank Foundation
                        </NavLink>

                    </div>

                    {/* Section: Wind Loads */}
                    <div className="mb-4">
                        <p className="px-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <span>Analysis</span>
                        </p>
                        <NavLink to="/app/wind-load-calc" end onClick={() => setIsOpen(false)} className={navLinkClasses}>
                            <svg className="w-5 h-5 mr-3 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                            </svg>
                            Wind Load (IS:875)
                        </NavLink>

                    </div>
                </nav>

                {/* Bottom Section */}
                <div className="p-5 border-t border-gray-50 bg-gray-50/50 mt-auto shrink-0">
                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-400">
                        <span>CIVIL CALC</span>
                        <NavLink to="/" className="text-red-400 bg-red-200/50 px-4 py-1 rounded-sm hover:text-red-700">LOGOUT</NavLink>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
