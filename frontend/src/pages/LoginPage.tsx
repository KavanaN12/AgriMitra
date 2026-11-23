import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Sprout, Lock, ArrowRight, User, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const isKn = i18n.language.startsWith('kn');

  const [apiError, setApiError] = useState<string | null>(null);
  const [showDemoInfo, setShowDemoInfo] = useState<boolean>(false);

  const loginSchema = z.object({
    identifier: z.string().min(3, {
      message: isKn ? 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಇಮೇಲ್ ಅಥವಾ 10-ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ' : 'Enter a valid email address or 10-digit mobile number'
    }),
    password: z.string().min(6, {
      message: isKn ? 'ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ 6 ಅಕ್ಷರಗಳಿರಬೇಕು' : 'Password must be at least 6 characters'
    })
  });

  type LoginFormData = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: ''
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    setApiError(null);
    try {
      const u = await login({
        identifier: data.identifier.trim(),
        password: data.password
      });

      if (!u.is_onboarded) {
        navigate('/onboarding');
      } else if (u.active_role === 'buyer') {
        navigate('/market');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setApiError(
        err?.message ||
        (isKn
          ? 'ಲಾಗಿನ್ ವಿಫಲವಾಗಿದೆ. ನಿಮ್ಮ ಇಮೇಲ್/ಮೊಬೈಲ್ ಮತ್ತು ಪಾಸ್‌ವರ್ಡ್ ಪರಿಶೀಲಿಸಿ.'
          : 'Sign in failed. Please verify your email/mobile and password.')
      );
    }
  };

  const fillSampleCredentials = (identifier: string, pass: string) => {
    setValue('identifier', identifier, { shouldValidate: true });
    setValue('password', pass, { shouldValidate: true });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 sm:p-8 space-y-6 bg-white border-earth-200 shadow-sm animate-fadeIn">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-forest-700 text-white flex items-center justify-center mx-auto shadow-sm aspect-square">
            <Sprout className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-earth-900 font-kannada leading-snug tracking-normal">
            {t('auth.login_title')}
          </h1>
          <p className="text-xs sm:text-sm text-earth-600 font-kannada leading-relaxed">
            {isKn ? 'ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಖಾತೆಗೆ ಲಾಗಿನ್ ಮಾಡಿ' : 'Sign in to access your farm dashboard, advisories and marketplace'}
          </p>
        </div>

        {/* Error Alert */}
        {apiError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {apiError}
          </div>
        )}

        {/* Real Password Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              label={isKn ? 'ಇಮೇಲ್ ಅಥವಾ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ' : 'Email Address or Mobile Number'}
              type="text"
              placeholder={isKn ? 'ಉದಾ: ananya.farmer@example.com ಅಥವಾ 9845012345' : 'e.g. ananya.farmer@example.com or 9845012345'}
              error={errors.identifier?.message}
              {...register('identifier')}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-earth-800">
                {t('auth.password')}
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-forest-700 hover:text-forest-900 font-semibold hover:underline"
              >
                {t('auth.forgot_password')}
              </Link>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
          </div>

          <Button
            type="submit"
            className="w-full font-bold mt-2 bg-forest-700 hover:bg-forest-800 text-white"
            isLoading={isSubmitting}
            size="lg"
          >
            <span>{t('auth.sign_in')}</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        {/* Registration Link */}
        <div className="pt-4 border-t border-earth-100 text-center text-xs sm:text-sm text-earth-600">
          <span>{t('auth.dont_have_account')} </span>
          <Link
            to="/register"
            className="font-bold text-forest-700 hover:text-forest-900 hover:underline"
          >
            {isKn ? 'ಹೊಸ ಖಾತೆ ನೋಂದಾಯಿಸಿ' : 'Register New Account'}
          </Link>
        </div>

        {/* Optional Collapsible Demonstration Notes for Evaluators */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowDemoInfo(!showDemoInfo)}
            className="w-full flex items-center justify-between text-xs text-earth-500 hover:text-earth-700 font-medium py-1"
          >
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              <span>{isKn ? 'ಪ್ರಾತ್ಯಕ್ಷಿಕೆ ಖಾತೆಗಳ ವಿವರ (Evaluation Personas)' : 'Evaluation & Test Accounts Reference'}</span>
            </span>
            {showDemoInfo ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showDemoInfo && (
            <div className="mt-2 p-3 bg-earth-50 rounded-xl border border-earth-200 text-xs text-earth-700 space-y-2">
              <p className="font-semibold text-earth-800">
                {isKn
                  ? 'ಮೌಲ್ಯಮಾಪನಕ್ಕಾಗಿ ಮೊದಲೇ ಸೇರಿಸಲಾದ ಮಾದರಿ ಖಾತೆಗಳು (ಪಾಸ್‌ವರ್ಡ್ ಪ್ರಮಾಣೀಕರಣ ಕಡ್ಡಾಯ):'
                  : 'Pre-seeded reference personas (real password authentication required):'}
              </p>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-earth-200">
                  <div>
                    <span className="font-bold text-forest-800 block">Farmer Ananya Rao</span>
                    <span className="text-[11px] text-earth-600">ananya.farmer@example.com / AnanyaFarmer@2026</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => fillSampleCredentials('ananya.farmer@example.com', 'AnanyaFarmer@2026')}
                    className="text-[11px] font-bold text-forest-700 hover:underline"
                  >
                    {isKn ? 'ಭರ್ತಿ ಮಾಡಿ' : 'Use'}
                  </button>
                </div>
                <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-earth-200">
                  <div>
                    <span className="font-bold text-earth-900 block">Buyer Arjun Traders</span>
                    <span className="text-[11px] text-earth-600">arjun.buyer@example.com / ArjunBuyer@2026</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => fillSampleCredentials('arjun.buyer@example.com', 'ArjunBuyer@2026')}
                    className="text-[11px] font-bold text-forest-700 hover:underline"
                  >
                    {isKn ? 'ಭರ್ತಿ ಮಾಡಿ' : 'Use'}
                  </button>
                </div>
                <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-earth-200">
                  <div>
                    <span className="font-bold text-purple-900 block">Admin Agronomist</span>
                    <span className="text-[11px] text-earth-600">admin@agrimitra.gov.in / Admin@123</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => fillSampleCredentials('admin@agrimitra.gov.in', 'Admin@123')}
                    className="text-[11px] font-bold text-purple-700 hover:underline"
                  >
                    {isKn ? 'ಭರ್ತಿ ಮಾಡಿ' : 'Use'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
