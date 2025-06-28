export default function FilterBar({ capabilities, selected, onChange, sortNew, onToggleSort }) {
  const allCaps = Array.from(new Set(capabilities.flat())).filter(Boolean);
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <label className="font-medium">Filter by:</label>
        <select value={selected} onChange={(e) => onChange(e.target.value)} className="border px-2 py-1 rounded">
          <option value="">All</option>
          {allCaps.map((cap) => (<option key={cap} value={cap}>{cap}</option>))}
        </select>
      </div>
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input type="checkbox" checked={sortNew} onChange={onToggleSort} />
        Newest First
      </label>
    </div>
  );
}
