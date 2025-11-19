import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@memedo/shared';
import { z } from 'zod';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuthStore } from '../../stores/auth.store';
import { useToast } from '../../hooks/useToast';

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      await login(data);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || 'Login failed. Please try again.');
      } else {
        toast.error('Login failed. Please try again.');
      }
    } finally {
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
        label="2FA Code (if enabled)"
        type="text"
        placeholder="123456"
        error={errors.totpToken?.message}
        helperText="Leave empty if 2FA is not enabled"
        {...register('totpToken')}
      />

      <div className="flex items-center justify-between">
        <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-500">
          Forgot password?
        </Link>
      </div>

      <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
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
