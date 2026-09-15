"use client";

export function ColorPicker({
  name,
  label,
  value,
  onChange,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-slate-700">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 cursor-pointer rounded-lg border border-white/70 bg-transparent"
        />
        <input
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-clay flex-1 rounded-xl px-3 py-2 font-mono text-sm uppercase"
        />
      </div>
    </label>
  );
}
