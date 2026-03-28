export default function Sidebar({ sketches, onSelect }) {
  return (
    <div className="sidebar">
      <h2>Sketches</h2>
      <ul>
        {sketches.map((s) => (
          <li key={s.name} onClick={() => onSelect(s)}>
            {s.name}
          </li>
        ))}
      </ul>
    </div>
  );
}