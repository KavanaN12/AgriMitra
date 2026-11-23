import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { HomePage } from '../pages/HomePage';
import { AdvisoryPage } from '../pages/AdvisoryPage';
import { CommunityPage } from '../pages/CommunityPage';
import { MarketPage } from '../pages/MarketPage';
import { ProfilePage } from '../pages/ProfilePage';
import { AdminPage } from '../pages/AdminPage';
import { LoginPage } from '../pages/LoginPage';
import { WelcomePage } from '../pages/WelcomePage';
import { RegisterPage } from '../pages/RegisterPage';
import { OtpVerificationPage } from '../pages/OtpVerificationPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { OnboardingPage } from '../pages/OnboardingPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'welcome', element: <WelcomePage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'verify-otp', element: <OtpVerificationPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'onboarding', element: <OnboardingPage /> },
      { path: 'advisory', element: <AdvisoryPage /> },
      { path: 'community', element: <CommunityPage /> },
      { path: 'market', element: <MarketPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'admin', element: <AdminPage /> },
      { path: 'home', element: <HomePage /> },
      { path: 'groups', element: <CommunityPage defaultTab="groups" /> },
      { path: 'forum', element: <CommunityPage defaultTab="forum" /> },
      { path: 'enquiries', element: <MarketPage defaultTab="my_enquiries" /> },
      { path: 'my-listings', element: <MarketPage defaultTab="my_listings" /> },
      { path: 'settings', element: <ProfilePage defaultTab="display" /> },
      { path: 'notifications', element: <ProfilePage defaultTab="personal" /> },
      { path: 'help', element: <ProfilePage defaultTab="help" /> },
      { path: '*', element: <NotFoundPage /> }
    ]
  }
]);
