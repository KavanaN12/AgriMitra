import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flag, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Dialog } from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { useReportPost } from '../../hooks/useAgriQuery';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: number;
  postTitle: string;
}

export function ReportModal({ isOpen, onClose, postId, postTitle }: ReportModalProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState<string>('misleading');
  const [details, setDetails] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const reportMutation = useReportPost();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await reportMutation.mutateAsync({
        id: postId,
        payload: {
          post_id: postId,
          reason,
          details: details.trim() || undefined
        }
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setDetails('');
        onClose();
      }, 2500);
    } catch (err) {
      console.error('Failed to submit report:', err);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={t('community.report_title')}
      description={t('community.report_subtitle')}
      className="max-w-md"
    >
      {isSuccess ? (
        <div className="py-6 text-center space-y-3">
          <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-earth-900 text-base">
            {t('community.report_success')}
          </h3>
          <p className="text-xs text-earth-600">
            Post: &ldquo;{postTitle}&rdquo;
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <span>
              Reporting: <strong>{postTitle}</strong>
            </span>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-earth-700 uppercase tracking-wider">
              {t('community.report_reason')}
            </label>
            <div className="space-y-2">
              {[
                { value: 'misleading', label: t('community.reason_misleading') },
                { value: 'spam', label: t('community.reason_spam') },
                { value: 'abusive', label: t('community.reason_abusive') },
                { value: 'commercial', label: t('community.reason_commercial') }
              ].map(opt => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    reason === opt.value
                      ? 'border-forest-600 bg-forest-50/50 text-forest-950 font-medium'
                      : 'border-earth-200 hover:border-earth-300 text-earth-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="report_reason"
                    value={opt.value}
                    checked={reason === opt.value}
                    onChange={e => setReason(e.target.value)}
                    className="mt-0.5 text-forest-600 focus:ring-forest-500"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-earth-700">
              {t('community.report_details')}
            </label>
            <Textarea
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder="Provide context on why this advice is incorrect or inappropriate..."
              className="min-h-[70px] text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-earth-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={reportMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={reportMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Flag className="w-3.5 h-3.5 mr-1" />
              {reportMutation.isPending ? 'Submitting...' : t('community.report_submit')}
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
