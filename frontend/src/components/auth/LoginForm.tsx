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
  const [attemptCount, setAttemptCount] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const isSubmittingRef = useRef(false);
  const lastSubmitTimeRef = useRef(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    const now = Date.now();

    console.log('[LoginForm] 🔍 onSubmit called at', now);
    console.log('[LoginForm] 🔍 isSubmittingRef:', isSubmittingRef.current);
    console.log('[LoginForm] 🔍 isLoading:', isLoading);
    console.log('[LoginForm] 🔍 lastSubmit:', lastSubmitTimeRef.current);
    console.log('[LoginForm] 🔍 timeSinceLastSubmit:', now - lastSubmitTimeRef.current);

    // CRITICAL: ABSOLUTE LOCK - Prevent ANY resubmission

    // 1. Check if blocked after 5 attempts
    if (isBlocked) {
      console.warn('[LoginForm] 🚫 BLOCKED: Too many failed attempts');
      return false; // Return false to stop form submission
    }

    // 2. Check if already submitting - THIS IS THE KEY TO STOP THE LOOP
    if (isSubmittingRef.current) {
      console.warn('[LoginForm] 🚫 BLOCKED: Already submitting (ref=true)');
      return false;
    }

    if (isLoading) {
      console.warn('[LoginForm] 🚫 BLOCKED: Already loading (state=true)');
      return false;
    }

    // 3. Rate limiting - AGGRESSIVE: prevent submissions within 2 seconds
    const timeSinceLastSubmit = now - lastSubmitTimeRef.current;
    if (timeSinceLastSubmit < 2000) {
      console.warn(
        '[LoginForm] 🚫 BLOCKED: Rate limit - only',
        timeSinceLastSubmit,
        'ms since last submit (need 2000ms)'
      );
      return false;
    }

    // 4. Check attempt count
    if (attemptCount >= 5) {
      console.warn('[LoginForm] 🚫 BLOCKED: Max attempts reached');
      setIsBlocked(true);
      toast.error('Too many failed login attempts. Please wait 1 minute.');

      // Unblock after 1 minute
      setTimeout(() => {
        setIsBlocked(false);
        setAttemptCount(0);
        console.log('[LoginForm] ✅ Unblocked after timeout');
      }, 60000);
      return false;
    }

    console.log(
      '[LoginForm] ✅ ALL CHECKS PASSED - Starting login... (Attempt',
      attemptCount + 1,
      '/ 5)'
    );

    // LOCK EVERYTHING IMMEDIATELY
    isSubmittingRef.current = true;
    lastSubmitTimeRef.current = now;
    setIsLoading(true);

    console.log('[LoginForm] 🔒 LOCKED: ref=true, loading=true, timestamp=', now);

    try {
      // Clean up totpToken - if empty string, send undefined
      const loginData = {
        ...data,
        totpToken: data.totpToken?.trim() || undefined,
      };

      console.log('[LoginForm] 📡 Calling login API...');
      await login(loginData);

      console.log('[LoginForm] ✅ Login successful!');
      toast.success('Login successful!');

      // Reset attempt count on success
      setAttemptCount(0);
      navigate('/dashboard');
    } catch (error) {
      console.error('[LoginForm] ❌ Login failed:', error);

      // Increment attempt count
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);

      const errorMessage = getErrorMessage(error);
      const remainingAttempts = 5 - newAttemptCount;

      // Show error with remaining attempts
      if (remainingAttempts > 0) {
        toast.error(`${errorMessage}. ${remainingAttempts} attempts remaining.`);
        setError('root', {
          type: 'manual',
          message: `${errorMessage}. You have ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining.`,
        });
      } else {
        toast.error('Too many failed attempts. Blocked for 1 minute.');
        setError('root', {
          type: 'manual',
          message: 'Too many failed attempts. Please wait 1 minute before trying again.',
        });
        setIsBlocked(true);

        // Unblock after 1 minute
        setTimeout(() => {
          setIsBlocked(false);
          setAttemptCount(0);
          setError('root', { type: 'manual', message: '' });
          console.log('[LoginForm] ✅ Unblocked after timeout');
        }, 60000);
      }

      console.log('[LoginForm] 📊 Attempt count:', newAttemptCount, '/ 5');
    } finally {
      // CRITICAL: Always unlock AFTER a delay to prevent rapid resubmission
      console.log('[LoginForm] 🔄 Will unlock in 500ms...');

      setTimeout(() => {
        isSubmittingRef.current = false;
        setIsLoading(false);
        console.log('[LoginForm] 🔓 UNLOCKED: ref=false, loading=false');
      }, 500); // Wait 500ms before unlocking to prevent rapid resubmission
    }
  };

  // Wrap handleSubmit to add extra protection
  const handleFormSubmit = (e: React.FormEvent) => {
    console.log('[LoginForm] 📝 Form submit event triggered');

    // If already submitting, prevent the form submission entirely
    if (isSubmittingRef.current || isLoading) {
      console.warn('[LoginForm] 🚫 Prevented form submission - already processing');
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Let react-hook-form handle it
    handleSubmit(onSubmit)(e);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
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
        disabled={isLoading || isSubmitting || isBlocked}
      >
        {isBlocked ? 'Too Many Attempts - Wait 1 Minute' : 'Login'}
      </Button>

      {attemptCount > 0 && !isBlocked && (
        <div className="text-sm text-orange-600 text-center">
          Failed attempts: {attemptCount} / 5
        </div>
      )}

      <p className="text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <Link to="/register" className="text-indigo-600 hover:text-indigo-500 font-medium">
          Sign up
        </Link>
      </p>
    </form>
  );
};
