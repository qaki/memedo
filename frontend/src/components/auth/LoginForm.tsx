import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@memedo/shared';
import { z } from 'zod';
import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuthStore } from '../../stores/auth.store';
import { useToast } from '../../hooks/useToast';
import { getErrorMessage } from '../../lib/api';

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const isSubmittingRef = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    // CRITICAL: Prevent multiple submissions with ref
    if (isSubmittingRef.current || isLoading) {
      console.log(
        '[LoginForm] Already submitting, ignoring (ref:',
        isSubmittingRef.current,
        'loading:',
        isLoading,
        ')'
      );
      return;
    }

    console.log('[LoginForm] Starting login...');
    isSubmittingRef.current = true;
    setIsLoading(true);

    try {
      // Clean up totpToken - if empty string, send undefined
      const loginData = {
        ...data,
        totpToken: data.totpToken?.trim() || undefined,
      };

      console.log('[LoginForm] Calling login API...');
      await login(loginData);

      console.log('[LoginForm] Login successful!');
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      console.error('[LoginForm] Login failed:', error);
      const errorMessage = getErrorMessage(error);

      // Show error via toast
      toast.error(errorMessage);

      // Set form-level error to display in UI
      setError('root', {
        type: 'manual',
        message: errorMessage,
      });
    } finally {
      // CRITICAL: Always reset both flags
      console.log('[LoginForm] Resetting submission state');
      isSubmittingRef.current = false;
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        label="Email"
        type="email"
        placeholder="your@email.com"
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register('password')}
      />

      <Input
        label="2FA Code (optional)"
        type="text"
        placeholder="123456"
        error={errors.totpToken?.message}
        helperText="Only required if you have 2FA enabled"
        {...register('totpToken')}
      />

      <div className="flex items-center justify-between">
        <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-500">
          Forgot password?
        </Link>
      </div>

      {errors.root && <div className="text-sm text-red-600 text-center">{errors.root.message}</div>}

      <Button
        type="submit"
        className="w-full"
        size="lg"
        isLoading={isLoading}
        disabled={isLoading || isSubmitting}
      >
        Login
      </Button>

      <p className="text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <Link to="/register" className="text-indigo-600 hover:text-indigo-500 font-medium">
          Sign up
        </Link>
      </p>
    </form>
  );
};
