export default function Controls({ settings, setSettings }) {

  function update(key, value) {
    setSettings(prev => ({
      ...prev,
      [key]: parseFloat(value)
    }));
  }

  return (
    <div className="sidebar">
      <h3>Controls</h3>

      {Object.keys(settings).map(key => (
        <div key={key}>
          <label>{key}</label>
          <input
            type="range"
            min="0"
            max="50"
            step="0.1"
            value={settings[key]}
            onChange={(e) => update(key, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}