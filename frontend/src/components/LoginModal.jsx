import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../utils/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function LoginModal({ isOpen, onClose }) {
    const [step, setStep] = useState('role'); // 'role', 'login'
    const [role, setRole] = useState(null); // 'student', 'admin'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleRoleSelect = (selectedRole) => {
        setRole(selectedRole);
        setStep('login');
        setError('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await login(email, password);
            localStorage.setItem('token', data.access_token);

            // Verify role matches
            const response = await fetch(`${API_BASE_URL}/users/me`, {
                headers: { 'Authorization': `Bearer ${data.access_token}` }
            });
            const user = await response.json();

            if (role === 'admin' && user.role !== 'admin') {
                setError('Access denied. Admin credentials required.');
                localStorage.removeItem('token');
                setLoading(false);
                return;
            }

            // Redirect based on role
            onClose();
            if (user.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError('Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        setStep('role');
        setRole(null);
        setError('');
        setEmail('');
        setPassword('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-md p-8 shadow-2xl animate-scale-in">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-white transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {step === 'role' && (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-2">Continue as</h2>
                        <p className="text-[var(--text-secondary)] mb-8">Select your role to login or signup</p>

                        <div className="space-y-4">
                            <button
                                onClick={() => handleRoleSelect('student')}
                                className="w-full group p-4 rounded-xl border border-white/10 hover:border-indigo-500/50 bg-white/5 hover:bg-indigo-500/10 transition-all flex items-center justify-between"
                            >
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-semibold">Student / Parent</h3>
                                        <p className="text-xs text-[var(--text-secondary)]">Access learning hub</p>
                                    </div>
                                </div>
                                <svg className="w-5 h-5 text-[var(--text-muted)] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>

                            <button
                                onClick={() => handleRoleSelect('admin')}
                                className="w-full group p-4 rounded-xl border border-white/10 hover:border-indigo-500/50 bg-white/5 hover:bg-indigo-500/10 transition-all flex items-center justify-between"
                            >
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                        <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-semibold">Admin</h3>
                                        <p className="text-xs text-[var(--text-secondary)]">Manage institute</p>
                                    </div>
                                </div>
                                <svg className="w-5 h-5 text-[var(--text-muted)] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {step === 'login' && (
                    <div>
                        <button
                            onClick={handleBack}
                            className="mb-6 text-sm text-[var(--text-secondary)] hover:text-white flex items-center transition-colors"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back
                        </button>

                        <h2 className="text-2xl font-bold mb-2">
                            {role === 'admin' ? 'Admin Login' : 'Student Login'}
                        </h2>
                        <p className="text-[var(--text-secondary)] mb-6">Enter your credentials to continue</p>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="name@example.com"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full gradient-primary text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Logging in...' : 'Login'}
                            </button>
                        </form>

                        <div className="mt-4 text-center text-sm text-[var(--text-muted)]">
                            <p>Don't have an account? <a href="/signup" className="text-indigo-400 hover:text-indigo-300">Sign up</a></p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
