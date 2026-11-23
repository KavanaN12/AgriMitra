import React from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, X, Lock, Eye, Database, Check } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  const { t, i18n } = useTranslation();
  const isKn = i18n.language.startsWith('kn');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-earth-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-policy-title"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-earth-100 flex items-center justify-between bg-earth-50/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-agri-700 text-white rounded-2xl">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 id="privacy-policy-title" className="text-base sm:text-lg font-bold text-earth-900">
                {t('help.privacy_title')}
              </h2>
              <p className="text-xs text-earth-500">
                {isKn ? 'ಡೇಟಾ ಸುರಕ್ಷತೆ ಮತ್ತು ರೈತರ ಗೌಪ್ಯತಾ ಹಕ್ಕುಗಳು' : 'Data protection & farmer privacy rights'}
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs sm:text-sm text-earth-700 leading-relaxed">
          <div className="p-3.5 rounded-2xl bg-earth-50 border border-earth-200 space-y-1.5">
            <h4 className="font-bold text-earth-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-agri-700" />
              <span>{isKn ? 'ನಮ್ಮ ಗೌಪ್ಯತಾ ವಾಗ್ದಾನ' : 'Our Privacy Pledge'}</span>
            </h4>
            <p className="text-xs text-earth-600">
              {isKn
                ? 'ಕೃಷಿಮಿತ್ರವು ರೈತರ ಡೇಟಾವನ್ನು ಗೌಪ್ಯವಾಗಿ ಕಾಪಾಡುತ್ತದೆ. ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ ಅಥವಾ ಬೆಳೆ ವಿವರಗಳನ್ನು ಯಾವುದೇ ವಾಣಿಜ್ಯ ಜಾಹೀರಾತುದಾರರಿಗೆ ಮಾರಾಟ ಮಾಡಲಾಗುವುದಿಲ್ಲ.'
                : 'AgriMitra respects farmer data sovereignty. We never sell your personal information, farm acreage, or yield records to commercial ad brokers or predatory lenders.'}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-agri-100 text-agri-700 shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="font-bold text-earth-900 text-xs sm:text-sm">
                  {isKn ? 'ಸ್ಥಳ ಮಾಹಿತಿ ಬಳಕೆ' : 'Location Data Purpose'}
                </p>
                <p className="text-xs text-earth-600 mt-0.5">
                  {isKn
                    ? 'ನಿಮ್ಮ ತಾಲೂಕು, ಹೋಬಳಿ ಮತ್ತು ಗ್ರಾಮವನ್ನು ಕೇವಲ ನಿಖರ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ ಮತ್ತು ಮಂಡ್ಯ ಮಂಡಿ ಬೆಲೆಗಳನ್ನು ನೀಡಲು ಮಾತ್ರ ಬಳಸಲಾಗುತ್ತದೆ.'
                    : 'Your Taluk, Hobli, and Village are used solely to query localized weather forecasts and match regional produce enquiries.'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-agri-100 text-agri-700 shrink-0 mt-0.5">
                <Eye className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="font-bold text-earth-900 text-xs sm:text-sm">
                  {isKn ? 'ಫೋನ್ ಸಂಖ್ಯೆ ಗೋಚರತೆ ನಿಯಂತ್ರಣ' : 'Phone Number Visibility Control'}
                </p>
                <p className="text-xs text-earth-600 mt-0.5">
                  {isKn
                    ? 'ನೀವು ಪ್ರೊಫೈಲ್ ಸೆಟ್ಟಿಂಗ್ಸ್‌ನಲ್ಲಿ ಫೋನ್ ಸಂಖ್ಯೆ ಗೋಚರತೆಯನ್ನು ಆನ್ ಮಾಡಿದಾಗ ಮಾತ್ರ ದೃಢೀಕೃತ ಖರೀದಿದಾರರಿಗೆ ನಿಮ್ಮ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಕಾಣಿಸುತ್ತದೆ.'
                    : 'Buyers can only view your direct phone number if you have explicitly enabled "Show Phone Number to Verified Buyers" in settings.'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-agri-100 text-agri-700 shrink-0 mt-0.5">
                <Database className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="font-bold text-earth-900 text-xs sm:text-sm">
                  {isKn ? 'ಸ್ಥಳೀಯ ಸಂಗ್ರಹಣೆ & ಆಫ್‌ಲೈನ್ ಸಿಂಕ್' : 'Local Storage & Offline Cache'}
                </p>
                <p className="text-xs text-earth-600 mt-0.5">
                  {isKn
                    ? 'ಆಫ್‌ಲೈನ್ ಕಾರ್ಯಕ್ಷಮತೆಗಾಗಿ ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಸುರಕ್ಷಿತವಾಗಿ ಡೇಟಾ ಸಂಗ್ರಹವಾಗುತ್ತದೆ.'
                    : 'Advisories and user preferences are cached locally on your device using secure browser IndexedDB / localStorage for offline resilience.'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-agri-50 rounded-2xl border border-agri-200 text-xs text-agri-900">
            <span className="font-bold">{isKn ? 'ಸಮ್ಮತಿ ಹಿಂಪಡೆಯುವಿಕೆ:' : 'Consent Withdrawal:'} </span>
            <span>
              {isKn
                ? 'ನಿಮ್ಮ ಖಾತೆಯನ್ನು ಯಾವುದೇ ಸಮಯದಲ್ಲಿ ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಬಹುದು ಅಥವಾ ಅಳಿಸಬಹುದು.'
                : 'You may update your consent, alter notification preferences, or request account data purge at any time.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
