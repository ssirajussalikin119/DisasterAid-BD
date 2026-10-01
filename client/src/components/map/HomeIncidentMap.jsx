import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ReportLocationPicker from './ReportLocationPicker';
import { getMapIncidents } from '../../services/incidentService';

/**
 * Homepage map: renders the SAME shared ReportLocationPicker component used
 * by /map and /incidents/new (form chrome hidden, pin editing disabled),
 * adapted to the homepage card layout. No map business logic lives here.
 */
export default function HomeIncidentMap() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const load = async (showLoading = false) => {
      if (showLoading && alive) setLoading(true);
      try {
        const liveIncidents = await getMapIncidents();
        if (alive) setCount(liveIncidents.length);
      } catch {
        if (alive) setCount(0);
      } finally {
        if (alive) setLoading(false);
      }
    };

    load(true);

    const interval = setInterval(() => load(false), 15000);
    const handleUpdateEvent = () => load(false);

    window.addEventListener('disasteraid:report-created', handleUpdateEvent);
    window.addEventListener('disasteraid:report-updated', handleUpdateEvent);

    return () => {
      alive = false;
      clearInterval(interval);
      window.removeEventListener('disasteraid:report-created', handleUpdateEvent);
      window.removeEventListener('disasteraid:report-updated', handleUpdateEvent);
    };
  }, []);

  return (
    <section className="relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-3 py-2.5 sm:px-4">
        <p className="text-xs font-extrabold text-slate-800 sm:text-sm">
          Live incident reports
          <span className="ml-2 rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-extrabold text-sky-700">
            {count} visible
          </span>
        </p>
        <Link
          to="/map"
          className="text-xs font-extrabold text-sky-600 transition hover:text-sky-700 sm:text-sm"
        >
          View Full Map →
        </Link>
      </div>

      <div className="relative h-[440px] w-full sm:h-[520px]">
        {loading ? (
          <div className="absolute inset-0 z-[850] grid place-items-center bg-white/60 backdrop-blur-sm">
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-lg">
              Loading interactive map…
            </div>
          </div>
        ) : null}

        <ReportLocationPicker
          showControls={false}
          interactive={false}
          fillHeight
          mapClassName="h-full w-full"
        />
      </div>
    </section>
  );
}
