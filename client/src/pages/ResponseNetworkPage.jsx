import { useState, useEffect } from 'react';
import { getResponseNetwork, getAssignedVolunteers, getAvailableVolunteers } from '../services/responseNetworkService';

export default function ResponseNetworkPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [members, setMembers] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [available, setAvailable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [allData, assignedData, availableData] = await Promise.all([
          getResponseNetwork(),
          getAssignedVolunteers(),
          getAvailableVolunteers()
        ]);
        
        setMembers(allData.data || []);
        setAssigned(assignedData.data || []);
        setAvailable(availableData.data || []);
        setError(null);
      } catch (err) {
        console.error("Failed to load network data:", err);
        setError("Failed to load response network data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const getDisplayData = () => {
    switch (activeTab) {
      case 'assigned': return assigned;
      case 'available': return available;
      case 'all': default: return members;
    }
  };

  const displayData = getDisplayData();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">Response Network</h1>
        <p className="mt-2 text-slate-600">Analyze volunteer and NGO participation using advanced database operations.</p>
      </div>

      <div className="mb-6 flex space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 font-medium text-sm border-b-2 ${activeTab === 'all' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
        >
          All Members (UNION)
        </button>
        <button
          onClick={() => setActiveTab('assigned')}
          className={`px-4 py-2 font-medium text-sm border-b-2 ${activeTab === 'assigned' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
        >
          Assigned Volunteers (INTERSECT)
        </button>
        <button
          onClick={() => setActiveTab('available')}
          className={`px-4 py-2 font-medium text-sm border-b-2 ${activeTab === 'available' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
        >
          Available Volunteers (EXCEPT)
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 mb-6">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600"></div>
        </div>
      ) : displayData.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
          <p className="text-sm font-semibold text-slate-500">No members found in this category.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Role</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Contact</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Availability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {displayData.map((member, idx) => (
                  <tr key={`${member.user_id}-${idx}`} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">{member.name}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        member.role === 'ngo' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {member.role?.toUpperCase()}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                      {member.email} <br /> {member.phone}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                      {member.availability || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
