import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, getCourses, getBatches } from '../utils/api';
import ClassCard from './ClassCard';
import Assignments from './Assignments';
import Support from './Support';

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('classes');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const userData = await getCurrentUser();
            setUser(userData);
        } catch (error) {
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    // Mock data for demonstration
    const upcomingClasses = [
        {
            title: 'Python Basics - Variables & Data Types',
            time: 'Today, 7:00 PM - 8:00 PM',
            instructor: 'Instructor Name',
            status: 'upcoming',
            link: 'https://meet.google.com/abc-defg-hij'
        },
        {
            title: 'Control Flow & Loops',
            time: 'Tomorrow, 7:00 PM - 8:00 PM',
            instructor: 'Instructor Name',
            status: 'upcoming',
            link: null
        }
    ];

    const completedClasses = [
        {
            title: 'Introduction to Python',
            time: 'Yesterday, 7:00 PM - 8:00 PM',
            instructor: 'Instructor Name',
            status: 'completed',
            link: null
        }
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-[var(--text-secondary)]">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <aside className="w-64 glass border-r border-white/10 p-6 flex flex-col">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gradient">Python Coaching</h1>
                </div>

                <nav className="flex-1 space-y-2">
                    <button
                        onClick={() => setActiveTab('classes')}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all ${activeTab === 'classes'
                            ? 'gradient-primary text-white'
                            : 'text-[var(--text-secondary)] hover:bg-white/5'
                            }`}
                    >
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            My Classes
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveTab('materials')}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all ${activeTab === 'materials'
                            ? 'gradient-primary text-white'
                            : 'text-[var(--text-secondary)] hover:bg-white/5'
                            }`}
                    >
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Materials
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveTab('assignments')}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all ${activeTab === 'assignments'
                            ? 'gradient-primary text-white'
                            : 'text-[var(--text-secondary)] hover:bg-white/5'
                            }`}
                    >
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                            Assignments
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveTab('support')}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all ${activeTab === 'support'
                            ? 'gradient-primary text-white'
                            : 'text-[var(--text-secondary)] hover:bg-white/5'
                            }`}
                    >
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            Support
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all ${activeTab === 'profile'
                            ? 'gradient-primary text-white'
                            : 'text-[var(--text-secondary)] hover:bg-white/5'
                            }`}
                    >
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Profile
                        </div>
                    </button>
                </nav>

                <div className="mt-auto">
                    <div className="glass rounded-lg p-4 mb-4">
                        <p className="text-sm font-medium mb-1">{user?.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">{user?.email}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {activeTab === 'classes' && (
                    <div>
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold mb-2">My Classes</h2>
                            <p className="text-[var(--text-secondary)]">Manage your upcoming and past sessions</p>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-xl font-semibold mb-4">Upcoming Classes</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {upcomingClasses.map((classItem, index) => (
                                    <ClassCard key={index} {...classItem} />
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold mb-4">Completed Classes</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {completedClasses.map((classItem, index) => (
                                    <ClassCard key={index} {...classItem} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'materials' && (
                    <div>
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold mb-2">Learning Materials</h2>
                            <p className="text-[var(--text-secondary)]">Access your course resources and recordings</p>
                        </div>

                        <div className="glass rounded-xl p-8 text-center">
                            <svg className="w-16 h-16 mx-auto mb-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-[var(--text-secondary)]">Materials will be available after your first class</p>
                        </div>
                    </div>
                )}

                {activeTab === 'assignments' && <Assignments />}

                {activeTab === 'support' && <Support />}

                {activeTab === 'profile' && (
                    <div>
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold mb-2">Profile</h2>
                            <p className="text-[var(--text-secondary)]">Manage your account settings</p>
                        </div>

                        <div className="glass rounded-xl p-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">Full Name</label>
                                    <input
                                        type="text"
                                        value={user?.name || ''}
                                        readOnly
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">Email</label>
                                    <input
                                        type="email"
                                        value={user?.email || ''}
                                        readOnly
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">Role</label>
                                    <input
                                        type="text"
                                        value={user?.role || ''}
                                        readOnly
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg capitalize"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div >
    );
}
