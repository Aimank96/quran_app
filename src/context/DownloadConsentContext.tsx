import { createContext, useContext, useState, type ReactNode } from 'react';

interface DownloadConsentContextValue {
  hasConsented: (surahNumber: number) => boolean;
  requestConsent: (surahNumber: number, options?: { showSurahOption?: boolean }) => Promise<{
    accepted: boolean;
    downloadEntireSurah: boolean;
  }>;
  showDonationModal: (onClose?: () => void) => void;
}

const DownloadConsentContext = createContext<DownloadConsentContextValue | null>(null);

const CONSENT_PREFIX = 'quran-audio-consent-surah-';

export function DownloadConsentProvider({ children }: { children: ReactNode }) {
  const [showModal, setShowModal] = useState(false);
  const [showSurahOption, setShowSurahOption] = useState(false);
  const [showDonation, setShowDonation] = useState(false);
  const [donationOnClose, setDonationOnClose] = useState<(() => void) | null>(null);
  const [resolvePromise, setResolvePromise] = useState<((value: { accepted: boolean; downloadEntireSurah: boolean }) => void) | null>(null);
  const [currentSurah, setCurrentSurah] = useState<number | null>(null);

  function hasConsented(surahNumber: number): boolean {
    return localStorage.getItem(`${CONSENT_PREFIX}${surahNumber}`) === 'true';
  }

  function requestConsent(surahNumber: number, options?: { showSurahOption?: boolean }): Promise<{
    accepted: boolean;
    downloadEntireSurah: boolean;
  }> {
    console.log('[DownloadConsent] requestConsent called for surah:', surahNumber, 'hasConsented:', hasConsented(surahNumber));
    
    // If in surah mode (no option shown), always show donation modal
    const isSurahMode = !(options?.showSurahOption ?? false);
    
    if (hasConsented(surahNumber) && !isSurahMode) {
      return Promise.resolve({ accepted: true, downloadEntireSurah: false });
    }

    return new Promise((resolve) => {
      console.log('[DownloadConsent] Showing modal for surah:', surahNumber);
      setCurrentSurah(surahNumber);
      setShowModal(true);
      setShowSurahOption(options?.showSurahOption ?? false);
      setResolvePromise(() => resolve);
    });
  }

  function handleAccept(downloadEntireSurah: boolean) {
    if (currentSurah !== null) {
      localStorage.setItem(`${CONSENT_PREFIX}${currentSurah}`, 'true');
    }
    setShowModal(false);
    
    // Show donation modal every time user chooses "entire surah" OR when in surah play mode
    // (downloadEntireSurah will be false in surah mode since no option is shown, but we still want donation)
    if (downloadEntireSurah || !showSurahOption) {
      setShowDonation(true);
    }
    
    if (resolvePromise) {
      resolvePromise({ accepted: true, downloadEntireSurah: downloadEntireSurah || !showSurahOption });
    }
  }

  function handleDecline() {
    setShowModal(false);
    if (resolvePromise) {
      resolvePromise({ accepted: false, downloadEntireSurah: false });
    }
  }

  function showDonationModal(onClose?: () => void) {
    setDonationOnClose(() => onClose);
    setShowDonation(true);
  }

  return (
    <DownloadConsentContext.Provider value={{ hasConsented, requestConsent, showDonationModal }}>
      {children}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Muat Turun Audio Quran
            </h2>
            
            <div className="space-y-3 mb-6 text-gray-700">
              <p>
                Untuk menjimatkan data dan membolehkan main balik luar talian, 
                audio akan dimuat turun dan disimpan di peranti anda.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800 font-semibold">
                  Kelebihan:
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>✓ Jimat bandwidth internet</li>
                  <li>✓ Main balik lebih pantas</li>
                  <li>✓ Boleh dengar luar talian</li>
                  <li>✓ Tiada caj data berulang</li>
                </ul>
              </div>

              <p className="text-sm text-gray-600">
                Anggaran saiz: <strong>~50-80 KB</strong> setiap ayat
              </p>

              {showSurahOption && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800 font-semibold mb-2">
                    Pilih pilihan download:
                  </p>
                  <label className="flex items-start gap-2 cursor-pointer mb-2">
                    <input
                      type="radio"
                      name="download-option"
                      value="ayah"
                      defaultChecked
                      className="mt-1"
                    />
                    <div>
                      <span className="font-medium text-green-900">Ayat ini sahaja</span>
                      <p className="text-xs text-green-700">Download 1 ayat (~60 KB)</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="download-option"
                      value="surah"
                      className="mt-1"
                    />
                    <div>
                      <span className="font-medium text-green-900">Seluruh surah</span>
                      <p className="text-xs text-green-700">Download semua ayat dalam surah ini</p>
                    </div>
                  </label>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDecline}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              {showSurahOption ? (
                <button
                  onClick={() => {
                    const selected = document.querySelector<HTMLInputElement>('input[name="download-option"]:checked');
                    const downloadEntireSurah = selected?.value === 'surah';
                    handleAccept(downloadEntireSurah);
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Muat Turun
                </button>
              ) : (
                <button
                  onClick={() => handleAccept(false)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Muat Turun
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {showDonation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl max-h-[90vh] flex flex-col">
            <div className="overflow-y-auto p-6 flex-1">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-3">
                <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Sokong Projek Ini
              </h2>
              <p className="text-gray-600 text-sm">
                Bantu kami terus menyediakan perkhidmatan ini
              </p>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-orange-800">
                <strong>Assalamualaikum,</strong>
              </p>
              <p className="text-sm text-orange-700 mt-2">
                Projek ini memerlukan kos penyelenggaraan server dan bandwidth yang agak tinggi. 
                Setiap kali audio dimuat turun, ia menggunakan bandwidth dari Firebase Storage.
              </p>
              <p className="text-sm text-orange-700 mt-2">
                Jika anda mampu dan sudi, silakan menderma untuk membantu kami terus menyediakan 
                perkhidmatan ini secara percuma.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-center text-sm font-semibold text-gray-700 mb-3">
                Imbas QR untuk menderma
              </p>
              <div className="flex justify-center">
                <img
                  src="/qr-donation.png"
                  alt="QR Code Derma"
                  className="w-48 h-48 sm:w-64 sm:h-64 object-contain"
                />
              </div>
              <p className="text-center text-xs text-gray-500 mt-3">
                Maybank - Muhammad Aiman Bin Kamal
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-blue-700 text-center">
                <strong>Jazakumullah khairan kathiran</strong> atas sumbangan anda.
                Semoga menjadi asbab keberkatan dunia dan akhirat.
              </p>
            </div>
            </div>

            <div className="p-6 pt-0">
            <button
              onClick={() => {
                setShowDonation(false);
                if (donationOnClose) {
                  donationOnClose();
                }
              }}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Tutup
            </button>
            </div>
          </div>
        </div>
      )}
    </DownloadConsentContext.Provider>
  );
}

export function useDownloadConsent() {
  const ctx = useContext(DownloadConsentContext);
  if (!ctx) throw new Error('useDownloadConsent must be used inside <DownloadConsentProvider>');
  return ctx;
}
