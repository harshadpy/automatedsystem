import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../utils/api';
import ClassCard from './ClassCard';
import Assignments from './Assignments';
import Support from './Support';
import api from '../utils/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function StudentDashboard() {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('hub');
    const [loading, setLoading] = useState(true);

    // AI Tutor state
    const [chatMessages, setChatMessages] = useState([
        { role: 'assistant', content: 'Hi! I\'m PyBot, your AI Python tutor. Ask me anything about Python!' }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);

    const navigate = useNavigate();

    const [upcomingClasses, setUpcomingClasses] = useState([]);
    const [certificates, setCertificates] = useState([]);

    useEffect(() => {
        loadUserData();
        loadClasses();
        loadCertificates();
    }, []);

    const loadUserData = async () => {
        try {
            const userData = await getCurrentUser();
            setUser(userData);
        } catch (error) {
            navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    const loadClasses = async () => {
        try {
            const response = await api.get('/users/me/classes');
            setUpcomingClasses(response.data);
        } catch (error) {
            console.error('Failed to load classes');
        }
    };

    const loadCertificates = async () => {
        try {
            const response = await api.get('/certificates/me');
            setCertificates(response.data);
        } catch (error) {
            console.error('Failed to load certificates');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const handleChatSubmit = async (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const userMessage = { role: 'user', content: chatInput };
        setChatMessages([...chatMessages, userMessage]);
        setChatInput('');
        setChatLoading(true);

        try {
            // Call AI service
            const response = await api.post('/ai/chat', { prompt: chatInput });
            const aiMessage = { role: 'assistant', content: response.data.response || 'I can help you with Python questions!' };
            setChatMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage = { role: 'assistant', content: 'Sorry, I\'m having trouble right now. Please try again.' };
            setChatMessages(prev => [...prev, errorMessage]);
        } finally {
            setChatLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <aside className="w-64 glass border-r border-white/10 p-6 flex flex-col">
                <div className="mb-8">
                    <h1 className="text-xl font-bold text-gradient">My Learning Hub</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Welcome, Student</p>
                </div>

                <nav className="flex-1 space-y-2">
                    <button
                        onClick={() => setActiveTab('hub')}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all ${activeTab === 'hub' ? 'gradient-primary text-white' : 'text-[var(--text-secondary)] hover:bg-white/5'
                            }`}
                    >
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Dashboard
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveTab('classes')}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all ${activeTab === 'classes' ? 'gradient-primary text-white' : 'text-[var(--text-secondary)] hover:bg-white/5'
                            }`}
                    >
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            My Classes
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveTab('pybot')}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all ${activeTab === 'pybot' ? 'gradient-primary text-white' : 'text-[var(--text-secondary)] hover:bg-white/5'
                            }`}
                    >
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            PyBot - AI Tutor
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveTab('assignments')}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all ${activeTab === 'assignments' ? 'gradient-primary text-white' : 'text-[var(--text-secondary)] hover:bg-white/5'
                            }`}
                    >
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Assignments
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveTab('certificates')}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all ${activeTab === 'certificates' ? 'gradient-primary text-white' : 'text-[var(--text-secondary)] hover:bg-white/5'
                            }`}
                    >
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Certificates
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveTab('support')}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all ${activeTab === 'support' ? 'gradient-primary text-white' : 'text-[var(--text-secondary)] hover:bg-white/5'
                            }`}
                    >
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            Need Help?
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

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {/* Learning Hub Tab */}
                {activeTab === 'hub' && (
                    <div>
                        {/* Progress Card */}
                        <div className="glass rounded-2xl p-8 mb-8 gradient-primary">
                            <h2 className="text-2xl font-bold mb-2">Keep up the momentum! 🚀</h2>
                            <p className="text-white/80 mb-6">You have completed {upcomingClasses.length > 0 ? '15%' : '0%'} of your Python Certification Course.</p>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/10 rounded-lg p-4">
                                    <p className="text-sm text-white/80 mb-1">NEXT CLASS</p>
                                    <p className="font-semibold">
                                        {upcomingClasses.length > 0 ? upcomingClasses[0].time : 'No upcoming classes'}
                                    </p>
                                </div>
                                <div className="bg-white/10 rounded-lg p-4">
                                    <p className="text-sm text-white/80 mb-1">PENDING TASKS</p>
                                    <p className="font-semibold">0</p>
                                </div>
                            </div>
                        </div>

                        {/* Upcoming Sessions */}
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold mb-4">📅 Upcoming Sessions</h3>
                            <div className="space-y-4">
                                {upcomingClasses.map((classItem, index) => (
                                    <div key={index} className="glass rounded-xl p-6">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="text-lg font-semibold mb-2">{classItem.title}</h4>
                                                <p className="text-sm text-[var(--text-secondary)] mb-2">{classItem.time}</p>
                                                <p className="text-sm text-[var(--text-muted)]">{classItem.instructor}</p>
                                            </div>
                                            {classItem.link && (
                                                <a
                                                    href={classItem.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="gradient-primary text-white font-medium py-2 px-6 rounded-lg hover:opacity-90 transition-all"
                                                >
                                                    Join Class
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Classes Tab */}
                {activeTab === 'classes' && (
                    <div>
                        <h2 className="text-3xl font-bold mb-8">My Classes</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {upcomingClasses.map((classItem, index) => (
                                <ClassCard key={index} {...classItem} />
                            ))}
                        </div>
                    </div>
                )}

                {/* PyBot AI Tutor Tab */}
                {activeTab === 'pybot' && (
                    <div>
                        <div className="mb-6">
                            <h2 className="text-3xl font-bold mb-2">PyBot - AI Python Tutor</h2>
                            <p className="text-[var(--text-secondary)]">Ask me anything about Python programming!</p>
                        </div>

                        <div className="glass rounded-xl flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
                            {/* Chat Messages */}
                            <div className="flex-1 p-6 overflow-y-auto space-y-4">
                                {chatMessages.map((msg, index) => (
                                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] rounded-lg p-4 ${msg.role === 'user'
                                            ? 'gradient-primary text-white'
                                            : 'bg-white/5 border border-white/10'
                                            }`}>
                                            <p className="text-sm">{msg.content}</p>
                                        </div>
                                    </div>
                                ))}
                                {chatLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                                            <div className="flex gap-2">
                                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Chat Input */}
                            <form onSubmit={handleChatSubmit} className="p-6 border-t border-white/10">
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder='Ask a Python question (e.g. "How do lists work?")'
                                        disabled={chatLoading}
                                    />
                                    <button
                                        type="submit"
                                        disabled={chatLoading || !chatInput.trim()}
                                        className="gradient-primary text-white font-medium py-3 px-6 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {activeTab === 'assignments' && <Assignments />}
                {activeTab === 'support' && <Support />}

                {/* Certificates Tab */}
                {activeTab === 'certificates' && (
                    <div>
                        <h2 className="text-3xl font-bold mb-8">My Certificates</h2>
                        {certificates.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {certificates.map((cert) => (
                                    <div key={cert.id} className="glass rounded-xl p-6 border border-white/10 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <div className="relative z-10">
                                            <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4 text-indigo-400">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-xl font-bold mb-2">{cert.course_name}</h3>
                                            <p className="text-[var(--text-secondary)] mb-4">Issued on {new Date(cert.issue_date).toLocaleDateString()}</p>

                                            <a
                                                href={`${API_BASE_URL}${cert.url}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center px-4 py-2 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-lg hover:bg-indigo-500/30 transition-all"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                                Download Certificate
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 glass rounded-xl">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-medium mb-2">No Certificates Yet</h3>
                                <p className="text-[var(--text-secondary)]">Complete a course to earn your certificate!</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

