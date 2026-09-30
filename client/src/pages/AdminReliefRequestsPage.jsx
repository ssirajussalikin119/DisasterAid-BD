import { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import PrimaryButton from '../components/ui/PrimaryButton';
import SecondaryButton from '../components/ui/SecondaryButton';
import api from '../services/api';

export default function AdminReliefRequestsPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState([]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/relief-requests');
            setRequests(res.data.data);
            
            // Fetch inventory aggregate stats
            const statsRes = await api.get('/admin/relief-requests/sql/aggregate');
            setStats(statsRes.data.data);
        } catch (err) {
            setError(err.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const updateStatus = async (id, status) => {
        try {
            await api.patch(`/admin/relief-requests/${id}/status`, { status });
            fetchRequests();
        } catch (err) {
            alert('Error updating status');
        }
    };

    return (
        <AdminLayout>
            <div className="mx-auto max-w-7xl space-y-8">
                <div>
                    <h1 className="font-display text-3xl font-bold text-ink">Relief Management Central</h1>
                    <p className="mt-2 text-slate-600">Monitor relief requests and inventory resources.</p>
                </div>

                {error && <div className="text-red-500 bg-red-50 p-4 rounded-xl">{error}</div>}

                {/* Inventory Overview */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold text-ink mb-4">Inventory Overview (Available vs Distributed)</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <h3 className="font-bold text-slate-800">{stat.item_name}</h3>
                                <p className="text-sm text-slate-500 mt-1">Requested: {stat.total_requested}</p>
                                <p className="text-sm text-slate-500">Distributed: {stat.total_distributed}</p>
                                <p className={`text-sm font-bold mt-2 ${stat.deficit > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                    Deficit: {stat.deficit}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Relief Requests */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold text-ink mb-4">Relief Requests</h2>
                    {loading ? (
                        <p className="text-slate-500">Loading requests...</p>
                    ) : (
                        <div className="space-y-4">
                            {requests.map(req => (
                                <div key={req.id} className="border border-slate-200 p-4 rounded-xl">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg">Request #{req.id}</h3>
                                            <p className="text-sm text-slate-600">By: {req.user?.name} | {req.user?.email}</p>
                                            <p className="text-sm text-slate-600">Urgency: <span className="font-semibold">{req.urgency}</span></p>
                                            <p className="text-sm text-slate-600 mt-2">{req.description}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase">{req.status}</span>
                                            {req.status === 'pending' && (
                                                <div className="flex gap-2 mt-2">
                                                    <SecondaryButton onClick={() => updateStatus(req.id, 'approved')} className="text-xs">Approve</SecondaryButton>
                                                    <SecondaryButton onClick={() => updateStatus(req.id, 'rejected')} className="text-xs text-red-600">Reject</SecondaryButton>
                                                </div>
                                            )}
                                            {req.status === 'approved' && (
                                                <SecondaryButton onClick={() => updateStatus(req.id, 'fulfilled')} className="text-xs text-green-600">Mark Fulfilled</SecondaryButton>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <h4 className="text-sm font-bold text-slate-700 mb-2">Requested Items:</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {req.items?.map(item => (
                                                <span key={item.id} className="bg-slate-100 px-3 py-1 rounded-md text-xs font-medium text-slate-700">
                                                    {item.quantity}x {item.item_name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
