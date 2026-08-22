export default function FormField({ label, error, className = '', as = 'input', ...props }) {
  const Component = as;

  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-semibold text-ink">{label}</span>
      <Component
        {...props}
        className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-sea focus:ring-4 focus:ring-sea/10 ${props.disabled ? 'opacity-70' : ''}`}
      />
      {error ? <span className="mt-2 block text-sm text-red-600">{error}</span> : null}
    </label>
  );
}