import { useEffect, useMemo, useState } from 'react';
import Container from '../components/common/Container';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import FormField from '../components/ui/FormField';
import PrimaryButton from '../components/ui/PrimaryButton';
import {
  createReliefCenter,
  createReliefDistribution,
  updateReliefCenter,
  deleteReliefCenter,
  getReliefCenters,
  getReliefDistributions,
  getReliefStatistics,
} from '../services/reliefService';

const emptyCenter = { name: '', address: '', capacity: '', contact_number: '', status: 'active', latitude: '', longitude: '', available_resources: '' };
const emptyDistribution = { relief_center_id: '', relief_type: '', quantity: '', distribution_date: '', description: '', recipient: '', report_reference: '', distributed_by: '', distributed_at: '' };

function niceDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('en-BD', { dateStyle: 'medium', timeStyle: value.includes?.('T') ? 'short' : undefined });
}

export default function ReliefManagementPage() {
  const [centers, setCenters] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [centerForm, setCenterForm] = useState(emptyCenter);
  const [distributionForm, setDistributionForm] = useState(emptyDistribution);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [editingCenterId, setEditingCenterId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [centerRows, distributionRows, stats] = await Promise.all([getReliefCenters(), getReliefDistributions(), getReliefStatistics()]);
      setCenters(centerRows);
      setDistributions(distributionRows);
      setStatistics(stats);
      setError('');
    } catch (exception) {
      setError(exception?.response?.data?.message ?? 'Could not load relief data. Make sure the Laravel API is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const activeCenters = useMemo(() => centers.filter((center) => String(center.status).toLowerCase() === 'active').length, [centers]);
  const totalDistributed = useMemo(() => distributions.reduce((sum, item) => sum + Number(item.quantity || 0), 0), [distributions]);

  const submitCenter = async (event) => {
    event.preventDefault();
    setSaving('center'); setMessage(''); setError('');
    try {
      const payload = {
        ...centerForm,
        capacity: centerForm.capacity === '' ? null : Number(centerForm.capacity),
        latitude: centerForm.latitude === '' ? null : Number(centerForm.latitude),
        longitude: centerForm.longitude === '' ? null : Number(centerForm.longitude),
      };
      if (editingCenterId) {
        const updated = await updateReliefCenter(editingCenterId, payload);
        setCenters((current) => current.map((item) => item.id === editingCenterId ? updated : item));
        setMessage('Relief center updated successfully.');
      } else {
        const created = await createReliefCenter(payload);
        setCenters((current) => [...current, created]);
        setDistributionForm((current) => ({ ...current, relief_center_id: String(created.id) }));
        setMessage('Relief center added to the database successfully.');
      }
      setEditingCenterId(null);
      setCenterForm(emptyCenter);
    } catch (exception) {
      setError(exception?.response?.data?.message ?? 'Unable to add relief center.');
    } finally { setSaving(''); }
  };


  const editCenter = (center) => {
    setEditingCenterId(center.id);
    setCenterForm({
      name: center.name ?? '', address: center.address ?? '', capacity: center.capacity ?? '',
      contact_number: center.contact_number ?? '', status: center.status ?? 'active',
      latitude: center.latitude ?? '', longitude: center.longitude ?? '',
      available_resources: center.available_resources ?? '',
    });
    window.scrollTo({ top: 420, behavior: 'smooth' });
  };

  const removeCenter = async (center) => {
    if (!window.confirm(`Delete ${center.name}? Its linked distribution records may also be removed.`)) return;
    try {
      await deleteReliefCenter(center.id);
      setCenters((current) => current.filter((item) => item.id !== center.id));
      setDistributions((current) => current.filter((item) => String(item.relief_center_id) !== String(center.id)));
      setMessage('Relief center deleted successfully.');
    } catch (exception) {
      setError(exception?.response?.data?.message ?? 'Unable to delete relief center.');
    }
  };

  const submitDistribution = async (event) => {
    event.preventDefault();
    setSaving('distribution'); setMessage(''); setError('');
    try {
      const created = await createReliefDistribution({
        ...distributionForm,
        relief_center_id: Number(distributionForm.relief_center_id),
        quantity: Number(distributionForm.quantity),
        distributed_by: distributionForm.distributed_by === '' ? null : Number(distributionForm.distributed_by),
        distributed_at: distributionForm.distributed_at || null,
      });
      const center = centers.find((item) => String(item.id) === String(created.relief_center_id));
      setDistributions((current) => [{ ...created, relief_center: created.relief_center ?? center }, ...current]);
      setDistributionForm(emptyDistribution);
      setMessage('Distribution record saved successfully.');
    } catch (exception) {
      setError(exception?.response?.data?.message ?? 'Unable to save distribution record.');
    } finally { setSaving(''); }
  };

  return (
    <div className="min-h-screen bg-mist text-ink">
      <Navbar />
      <main>
        <section className="bg-white py-14 sm:py-16">
          <Container>
            <p className="font-display text-lg font-bold text-sky-600">Relief Operations</p>
            <h1 className="mt-3 max-w-4xl font-display text-4xl font-bold tracking-tight sm:text-5xl">Relief centers and distribution tracking</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-700">Manage relief centers, track available resources, and coordinate relief distribution across affected areas.</p>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[['Relief centers', centers.length], ['Active centers', activeCenters], ['Units distributed', totalDistributed]].map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><p className="text-sm font-semibold text-slate-600">{label}</p><p className="mt-2 font-display text-3xl font-bold">{value}</p></div>)}
            </div>
          </Container>
        </section>

        <section className="py-12">
          <Container>
            {message ? <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</div> : null}
            {error ? <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div> : null}
            <div className="grid gap-8 xl:grid-cols-2">
              <form onSubmit={submitCenter} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="font-display text-2xl font-bold">{editingCenterId ? 'Edit relief center' : 'Add relief center'}</h2>
                <p className="mt-2 text-sm text-slate-600">Creates a row through POST /api/relief-centers.</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <FormField label="Center name" value={centerForm.name} onChange={(e) => setCenterForm({ ...centerForm, name: e.target.value })} required />
                  <FormField label="Address" value={centerForm.address} onChange={(e) => setCenterForm({ ...centerForm, address: e.target.value })} required />
                  <FormField label="Capacity" type="number" min="0" value={centerForm.capacity} onChange={(e) => setCenterForm({ ...centerForm, capacity: e.target.value })} />
                  <FormField label="Contact number" value={centerForm.contact_number} onChange={(e) => setCenterForm({ ...centerForm, contact_number: e.target.value })} />
                  <FormField label="Latitude" type="number" step="any" value={centerForm.latitude} onChange={(e) => setCenterForm({ ...centerForm, latitude: e.target.value })} />
                  <FormField label="Longitude" type="number" step="any" value={centerForm.longitude} onChange={(e) => setCenterForm({ ...centerForm, longitude: e.target.value })} />
                  <FormField as="select" label="Status" value={centerForm.status} onChange={(e) => setCenterForm({ ...centerForm, status: e.target.value })}><option value="active">Active</option><option value="inactive">Inactive</option><option value="full">Full</option></FormField>
                  <FormField label="Available resources" value={centerForm.available_resources} onChange={(e) => setCenterForm({ ...centerForm, available_resources: e.target.value })} placeholder="Rice, water, medicine" />
                </div>
                <PrimaryButton type="submit" className="mt-6" disabled={saving === 'center'}>{saving === 'center' ? 'Saving...' : editingCenterId ? 'Update relief center' : 'Add relief center'}</PrimaryButton>{editingCenterId ? <button type="button" onClick={() => { setEditingCenterId(null); setCenterForm(emptyCenter); }} className="ml-3 rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold">Cancel</button> : null}
              </form>

              <form onSubmit={submitDistribution} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="font-display text-2xl font-bold">Record distribution</h2>
                <p className="mt-2 text-sm text-slate-600">Links a distribution record to a relief center.</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <FormField as="select" label="Relief center" value={distributionForm.relief_center_id} onChange={(e) => setDistributionForm({ ...distributionForm, relief_center_id: e.target.value })} required><option value="">Select center</option>{centers.map((center) => <option key={center.id} value={center.id}>{center.name}</option>)}</FormField>
                  <FormField label="Relief item/type" value={distributionForm.relief_type} onChange={(e) => setDistributionForm({ ...distributionForm, relief_type: e.target.value })} placeholder="Food package" required />
                  <FormField label="Quantity" type="number" min="1" value={distributionForm.quantity} onChange={(e) => setDistributionForm({ ...distributionForm, quantity: e.target.value })} required />
                  <FormField label="Distribution date" type="date" value={distributionForm.distribution_date} onChange={(e) => setDistributionForm({ ...distributionForm, distribution_date: e.target.value })} required />
                  <FormField label="Recipient / area" value={distributionForm.recipient} onChange={(e) => setDistributionForm({ ...distributionForm, recipient: e.target.value })} placeholder="Flood affected families" />
                  <FormField label="Report reference" value={distributionForm.report_reference} onChange={(e) => setDistributionForm({ ...distributionForm, report_reference: e.target.value })} placeholder="INC-2026-001" />
                  <FormField label="Distributed by (user ID)" type="number" min="1" value={distributionForm.distributed_by} onChange={(e) => setDistributionForm({ ...distributionForm, distributed_by: e.target.value })} />
                  <FormField label="Distributed at" type="datetime-local" value={distributionForm.distributed_at} onChange={(e) => setDistributionForm({ ...distributionForm, distributed_at: e.target.value })} />
                  <FormField as="textarea" className="sm:col-span-2" rows="3" label="Description" value={distributionForm.description} onChange={(e) => setDistributionForm({ ...distributionForm, description: e.target.value })} />
                </div>
                <PrimaryButton type="submit" className="mt-6" disabled={saving === 'distribution'}>{saving === 'distribution' ? 'Saving...' : 'Save distribution'}</PrimaryButton>
              </form>
            </div>
          </Container>
        </section>

        {statistics && (
          <section className="bg-slate-50 py-12">
            <Container>
              <h2 className="font-display text-3xl font-bold">Relief Statistics</h2>
              <p className="mt-2 text-sm text-slate-600">Calculated via RAW SQL queries.</p>
              
              <div className="mt-8 grid gap-8 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="font-display text-xl font-bold mb-4">Total Distributions (COUNT & SUM)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-600">Distributions</p>
                      <p className="font-display text-2xl font-bold">{statistics.totals?.total_distributions || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-600">Total Quantity</p>
                      <p className="font-display text-2xl font-bold">{statistics.totals?.total_quantity || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="font-display text-xl font-bold mb-4">High Volume Centers (HAVING)</h3>
                  <p className="mb-4 text-xs text-slate-500">Centers with total quantity &gt; 100</p>
                  <ul className="divide-y divide-slate-100">
                    {statistics.high_volume_centers?.length > 0 ? (
                      statistics.high_volume_centers.map((c, i) => (
                        <li key={i} className="flex justify-between py-2">
                          <span className="font-semibold">{c.center_name}</span>
                          <span>{c.total_quantity} qty</span>
                        </li>
                      ))
                    ) : (
                      <li className="py-2 text-slate-500">No high volume centers yet.</li>
                    )}
                  </ul>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="font-display text-xl font-bold mb-4">Quantity Per Center (GROUP BY)</h3>
                  <ul className="divide-y divide-slate-100">
                    {statistics.quantity_per_center?.map((c, i) => (
                      <li key={i} className="flex justify-between py-2">
                        <span className="font-semibold">{c.center_name}</span>
                        <span>{c.total_quantity} qty</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="font-display text-xl font-bold mb-4">Distributions Per Center (LEFT JOIN + COUNT)</h3>
                  <p className="mb-4 text-xs text-slate-500">Includes centers with 0 distributions</p>
                  <ul className="divide-y divide-slate-100">
                    {statistics.center_distribution_counts?.map((c, i) => (
                      <li key={i} className="flex justify-between py-2">
                        <span className="font-semibold">{c.center_name}</span>
                        <span>{c.total_distributions} events</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Container>
          </section>
        )}

        <section className="bg-white py-12">
          <Container>
            <h2 className="font-display text-3xl font-bold">Relief centers</h2>
            {loading ? <p className="mt-6 text-slate-600">Loading database records...</p> : <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{centers.map((center) => <article key={center.id} className="rounded-2xl border border-slate-200 p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><h3 className="font-display text-xl font-bold">{center.name}</h3><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase text-emerald-700">{center.status || 'active'}</span></div><p className="mt-3 text-sm text-slate-600">{center.address}</p><div className="mt-5 space-y-2 text-sm"><p><b>Capacity:</b> {center.capacity ?? '—'}</p><p><b>Contact:</b> {center.contact_number || '—'}</p><p><b>Resources:</b> {center.available_resources || 'Not recorded'}</p>{center.latitude != null && center.longitude != null ? <p><b>Coordinates:</b> {center.latitude}, {center.longitude}</p> : null}</div><div className="mt-5 flex gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={() => editCenter(center)} className="rounded-full border border-slate-300 px-4 py-2 text-xs font-bold hover:bg-slate-50">Edit</button><button type="button" onClick={() => removeCenter(center)} className="rounded-full border border-red-200 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50">Delete</button></div></article>)}</div>}
          </Container>
        </section>

        <section className="py-12">
          <Container>
            <h2 className="font-display text-3xl font-bold">Distribution history</h2>
            <div className="mt-7 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr>{['Center', 'Item', 'Quantity', 'Recipient', 'Reference', 'Date'].map((label) => <th key={label} className="px-5 py-4 font-semibold">{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{distributions.map((item) => <tr key={item.id}><td className="px-5 py-4 font-semibold">{item.relief_center?.name ?? centers.find((c) => c.id === item.relief_center_id)?.name ?? `Center #${item.relief_center_id}`}</td><td className="px-5 py-4">{item.relief_type}</td><td className="px-5 py-4">{item.quantity}</td><td className="px-5 py-4">{item.recipient || '—'}</td><td className="px-5 py-4">{item.report_reference || '—'}</td><td className="px-5 py-4">{niceDate(item.distributed_at || item.distribution_date)}</td></tr>)}{!loading && distributions.length === 0 ? <tr><td colSpan="6" className="px-5 py-10 text-center text-slate-500">No distribution records yet.</td></tr> : null}</tbody></table>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
