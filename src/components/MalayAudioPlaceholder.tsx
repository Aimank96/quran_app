import { useState } from 'react';

export function MalayAudioPlaceholder() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowModal(true)}
        className="flex h-7 items-center gap-1 rounded-full px-2 text-stone-300 transition hover:bg-stone-100 hover:text-stone-400"
        aria-label="Audio Bahasa Melayu"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M12 6v12m0 0l-3-3m3 3l3-3M9 10l-1.5-1.5M6.343 6.343A8 8 0 1117.657 17.657" />
        </svg>
        <span className="text-xs font-medium">BM</span>
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={() => setShowModal(false)}
        >
          <div
            className="mx-4 max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 mx-auto">
              <svg className="h-6 w-6 text-amber-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-center text-base font-bold text-gray-900 mb-2">Akan Datang</h3>
            <p className="text-center text-sm text-gray-600">
              Bacaan terjemahan Bahasa Melayu sedang dalam pembangunan dan akan tersedia tidak lama lagi.
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 w-full rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
            >
              Faham
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
