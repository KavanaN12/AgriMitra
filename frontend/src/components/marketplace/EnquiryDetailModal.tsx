import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MessageSquare,
  Send,
  Phone,
  Check,
  X,
  CheckCircle2,
  AlertCircle,
  Tag,
  DollarSign,
  Package,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Dialog } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { LoadingState } from '../common/LoadingState';
import {
  useMarketEnquiry,
  useUpdateEnquiryStatus,
  useSendEnquiryMessage,
  useCurrentUser
} from '../../hooks/useAgriQuery';

interface EnquiryDetailModalProps {
  enquiryId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EnquiryDetailModal({
  enquiryId,
  isOpen,
  onClose
}: EnquiryDetailModalProps) {
  const { t, i18n } = useTranslation();
  const isKn = i18n.language.startsWith('kn');

  const { data: user } = useCurrentUser();
  const { data: enquiry, isLoading } = useMarketEnquiry(enquiryId || undefined);
  const updateStatusMutation = useUpdateEnquiryStatus();
  const sendMessageMutation = useSendEnquiryMessage();

  const [replyText, setReplyText] = useState('');
  const [counterPrice, setCounterPrice] = useState('');

  if (!isOpen) return null;

  const isFarmer = user?.id === enquiry?.farmer_id;
  const isBuyer = user?.id === enquiry?.buyer_id;

  const handleStatusChange = async (
    newStatus: 'accepted' | 'declined' | 'cancelled' | 'closed'
  ) => {
    if (!enquiryId) return;
    try {
      await updateStatusMutation.mutateAsync({
        id: enquiryId,
        payload: { status: newStatus }
      });
    } catch (err) {
      console.error('Failed to update enquiry status:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryId || (!replyText.trim() && !counterPrice.trim())) return;

    try {
      await sendMessageMutation.mutateAsync({
        id: enquiryId,
        payload: {
          message: replyText.trim() || `Proposed counter-price of ₹${counterPrice} / unit.`,
          proposed_price: counterPrice ? Number(counterPrice) : undefined
        }
      });
      setReplyText('');
      setCounterPrice('');
    } catch (err) {
      console.error('Failed to send enquiry message:', err);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={enquiry?.listing_title || t('market.thread_title')}
      description={`Enquiry #${enquiryId} • ${
        enquiry?.buyer_name || 'Buyer'
      } & ${enquiry?.farmer_name || 'Farmer'}`}
      className="max-w-2xl"
    >
      {isLoading || !enquiry ? (
        <LoadingState message={t('common.loading')} />
      ) : (
        <div className="space-y-4 pt-2">
          {/* Order / Proposal Header Banner */}
          <div className="p-3.5 rounded-2xl bg-sand-50 border border-sand-200 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge
                  className={`px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                    enquiry.status === 'accepted'
                      ? 'bg-emerald-600 text-white'
                      : enquiry.status === 'declined'
                      ? 'bg-red-600 text-white'
                      : enquiry.status === 'cancelled'
                      ? 'bg-stone-500 text-white'
                      : enquiry.status === 'closed'
                      ? 'bg-blue-600 text-white'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  {t(`market.status_${enquiry.status}`)}
                </Badge>
                <span className="text-xs text-earth-600 font-medium">
                  {new Date(enquiry.created_at).toLocaleDateString(isKn ? 'kn-IN' : 'en-IN', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              {/* Status Action Buttons */}
              <div className="flex items-center gap-1.5">
                {isFarmer && enquiry.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange('accepted')}
                      disabled={updateStatusMutation.isPending}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-7 px-2.5 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5 mr-1" />
                      <span>{t('market.accept')}</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange('declined')}
                      disabled={updateStatusMutation.isPending}
                      className="text-red-700 border-red-300 hover:bg-red-50 text-xs h-7 px-2.5"
                    >
                      <X className="w-3.5 h-3.5 mr-1" />
                      <span>{t('market.decline')}</span>
                    </Button>
                  </>
                )}

                {isBuyer && enquiry.status === 'pending' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange('cancelled')}
                    disabled={updateStatusMutation.isPending}
                    className="text-stone-700 border-stone-300 hover:bg-stone-50 text-xs h-7 px-2.5"
                  >
                    <X className="w-3.5 h-3.5 mr-1" />
                    <span>{t('market.cancel')}</span>
                  </Button>
                )}

                {enquiry.status === 'accepted' && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange('closed')}
                    disabled={updateStatusMutation.isPending}
                    className="bg-blue-700 hover:bg-blue-800 text-white text-xs h-7 px-2.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    <span>{t('market.close')}</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Deal Terms Snapshot */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-sand-200 text-xs">
              <div>
                <span className="text-earth-500 block">Requested Quantity</span>
                <span className="font-bold text-earth-900">
                  {enquiry.quantity_requested} {enquiry.listing_unit}
                </span>
              </div>
              <div>
                <span className="text-earth-500 block">Current Proposed Price</span>
                <span className="font-bold text-forest-800">
                  ₹{enquiry.offered_price || enquiry.listing_price} / {enquiry.listing_unit}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-earth-500 block">Total Lot Value</span>
                <span className="font-black text-earth-900">
                  ₹{(
                    (enquiry.offered_price || enquiry.listing_price || 0) *
                    enquiry.quantity_requested
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Bar */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-earth-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-earth-800">
                {isFarmer ? `Buyer: ${enquiry.buyer_name}` : `Farmer: ${enquiry.farmer_name}`}
              </span>
              <span className="text-earth-500">
                ({enquiry.buyer_village || 'Mandya'})
              </span>
            </div>
            {(isFarmer ? enquiry.buyer_phone : null) && (
              <a
                href={`tel:${enquiry.buyer_phone}`}
                className="inline-flex items-center gap-1 text-forest-700 font-semibold hover:underline"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{enquiry.buyer_phone}</span>
              </a>
            )}
          </div>

          {/* Message History Thread */}
          <div className="space-y-3 max-h-72 overflow-y-auto p-3 rounded-2xl bg-earth-50 border border-earth-200">
            {enquiry.messages && enquiry.messages.length > 0 ? (
              enquiry.messages.map((m) => {
                const isMe = m.sender_id === user?.id;
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-earth-500">
                      <span className="font-semibold text-earth-700">
                        {m.sender_name || (isMe ? 'You' : 'Counterparty')}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(m.created_at).toLocaleTimeString(isKn ? 'kn-IN' : 'en-IN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl p-3 text-xs sm:text-sm shadow-sm ${
                        isMe
                          ? 'bg-forest-700 text-white rounded-tr-none'
                          : 'bg-white text-earth-900 border border-earth-200 rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.message}</p>

                      {m.proposed_price && (
                        <div
                          className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                            isMe
                              ? 'bg-forest-800 text-sand-100 border border-forest-600'
                              : 'bg-sand-100 text-forest-900 border border-sand-300'
                          }`}
                        >
                          <Tag className="w-3.5 h-3.5" />
                          <span>
                            Negotiated Price: ₹{m.proposed_price} / {enquiry.listing_unit}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-xs text-earth-500 py-6">
                No discussion messages yet.
              </p>
            )}
          </div>

          {/* Reply and Counter-offer input form */}
          {enquiry.status !== 'closed' && enquiry.status !== 'cancelled' ? (
            <form onSubmit={handleSendMessage} className="space-y-2 pt-1">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={t('market.reply_placeholder')}
                    className="text-xs sm:text-sm"
                  />
                </div>

                <div className="w-28 sm:w-36">
                  <Input
                    type="number"
                    step="any"
                    value={counterPrice}
                    onChange={(e) => setCounterPrice(e.target.value)}
                    placeholder="Offer (₹)"
                    className="text-xs sm:text-sm"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={sendMessageMutation.isPending || (!replyText.trim() && !counterPrice.trim())}
                  className="bg-forest-700 hover:bg-forest-800 text-white px-4 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-[11px] text-earth-500">
                Tip: Enter a number in the Offer field to suggest a revised price per unit.
              </p>
            </form>
          ) : (
            <div className="p-3 rounded-xl bg-sand-100 text-center text-xs text-earth-700 font-medium">
              This enquiry is {enquiry.status}. New messages cannot be sent.
            </div>
          )}
        </div>
      )}
    </Dialog>
  );
}