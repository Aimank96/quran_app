import { Info, Download, Smartphone } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function OfflineInfoBanner() {
  const [cacheSize, setCacheSize] = useState<string | null>(null);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    if ('caches' in window) {
      caches.storage?.estimate?.().then(({ usage, quota }) => {
        if (usage && quota) {
          const sizeGB = (usage / 1024 / 1024 / 1024).toFixed(1);
          const quotaGB = (quota / 1024 / 1024 / 1024).toFixed(1);
          setCacheSize(`${sizeGB}GB of ${quotaGB}GB`);
        }
      });
    }
  }, []);

  if (!showBanner) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex items-start gap-3">
          <Download className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 text-sm">
              📱 Works Offline - Saves Bandwidth
            </h3>
            <p className="text-xs text-blue-800 mt-1">
              Your device is automatically downloading and caching Quran data. After first download, you can read completely offline on your computer, phone, or tablet without internet.
              {cacheSize && <span> Currently cached: {cacheSize}</span>}
            </p>
            <p className="text-xs text-blue-700 mt-2 flex items-center gap-1">
              <Smartphone className="w-3 h-3" />
              Works on: Desktop browsers, iOS Safari, Chrome Android, and can be installed as an app!
            </p>
          </div>
          <button
            onClick={() => setShowBanner(false)}
            className="flex-shrink-0 text-blue-600 hover:text-blue-700 p-1"
            aria-label="Close"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
