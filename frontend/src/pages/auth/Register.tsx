import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { RegisterForm } from '../../components/auth/RegisterForm';

const Register = () => {
  const [showSuccess, setShowSuccess] = useState(false);

  if (showSuccess) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <div className="text-center">
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email!</h2>
            <p className="text-gray-600 mb-6">
              We've sent you a verification link. Please check your inbox and click the link to
              verify your account.
            </p>
            <p className="text-sm text-gray-500">
              Didn't receive the email? Check your spam folder or contact support.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-600 mt-2">Start analyzing tokens for free</p>
        </div>
        <RegisterForm onSuccess={() => setShowSuccess(true)} />
      </Card>
    </div>
  );
};

export default Register;
