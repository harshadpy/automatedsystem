import { useState, useEffect } from 'react';
import api from '../utils/api';

export default function Support() {
    const [tickets, setTickets] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTickets();
    }, []);

    const loadTickets = async () => {
        try {
            const response = await api.get('/support');
            setTickets(response.data);
        } catch (error) {
            console.error('Error loading tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/support', { subject, message });
            setSubject('');
            setMessage('');
            setShowForm(false);
            loadTickets();
        } catch (error) {
            console.error('Error creating ticket:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold mb-2">Support</h2>
                    <p className="text-[var(--text-secondary)]">Get help with your queries</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="gradient-primary text-white font-medium py-2 px-6 rounded-lg hover:opacity-90 transition-all"
                >
                    {showForm ? 'Cancel' : 'New Ticket'}
                </button>
            </div>

            {showForm && (
                <div className="glass rounded-xl p-6 mb-6">
                    <h3 className="text-xl font-semibold mb-4">Create Support Ticket</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
                                Subject
                            </label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Brief description of your issue"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
                                Message
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                rows="4"
                                placeholder="Describe your issue in detail..."
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="gradient-primary text-white font-medium py-2 px-6 rounded-lg hover:opacity-90 transition-all"
                        >
                            Submit Ticket
                        </button>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                {tickets.map((ticket) => (
                    <div key={ticket.id} className="glass rounded-xl p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-1">{ticket.subject}</h3>
                                <p className="text-sm text-[var(--text-muted)]">
                                    {new Date(ticket.created_at).toLocaleDateString()}
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

                {tickets.length === 0 && (
                    <div className="glass rounded-xl p-8 text-center">
                        <svg className="w-16 h-16 mx-auto mb-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        <p className="text-[var(--text-secondary)]">No support tickets yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}
