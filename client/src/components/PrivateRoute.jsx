import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * PrivateRoute — wraps protected /app/* routes.
 * Hits /api/auth/me (which validates the httpOnly JWT cookie).
 * - Loading  → full-screen spinner
 * - Valid    → render nested routes via <Outlet />
 * - Invalid  → redirect to login page (/)
 */
const PrivateRoute = () => {
    const [status, setStatus] = useState('loading'); // 'loading' | 'auth' | 'unauth'

    useEffect(() => {
        let cancelled = false;

        fetch('/api/auth/me', {
            method: 'GET',
            credentials: 'include',
        })
            .then(res => {
                if (cancelled) return;
                setStatus(res.ok ? 'auth' : 'unauth');
            })
            .catch(() => {
                if (!cancelled) setStatus('unauth');
            });

        return () => { cancelled = true; };
    }, []);

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#f8fafc]">
                <div className="flex flex-col items-center gap-4">
                    {/* Spinner */}
                    <div className="w-10 h-10 rounded-full border-4 border-emerald-100 border-t-emerald-500 animate-spin" />
                    <p className="text-sm font-medium text-gray-400 tracking-wide">Verifying session…</p>
                </div>
            </div>
        );
    }

    if (status === 'unauth') {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default PrivateRoute;
