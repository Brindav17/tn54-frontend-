export default function AuthField({ label, type, value, onChange, ...rest }) {
  return (
    <label className="block">
      <span className="text-xs font-mono text-muted mb-1 block">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-panel px-3 py-2.5 text-sm text-paper outline-none focus:border-cyan/50 transition"
        {...rest}
      />
    </label>
  );
}
