import { useState, useEffect } from 'react';
import api from '../utils/api';

export default function Assignments() {
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [submissionContent, setSubmissionContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [assignmentsData, submissionsData] = await Promise.all([
                api.get('/assignments'),
                api.get('/submissions')
            ]);
            setAssignments(assignmentsData.data);
            setSubmissions(submissionsData.data);
        } catch (error) {
            console.error('Error loading assignments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (assignmentId) => {
        try {
            await api.post('/submissions', {
                assignment_id: assignmentId,
                content: submissionContent
            });
            setSubmissionContent('');
            setSelectedAssignment(null);
            loadData();
        } catch (error) {
            console.error('Error submitting assignment:', error);
        }
    };

    const getSubmissionForAssignment = (assignmentId) => {
        return submissions.find(s => s.assignment_id === assignmentId);
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
            <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">Assignments</h2>
                <p className="text-[var(--text-secondary)]">View and submit your assignments</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {assignments.map((assignment) => {
                    const submission = getSubmissionForAssignment(assignment.id);

                    return (
                        <div key={assignment.id} className="glass rounded-xl p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-semibold mb-2">{assignment.title}</h3>
                                    <p className="text-[var(--text-secondary)] mb-4">{assignment.description}</p>
                                    <div className="flex items-center text-sm text-[var(--text-muted)]">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Due: {assignment.deadline}
                                    </div>
                                </div>
                                {submission ? (
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${submission.status === 'graded'
                                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                        }`}>
                                        {submission.status === 'graded' ? `Graded: ${submission.grade}` : 'Submitted'}
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                        Pending
                                    </span>
                                )}
                            </div>

                            {submission ? (
                                <div className="mt-4 p-4 bg-white/5 rounded-lg">
                                    <p className="text-sm text-[var(--text-secondary)] mb-2">Your Submission:</p>
                                    <p className="text-sm mb-2">{submission.content}</p>
                                    {submission.feedback && (
                                        <div className="mt-3 pt-3 border-t border-white/10">
                                            <p className="text-sm text-[var(--text-secondary)] mb-1">Feedback:</p>
                                            <p className="text-sm text-green-400">{submission.feedback}</p>
                                        </div>
                                    )}
                                </div>
                            ) : selectedAssignment === assignment.id ? (
                                <div className="mt-4">
                                    <textarea
                                        value={submissionContent}
                                        onChange={(e) => setSubmissionContent(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                        rows="4"
                                        placeholder="Enter your submission..."
                                    />
                                    <div className="flex gap-3 mt-3">
                                        <button
                                            onClick={() => handleSubmit(assignment.id)}
                                            className="gradient-primary text-white font-medium py-2 px-6 rounded-lg hover:opacity-90 transition-all"
                                        >
                                            Submit
                                        </button>
                                        <button
                                            onClick={() => setSelectedAssignment(null)}
                                            className="px-6 py-2 text-sm text-[var(--text-secondary)] hover:bg-white/5 rounded-lg transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setSelectedAssignment(assignment.id)}
                                    className="mt-4 gradient-primary text-white font-medium py-2 px-6 rounded-lg hover:opacity-90 transition-all"
                                >
                                    Submit Assignment
                                </button>
                            )}
                        </div>
                    );
                })}

                {assignments.length === 0 && (
                    <div className="glass rounded-xl p-8 text-center">
                        <svg className="w-16 h-16 mx-auto mb-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-[var(--text-secondary)]">No assignments yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}
