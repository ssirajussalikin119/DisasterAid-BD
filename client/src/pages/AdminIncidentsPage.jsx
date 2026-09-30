import { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import PrimaryButton from '../components/ui/PrimaryButton';
import SecondaryButton from '../components/ui/SecondaryButton';
import { 
    getAdminIncidents, 
    createAdminIncident, 
    updateAdminIncident,
    updateAdminIncidentStatus,
    closeAdminIncident,
    finalizeAdminIncident
} from '../services/adminIncidentService';

export default function AdminIncidentsPage() {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [currentIncident, setCurrentIncident] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        district: '',
        status: 'active',
        severity: 'low',
        verified: false
    });

    const fetchIncidents = async () => {
        setLoading(true);
        try {
            const res = await getAdminIncidents();
            if (res.success) {
                setIncidents(res.data.incidents || []);
            } else {
                setError('Failed to fetch incidents');
            }
        } catch (err) {
            setError(err.message || 'Error fetching incidents');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIncidents();
    }, []);

    const openCreateForm = () => {
        setFormData({ title: '', district: '', status: 'active', severity: 'low', verified: false });
        setCurrentIncident(null);
        setIsFormOpen(true);
    };

    const openEditForm = (incident) => {
        setFormData({
            title: incident.title,
            district: incident.district,
            status: incident.status,
            severity: incident.severity,
            verified: !!incident.verified
        });
        setCurrentIncident(incident);
        setIsFormOpen(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentIncident) {
                await updateAdminIncident(currentIncident.id, formData);
            } else {
                await createAdminIncident(formData);
            }
            setIsFormOpen(false);
            fetchIncidents();
        } catch (err) {
            alert('Error saving incident');
        }
    };

    const handleStatusUpdate = async (id, status) => {
        if (window.confirm(`Are you sure you want to change status to ${status}?`)) {
            try {
                await updateAdminIncidentStatus(id, status);
                fetchIncidents();
            } catch (err) {
                alert('Error updating status');
            }
        }
    };

    const handleCloseIncident = async (id) => {
        if (window.confirm('Are you sure you want to resolve/close this incident?')) {
            try {
                await closeAdminIncident(id);
                fetchIncidents();
            } catch (err) {
                alert('Error closing incident');
            }
        }
    };

    const handleFinalizeIncident = async (id) => {
        if (window.confirm('Are you sure you want to finalize this incident? This requires all related assignments to be completed.')) {
            try {
                await finalizeAdminIncident(id);
                alert('Incident finalized successfully.');
                fetchIncidents();
            } catch (err) {
                alert(err.response?.data?.message || err.message || 'Error finalizing incident. Check if there are incomplete assignments.');
            }
        }
    };

    return (
        <AdminLayout>
            <div className="mx-auto max-w-7xl">
                <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-600">Admin</p>
                        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">Incident Management</h1>
                        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-700">Create, monitor, and resolve disaster incidents.</p>
                    </div>
                    <div>
                        <PrimaryButton onClick={openCreateForm}>Create Incident</PrimaryButton>
                    </div>
                </div>

                {loading ? (
                    <div className="mt-10 p-6 text-center text-slate-500 font-medium">Loading incidents...</div>
                ) : error ? (
                    <div className="mt-10 p-6 text-center text-red-500 font-medium bg-red-50 rounded-xl">{error}</div>
                ) : (
                    <div className="mt-10 grid gap-6">
                        {incidents.length === 0 ? (
                            <div className="p-6 text-center text-slate-500 bg-white rounded-xl shadow-sm">No incidents found.</div>
                        ) : (
                            incidents.map((incident) => (
                                <div key={incident.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900">{incident.title}</h3>
                                            <p className="text-sm text-slate-500 mt-1">District: {incident.district} | Reported by: {incident.creator_name}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${incident.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{incident.status}</span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${incident.severity === 'critical' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>{incident.severity}</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex flex-wrap items-center gap-4">
                                        <div className="text-sm font-medium text-slate-700">Linked Reports: <span className="bg-slate-100 px-2 py-1 rounded-md">{incident.report_count}</span></div>
                                        <SecondaryButton onClick={() => openEditForm(incident)} className="text-sm py-1 px-3">Edit</SecondaryButton>
                                        {incident.status !== 'resolved' && (
                                            <>
                                                <SecondaryButton onClick={() => handleStatusUpdate(incident.id, incident.status === 'monitoring' ? 'active' : 'monitoring')} className="text-sm py-1 px-3">
                                                    Mark as {incident.status === 'monitoring' ? 'Active' : 'Monitoring'}
                                                </SecondaryButton>
                                                <button onClick={() => handleFinalizeIncident(incident.id)} className="text-sm py-1 px-4 rounded-md font-medium transition-colors bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm">
                                                    Finalize
                                                </button>
                                                <SecondaryButton onClick={() => handleCloseIncident(incident.id)} className="text-sm py-1 px-3 bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                                                    Resolve Incident
                                                </SecondaryButton>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Modal Form */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
                        <h2 className="text-2xl font-bold mb-4">{currentIncident ? 'Edit Incident' : 'Create Incident'}</h2>
                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Title</label>
                                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">District</label>
                                <input required type="text" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Status</label>
                                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm">
                                        <option value="active">Active</option>
                                        <option value="monitoring">Monitoring</option>
                                        <option value="resolved">Resolved</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Severity</label>
                                    <select value={formData.severity} onChange={e => setFormData({...formData, severity: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm">
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-center mt-2">
                                <input type="checkbox" checked={formData.verified} onChange={e => setFormData({...formData, verified: e.target.checked})} className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded" />
                                <label className="ml-2 block text-sm text-slate-900">Verified</label>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <SecondaryButton type="button" onClick={() => setIsFormOpen(false)}>Cancel</SecondaryButton>
                                <PrimaryButton type="submit">Save</PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
