import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import LoginModal from './LoginModal';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function LandingPage() {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [searchParams] = useSearchParams();
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    useEffect(() => {
        if (searchParams.get('payment') === 'success') {
            setShowSuccessPopup(true);
        }
    }, [searchParams]);

    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        parentName: '',
        email: '',
        phone: '',
        city: '',
        role: 'student',
        course_id: 1
    });
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch courses and batches
        const fetchData = async () => {
            try {
                const [coursesRes, batchesRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/courses`),
                    axios.get(`${API_BASE_URL}/batches`)
                ]);

                setCourses(coursesRes.data);
                setBatches(batchesRes.data);

                if (coursesRes.data.length > 0) {
                    setFormData(prev => ({ ...prev, course_id: coursesRes.data[0].id }));
                }
            } catch (error) {
                console.error('Failed to fetch data', error);
                // Fallback mock data
                setCourses([
                    { id: 1, title: 'Python Mastery Program', price: 4999 },
                    { id: 2, title: 'Web Development Bootcamp', price: 5999 }
                ]);
                setBatches([
                    { id: 1, course_id: 1, start_date: '2023-11-01' },
                    { id: 2, course_id: 2, start_date: '2023-12-01' }
                ]);
            }
        };
        fetchData();
    }, []);

    const courseDetailsRef = useRef(null);
    const leadFormRef = useRef(null);

    const scrollToSection = (ref) => {
        ref.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/public/leads`, formData);
            setSubmitted(true);
            // Simulate WhatsApp/Email automation trigger
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Failed to submit. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-indigo-500/30">
            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />

            {/* Success Popup */}
            {showSuccessPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white text-gray-900 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-scale-in relative">
                        <button
                            onClick={() => setShowSuccessPopup(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>

                            <h3 className="text-2xl font-bold mb-2">Payment Successful! 🎉</h3>
                            <p className="text-gray-600 mb-6">
                                Welcome to Python Pro! We have sent your login credentials to your email.
                            </p>

                            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-6">
                                <p className="text-sm text-indigo-800 font-medium">
                                    Check your inbox (and spam folder) for an email from Python Pro.
                                </p>
                            </div>

                            <button
                                onClick={() => setIsLoginModalOpen(true)}
                                className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors"
                            >
                                Login to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sticky Header */}
            <header className="sticky top-0 z-40 glass border-b border-white/10 px-6 py-4 backdrop-blur-md bg-[#0f172a]/80">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <span className="font-bold text-white">P</span>
                        </div>
                        <h1 className="text-xl font-bold tracking-tight">PythonPro</h1>
                    </div>

                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--text-secondary)]">
                        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition-colors">About</button>
                        <button onClick={() => scrollToSection(courseDetailsRef)} className="hover:text-white transition-colors">Courses</button>
                        <button onClick={() => scrollToSection(leadFormRef)} className="hover:text-white transition-colors">Contact</button>
                    </nav>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => scrollToSection(leadFormRef)}
                            className="hidden md:block px-4 py-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                            ⭐ Enroll Now
                        </button>
                        <button
                            onClick={() => setIsLoginModalOpen(true)}
                            className="px-6 py-2 text-sm font-medium bg-white/10 hover:bg-white/20 rounded-full transition-all border border-white/10"
                        >
                            Login
                        </button>
                        <a
                            href="/signup"
                            className="px-6 py-2 text-sm font-medium gradient-primary text-white rounded-full transition-all hover:opacity-90"
                        >
                            Sign Up
                        </a>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-20 pb-32 px-6 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] animate-pulse"></div>
                    <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
                </div>

                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-6">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                            New Batch Starting Soon
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                            Python Classes for <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                                Future Innovators
                            </span>
                        </h1>
                        <p className="text-xl text-[var(--text-secondary)] mb-8 max-w-lg">
                            Designed for students ages 12–18. Zero background required. Live online batches with certification.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => scrollToSection(courseDetailsRef)}
                                className="px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all font-medium"
                            >
                                Know More
                            </button>
                            <button
                                onClick={() => scrollToSection(leadFormRef)}
                                className="px-8 py-4 rounded-xl gradient-primary text-white font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all transform hover:-translate-y-1"
                            >
                                Enroll Now
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-3xl blur-2xl transform rotate-6"></div>
                        <div className="relative glass rounded-3xl p-2 border border-white/10">
                            {/* Placeholder for an image or illustration */}
                            <div className="aspect-[4/3] bg-[#1e293b] rounded-2xl overflow-hidden flex items-center justify-center relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10"></div>
                                <div className="text-center p-8">
                                    <div className="w-20 h-20 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                                        <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                        </svg>
                                    </div>
                                    <p className="font-mono text-sm text-indigo-300">print("Hello, Future!")</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits & Social Proof */}
            <section className="py-20 px-6 bg-[#0f172a]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Why Students Love Us</h2>
                        <div className="flex items-center justify-center gap-2 text-yellow-400 mb-2">
                            {[1, 2, 3, 4, 5].map(i => (
                                <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                        <p className="text-[var(--text-secondary)]">4.9/5 rating based on 120+ students</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                        {[
                            { title: 'Live Classes', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', desc: 'Interactive sessions with expert mentors' },
                            { title: 'Beginner Friendly', icon: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', desc: 'No prior coding knowledge needed' },
                            { title: 'Projects & Certs', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z', desc: 'Build real apps and get certified' },
                            { title: 'Recorded Sessions', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', desc: 'Lifetime access to class recordings' }
                        ].map((item, i) => (
                            <div key={i} className="glass p-6 rounded-2xl hover:bg-white/5 transition-colors">
                                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                    </svg>
                                </div>
                                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                                <p className="text-sm text-[var(--text-secondary)]">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Course Details + Lead Form */}
            <section ref={courseDetailsRef} className="py-20 px-6 bg-[#0f172a] relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-900/20 pointer-events-none"></div>
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Left: Course Details */}
                    <div className="lg:col-span-7 space-y-12">
                        <div>
                            <h2 className="text-3xl font-bold mb-6">Course Curriculum</h2>
                            <div className="space-y-4">
                                {[
                                    'Module 1: Python Basics & Variables',
                                    'Module 2: Control Flow (If/Else, Loops)',
                                    'Module 3: Functions & Modules',
                                    'Module 4: Data Structures (Lists, Dicts)',
                                    'Module 5: Final Project: Build a Game'
                                ].map((module, i) => (
                                    <div key={i} className="flex items-center p-4 rounded-xl bg-white/5 border border-white/5">
                                        <span className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-bold mr-4">
                                            {i + 1}
                                        </span>
                                        <span className="font-medium">{module}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                                <h3 className="text-[var(--text-secondary)] text-sm uppercase tracking-wider mb-2">Duration</h3>
                                <p className="text-2xl font-bold">8 Weeks</p>
                                <p className="text-sm text-[var(--text-muted)]">2 Classes / Week</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                                <h3 className="text-[var(--text-secondary)] text-sm uppercase tracking-wider mb-2">Format</h3>
                                <p className="text-2xl font-bold">Live Online</p>
                                <p className="text-sm text-[var(--text-muted)]">Zoom / Google Meet</p>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
                            <div className="space-y-4">
                                <details className="group bg-white/5 rounded-xl border border-white/5">
                                    <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-4">
                                        <span>Do I need a laptop?</span>
                                        <span className="transition group-open:rotate-180">
                                            <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                                        </span>
                                    </summary>
                                    <p className="text-[var(--text-secondary)] mt-0 px-4 pb-4">
                                        Yes, a laptop or desktop is recommended for coding practice.
                                    </p>
                                </details>
                                <details className="group bg-white/5 rounded-xl border border-white/5">
                                    <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-4">
                                        <span>What if I miss a class?</span>
                                        <span className="transition group-open:rotate-180">
                                            <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                                        </span>
                                    </summary>
                                    <p className="text-[var(--text-secondary)] mt-0 px-4 pb-4">
                                        All classes are recorded and available in your student dashboard.
                                    </p>
                                </details>
                            </div>
                        </div>
                    </div>

                    {/* Right: Lead Form */}
                    <div className="lg:col-span-5 relative" ref={leadFormRef}>
                        <div className="sticky top-24">
                            <div className="glass p-8 rounded-3xl border border-white/10 shadow-2xl shadow-indigo-500/10">
                                {submitted ? (
                                    <div className="text-center py-12">
                                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
                                            <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <h3 className="text-2xl font-bold mb-2">You're In! 🎉</h3>
                                        <p className="text-[var(--text-secondary)] mb-6">We've sent the course syllabus to your email and WhatsApp.</p>

                                        <button
                                            onClick={() => {
                                                const batch = batches.find(b => b.course_id === formData.course_id) || { id: 1 };
                                                navigate(`/pay/checkout?batch=${batch.id}&student=${encodeURIComponent(formData.name)}&email=${encodeURIComponent(formData.email)}`);
                                            }}
                                            className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors mb-4 shadow-lg shadow-indigo-500/25"
                                        >
                                            Complete Payment Now
                                        </button>

                                        <button
                                            onClick={() => setSubmitted(false)}
                                            className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
                                        >
                                            Submit another response
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="mb-8">
                                            <h3 className="text-2xl font-bold mb-2">Get Full Details</h3>
                                            <p className="text-[var(--text-secondary)]">Syllabus, Fees & Batch Timings sent to your WhatsApp.</p>
                                        </div>

                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">Student Name</label>
                                                <input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full px-4 py-3 bg-[#0f172a]/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                                    placeholder="Enter student name"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">Parent Name (Optional)</label>
                                                <input
                                                    type="text"
                                                    value={formData.parentName}
                                                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                                                    className="w-full px-4 py-3 bg-[#0f172a]/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                                    placeholder="Enter parent name"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">Email</label>
                                                    <input
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        className="w-full px-4 py-3 bg-[#0f172a]/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                                        placeholder="john@example.com"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">WhatsApp</label>
                                                    <input
                                                        type="tel"
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                        className="w-full px-4 py-3 bg-[#0f172a]/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                                        placeholder="+91 98765..."
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">City</label>
                                                    <input
                                                        type="text"
                                                        value={formData.city}
                                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                        className="w-full px-4 py-3 bg-[#0f172a]/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                                        placeholder="Mumbai"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">I am a</label>
                                                    <select
                                                        value={formData.role}
                                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                                        className="w-full px-4 py-3 bg-[#0f172a]/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                                                    >
                                                        <option value="student">Student</option>
                                                        <option value="parent">Parent</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">Select Course</label>
                                                <select
                                                    value={formData.course_id}
                                                    onChange={(e) => setFormData({ ...formData, course_id: parseInt(e.target.value) })}
                                                    className="w-full px-4 py-3 bg-[#0f172a]/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                                                >
                                                    {courses.map(course => (
                                                        <option key={course.id} value={course.id}>{course.title} - ₹{course.price}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <button
                                                type="submit"
                                                className="w-full py-4 rounded-xl gradient-primary text-white font-bold text-lg shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all transform hover:-translate-y-1 mt-2"
                                            >
                                                Get Details on WhatsApp
                                            </button>

                                            <p className="text-xs text-center text-[var(--text-muted)] mt-4">
                                                By clicking, you agree to receive course updates via WhatsApp/Email.
                                            </p>
                                        </form>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/10 bg-[#0f172a] pt-16 pb-8 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                    <span className="font-bold text-white">P</span>
                                </div>
                                <h1 className="text-xl font-bold tracking-tight">PythonPro</h1>
                            </div>
                            <p className="text-[var(--text-secondary)] max-w-sm">
                                Empowering the next generation of innovators with coding skills. Join the revolution today.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-bold mb-4">Contact</h4>
                            <ul className="space-y-2 text-[var(--text-secondary)] text-sm">
                                <li>hello@pythonpro.com</li>
                                <li>+91 98765 43210</li>
                                <li>Mumbai, India</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold mb-4">Social</h4>
                            <div className="flex gap-4">
                                {['Twitter', 'LinkedIn', 'Instagram', 'YouTube'].map(social => (
                                    <a key={social} href="#" className="text-[var(--text-secondary)] hover:text-white transition-colors text-sm">
                                        {social}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[var(--text-muted)]">
                        <p>© 2023 PythonPro Coaching. All rights reserved.</p>
                        <div className="flex gap-6">
                            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
