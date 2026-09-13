import { useState, useEffect } from 'react';
import { getOfficialIncidents } from '../services/incidentService';
import assignmentService from '../services/assignmentService';

export default function VolunteerAssignmentPage() {
  const [assignments, setAssignments] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [availableVolunteers, setAvailableVolunteers] = useState([]);
  const [aggregateCounts, setAggregateCounts] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [assigning, setAssigning] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState('');
  const [selectedVolunteer, setSelectedVolunteer] = useState('');
  
  const [statusFilter, setStatusFilter] = useState('');
  const [incidentFilter, setIncidentFilter] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [assignmentsRes, incidentsRes, availableRes, countsRes] = await Promise.all([
        assignmentService.getInnerJoin(),
        getOfficialIncidents(),
        assignmentService.getExceptUnassigned(),
        assignmentService.getAggregateCounts(),
      ]);
      
      setAssignments(assignmentsRes.data || []);
      setIncidents(incidentsRes || []);
      setAvailableVolunteers(availableRes.data || []);
      setAggregateCounts(countsRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load assignment data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedIncident || !selectedVolunteer) return;
    
    try {
      setAssigning(true);
      await assignmentService.createAssignment({
        incident_id: selectedIncident,
        volunteer_id: selectedVolunteer,
        status: 'pending'
      });
      
      setSelectedIncident('');
      setSelectedVolunteer('');
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign volunteer');
    } finally {
      setAssigning(false);
    }
  };

  const filteredAssignments = assignments.filter(a => {
    if (statusFilter && a.status !== statusFilter) return false;
    if (incidentFilter && String(a.incident_id) !== String(incidentFilter)) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-lg font-semibold text-slate-500">Loading assignments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[1.5rem] bg-red-50 p-6 text-center">
        <p className="text-red-600">{error}</p>
        <button onClick={loadData} className="mt-4 rounded-full bg-red-600 px-6 py-2 text-white hover:bg-red-700">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink">Volunteer Assignments</h1>
        <p className="mt-2 text-slate-600">Assign available volunteers to active incidents and monitor deployment.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-panel lg:col-span-1">
          <h2 className="mb-4 text-xl font-bold text-ink">Assign Volunteer</h2>
          <form onSubmit={handleAssign} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700">Available Volunteer</label>
              <select 
                value={selectedVolunteer}
                onChange={e => setSelectedVolunteer(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm"
                required
              >
                <option value="">Select Volunteer...</option>
                {availableVolunteers.map(v => (
                  <option key={v.volunteer_id} value={v.volunteer_id}>{v.volunteer_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Incident</label>
              <select 
                value={selectedIncident}
                onChange={e => setSelectedIncident(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm"
                required
              >
                <option value="">Select Incident...</option>
                {incidents.map(i => (
                  <option key={i.id} value={i.id}>{i.title} ({i.district})</option>
                ))}
              </select>
            </div>
            <button 
              type="submit" 
              disabled={assigning || !selectedIncident || !selectedVolunteer}
              className="w-full rounded-full bg-sea px-4 py-2.5 text-sm font-bold text-white transition hover:bg-sea/90 disabled:opacity-50"
            >
              {assigning ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </form>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-panel lg:col-span-2">
          <h2 className="mb-4 text-xl font-bold text-ink">Incident Statistics (SQL Aggregate)</h2>
          {aggregateCounts.length === 0 ? (
            <p className="text-sm text-slate-500">No incident statistics available.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {aggregateCounts.slice(0, 6).map(count => (
                <div key={count.incident_id} className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                  <p className="truncate text-sm font-bold text-ink">{count.title}</p>
                  <p className="mt-1 text-2xl font-black text-sea">{count.assignment_count}</p>
                  <p className="text-xs uppercase tracking-wider text-slate-500">Volunteers</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-panel">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h2 className="text-xl font-bold text-ink">Active Assignments</h2>
          <div className="flex gap-4">
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {filteredAssignments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
            <p className="text-slate-500">No assignments match your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-400">
                <tr>
                  <th className="pb-3 pr-4 font-semibold">Volunteer</th>
                  <th className="pb-3 pr-4 font-semibold">Incident</th>
                  <th className="pb-3 pr-4 font-semibold">District</th>
                  <th className="pb-3 pr-4 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Date Assigned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAssignments.map(assignment => (
                  <tr key={assignment.id}>
                    <td className="py-4 pr-4 font-medium text-ink">{assignment.volunteer_name}</td>
                    <td className="py-4 pr-4">{assignment.incident_title}</td>
                    <td className="py-4 pr-4">{assignment.incident_district}</td>
                    <td className="py-4 pr-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold capitalize text-slate-700">
                        {assignment.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 text-slate-500">
                      {new Date(assignment.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
