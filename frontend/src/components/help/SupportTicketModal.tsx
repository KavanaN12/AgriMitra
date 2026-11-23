import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  LifeBuoy,
  X,
  Send,
  CheckCircle,
  Clock,
  CheckCheck,
  AlertCircle
} from 'lucide-react';
import { useCreateSupportTicket, useSupportTickets } from '../../hooks/useAgriQuery';

interface SupportTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ticketSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters')
});

type TicketFormData = z.infer<typeof ticketSchema>;

export function SupportTicketModal({ isOpen, onClose }: SupportTicketModalProps) {
  const { t, i18n } = useTranslation();
  const isKn = i18n.language.startsWith('kn');

  const [activeTab, setActiveTab] = useState<'create' | 'my_tickets'>('create');
  const [successMessage, setSuccessMessage] = useState(false);

  const { data: tickets = [] } = useSupportTickets();
  const createMutation = useCreateSupportTicket();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      category: 'Marketplace',
      subject: '',
      description: ''
    }
  });

  if (!isOpen) return null;

  const onSubmit = (data: TicketFormData) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        reset();
        setSuccessMessage(true);
        setTimeout(() => {
          setSuccessMessage(false);
          setActiveTab('my_tickets');
        }, 1500);
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
            <CheckCheck className="w-3 h-3" />
            {isKn ? 'ಪರಿಹರಿಸಲಾಗಿದೆ' : 'Resolved'}
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3" />
            {isKn ? 'ಪ್ರಗತಿಯಲ್ಲಿದೆ' : 'In Progress'}
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-earth-100 text-earth-700">
            {isKn ? 'ಮುಕ್ತಾಯ' : 'Closed'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
            <AlertCircle className="w-3 h-3" />
            {isKn ? 'ತೆರೆದಿದೆ' : 'Open'}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-earth-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-ticket-title"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-earth-100 flex items-center justify-between bg-earth-50/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-agri-700 text-white rounded-2xl">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h2 id="support-ticket-title" className="text-base sm:text-lg font-bold text-earth-900">
                {t('help.contact_support')}
              </h2>
              <p className="text-xs text-earth-500">
                {isKn ? 'ಮಂಡ್ಯ ಜಿಲ್ಲಾ ಕೃಷಿ ವಿಸ್ತರಣಾ ತಾಂತ್ರಿಕ ನೆರವು' : 'Mandya district agricultural platform support'}
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

        {/* Tab switch */}
        <div className="flex border-b border-earth-100 px-4 pt-2 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('create')}
            className={`pb-2.5 px-3 border-b-2 transition-all ${
              activeTab === 'create'
                ? 'border-agri-700 text-agri-800 font-bold'
                : 'border-transparent text-earth-500 hover:text-earth-800'
            }`}
          >
            {isKn ? 'ಹೊಸ ಮನವಿ ಸಲ್ಲಿಸಿ' : 'New Ticket'}
          </button>
          <button
            onClick={() => setActiveTab('my_tickets')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'my_tickets'
                ? 'border-agri-700 text-agri-800 font-bold'
                : 'border-transparent text-earth-500 hover:text-earth-800'
            }`}
          >
            <span>{isKn ? 'ನನ್ನ ಮನವಿಗಳು' : 'My Tickets'}</span>
            <span className="px-1.5 py-0.5 rounded-full bg-earth-100 text-[10px] text-earth-700 font-bold">
              {tickets.length}
            </span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {successMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{t('help.ticket_sent')}</span>
            </div>
          )}

          {activeTab === 'create' ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-earth-800 mb-1">
                  {t('help.ticket_category')}
                </label>
                <select
                  {...register('category')}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-earth-50 border border-earth-200 rounded-xl text-earth-900 focus:outline-none focus:ring-2 focus:ring-agri-500"
                >
                  <option value="Marketplace">{isKn ? 'ಮಾರುಕಟ್ಟೆ & ಬೆಳೆ ಪಟ್ಟಿ (Marketplace)' : 'Marketplace & Listings'}</option>
                  <option value="Advisory">{isKn ? 'ಹವಾಮಾನ & ಕೀಟ ಸಲಹೆ (Crop Advisory)' : 'Weather & Crop Advisory'}</option>
                  <option value="Community">{isKn ? 'ರೈತರ ಸಂಘ & ಚರ್ಚೆ (Community)' : 'Farmer Groups & Forum'}</option>
                  <option value="Account">{isKn ? 'ಖಾತೆ & ಪ್ರೊಫೈಲ್ (Account / Profile)' : 'Account & Profile'}</option>
                  <option value="Technical">{isKn ? 'ಆ್ಯಪ್ ತಾಂತ್ರಿಕ ದೋಷ (Technical Bug)' : 'Technical / App Bug'}</option>
                </select>
                {errors.category && (
                  <p className="text-[11px] text-red-600 mt-1">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-earth-800 mb-1">
                  {t('help.ticket_subject')}
                </label>
                <input
                  type="text"
                  {...register('subject')}
                  placeholder={isKn ? 'ಉದಾ: ಭತ್ತದ ದರ ನವೀಕರಣ ಆಗುತ್ತಿಲ್ಲ' : 'e.g. Unable to update produce listing quantity'}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-earth-50 border border-earth-200 rounded-xl text-earth-900 focus:outline-none focus:ring-2 focus:ring-agri-500"
                />
                {errors.subject && (
                  <p className="text-[11px] text-red-600 mt-1">{errors.subject.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-earth-800 mb-1">
                  {t('help.ticket_desc')}
                </label>
                <textarea
                  rows={4}
                  {...register('description')}
                  placeholder={isKn ? 'ದಯವಿಟ್ಟು ಸಮಸ್ಯೆಯ ಸಂಪೂರ್ಣ ವಿವರ ಬರೆಯಿರಿ...' : 'Provide specific details so our Mandya team can assist...'}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-earth-50 border border-earth-200 rounded-xl text-earth-900 focus:outline-none focus:ring-2 focus:ring-agri-500"
                />
                {errors.description && (
                  <p className="text-[11px] text-red-600 mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full py-2.5 bg-agri-700 hover:bg-agri-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{createMutation.isPending ? (isKn ? 'ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ...' : 'Submitting...') : t('help.submit_ticket')}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              {tickets.length === 0 ? (
                <p className="text-xs text-earth-500 text-center py-8">
                  {isKn ? 'ಯಾವುದೇ ಮನವಿಗಳು ದಾಖಲಾಗಿಲ್ಲ' : 'No support tickets found.'}
                </p>
              ) : (
                tickets.map(tkt => (
                  <div key={tkt.id} className="p-3.5 rounded-2xl bg-earth-50 border border-earth-200 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-earth-500">
                          #{tkt.id} • {tkt.category}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-earth-900 mt-0.5">
                          {tkt.subject}
                        </h4>
                      </div>
                      {getStatusBadge(tkt.status)}
                    </div>
                    <p className="text-xs text-earth-600 leading-relaxed">
                      {tkt.description}
                    </p>
                    {tkt.resolution_notes && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                        <span className="font-bold">{isKn ? 'ಪರಿಹಾರ ಟಿಪ್ಪಣಿ:' : 'Resolution:'} </span>
                        <span>{tkt.resolution_notes}</span>
                      </div>
                    )}
                    <span className="text-[10px] text-earth-400 block pt-1">
                      {new Date(tkt.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
