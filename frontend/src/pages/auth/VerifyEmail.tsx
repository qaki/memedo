import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import api from '../../lib/api';
import { useAuthStore } from '../../stores/auth.store';

const VerifyEmail = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      try {
        const response = await api.get<{
          success: true;
          data: {
            message: string;
            user: {
              id: string;
              email: string;
              display_name: string | null;
              role: string;
              email_verified: boolean;
            };
          };
        }>(`/api/auth/verify-email/${token}`);

        setStatus('success');
        setMessage(response.data.data.message);
        setUser(response.data.data.user as any);

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.error?.message || 'Email verification failed');
      }
    };

    verifyEmail();
  }, [token, setUser, navigate]);

  return (
    <div className="max-w-md mx-auto">
      <Card>
        {status === 'loading' && (
          <div className="text-center py-8">
            <Spinner size="xl" className="mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying your email...</h2>
            <p className="text-gray-600">Please wait a moment</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center py-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email verified!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center py-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link to="/login">
              <Button>Go to Login</Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
};

export default VerifyEmail;
