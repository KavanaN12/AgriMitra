import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { KeyRound, ArrowRight, ArrowLeft, CheckCircle2, Info } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth } from '../context/AuthContext';

export function ForgotPasswordPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { forgotPassword, resetPassword } = useAuth();
  const isKn = i18n.language.startsWith('kn');

  const [step, setStep] = useState<1 | 2>(1);
  const [identifier, setIdentifier] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [deliveryInfo, setDeliveryInfo] = useState<any>(null);

  // Schema for Step 1
  const identifierSchema = z.object({
    identifier: z.string().min(3, {
      message: isKn ? 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಇಮೇಲ್ ಅಥವಾ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ' : 'Enter a valid email address or mobile number'
    })
  });
  type IdentifierFormData = z.infer<typeof identifierSchema>;

  // Schema for Step 2
  const resetSchema = z.object({
    token: z.string().min(6, {
      message: isKn ? 'ಮಾನ್ಯವಾದ ಪರಿಶೀಲನಾ ಟೋಕನ್ ನಮೂದಿಸಿ' : 'Enter valid verification token'
    }),
    new_password: z.string().min(6, {
      message: isKn ? 'ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ 6 ಅಕ್ಷರಗಳಿರಬೇಕು' : 'Password must be at least 6 characters'
    }),
    confirm_new_password: z.string().min(1, {
      message: isKn ? 'ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ' : 'Please confirm your password'
    })
  }).refine((data) => data.new_password === data.confirm_new_password, {
    message: isKn ? 'ಪಾಸ್‌ವರ್ಡ್‌ಗಳು ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ' : 'Passwords do not match',
    path: ['confirm_new_password']
  });
  type ResetFormData = z.infer<typeof resetSchema>;

  const idForm = useForm<IdentifierFormData>({
    resolver: zodResolver(identifierSchema),
    defaultValues: { identifier: '' }
  });

  const resetForm = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: { token: '', new_password: '', confirm_new_password: '' }
  });

  const onSendReset = async (data: IdentifierFormData) => {
    setApiError(null);
    setSuccessMsg(null);
    try {
      const res = await forgotPassword(data.identifier);
      setIdentifier(data.identifier);
      setStep(2);
      setDeliveryInfo(res.delivery);

      if (res.token) {
        // Pre-fill verification token for development/pilot ease if SMTP not active
        resetForm.setValue('token', res.token);
      }

      if (res.delivery?.delivered) {
        setSuccessMsg(isKn ? 'ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಸುವ ಸೂಚನೆಗಳನ್ನು ನಿಮ್ಮ ಇಮೇಲ್‌ಗೆ ಕಳುಹಿಸಲಾಗಿದೆ.' : 'Password reset instructions have been dispatched to your email.');
      } else {
        setSuccessMsg(isKn ? 'ಪರಿಶೀಲನಾ ಟೋಕನ್ ರಚಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ.' : 'Password reset token generated. Please set your new password.');
      }
    } catch (err: any) {
      setApiError(err?.message || (isKn ? 'ವಿನಂತಿಯನ್ನು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲು ಸಾಧ್ಯವಾಗಿಲ್ಲ' : 'Failed to process password reset request.'));
    }
  };

  const onReset = async (data: ResetFormData) => {
    setApiError(null);
    try {
      await resetPassword({
        token: data.token.trim(),
        new_password: data.new_password
      });
      navigate('/login');
    } catch (err: any) {
      setApiError(err?.message || (isKn ? 'ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಸಲು ಸಾಧ್ಯವಾಗಿಲ್ಲ' : 'Failed to reset password.'));
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 sm:p-8 space-y-6 bg-white border-earth-200 shadow-sm animate-fadeIn">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-forest-700 text-white flex items-center justify-center mx-auto shadow-sm aspect-square">
            <KeyRound className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-earth-900 font-kannada leading-snug tracking-normal">
            {isKn ? 'ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಕೆ' : 'Reset Your Password'}
          </h1>
          <p className="text-xs sm:text-sm text-earth-600 font-kannada leading-relaxed">
            {step === 1
              ? (isKn ? 'ನಿಮ್ಮ ನೋಂದಾಯಿತ ಇಮೇಲ್ ಅಥವಾ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ' : 'Enter your registered email address or mobile number')
              : (isKn ? `ಪರಿಶೀಲನಾ ಟೋಕನ್ ನಮೂದಿಸಿ (${identifier})` : `Enter the verification token sent for ${identifier}`)}
          </p>
        </div>

        {/* Status / Error Messages */}
        {apiError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {apiError}
          </div>
        )}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-forest-50 border border-forest-200 text-xs text-forest-800 font-medium">
            {successMsg}
          </div>
        )}

        {/* Step 1: Enter Email or Mobile */}
        {step === 1 && (
          <form onSubmit={idForm.handleSubmit(onSendReset)} className="space-y-4">
            <div>
              <Input
                label={isKn ? 'ನೋಂದಾಯಿತ ಇಮೇಲ್ ಅಥವಾ ಮೊಬೈಲ್' : 'Registered Email or Mobile'}
                type="text"
                placeholder={isKn ? 'ಉದಾ: ananya.farmer@example.com' : 'e.g. ananya.farmer@example.com'}
                error={idForm.formState.errors.identifier?.message}
                {...idForm.register('identifier')}
              />
            </div>

            <Button
              type="submit"
              className="w-full font-bold bg-forest-700 hover:bg-forest-800 text-white"
              isLoading={idForm.formState.isSubmitting}
              size="lg"
            >
              <span>{isKn ? 'ಮರುಹೊಂದಿಸುವ ಲಿಂಕ್ ಪಡೆಯಿರಿ' : 'Send Reset Instructions'}</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        )}

        {/* Step 2: Enter Token & New Password */}
        {step === 2 && (
          <form onSubmit={resetForm.handleSubmit(onReset)} className="space-y-4">
            <div>
              <Input
                label={isKn ? 'ಪರಿಶೀಲನಾ ಟೋಕನ್' : 'Verification Token'}
                type="text"
                placeholder="Reset Token"
                error={resetForm.formState.errors.token?.message}
                {...resetForm.register('token')}
              />
            </div>

            <div>
              <Input
                label={isKn ? 'ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ (ಕನಿಷ್ಠ 6 ಅಕ್ಷರಗಳು)' : 'New Password (min 6 chars)'}
                type="password"
                placeholder="••••••••"
                error={resetForm.formState.errors.new_password?.message}
                {...resetForm.register('new_password')}
              />
            </div>

            <div>
              <Input
                label={isKn ? 'ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ' : 'Confirm New Password'}
                type="password"
                placeholder="••••••••"
                error={resetForm.formState.errors.confirm_new_password?.message}
                {...resetForm.register('confirm_new_password')}
              />
            </div>

            <Button
              type="submit"
              className="w-full font-bold bg-forest-700 hover:bg-forest-800 text-white"
              isLoading={resetForm.formState.isSubmitting}
              size="lg"
            >
              <span>{isKn ? 'ಪಾಸ್‌ವರ್ಡ್ ನವೀಕರಿಸಿ & ಲಾಗಿನ್ ಮಾಡಿ' : 'Update Password & Sign In'}</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        )}

        {/* Back Link */}
        <div className="pt-2 text-center">
          <Link
            to="/login"
            className="text-xs sm:text-sm font-semibold text-earth-600 hover:text-earth-900 inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isKn ? 'ಲಾಗಿನ್‌ಗೆ ಹಿಂತಿರುಗಿ' : 'Back to Sign In'}</span>
          </Link>
        </div>
      </Card>
    </div>
  );
}
