import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ShieldCheck, Phone, RefreshCw, ArrowRight, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth } from '../context/AuthContext';

export function OtpVerificationPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { pendingPhone, verifyOtp, resendOtp } = useAuth();
  const isKn = i18n.language.startsWith('kn');

  const [phone, setPhone] = useState(pendingPhone || '9876543210');
  const [resendCooldown, setResendCooldown] = useState(30);
  const [apiError, setApiError] = useState<string | null>(null);
  const [resendNotice, setResendNotice] = useState<string | null>(null);

  const otpSchema = z.object({
    otp: z.string().regex(/^\d{6}$/, {
      message: isKn ? 'ದಯವಿಟ್ಟು 6-ಅಂಕಿಯ OTP ನಮೂದಿಸಿ' : 'Please enter a valid 6-digit OTP'
    })
  });

  type OtpFormData = z.infer<typeof otpSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: ''
    }
  });

  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleAutoFill = () => {
    setValue('otp', '123456', { shouldValidate: true });
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      const res = await resendOtp(phone);
      setResendNotice(
        isKn
          ? 'ಹೊಸ ಪ್ರಾತ್ಯಕ್ಷಿಕೆ OTP ಕಳುಹಿಸಲಾಗಿದೆ: 123456 (SMS ಸೋಗುಮಾಡಲಾಗಿದೆ)'
          : `New demo OTP generated: ${res.demo_otp || '123456'} (SMS simulated)`
      );
      setResendCooldown(30);
    } catch {
      setResendNotice(isKn ? 'OTP ಕಳುಹಿಸಲಾಗಿದೆ: 123456' : 'Demo OTP ready: 123456');
      setResendCooldown(30);
    }
  };

  const onSubmit = async (data: OtpFormData) => {
    setApiError(null);
    try {
      await verifyOtp({
        phone_number: phone,
        otp: data.otp
      });
      navigate('/onboarding');
    } catch (err: any) {
      setApiError(
        err?.message ||
        (isKn ? 'ಅಮಾನ್ಯವಾದ OTP. ದಯವಿಟ್ಟು 123456 ನಮೂದಿಸಿ.' : 'Invalid OTP. Please enter 123456.')
      );
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 sm:p-8 space-y-6 bg-white border-earth-200 shadow-sm animate-fadeIn">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-agri-700 text-white flex items-center justify-center mx-auto shadow-sm">
            <KeyRound className="w-8 h-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-earth-900">
            {t('auth.verify_otp_title')}
          </h1>
          <p className="text-xs sm:text-sm text-earth-600">
            {t('auth.verify_otp_subtitle')}{' '}
            <span className="font-bold text-earth-800 tracking-wider">+91 {phone}</span>
          </p>
        </div>

        {/* Demo OTP Notice Card */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-amber-950">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{isKn ? 'ಪ್ರಾತ್ಯಕ್ಷಿಕೆ ಪರಿಸರ (Simulated SMS):' : 'Demonstration Environment:'}</span>
          </div>
          <p className="text-amber-800 leading-relaxed">
            {t('auth.demo_otp_banner')}
          </p>
          <button
            type="button"
            onClick={handleAutoFill}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-200/70 hover:bg-amber-200 text-amber-950 font-bold transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-800" />
            <span>{isKn ? 'ಡೆಮೊ OTP ಭರ್ತಿ ಮಾಡಿ (123456)' : 'Fill Demo OTP (123456)'}</span>
          </button>
        </div>

        {/* Success / Resend Notice */}
        {resendNotice && (
          <div className="p-3 rounded-xl bg-agri-50 border border-agri-200 text-xs text-agri-800 font-medium">
            {resendNotice}
          </div>
        )}

        {/* API Error Message */}
        {apiError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {apiError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <Input
              label={t('auth.otp_label')}
              type="text"
              maxLength={6}
              placeholder="123456"
              className="text-center tracking-widest text-lg font-bold"
              error={errors.otp?.message}
              {...register('otp')}
            />
          </div>

          <Button
            type="submit"
            className="w-full font-bold"
            isLoading={isSubmitting}
            size="lg"
          >
            <span>{t('auth.verify_btn')}</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        {/* Resend and Actions */}
        <div className="pt-2 flex flex-col items-center gap-3 text-xs sm:text-sm text-earth-600">
          <div className="flex items-center gap-1.5">
            {resendCooldown > 0 ? (
              <span className="text-earth-500">
                {t('auth.resend_in')} <strong className="text-earth-700">{resendCooldown}</strong> {t('auth.seconds')}
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="font-bold text-agri-700 hover:text-agri-800 hover:underline inline-flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{t('auth.resend_otp')}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 text-earth-500 text-xs">
            <Link
              to="/register"
              className="hover:text-earth-800 inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>{isKn ? 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಬದಲಿಸಿ' : 'Change Phone Number'}</span>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
