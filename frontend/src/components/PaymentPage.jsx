import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const PaymentPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('initial'); // initial, processing, success, error
    const [amount, setAmount] = useState(0);
    const [courseTitle, setCourseTitle] = useState('');

    const batchId = searchParams.get('batch');
    const studentName = searchParams.get('student');
    const studentEmail = searchParams.get('email');

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                if (batchId) {
                    // Fetch all batches and courses to find the matching one
                    // In a real app, we would have specific endpoints
                    const [batchesRes, coursesRes] = await Promise.all([
                        api.get('/batches'),
                        api.get('/courses')
                    ]);

                    const batch = batchesRes.data.find(b => b.id === parseInt(batchId));
                    if (batch) {
                        const course = coursesRes.data.find(c => c.id === batch.course_id);
                        if (course) {
                            setAmount(course.price);
                            setCourseTitle(course.title);
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to fetch details', error);
            }
        };
        fetchDetails();
    }, [batchId]);

    const handlePayment = async () => {
        setLoading(true);
        setStatus('processing');

        // Simulate payment processing delay
        setTimeout(async () => {
            try {
                // Call backend webhook to simulate success
                await api.post('/payments/webhook/mock', {
                    status: 'success',
                    order_id: `ORDER_${Date.now()}`,
                    email: studentEmail,
                    name: studentName,
                    amount: amount
                });

                setStatus('success');

                // Redirect to landing page immediately
                navigate('/?payment=success');

            } catch (error) {
                console.error('Payment failed:', error);
                setStatus('error');
            } finally {
                setLoading(false);
            }
        }, 2000);
    };

    if (status === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-green-50">
                <div className="text-center p-8 bg-white rounded-lg shadow-xl">
                    <div className="text-6xl mb-4">✅</div>
                    <h2 className="text-2xl font-bold text-green-800 mb-2">Payment Successful!</h2>
                    <p className="text-gray-600">Redirecting you back to home...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-indigo-600 py-4 px-6">
                    <h2 className="text-xl font-bold text-white">Complete Your Enrollment</h2>
                </div>

                <div className="p-6 space-y-6">
                    <div className="border-b pb-4">
                        <p className="text-sm text-gray-500">Student Name</p>
                        <p className="font-medium text-lg text-gray-900">{studentName || 'Student'}</p>
                    </div>

                    <div className="border-b pb-4">
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-lg text-gray-900">{studentEmail || 'Not provided'}</p>
                    </div>

                    <div className="border-b pb-4">
                        <p className="text-sm text-gray-500">Course</p>
                        <p className="font-medium text-lg text-gray-900">{courseTitle || `Batch ${batchId}`}</p>
                    </div>

                    <div className="flex justify-between items-center py-2">
                        <span className="font-bold text-gray-700">Total Amount</span>
                        <span className="font-bold text-2xl text-indigo-600">₹{amount.toLocaleString()}</span>
                    </div>

                    {status === 'error' && (
                        <div className="bg-red-50 text-red-700 p-3 rounded">
                            Payment failed. Please try again.
                        </div>
                    )}

                    <button
                        onClick={handlePayment}
                        disabled={loading}
                        className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white font-medium 
                            ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}
                        `}
                    >
                        {loading ? 'Processing...' : 'Pay Now Securely'}
                    </button>

                    <p className="text-xs text-center text-gray-500 mt-4">
                        This is a secure 256-bit SSL encrypted payment.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
