import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'

const AuthPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Determine initial mode from props or pathname
    const isInitialLogin = location.pathname === '/login';
    const [isLogin, setIsLogin] = useState(isInitialLogin);

    const [employeeId, setEmployeeId] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        setIsLoading(true);
        axios.post('/api/login', {
            employee_id: employeeId,
            password: password
        }, { withCredentials: true }).then((res) => {
            alert(res.data.message);
            navigate('/app/beam-design');
        }).catch((err) => {
            console.error(err);
            alert(err.response?.data?.message || 'Login failed. Please check your credentials.');
        }).finally(() => {
            setIsLoading(false);
        });
    };

    const handleRegister = (e) => {
        e.preventDefault();
        setIsLoading(true);
        axios.post('/api/users', {
            employee_id: employeeId,
            name: name,
            password: password
        }).then((res) => {
            alert('Registration successful! Please login.');
            setIsLogin(true); // Switch to login after successful registration
            setEmployeeId(employeeId); // Keep ID for convenience
            setName('');
            setPassword('');
        }).catch((err) => {
            console.error(err);
            alert(err.response?.data?.message || 'Registration failed. Please try again.');
        }).finally(() => {
            setIsLoading(false);
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            {/* Logo and Header */}
            <div className="mb-8 text-center flex flex-col items-center gap-3">

                <div>
                    <h1 className="text-2xl font-bold font-sans text-gray-900 leading-tight">Civil Calc App</h1>
                    <p className="text-sm text-gray-500">123Engineering design made simple.</p>
                </div>
            </div>

            {/* Auth Card */}
            <div className="section-card w-full max-w-md shadow-xl border-gray-100 animate-in fade-in zoom-in duration-300">
                {/* Toggle Switch*/}
                <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
                    <button
                        onClick={() => setIsLogin(true)}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setIsLogin(false)}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${!isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Register
                    </button>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                    {isLogin ? 'Enter Credentials!' : 'Create Account'}
                </h2>

                <form onSubmit={isLogin ? handleLogin : handleRegister} className="flex flex-col gap-5">
                    <div>
                        <label className="label-text">Employee ID</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. EMP001"
                            value={employeeId}
                            onChange={(e) => setEmployeeId(e.target.value)}
                            className="input-field"
                        />
                    </div>

                    {!isLogin && (
                        <div className="animate-in slide-in-from-top-2 duration-200">
                            <label className="label-text">Full Name</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="input-field"
                            />
                        </div>
                    )}

                    <div>
                        <label className="label-text">Password</label>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="mt-4 w-full bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-3 font-semibold shadow-lg shadow-blue-100 transition-all duration-200 flex items-center justify-center gap-2 group"
                    >
                        {isLoading ? (
                            <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            <>
                                <span>{isLogin ? 'Login' : 'Sign Up'}</span>
                                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <p className="text-sm text-gray-500">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="ml-2 text-blue-600 font-semibold hover:underline"
                        >
                            {isLogin ? 'Register now' : 'Login here'}
                        </button>
                    </p>
                </div>
            </div>

            {/* Footer */}
            <footer className="mt-12 text-center text-xs text-gray-400">
                &copy; {new Date().getFullYear()} Civil Calc App. Engineering Verified.
            </footer>
        </div>
    );
};

export default AuthPage;
