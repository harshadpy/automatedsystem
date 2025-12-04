import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdminDashboard() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [leads, setLeads] = useState([]);
    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [students, setStudents] = useState([]);
    const [stats, setStats] = useState({
        total_leads: 0,
        total_students: 0,
        total_revenue: 0,
        active_batches: 0,
        enrollment_trend: [],
        lead_distribution: []
    });
    const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
    const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    const [selectedLeads, setSelectedLeads] = useState([]);
    const [supportTickets, setSupportTickets] = useState([]);

    // Email System State
    const [emailSelectedUser, setEmailSelectedUser] = useState(null);
    const [emailHistory, setEmailHistory] = useState([]);
    const [emailSubject, setEmailSubject] = useState('');
    const [emailMessage, setEmailMessage] = useState('');

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterCity, setFilterCity] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    // Derived state for filtering and sorting
    const filteredLeads = leads.filter(lead => {
        const matchesSearch = (
            lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.phone.includes(searchQuery)
        );
        const matchesRole = filterRole === 'all' || lead.role === filterRole;
        const matchesCity = filterCity === 'all' || (lead.city && lead.city.toLowerCase() === filterCity.toLowerCase());

        return matchesSearch && matchesRole && matchesCity;
    }).sort((a, b) => {
        if (sortBy === 'newest') return b.id - a.id;
        if (sortBy === 'oldest') return a.id - b.id;
        if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
        if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
        return 0;
    });

    // Get unique cities for filter dropdown
    const uniqueCities = [...new Set(leads.map(lead => lead.city).filter(Boolean))];

    const [activeEnrollTab, setActiveEnrollTab] = useState('students');
    const [selectedBatchId, setSelectedBatchId] = useState(null);
    const [enrolledStudents, setEnrolledStudents] = useState([]);

    // Forms state
    const [leadForm, setLeadForm] = useState({ name: '', email: '', phone: '', city: '', role: 'student' });
    const [batchForm, setBatchForm] = useState({ course_id: '', start_date: '', timings: '', meeting_link: '' });

    // AI Marketing state
    const [aiTopic, setAiTopic] = useState('');
    const [aiChannel, setAiChannel] = useState('email');
    const [aiAudience, setAiAudience] = useState('parents');
    const [aiContent, setAiContent] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [marketingSelectedLeads, setMarketingSelectedLeads] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const userData = await api.get('/users/me');

            if (userData.data.role !== 'admin') {
                localStorage.removeItem('token');
                navigate('/admin/login');
                return;
            }

            setUser(userData.data);

            // Fetch other data separately to avoid blocking on errors
            try {
                const [leadsData, coursesData, batchesData, studentsData, statsData, supportData] = await Promise.all([
                    api.get('/leads'),
                    api.get('/courses'),
                    api.get('/batches'),
                    api.get('/users?role=student'),
                    api.get('/admin/stats'),
                    api.get('/support')
                ]);
                setLeads(leadsData.data);
                setCourses(coursesData.data);
                setBatches(batchesData.data);
                setStudents(studentsData.data);
                setStats(statsData.data);
                setSupportTickets(supportData.data);
            } catch (dataError) {
                console.error('Error loading dashboard data:', dataError);
                // Don't redirect, just show empty data
            }
        } catch (error) {
            console.error('Authentication error:', error);
            localStorage.removeItem('token');
            navigate('/admin/login');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    // Lead Actions
    const handleCreateLead = async (e) => {
        e.preventDefault();
        try {
            await api.post('/leads', leadForm);
            setIsLeadModalOpen(false);
            setLeadForm({ name: '', email: '', phone: '', city: '', role: 'student' });
            loadData(); // Refresh data
            alert('Lead added successfully!');
        } catch (error) {
            alert('Failed to add lead');
        }
    };

    const handleSendEmail = async (leadId) => {
        try {
            await api.post(`/leads/${leadId}/notify/email`, null, {
                params: {
                    subject: 'Welcome to Python Coaching',
                    prompt: 'We are excited to have you interested in our Python Mastery Program. Our course offers comprehensive training, hands-on projects, and expert mentorship to help you become a proficient Python developer.\n\nWe would love to discuss your learning goals. Please feel free to reply to this email or reach out to us directly.'
                }
            });
            alert('Email sent successfully!');
        } catch (error) {
            alert('Failed to send email');
        }
    };

    const handleSendWhatsApp = async (leadId) => {
        try {
            await api.post(`/leads/${leadId}/notify/whatsapp`, null, {
                params: {
                    prompt: 'Send a friendly message about our Python course'
                }
            });
            alert('WhatsApp message sent!');
        } catch (error) {
            alert('Failed to send WhatsApp');
        }
    };

    const handleCall = async (leadId) => {
        try {
            await api.post(`/leads/${leadId}/call`);
            alert('Call initiated!');
        } catch (error) {
            alert('Failed to initiate call');
        }
    };

    const handleDeleteLead = async (leadId) => {
        if (!confirm('Are you sure you want to delete this lead?')) return;
        try {
            await api.delete(`/leads/${leadId}`);
            loadData();
            alert('Lead deleted successfully!');
        } catch (error) {
            alert('Failed to delete lead');
        }
    };

    const handleBulkAction = async (type) => {
        if (selectedLeads.length === 0) return;

        const confirm = window.confirm(`Send ${type} to ${selectedLeads.length} selected leads?`);
        if (!confirm) return;

        let successCount = 0;
        for (const leadId of selectedLeads) {
            try {
                if (type === 'email') {
                    await api.post(`/leads/${leadId}/notify/email`, null, {
                        params: {
                            subject: 'Update from Python Coaching',
                            prompt: 'Write a short update email for our students.'
                        }
                    });
                } else if (type === 'whatsapp') {
                    await api.post(`/leads/${leadId}/notify/whatsapp`, null, {
                        params: {
                            prompt: 'Write a short update message.'
                        }
                    });
                }
                successCount++;
            } catch (error) {
                console.error(`Failed for lead ${leadId}`);
            }
        }
        alert(`Successfully sent to ${successCount} leads!`);
        setSelectedLeads([]);
    };

    // AI Marketing Actions
    const generateAIContent = async () => {
        if (!aiTopic) return;
        setAiLoading(true);
        setAiContent('Generating...');

        try {
            const prompt = `Create a ${aiChannel} campaign for ${aiAudience} about: ${aiTopic}. Return only the content.`;
            const response = await api.post('/ai/chat', { prompt });
            setAiContent(response.data.response);
        } catch (error) {
            setAiContent('Failed to generate content.');
        } finally {
            setAiLoading(false);
        }
    };

    const handleBroadcast = async () => {
        if (!aiContent || marketingSelectedLeads.length === 0) {
            alert('Please generate content and select at least one lead.');
            return;
        }

        const confirm = window.confirm(`Are you sure you want to send this to ${marketingSelectedLeads.length} leads?`);
        if (!confirm) return;

        alert(`Broadcast started! Sending to ${marketingSelectedLeads.length} leads...`);

        try {
            const payload = {
                lead_ids: marketingSelectedLeads,
                subject: aiTopic ? `Update: ${aiTopic}` : 'Update from Python Pro',
                prompt: aiContent
            };

            console.log('Sending payload:', payload);

            if (aiChannel === 'email') {
                const response = await api.post('/leads/bulk/notify/email', payload);
                console.log('Email response:', response.data);
            } else if (aiChannel === 'whatsapp') {
                const response = await api.post('/leads/bulk/notify/whatsapp', payload);
                console.log('WhatsApp response:', response.data);
            }
            alert('Broadcast completed successfully!');
            setMarketingSelectedLeads([]); // Clear selection
        } catch (error) {
            console.error('Broadcast failed:', error);
            console.error('Error response:', error.response?.data);
            alert(`Broadcast failed: ${error.response?.data?.detail || error.message}`);
        }
    };

    // Class Actions
    const handleCreateBatch = async (e) => {
        e.preventDefault();
        try {
            await api.post('/batches', batchForm);
            setIsBatchModalOpen(false);
            setBatchForm({ course_id: '', start_date: '', timings: '', meeting_link: '' });
            loadData(); // Refresh data
            alert('Class scheduled successfully!');
        } catch (error) {
            alert('Failed to schedule class');
        }
    };

    const handleJoinLink = (link) => {
        if (link) {
            navigator.clipboard.writeText(link);
            alert('Link copied to clipboard!');
        } else {
            alert('No link available for this class.');
        }
    };

    // Enrollment Actions
    const handleOpenEnrollModal = async (batchId) => {
        setSelectedBatchId(batchId);
        setActiveEnrollTab('students');
        setIsEnrollModalOpen(true);

        // Fetch enrolled students
        try {
            const response = await api.get(`/batches/${batchId}/students`);
            setEnrolledStudents(response.data);
        } catch (error) {
            console.error("Failed to fetch enrolled students", error);
            setEnrolledStudents([]);
        }
    };

    const handleEnrollStudent = async (studentId) => {
        try {
            await api.post('/enrollments', {
                student_id: studentId,
                batch_id: selectedBatchId,
                payment_id: 'ADMIN_ENROLLED',
                amount: 0,
                status: 'completed'
            });
            alert('Student enrolled successfully!');
            setIsEnrollModalOpen(false);
        } catch (error) {
            alert(error.response?.data?.detail || 'Failed to enroll student');
        }
    };

    const handleEnrollLead = async (leadId) => {
        try {
            const response = await api.post('/enrollments/from-lead', {
                lead_id: leadId,
                batch_id: selectedBatchId
            });
            alert(response.data.message);
            setIsEnrollModalOpen(false);
            loadData(); // Refresh to show new student
        } catch (error) {
            alert(error.response?.data?.detail || 'Failed to enroll lead');
        }
    };

    const handleIssueCertificate = async (studentId) => {
        if (!selectedBatchId) return;

        // Find course_id from batch
        const batch = batches.find(b => b.id === selectedBatchId);
        if (!batch) return;

        try {
            await api.post('/certificates/generate', {
                student_id: studentId,
                course_id: batch.course_id
            });
            alert('Certificate issued successfully!');
        } catch (error) {
            alert(error.response?.data?.detail || 'Failed to issue certificate');
        }
    };

    // Email System Actions
    const fetchEmailHistory = async (leadId) => {
        try {
            const response = await api.get(`/communications/${leadId}`);
            setEmailHistory(response.data);
        } catch (error) {
            console.error("Failed to fetch email history", error);
        }
    };

    const handleSendEmailSystem = async () => {
        if (!emailSelectedUser || !emailSubject || !emailMessage) {
            alert("Please select a user and fill in all fields.");
            return;
        }

        try {
            await api.post('/communications/email', {
                lead_id: emailSelectedUser.id,
                subject: emailSubject,
                message: emailMessage
            });
            alert("Email sent successfully!");
            setEmailMessage('');
            setEmailSubject('');
            fetchEmailHistory(emailSelectedUser.id);
        } catch (error) {
            console.error(error);
            alert(`Failed to send email: ${error.response?.data?.detail || error.message}`);
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
        <div className="min-h-screen flex relative">
            {/* Sidebar */}
            <aside className="w-64 glass border-r border-white/10 p-6 flex flex-col sticky top-0 h-screen">
                <div className="mb-8">
                    <h1 className="text-xl font-bold text-gradient">Admin Panel</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Administrator</p>
                </div>

                <nav className="flex-1 space-y-2">
                    {['overview', 'leads', 'ai-marketing', 'classes', 'support', 'email'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`w-full text-left px-4 py-3 rounded-lg transition-all capitalize ${activeTab === tab ? 'gradient-primary text-white' : 'text-[var(--text-secondary)] hover:bg-white/5'
                                }`}
                        >
                            {tab.replace('-', ' ')}
                        </button>
                    ))}
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
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="animate-fade-in">
                        <h2 className="text-3xl font-bold mb-8">Dashboard Overview</h2>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="glass rounded-xl p-6 border-l-4 border-l-blue-500">
                                <p className="text-sm text-[var(--text-secondary)]">Total Leads</p>
                                <p className="text-3xl font-bold mt-2">{stats.total_leads}</p>
                            </div>
                            <div className="glass rounded-xl p-6 border-l-4 border-l-green-500">
                                <p className="text-sm text-[var(--text-secondary)]">Active Students</p>
                                <p className="text-3xl font-bold mt-2">{stats.total_students}</p>
                            </div>
                            <div className="glass rounded-xl p-6 border-l-4 border-l-purple-500">
                                <p className="text-sm text-[var(--text-secondary)]">Total Revenue</p>
                                <p className="text-3xl font-bold mt-2">₹{stats.total_revenue.toLocaleString()}</p>
                            </div>
                            <div className="glass rounded-xl p-6 border-l-4 border-l-pink-500">
                                <p className="text-sm text-[var(--text-secondary)]">Active Batches</p>
                                <p className="text-3xl font-bold mt-2">{stats.active_batches}</p>
                            </div>
                        </div>

                        {/* Charts Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            {/* Enrollment Trend */}
                            <div className="glass rounded-xl p-6">
                                <h3 className="text-xl font-semibold mb-6">Enrollment Trends (Last 7 Days)</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={stats.enrollment_trend}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                            <XAxis dataKey="name" stroke="#9ca3af" />
                                            <YAxis stroke="#9ca3af" />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                            <Line type="monotone" dataKey="students" stroke="#818cf8" strokeWidth={3} dot={{ r: 4 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Lead Distribution */}
                            <div className="glass rounded-xl p-6">
                                <h3 className="text-xl font-semibold mb-6">Lead Status Distribution</h3>
                                <div className="h-80 flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={stats.lead_distribution}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {stats.lead_distribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={['#60a5fa', '#34d399', '#f472b6', '#fbbf24'][index % 4]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex justify-center gap-4 mt-4">
                                    {stats.lead_distribution.map((entry, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ['#60a5fa', '#34d399', '#f472b6', '#fbbf24'][index % 4] }}></div>
                                            <span className="text-sm text-[var(--text-secondary)] capitalize">{entry.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Lead CRM Tab */}
                {activeTab === 'leads' && (
                    <div>
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-3xl font-bold">Lead Management System</h2>
                                <p className="text-[var(--text-secondary)] mt-1">Auto-sync with Landing Page</p>
                            </div>
                            <div className="flex gap-3">
                                {selectedLeads.length > 0 && (
                                    <div className="flex gap-2 animate-fade-in">
                                        <button
                                            onClick={() => handleBulkAction('email')}
                                            className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-all flex items-center"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                            Email ({selectedLeads.length})
                                        </button>
                                        <button
                                            onClick={() => handleBulkAction('whatsapp')}
                                            className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-all flex items-center"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                            WhatsApp ({selectedLeads.length})
                                        </button>
                                    </div>
                                )}
                                <label className="px-4 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-all cursor-pointer flex items-center">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                    Import CSV
                                    <input type="file" accept=".csv" className="hidden" onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const formData = new FormData();
                                            formData.append('file', file);
                                            api.post('/leads/import', formData, {
                                                headers: { 'Content-Type': 'multipart/form-data' }
                                            }).then(() => {
                                                alert('CSV imported successfully!');
                                                loadData();
                                            }).catch(() => {
                                                alert('Failed to import CSV');
                                            });
                                        }
                                    }} />
                                </label>
                                <button
                                    onClick={() => setIsLeadModalOpen(true)}
                                    className="gradient-primary text-white font-medium py-2 px-6 rounded-lg hover:opacity-90 transition-all"
                                >
                                    + Add Lead
                                </button>
                            </div>
                        </div>

                        {/* Advanced Search & Filters */}
                        <div className="glass rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-center">
                            <div className="flex-1 min-w-[200px] relative">
                                <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                <input
                                    type="text"
                                    placeholder="Search by name, email, or phone..."
                                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <select
                                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                            >
                                <option value="all">All Roles</option>
                                <option value="student">Student</option>
                                <option value="parent">Parent</option>
                            </select>
                            <select
                                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={filterCity}
                                onChange={(e) => setFilterCity(e.target.value)}
                            >
                                <option value="all">All Cities</option>
                                {uniqueCities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                            <select
                                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="name_asc">Name (A-Z)</option>
                                <option value="name_desc">Name (Z-A)</option>
                            </select>
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setFilterRole('all');
                                    setFilterCity('all');
                                    setSortBy('newest');
                                }}
                                className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-white hover:bg-white/5 rounded-lg transition-all"
                            >
                                Reset
                            </button>
                        </div>

                        <div className="glass rounded-xl overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-white/5">
                                    <tr>
                                        <th className="px-6 py-4 text-left">
                                            <input
                                                type="checkbox"
                                                className="rounded border-white/10 bg-white/5 text-indigo-500 focus:ring-indigo-500"
                                                checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedLeads(filteredLeads.map(l => l.id));
                                                    } else {
                                                        setSelectedLeads([]);
                                                    }
                                                }}
                                            />
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-[var(--text-secondary)]">NAME</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-[var(--text-secondary)]">CONTACT</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-[var(--text-secondary)]">LOCATION</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-[var(--text-secondary)]">ROLE</th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-[var(--text-secondary)]">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredLeads.map((lead) => (
                                        <tr key={lead.id} className={`hover:bg-white/5 transition-all ${selectedLeads.includes(lead.id) ? 'bg-white/5' : ''}`}>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-white/10 bg-white/5 text-indigo-500 focus:ring-indigo-500"
                                                    checked={selectedLeads.includes(lead.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedLeads([...selectedLeads, lead.id]);
                                                        } else {
                                                            setSelectedLeads(selectedLeads.filter(id => id !== lead.id));
                                                        }
                                                    }}
                                                />
                                            </td>
                                            <td className="px-6 py-4 font-medium">{lead.name}</td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm">{lead.email}</p>
                                                <p className="text-xs text-[var(--text-muted)]">{lead.phone}</p>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{lead.city || '-'}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                                    {lead.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleSendEmail(lead.id)} className="p-2 hover:bg-white/10 rounded-lg text-blue-400" title="Email">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                    </button>
                                                    <button onClick={() => handleSendWhatsApp(lead.id)} className="p-2 hover:bg-white/10 rounded-lg text-green-400" title="WhatsApp">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                                    </button>
                                                    <button onClick={() => handleCall(lead.id)} className="p-2 hover:bg-white/10 rounded-lg text-purple-400" title="Call">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                    </button>
                                                    <button onClick={() => handleDeleteLead(lead.id)} className="p-2 hover:bg-white/10 rounded-lg text-red-500" title="Delete">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div >
                )
                }

                {/* AI Marketing Tab */}
                {
                    activeTab === 'ai-marketing' && (
                        <div>
                            <h2 className="text-3xl font-bold mb-8">AI Content Generator</h2>
                            <div className="glass rounded-xl p-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">Campaign Topic</label>
                                        <input
                                            type="text"
                                            value={aiTopic}
                                            onChange={(e) => setAiTopic(e.target.value)}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="e.g., Python Summer Camp"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">Channel</label>
                                            <select
                                                value={aiChannel}
                                                onChange={(e) => setAiChannel(e.target.value)}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            >
                                                <option value="email">Email Blast</option>
                                                <option value="whatsapp">WhatsApp</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">Target Audience</label>
                                            <select
                                                value={aiAudience}
                                                onChange={(e) => setAiAudience(e.target.value)}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            >
                                                <option value="parents">Parents</option>
                                                <option value="students">Students</option>
                                                <option value="all">All</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button
                                        onClick={generateAIContent}
                                        disabled={aiLoading}
                                        className="gradient-primary text-white font-medium py-3 px-6 rounded-lg hover:opacity-90 transition-all flex items-center disabled:opacity-50"
                                    >
                                        {aiLoading ? 'Generating...' : 'Generate Content'}
                                    </button>
                                    {aiContent && (
                                        <div className="mt-6 p-6 bg-white/5 border border-white/10 rounded-lg">
                                            <h3 className="font-semibold mb-4">Generated Draft</h3>
                                            <pre className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap mb-6">{aiContent}</pre>

                                            {/* Lead Selection for Broadcast */}
                                            <div className="mb-6">
                                                <h4 className="font-medium mb-3 text-[var(--text-secondary)]">Select Recipients ({aiAudience})</h4>
                                                <div className="max-h-60 overflow-y-auto border border-white/10 rounded-lg bg-black/20 p-2">
                                                    {leads
                                                        .filter(l => aiAudience === 'all' || (aiAudience === 'students' ? l.role === 'student' : l.role !== 'student'))
                                                        .map(lead => (
                                                            <div key={lead.id} className="flex items-center p-2 hover:bg-white/5 rounded">
                                                                <input
                                                                    type="checkbox"
                                                                    className="mr-3 rounded border-white/10 bg-white/5 text-indigo-500 focus:ring-indigo-500"
                                                                    checked={marketingSelectedLeads.includes(lead.id)}
                                                                    onChange={(e) => {
                                                                        if (e.target.checked) {
                                                                            setMarketingSelectedLeads([...marketingSelectedLeads, lead.id]);
                                                                        } else {
                                                                            setMarketingSelectedLeads(marketingSelectedLeads.filter(id => id !== lead.id));
                                                                        }
                                                                    }}
                                                                />
                                                                <div className="flex-1">
                                                                    <p className="text-sm font-medium">{lead.name}</p>
                                                                    <p className="text-xs text-[var(--text-muted)]">{lead.email} • {lead.role}</p>
                                                                </div>
                                                            </div>
                                                        ))
                                                    }
                                                    {leads.filter(l => aiAudience === 'all' || (aiAudience === 'students' ? l.role === 'student' : l.role !== 'student')).length === 0 && (
                                                        <p className="text-sm text-[var(--text-muted)] p-2">No leads found for this audience.</p>
                                                    )}
                                                </div>
                                                <div className="mt-2 flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            const filtered = leads.filter(l => aiAudience === 'all' || (aiAudience === 'students' ? l.role === 'student' : l.role !== 'student'));
                                                            setMarketingSelectedLeads(filtered.map(l => l.id));
                                                        }}
                                                        className="text-xs text-indigo-400 hover:text-indigo-300"
                                                    >
                                                        Select All
                                                    </button>
                                                    <button
                                                        onClick={() => setMarketingSelectedLeads([])}
                                                        className="text-xs text-[var(--text-muted)] hover:text-white"
                                                    >
                                                        Deselect All
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex gap-3">
                                                <button
                                                    onClick={handleBroadcast}
                                                    disabled={marketingSelectedLeads.length === 0}
                                                    className="gradient-primary text-white font-medium py-2 px-6 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Approve & Send ({marketingSelectedLeads.length})
                                                </button>
                                                <button
                                                    onClick={() => setAiContent('')}
                                                    className="px-6 py-2 text-sm text-[var(--text-secondary)] hover:bg-white/5 rounded-lg transition-all"
                                                >
                                                    Discard
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* Class Manager Tab */}
                {
                    activeTab === 'classes' && (
                        <div>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-3xl font-bold">Class Schedule</h2>
                                <button
                                    onClick={() => setIsBatchModalOpen(true)}
                                    className="gradient-primary text-white font-medium py-2 px-6 rounded-lg hover:opacity-90 transition-all"
                                >
                                    + Schedule Class
                                </button>
                            </div>
                            <div className="space-y-4">
                                {batches.map((batch, index) => {
                                    const course = courses.find(c => c.id === batch.course_id);
                                    const colors = [
                                        { badge: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30', accent: 'border-l-indigo-500' },
                                        { badge: 'bg-purple-500/20 text-purple-400 border-purple-500/30', accent: 'border-l-purple-500' },
                                        { badge: 'bg-pink-500/20 text-pink-400 border-pink-500/30', accent: 'border-l-pink-500' },
                                        { badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30', accent: 'border-l-blue-500' },
                                        { badge: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', accent: 'border-l-cyan-500' },
                                    ];
                                    const colorScheme = colors[index % colors.length];

                                    return (
                                        <div key={batch.id} className={`glass rounded-xl p-6 border-l-4 ${colorScheme.accent} hover:bg-white/5 transition-all`}>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colorScheme.badge}`}>
                                                        BATCH {batch.id}
                                                    </span>
                                                    <h3 className="text-xl font-semibold mt-3 mb-2">
                                                        {course?.title || 'Python for Beginners'}
                                                    </h3>
                                                    <p className="text-sm text-[var(--text-secondary)] mb-3">
                                                        {course?.description || 'Learn Python from scratch.'}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-sm">
                                                        <div className="flex items-center text-[var(--text-muted)]">
                                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                            {new Date(batch.start_date).toLocaleDateString()}
                                                        </div>
                                                        <div className="flex items-center text-[var(--text-muted)]">
                                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                            {batch.timings}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <button
                                                        onClick={() => handleOpenEnrollModal(batch.id)}
                                                        className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-all"
                                                    >
                                                        Manage Students
                                                    </button>
                                                    <button
                                                        onClick={() => handleJoinLink(batch.meeting_link)}
                                                        className="px-4 py-2 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/30 rounded-lg text-sm transition-all flex items-center justify-center"
                                                    >
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                        Join Class
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )
                }

                {/* Support Tab */}
                {
                    activeTab === 'support' && (
                        <div className="animate-fade-in">
                            <h2 className="text-3xl font-bold mb-8">Support Tickets</h2>
                            <div className="space-y-4">
                                {supportTickets.map((ticket) => (
                                    <div key={ticket.id} className="glass rounded-xl p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold mb-1">{ticket.subject}</h3>
                                                <p className="text-sm text-[var(--text-muted)]">
                                                    User ID: {ticket.user_id} | {new Date(ticket.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${ticket.status === 'closed'
                                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                : ticket.status === 'in_progress'
                                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                                    : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                                }`}>
                                                {ticket.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-[var(--text-secondary)] mb-4">{ticket.message}</p>
                                        {ticket.response && (
                                            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                                                <p className="text-sm font-medium text-green-400 mb-2">Response:</p>
                                                <p className="text-sm text-[var(--text-secondary)]">{ticket.response}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {supportTickets.length === 0 && (
                                    <div className="text-center py-12 glass rounded-xl">
                                        <p className="text-[var(--text-secondary)]">No support tickets found.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                }

                {/* Email System Tab */}
                {
                    activeTab === 'email' && (
                        <div className="animate-fade-in h-[calc(100vh-8rem)] flex gap-6">
                            {/* Left Sidebar: User List */}
                            <div className="w-1/3 glass rounded-xl overflow-hidden flex flex-col">
                                <div className="p-4 border-b border-white/10">
                                    <h3 className="font-bold mb-2">Select Recipient</h3>
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="flex-1 overflow-y-auto">
                                    {leads
                                        .filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase()) || l.email.toLowerCase().includes(searchQuery.toLowerCase()))
                                        .map(lead => (
                                            <div
                                                key={lead.id}
                                                onClick={() => {
                                                    setEmailSelectedUser(lead);
                                                    fetchEmailHistory(lead.id);
                                                }}
                                                className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-all ${emailSelectedUser?.id === lead.id ? 'bg-indigo-500/20 border-l-4 border-l-indigo-500' : ''}`}
                                            >
                                                <p className="font-medium">{lead.name}</p>
                                                <p className="text-xs text-[var(--text-muted)]">{lead.email}</p>
                                                <span className="text-[10px] uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded mt-1 inline-block">{lead.role}</span>
                                            </div>
                                        ))}
                                </div>
                            </div>

                            {/* Right Content: Compose & History */}
                            <div className="flex-1 glass rounded-xl flex flex-col overflow-hidden">
                                {emailSelectedUser ? (
                                    <>
                                        {/* Header */}
                                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                                            <div>
                                                <h3 className="font-bold">{emailSelectedUser.name}</h3>
                                                <p className="text-sm text-[var(--text-muted)]">{emailSelectedUser.email}</p>
                                            </div>
                                            <div className="text-xs text-[var(--text-muted)]">
                                                ID: {emailSelectedUser.id}
                                            </div>
                                        </div>

                                        {/* History */}
                                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                            {emailHistory.length === 0 ? (
                                                <div className="text-center text-[var(--text-muted)] py-10">
                                                    No communication history yet.
                                                </div>
                                            ) : (
                                                emailHistory.map((log) => {
                                                    const isReceived = log.status === 'received';
                                                    return (
                                                        <div key={log.id} className={`flex flex-col ${isReceived ? 'items-start' : 'items-end'}`}>
                                                            <div className={`max-w-[80%] rounded-xl p-4 ${!isReceived ? 'bg-indigo-500/20 border border-indigo-500/30 rounded-tr-none' : 'bg-white/5 border border-white/10 rounded-tl-none'}`}>
                                                                <div className="flex justify-between items-center mb-2 gap-4">
                                                                    <span className="text-xs font-bold uppercase opacity-70">{log.type}</span>
                                                                    <span className="text-xs opacity-50">{new Date(log.timestamp).toLocaleString()}</span>
                                                                </div>
                                                                <p className="text-sm whitespace-pre-wrap">{log.content}</p>
                                                                <div className="mt-2 text-xs opacity-50 text-right capitalize">Status: {log.status}</div>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>

                                        {/* Compose Area */}
                                        <div className="p-4 border-t border-white/10 bg-black/20">
                                            <input
                                                type="text"
                                                placeholder="Subject"
                                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                value={emailSubject}
                                                onChange={(e) => setEmailSubject(e.target.value)}
                                            />
                                            <textarea
                                                placeholder="Type your message here..."
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg h-32 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
                                                value={emailMessage}
                                                onChange={(e) => setEmailMessage(e.target.value)}
                                            ></textarea>
                                            <div className="flex justify-end">
                                                <button
                                                    onClick={handleSendEmailSystem}
                                                    className="gradient-primary text-white font-medium py-2 px-6 rounded-lg hover:opacity-90 transition-all flex items-center"
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                                    Send Email
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex-1 flex items-center justify-center text-[var(--text-muted)]">
                                        Select a user to view history and send emails.
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                }
            </main>

            {/* Modals */}
            {
                isLeadModalOpen && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="glass rounded-xl p-8 w-full max-w-md animate-fade-in relative">
                            <button
                                onClick={() => setIsLeadModalOpen(false)}
                                className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-white"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            <h2 className="text-2xl font-bold mb-6">Add New Lead</h2>
                            <form onSubmit={handleCreateLead} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={leadForm.name}
                                        onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={leadForm.email}
                                        onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Phone Number</label>
                                    <input
                                        type="tel"
                                        required
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={leadForm.phone}
                                        onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">City</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={leadForm.city}
                                        onChange={(e) => setLeadForm({ ...leadForm, city: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Role</label>
                                    <select
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={leadForm.role}
                                        onChange={(e) => setLeadForm({ ...leadForm, role: e.target.value })}
                                    >
                                        <option value="student">Student</option>
                                        <option value="parent">Parent</option>
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full gradient-primary text-white font-bold py-3 rounded-lg hover:opacity-90 transition-all mt-6"
                                >
                                    Add Lead
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }

            {
                isBatchModalOpen && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="glass rounded-xl p-8 w-full max-w-md animate-fade-in relative">
                            <button
                                onClick={() => setIsBatchModalOpen(false)}
                                className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-white"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            <h2 className="text-2xl font-bold mb-6">Schedule New Class</h2>
                            <form onSubmit={handleCreateBatch} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Select Course</label>
                                    <select
                                        required
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={batchForm.course_id}
                                        onChange={(e) => setBatchForm({ ...batchForm, course_id: e.target.value })}
                                    >
                                        <option value="">Select a course...</option>
                                        {courses.map(course => (
                                            <option key={course.id} value={course.id}>{course.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Start Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={batchForm.start_date}
                                        onChange={(e) => setBatchForm({ ...batchForm, start_date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Timings</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g., Mon-Fri, 6 PM - 7 PM"
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={batchForm.timings}
                                        onChange={(e) => setBatchForm({ ...batchForm, timings: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Meeting Link</label>
                                    <input
                                        type="url"
                                        placeholder="https://meet.google.com/..."
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={batchForm.meeting_link}
                                        onChange={(e) => setBatchForm({ ...batchForm, meeting_link: e.target.value })}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full gradient-primary text-white font-bold py-3 rounded-lg hover:opacity-90 transition-all mt-6"
                                >
                                    Schedule Class
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }

            {
                isEnrollModalOpen && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="glass rounded-xl p-8 w-full max-w-2xl animate-fade-in relative max-h-[90vh] overflow-y-auto">
                            <button
                                onClick={() => setIsEnrollModalOpen(false)}
                                className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-white"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            <h2 className="text-2xl font-bold mb-6">Manage Enrollments</h2>

                            <div className="flex gap-4 mb-6 border-b border-white/10">
                                <button
                                    onClick={() => setActiveEnrollTab('students')}
                                    className={`pb-2 px-1 ${activeEnrollTab === 'students' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-[var(--text-secondary)]'}`}
                                >
                                    Existing Students
                                </button>
                                <button
                                    onClick={() => setActiveEnrollTab('leads')}
                                    className={`pb-2 px-1 ${activeEnrollTab === 'leads' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-[var(--text-secondary)]'}`}
                                >
                                    Convert Leads
                                </button>
                            </div>

                            {activeEnrollTab === 'students' ? (
                                <div className="space-y-6">
                                    {/* Enrolled Students Section */}
                                    {enrolledStudents.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3 uppercase tracking-wider">
                                                Already Enrolled ({enrolledStudents.length})
                                            </h3>
                                            <div className="space-y-2 mb-6">
                                                {enrolledStudents.map(student => (
                                                    <div key={student.id} className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                                                        <div>
                                                            <p className="font-medium text-white">{student.name}</p>
                                                            <p className="text-sm text-[var(--text-muted)]">{student.email}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                                                                Enrolled
                                                            </span>
                                                            <button
                                                                onClick={() => handleIssueCertificate(student.id)}
                                                                className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-xs font-medium hover:bg-indigo-500/30 transition-all border border-indigo-500/30"
                                                            >
                                                                Issue Certificate
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Available Students Section */}
                                    <div>
                                        <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3 uppercase tracking-wider">
                                            Available Students
                                        </h3>
                                        <input
                                            type="text"
                                            placeholder="Search students..."
                                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
                                        />
                                        <div className="space-y-2">
                                            {students
                                                .filter(student => !enrolledStudents.some(es => es.id === student.id))
                                                .map(student => (
                                                    <div key={student.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                                        <div>
                                                            <p className="font-medium">{student.name}</p>
                                                            <p className="text-sm text-[var(--text-muted)]">{student.email}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => handleEnrollStudent(student.id)}
                                                            className="px-3 py-1 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-lg text-sm hover:bg-indigo-500/30 transition-all"
                                                        >
                                                            Enroll
                                                        </button>
                                                    </div>
                                                ))}
                                            {students.filter(student => !enrolledStudents.some(es => es.id === student.id)).length === 0 && (
                                                <p className="text-center text-[var(--text-muted)] py-4">No available students found.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Search leads..."
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
                                    />
                                    <div className="space-y-2">
                                        {leads.filter(l => l.status !== 'enrolled').map(lead => (
                                            <div key={lead.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                                <div>
                                                    <p className="font-medium">{lead.name}</p>
                                                    <p className="text-sm text-[var(--text-muted)]">{lead.email}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleEnrollLead(lead.id)}
                                                    className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-sm hover:bg-green-500/30 transition-all"
                                                >
                                                    Convert & Enroll
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }
        </div >
    );
}
