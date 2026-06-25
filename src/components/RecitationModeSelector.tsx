import { useState } from 'react';
import { RECITATION_MODE_LABELS, type RecitationMode } from '../types/audio';

interface RecitationModeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (mode: RecitationMode) => void;
}

const MODE_DESCRIPTIONS: Record<RecitationMode, string> = {
  'arabic': 'Bacaan Arab oleh qari',
  'malay': 'Terjemahan Malay oleh Osman',
  'arabic-then-malay': 'Arab dahulu, kemudian Malay untuk setiap ayat',
};

export function RecitationModeSelector({ isOpen, onClose, onSelect }: RecitationModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<RecitationMode>('arabic');

  if (!isOpen) return null;

  function handleStart() {
    onSelect(selectedMode);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          Pilih Mod Bacaan
        </h2>

        <div className="space-y-3 mb-6">
          {(Object.keys(RECITATION_MODE_LABELS) as RecitationMode[]).map((mode) => (
            <label
              key={mode}
              className="flex items-start gap-3 cursor-pointer rounded-lg border border-stone-200 p-3 transition hover:border-emerald-300 hover:bg-emerald-50"
            >
              <input
                type="radio"
                name="recitation-mode"
                value={mode}
                checked={selectedMode === mode}
                onChange={() => setSelectedMode(mode)}
                className="mt-0.5 accent-emerald-600"
              />
              <div>
                <span className="font-medium text-gray-900">
                  {RECITATION_MODE_LABELS[mode]}
                </span>
                <p className="text-xs text-gray-500 mt-0.5">
                  {MODE_DESCRIPTIONS[mode]}
                </p>
              </div>
            </label>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleStart}
            className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            Mula
          </button>
        </div>
      </div>
    </div>
  );
}
