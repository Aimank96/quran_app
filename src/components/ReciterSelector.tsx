import { useAudio } from '../context/AudioContext';
import { RECITERS, type Reciter } from '../types/audio';

export function ReciterSelector() {
  const { reciter, setReciter } = useAudio();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const found = RECITERS.find((r) => r.id === e.target.value);
    if (found) setReciter(found);
  }

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-stone-400 shrink-0">Qari:</label>
      <select
        value={reciter.id}
        onChange={handleChange}
        className="rounded-lg border border-stone-200 bg-white px-2 py-1 text-xs text-gray-700 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200 max-w-[180px]"
      >
        {RECITERS.map((r: Reciter) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </select>
    </div>
  );
}
