export function ChartLoading({ label = 'Loading analytics...' }) {
  return (
    <div className="px-6 py-12 text-center">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-ink" />
      <p className="mt-3 text-sm text-slate-600">{label}</p>
    </div>
  );
}

export function ChartError({ message, onRetry }) {
  return (
    <div className="px-6 py-8">
      <div role="alert" className="rounded-xl border border-ember/30 bg-ember/10 px-4 py-3 text-sm font-semibold text-ember">
        {message}
      </div>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-lg bg-ember px-4 py-2 text-sm font-semibold text-white hover:bg-ember/90"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}

export function ChartEmpty({ title, description }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-mist px-5 py-10 text-center">
      <h3 className="font-display text-base font-bold text-ink">{title}</h3>
      <p className="mt-1.5 text-sm text-slate-600">{description}</p>
    </div>
  );
}
