import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sprout, X, ShieldCheck, MapPin, Cpu, HeartHandshake } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const { t, i18n } = useTranslation();
  const isKn = i18n.language.startsWith('kn');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-earth-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-agrimitra-title"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-earth-100 flex items-center justify-between bg-agri-50/60">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-forest-700 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col justify-center min-w-max">
              <div className="flex items-center gap-1.5 leading-snug">
                <span className="font-extrabold text-base sm:text-lg text-forest-950 tracking-normal whitespace-nowrap">
                  AgriMitra
                </span>
                <span className="text-forest-700/50 font-light select-none text-sm">|</span>
                <span className="font-bold text-sm sm:text-base text-forest-800 tracking-normal whitespace-nowrap font-kannada">
                  ಕೃಷಿಮಿತ್ರ
                </span>
              </div>
              <p className="text-xs text-earth-600 font-medium whitespace-nowrap leading-relaxed font-kannada">
                {isKn ? 'ಮಂಡ್ಯ ಜಿಲ್ಲಾ ಪ್ರಾಯೋಗಿಕ ಯೋಜನೆ' : 'Mandya District Pilot Project'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-earth-400 hover:text-earth-700 hover:bg-earth-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs sm:text-sm text-earth-700 leading-relaxed">
          <div className="p-3.5 rounded-2xl bg-agri-50 border border-agri-200">
            <h3 className="font-bold text-agri-950 flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-agri-700" />
              <span>{isKn ? 'ಮಂಡ್ಯ ಜಿಲ್ಲಾ ಪ್ರಾಯೋಗಿಕ ಉದ್ದೇಶ' : 'Mandya Pilot Vision'}</span>
            </h3>
            <p className="text-xs text-agri-900">
              {isKn
                ? 'ಕೃಷಿಮಿತ್ರವು ಕಾವೇರಿ ಕಣಿವೆಯ ಸಕ್ಕರೆ ನಗರಿ ಮಂಡ್ಯ ಜಿಲ್ಲೆಯ ರೈತರಿಗಾಗಿ ವಿನ್ಯಾಸಗೊಳಿಸಲಾದ ಬಹುಭಾಷಾ (ಕನ್ನಡ & ಇಂಗ್ಲಿಷ್) ಕೃಷಿ ವೇದಿಕೆಯಾಗಿದೆ. ಇದು ವೈಜ್ಞಾನಿಕ ಬೆಳೆ ಸಲಹೆ, ಸಮುದಾಯ ಚರ್ಚೆ ಹಾಗೂ ನೇರ ಮಾರುಕಟ್ಟೆ ಸಂಪರ್ಕವನ್ನು ಒಂದೇ ಸೂರಿನಡಿ ಒದಗಿಸುತ್ತದೆ.'
                : 'AgriMitra is a multilingual digital public good designed for the Cauvery basin agricultural belt in Mandya district, Karnataka. It integrates scientific crop advisories, village peer discussions, and direct farmer-to-buyer trade.'}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-earth-100 text-agri-700 shrink-0">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-earth-900 text-xs sm:text-sm">
                  {isKn ? 'ಸ್ಮಾರ್ಟ್ ಬೆಳೆ ಸಲಹಾ ಎಂಜಿನ್' : 'Smart Rule-Based Crop Advisory'}
                </h4>
                <p className="text-xs text-earth-600 mt-0.5">
                  {isKn
                    ? 'ಬೆಳೆ ಹಂತ, ಮಣ್ಣಿನ ಬಗೆ ಮತ್ತು ಸ್ಥಳೀಯ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆಯನ್ನು ಪರಿಶೀಲಿಸಿ ನಿಖರ ನೀರಾವರಿ ಹಾಗೂ ಕೀಟ ನಿರ್ವಹಣಾ ಸಲಹೆಗಳನ್ನು ನೀಡುತ್ತದೆ.'
                    : 'Transparent, explainable agronomic recommendations based on crop growth stages, soil type, and live 7-day weather forecasts.'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-earth-100 text-blue-700 shrink-0">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-earth-900 text-xs sm:text-sm">
                  {isKn ? 'ರೈತರ ಸಮುದಾಯ & ಗ್ರಾಮ ಸಂಘಗಳು' : 'Farmer Community & Village Collectives'}
                </h4>
                <p className="text-xs text-earth-600 mt-0.5">
                  {isKn
                    ? 'ಮಂಡ್ಯದ 7 ತಾಲೂಕುಗಳ ರೈತರು ಪರಸ್ಪರ ಕೃಷಿ ಅನುಭವ ಹಂಚಿಕೊಳ್ಳಲು ಹಾಗೂ ಸಾಮೂಹಿಕವಾಗಿ ಬೆಳೆ ಮಾರಾಟ ಮಾಡಲು ವೇದಿಕೆ ಕಲ್ಪಿಸುತ್ತದೆ.'
                    : 'Fosters village-level self-help groups, equipment sharing, and collective harvest pooling for better market leverage.'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-earth-100 text-amber-700 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-earth-900 text-xs sm:text-sm">
                  {isKn ? 'ನ್ಯಾಯಸಮ್ಮತ ನೇರ ವ್ಯಾಪಾರ' : 'Fair Direct-to-Buyer Trade'}
                </h4>
                <p className="text-xs text-earth-600 mt-0.5">
                  {isKn
                    ? 'ಮಧ್ಯವರ್ತಿಗಳ ಹಾವಳಿಯಿಲ್ಲದೆ ಖರೀದಿದಾರರೊಂದಿಗೆ ನೇರ ಸಂಪರ್ಕ ಮತ್ತು ಪಾರದರ್ಶಕ ಬೆಲೆ ನಿಗದಿ.'
                    : 'Removes opaque intermediaries by connecting Mandya growers directly with verified regional buyers and traders.'}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-earth-100 text-[11px] text-earth-500 space-y-1">
            <p>AgriMitra Foundation • Version 1.0.0 (Mandya Pilot)</p>
            <p>Backend: Python FastAPI • Frontend: React + TypeScript + Vite PWA • Database: PostgreSQL</p>
          </div>
        </div>
      </div>
    </div>
  );
}
