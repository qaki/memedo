import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { PublicRoute } from '../components/auth/PublicRoute';

// Lazy load pages for code splitting
import { lazy, Suspense } from 'react';
import { Spinner } from '../components/ui/Spinner';

// Lazy loaded pages
const Home = lazy(() => import('../pages/Home'));
const Pricing = lazy(() => import('../pages/Pricing'));
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));
const VerifyEmail = lazy(() => import('../pages/auth/VerifyEmail'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/auth/ResetPassword'));
const Dashboard = lazy(() => import('../pages/dashboard/Dashboard'));
const Profile = lazy(() => import('../pages/dashboard/Profile'));
const Settings = lazy(() => import('../pages/dashboard/Settings'));
const Subscription = lazy(() => import('../pages/dashboard/Subscription'));
const AnalyzeToken = lazy(() => import('../pages/analysis/AnalyzeToken'));
const AnalysisHistory = lazy(() => import('../pages/analysis/AnalysisHistory'));
const Watchlist = lazy(() =>
  import('../pages/dashboard/Watchlist').then((m) => ({ default: m.Watchlist }))
);
const TermsOfService = lazy(() => import('../pages/legal/TermsOfService'));
const PrivacyPolicy = lazy(() => import('../pages/legal/PrivacyPolicy'));
const RefundPolicy = lazy(() => import('../pages/legal/RefundPolicy'));
const NotFound = lazy(() => import('../pages/NotFound'));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Spinner size="xl" />
  </div>
);

// Wrapper for lazy loaded components
const Lazy = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      // Public routes
      {
        index: true,
        element: (
          <Lazy>
            <Home />
          </Lazy>
        ),
      },
      {
        path: 'pricing',
        element: (
          <Lazy>
            <Pricing />
          </Lazy>
        ),
      },
      {
        path: 'terms',
        element: (
          <Lazy>
            <TermsOfService />
          </Lazy>
        ),
      },
      {
        path: 'privacy',
        element: (
          <Lazy>
            <PrivacyPolicy />
          </Lazy>
        ),
      },
      {
        path: 'refund-policy',
        element: (
          <Lazy>
            <RefundPolicy />
          </Lazy>
        ),
      },
      {
        path: 'login',
        element: (
          <Lazy>
            <PublicRoute>
              <Login />
            </PublicRoute>
          </Lazy>
        ),
      },
      {
        path: 'register',
        element: (
          <Lazy>
            <PublicRoute>
              <Register />
            </PublicRoute>
          </Lazy>
        ),
      },
      {
        path: 'verify-email/:token',
        element: (
          <Lazy>
            <VerifyEmail />
          </Lazy>
        ),
      },
      {
        path: 'forgot-password',
        element: (
          <Lazy>
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          </Lazy>
        ),
      },
      {
        path: 'reset-password/:token',
        element: (
          <Lazy>
            <ResetPassword />
          </Lazy>
        ),
      },

      // Protected routes
      {
        path: 'dashboard',
        element: (
          <Lazy>
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </Lazy>
        ),
      },
      {
        path: 'analyze',
        element: (
          <Lazy>
            <ProtectedRoute>
              <AnalyzeToken />
            </ProtectedRoute>
          </Lazy>
        ),
      },
      {
        path: 'history',
        element: (
          <Lazy>
            <ProtectedRoute>
              <AnalysisHistory />
            </ProtectedRoute>
          </Lazy>
        ),
      },
      {
        path: 'watchlist',
        element: (
          <Lazy>
            <ProtectedRoute>
              <Watchlist />
            </ProtectedRoute>
          </Lazy>
        ),
      },
      {
        path: 'profile',
        element: (
          <Lazy>
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          </Lazy>
        ),
      },
      {
        path: 'settings',
        element: (
          <Lazy>
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          </Lazy>
        ),
      },
      {
        path: 'subscription',
        element: (
          <Lazy>
            <ProtectedRoute>
              <Subscription />
            </ProtectedRoute>
          </Lazy>
        ),
      },

      // 404
      {
        path: '404',
        element: (
          <Lazy>
            <NotFound />
          </Lazy>
        ),
      },
      {
        path: '*',
        element: <Navigate to="/404" replace />,
      },
    ],
  },
]);
