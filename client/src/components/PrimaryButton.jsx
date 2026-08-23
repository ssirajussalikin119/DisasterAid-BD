export default function PrimaryButton({ children, loading = false, className = '', type = 'button', disabled = false, ...props }) {
  return (
    <button
      type={type}
      disabled={loading || disabled}
      className={`inline-flex w-full items-center justify-center rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {loading ? 'Please wait...' : children}
    </button>
  );
}
