import type { ReactNode } from 'react';

interface DonationModalProps {
  show: boolean;
  onClose: () => void;
}

export function DonationModal({ show, onClose }: DonationModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
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
              className="w-64 h-64 object-contain"
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

        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}

interface DonationConsentProps {
  children: ReactNode;
}

export function DonationConsent({ children }: DonationConsentProps) {
  return <>{children}</>;
}
