import { useEffect, useState } from 'react';
import { X, Heart } from 'lucide-react';

export default function DonationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Show prompt after 2nd visit or when caches are large
    const visitCount = localStorage.getItem('quran-visits') || '0';
    const visits = parseInt(visitCount) + 1;
    localStorage.setItem('quran-visits', visits.toString());

    // Check if service worker cached data (after ~50MB cached)
    if ('caches' in window && visits > 1) {
      caches.storage?.estimate?.().then(({ usage }) => {
        if (usage && usage > 50 * 1024 * 1024) {
          // More than 50MB cached
          if (!dismissed) {
            setShowPrompt(true);
          }
        }
      });
    }
  }, [dismissed]);

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <Heart className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-amber-900 text-sm">Help us save bandwidth!</h3>
            <p className="text-xs text-amber-800 mt-1">
              Your device is caching Quran data offline. This saves us server costs. If you find value in this app, consider donating to support our mission.
            </p>
            <div className="flex gap-2 mt-3">
              <a
                href="#donate"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium transition-colors"
              >
                <Heart className="w-3 h-3" />
                Donate
              </a>
              <button
                onClick={() => setShowPrompt(false)}
                className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded text-xs font-medium transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            setShowPrompt(false);
            setDismissed(true);
          }}
          className="flex-shrink-0 p-1 hover:bg-amber-100 rounded transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4 text-amber-600" />
        </button>
      </div>
    </div>
  );
}
