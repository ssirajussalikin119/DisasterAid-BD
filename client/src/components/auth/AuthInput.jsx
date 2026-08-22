import { forwardRef, useId } from 'react';

const AuthInput = forwardRef(function AuthInput({ label, error, icon, trailing, className = '', ...inputProps }, ref) {
  const generatedId = useId();
  const id = inputProps.id ?? generatedId;
  const describedBy = error ? `${id}-error` : undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-ink">
        {label}
      </label>
      <div className="relative">
        {icon ? <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">{icon}</span> : null}
        <input
          id={id}
          ref={ref}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          {...inputProps}
          className={`w-full rounded-2xl border bg-white py-3.5 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 ${icon ? 'pl-11' : 'px-4'} ${trailing ? 'pr-12' : 'pr-4'} ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-sky-500 focus:ring-sky-100'}`}
        />
        {trailing ? <div className="absolute inset-y-0 right-3 flex items-center">{trailing}</div> : null}
      </div>
      {error ? <p id={describedBy} className="mt-2 text-sm font-medium text-red-600">{error.message ?? error}</p> : null}
    </div>
  );
});

export default AuthInput;
