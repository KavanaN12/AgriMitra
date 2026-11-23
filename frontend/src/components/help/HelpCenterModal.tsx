import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HelpCircle,
  PhoneCall,
  ChevronDown,
  ChevronUp,
  Download,
  LifeBuoy,
  X,
  MapPin,
  Search,
  BookOpen
} from 'lucide-react';

interface HelpCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSupportTicket?: () => void;
}

export function HelpCenterModal({ isOpen, onClose, onOpenSupportTicket }: HelpCenterModalProps) {
  const { t, i18n } = useTranslation();
  const isKn = i18n.language.startsWith('kn');

  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [installPrompted, setInstallPrompted] = useState(false);

  if (!isOpen) return null;

  const faqs = [
    {
      q_en: 'How do I receive tailored weather advisories for my village in Mandya?',
      q_kn: 'ನನ್ನ ಮಂಡ್ಯ ಗ್ರಾಮಕ್ಕೆ ಸೂಕ್ತ ಹವಾಮಾನ ಹಾಗೂ ಬೆಳೆ ಸಲಹೆಗಳನ್ನು ಪಡೆಯುವುದು ಹೇಗೆ?',
      a_en: 'During onboarding or in your Profile settings, select your Taluk, Hobli, and Village (e.g. Maddur -> Shivapura). The AgriMitra rule engine calculates customized irrigation advice and pest alerts using hyper-local Open-Meteo Mandya weather feeds.',
      a_kn: 'ಆನ್‌ಬೋರ್ಡಿಂಗ್ ಅಥವಾ ಪ್ರೊಫೈಲ್ ಸೆಟ್ಟಿಂಗ್ಸ್‌ನಲ್ಲಿ ನಿಮ್ಮ ತಾಲೂಕು, ಹೋಬಳಿ ಹಾಗೂ ಗ್ರಾಮವನ್ನು (ಉದಾ: ಮದ್ದೂರು -> ಶಿವಪುರ) ನಮೂದಿಸಿ. ಕೃಷಿಮಿತ್ರದ ವೈಜ್ಞಾನಿಕ ಅಲ್ಗಾರಿದಮ್ ಸ್ಥಳೀಯ ಮಂಡ್ಯ ಹವಾಮಾನಕ್ಕೆ ತಕ್ಕಂತೆ ನೀರಾವರಿ ಮತ್ತು ಕೀಟ ನಿರ್ವಹಣಾ ಸಲಹೆಗಳನ್ನು ನೀಡುತ್ತದೆ.'
    },
    {
      q_en: 'How does selling produce directly to buyers work?',
      q_kn: 'ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ನೇರವಾಗಿ ಖರೀದಿದಾರರಿಗೆ ಉತ್ಪನ್ನ ಮಾರಾಟ ಮಾಡುವುದು ಹೇಗೆ?',
      a_en: 'Farmers can list produce under the "Market" tab with crop type, quantity, expected price, harvest date, and collection point. Verified buyers can browse listings and send enquiries. You can accept quotes and chat directly within the app.',
      a_kn: '"ಮಾರುಕಟ್ಟೆ" ಟ್ಯಾಬ್‌ನಲ್ಲಿ ನಿಮ್ಮ ಬೆಳೆ, ಪ್ರಮಾಣ, ನಿರೀಕ್ಷಿತ ದರ, ಕಟಾವಿನ ದಿನಾಂಕ ಮತ್ತು ಸಂಗ್ರಹಣಾ ಸ್ಥಳದ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ. ದೃಢೀಕೃತ ಖರೀದಿದಾರರು ನಿಮ್ಮ ಪಟ್ಟಿಯನ್ನು ನೋಡಿ ವಿಚಾರಣೆ ಕಳುಹಿಸುತ್ತಾರೆ.'
    },
    {
      q_en: 'What are Village Farmer Groups and collective listings?',
      q_kn: 'ಗ್ರಾಮ ರೈತ ಸಂಘಗಳು ಮತ್ತು ಸಾಮೂಹಿಕ ಮಾರಾಟ ಪಟ್ಟಿಗಳು ಎಂದರೇನು?',
      a_en: 'Village groups allow farmers in the same taluk/village to share farming tips, request machinery sharing, and pool produce together (Collective Listing) to secure higher bulk prices from institutional buyers and mills.',
      a_kn: 'ಗ್ರಾಮ ಸಂಘಗಳು ಒಂದೇ ಪ್ರದೇಶದ ರೈತರು ಒಗ್ಗೂಡಲು, ಕೃಷಿ ಉಪಕರಣಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಲು ಮತ್ತು ಸಾಮೂಹಿಕವಾಗಿ (Collective) ಬೆಳೆ ಒಟ್ಟುಗೂಡಿಸಿ ಸಗಟು ಖರೀದಿದಾರರಿಂದ ಹೆಚ್ಚಿನ ಬೆಲೆ ಪಡೆಯಲು ಸಹಕರಿಸುತ್ತವೆ.'
    },
    {
      q_en: 'Does AgriMitra work without internet (offline)?',
      q_kn: 'ಕೃಷಿಮಿತ್ರ ಅಂತರ್ಜಾಲವಿಲ್ಲದೆ (ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ) ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆಯೇ?',
      a_en: 'Yes! AgriMitra is a Progressive Web App (PWA). When offline, previously loaded advisories, weather records, crop guides, and listings remain fully viewable. Actions like posting or submitting enquiries are stored and synched once connectivity resumes.',
      a_kn: 'ಹೌದು! ಕೃಷಿಮಿತ್ರ ಒಂದು ಪ್ರೋಗ್ರೆಸ್ಸಿವ್ ವೆಬ್ ಆ್ಯಪ್ (PWA). ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿರುವಾಗಲೂ ಹಿಂದೆ ನೋಡಿದ ಹವಾಮಾನ, ಬೆಳೆ ಸಲಹೆಗಳು ಮತ್ತು ಪಟ್ಟಿಗಳು ಲಭ್ಯವಿರುತ್ತವೆ. ಅಂತರ್ಜಾಲ ಸಿಕ್ಕಾಗ ಹೊಸ ಡೇಟಾ ನವೀಕರಣಗೊಳ್ಳುತ್ತದೆ.'
    },
    {
      q_en: 'How is farmer personal information and privacy protected?',
      q_kn: 'ರೈತರ ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ ಮತ್ತು ಗೌಪ್ಯತೆ ಹೇಗೆ ರಕ್ಷಿಸಲ್ಪಡುತ್ತದೆ?',
      a_en: 'You have full control. In Profile -> Display & Accessibility, you can toggle whether your phone number is visible to verified buyers or keep direct communications purely inside the secure in-app messaging thread.',
      a_kn: 'ಪ್ರೊಫೈಲ್ ಸೆಟ್ಟಿಂಗ್ಸ್‌ನಲ್ಲಿ ನಿಮ್ಮ ಫೋನ್ ಸಂಖ್ಯೆಯನ್ನು ಖರೀದಿದಾರರಿಗೆ ತೋರಿಸಬೇಕೆ ಅಥವಾ ಗೌಪ್ಯವಾಗಿಡಬೇಕೆ ಎಂದು ನೀವೇ ನಿರ್ಧರಿಸಬಹುದು.'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const q = isKn ? faq.q_kn : faq.q_en;
    const a = isKn ? faq.a_kn : faq.a_en;
    return q.toLowerCase().includes(searchQuery.toLowerCase()) || a.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleInstallClick = () => {
    setInstallPrompted(true);
    // In browser, window.deferredPrompt?.prompt() is typically called.
    setTimeout(() => {
      alert(isKn ? 'ಕೃಷಿಮಿತ್ರ ಆ್ಯಪ್ ನಿಮ್ಮ ಮೊಬೈಲ್ ಹೋಮ್‌ಸ್ಕ್ರೀನ್‌ಗೆ ಸೇರಿಸಲಾಗಿದೆ!' : 'AgriMitra installed to home screen shortcut!');
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-earth-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-center-title"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-earth-100 flex items-center justify-between bg-agri-50/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-agri-700 text-white rounded-2xl">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 id="help-center-title" className="text-base sm:text-lg font-bold text-earth-900">
                {t('help.help_center')}
              </h2>
              <p className="text-xs text-earth-600">
                {isKn ? 'ಮಂಡ್ಯ ಜಿಲ್ಲಾ ರೈತರ ಸಹಾಯವಾಣಿ ಮತ್ತು ಮಾರ್ಗದರ್ಶಿ' : 'Mandya district farmer support & assistance'}
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

        {/* Search */}
        <div className="p-4 border-b border-earth-100 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-earth-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isKn ? 'ಸಮಸ್ಯೆ ಅಥವಾ ಪ್ರಶ್ನೆ ಹುಡುಕಿ...' : 'Search questions, advisories, contacts...'}
              className="w-full pl-9 pr-4 py-2 bg-earth-50 border border-earth-200 rounded-xl text-xs sm:text-sm text-earth-900 focus:outline-none focus:ring-2 focus:ring-agri-500"
            />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* FAQ Accordion */}
          <div>
            <h3 className="text-sm font-bold text-earth-900 flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-agri-700" />
              <span>{t('help.faq_title')}</span>
            </h3>

            <div className="space-y-2">
              {filteredFaqs.map((faq, idx) => {
                const isOpen = expandedFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-earth-200 rounded-2xl overflow-hidden bg-earth-50/50"
                  >
                    <button
                      onClick={() => setExpandedFaq(isOpen ? null : idx)}
                      className="w-full p-3.5 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold text-earth-900 hover:bg-earth-100/60 transition-colors"
                    >
                      <span>{isKn ? faq.q_kn : faq.q_en}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-earth-500 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-earth-500 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-3.5 pb-3.5 pt-1 text-xs text-earth-700 leading-relaxed border-t border-earth-200/50 bg-white">
                        {isKn ? faq.a_kn : faq.a_en}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mandya Agriculture Extension Helplines */}
          <div className="bg-gradient-to-br from-agri-50 to-emerald-50 rounded-2xl p-4 border border-agri-200/80 space-y-3">
            <h4 className="text-xs sm:text-sm font-bold text-agri-950 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-agri-700" />
              <span>{t('help.mandya_helplines')}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-agri-200 shadow-2xs">
                <p className="font-bold text-earth-900">{isKn ? 'ಕಿಸಾನ್ ಕಾಲ್ ಸೆಂಟರ್ (ಉಚಿತ)' : 'Kisan Call Centre (Toll-Free)'}</p>
                <a href="tel:18001801551" className="text-agri-700 font-bold hover:underline">1800-180-1551</a>
                <p className="text-[10px] text-earth-500 mt-0.5">{isKn ? 'ದಿನದ 24 ಗಂಟೆ ಬೆಳೆ ಮಾಹಿತಿ' : '24x7 all-India farmer hotline'}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-agri-200 shadow-2xs">
                <p className="font-bold text-earth-900">{isKn ? 'ಕೃಷಿ ವಿಜ್ಞಾನ ಕೇಂದ್ರ (KVK ಮಂಡ್ಯ)' : 'Krishi Vigyan Kendra (KVK Mandya)'}</p>
                <a href="tel:08232277444" className="text-agri-700 font-bold hover:underline">08232-277444</a>
                <p className="text-[10px] text-earth-500 mt-0.5">{isKn ? 'ವಿ.ಸಿ. ಫಾರ್ಮ್, ಮಂಡ್ಯ' : 'V.C. Farm, Mandya'}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-agri-200 shadow-2xs">
                <p className="font-bold text-earth-900">{isKn ? 'ಜಂಟಿ ಕೃಷಿ ನಿರ್ದೇಶಕರು (JDA ಮಂಡ್ಯ)' : 'Joint Director of Agri (Mandya)'}</p>
                <a href="tel:08232224164" className="text-agri-700 font-bold hover:underline">08232-224164</a>
                <p className="text-[10px] text-earth-500 mt-0.5">{isKn ? 'ಜಿಲ್ಲಾಡಳಿತ ಭವನ, ಮಂಡ್ಯ' : 'Deputy Commissioner Office Rd'}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-agri-200 shadow-2xs">
                <p className="font-bold text-earth-900">{isKn ? 'ರೈತ ಸಂಪರ್ಕ ಕೇಂದ್ರ (ಮದ್ದೂರು RSK)' : 'Maddur Raitha Samparka Kendra'}</p>
                <a href="tel:08232200112" className="text-agri-700 font-bold hover:underline">08232-200112</a>
                <p className="text-[10px] text-earth-500 mt-0.5">{isKn ? 'ಬೀಜ, ರಸಗೊಬ್ಬರ & ಸಬ್ಸಿಡಿ ಕೇಂದ್ರ' : 'Seeds & Soil health cards'}</p>
              </div>
            </div>
          </div>

          {/* PWA Install Banner */}
          <div className="p-4 rounded-2xl bg-earth-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/10 text-agri-400">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold">{t('help.pwa_install_title')}</h4>
                <p className="text-xs text-earth-300">{t('help.pwa_install_desc')}</p>
              </div>
            </div>
            <button
              onClick={handleInstallClick}
              className="w-full sm:w-auto px-4 py-2 bg-agri-600 hover:bg-agri-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('help.install_button')}</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-earth-100 bg-earth-50/60 flex items-center justify-between gap-3">
          <p className="text-xs text-earth-600">
            {isKn ? 'ನಿಮ್ಮ ಸಮಸ್ಯೆಗೆ ಪರಿಹಾರ ಸಿಗಲಿಲ್ಲವೇ?' : 'Still need assistance?'}
          </p>
          {onOpenSupportTicket && (
            <button
              onClick={() => {
                onClose();
                onOpenSupportTicket();
              }}
              className="px-4 py-2 bg-agri-700 hover:bg-agri-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <LifeBuoy className="w-4 h-4" />
              <span>{t('help.contact_support')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
