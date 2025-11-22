import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../stores/auth.store';
import { useToast } from '../../hooks/useToast';

// Form validation schemas
const profileSchema = z.object({
  display_name: z.string().min(2, 'Display name must be at least 2 characters').max(50),
});

const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    new_password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm_password: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

const Profile = () => {
  const toast = useToast();
  const { user, updateProfile, changePassword } = useAuthStore();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      display_name: user?.display_name || '',
    },
  });

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onUpdateProfile = async (data: ProfileForm) => {
    setIsUpdatingProfile(true);
    try {
      await updateProfile(data);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Profile update error:', error);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onChangePassword = async (data: PasswordForm) => {
    setIsChangingPassword(true);
    try {
      await changePassword({
        current_password: data.current_password,
        new_password: data.new_password,
      });
      toast.success('Password changed successfully!');
      resetPasswordForm();
    } catch (error) {
      toast.error('Failed to change password. Check your current password.');
      console.error('Password change error:', error);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getPlanBadgeVariant = (plan: string): 'success' | 'warning' | 'gray' => {
    switch (plan) {
      case 'premium':
        return 'success';
      case 'admin':
        return 'gray';
      default:
        return 'warning';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="mt-2 text-gray-600">Manage your account information and preferences</p>
      </div>

      {/* Account Overview */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Overview</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{user?.email}</p>
              </div>
              <Badge variant={user?.email_verified ? 'success' : 'warning'}>
                {user?.email_verified ? '✓ Verified' : 'Unverified'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Plan</p>
                <p className="font-medium text-gray-900 capitalize">{user?.role || 'Free'}</p>
              </div>
              <Badge variant={getPlanBadgeVariant(user?.role || 'free')}>
                {user?.role === 'premium'
                  ? '⭐ Premium'
                  : user?.role === 'admin'
                    ? '👑 Admin'
                    : 'Free'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Two-Factor Authentication</p>
                <p className="font-medium text-gray-900">
                  {user?.totp_enabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              <Badge variant={user?.totp_enabled ? 'success' : 'gray'}>
                {user?.totp_enabled ? '✓ Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="font-medium text-gray-900">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Update Profile */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Update Profile</h2>
          <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4">
            <Input
              label="Display Name"
              placeholder="Enter your display name"
              {...registerProfile('display_name')}
              error={profileErrors.display_name?.message}
              disabled={isUpdatingProfile}
            />
            <Button type="submit" isLoading={isUpdatingProfile} disabled={isUpdatingProfile}>
              {isUpdatingProfile ? 'Updating...' : 'Update Profile'}
            </Button>
          </form>
        </div>
      </Card>

      {/* Change Password */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Change Password</h2>
          <form onSubmit={handlePasswordSubmit(onChangePassword)} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              placeholder="Enter your current password"
              {...registerPassword('current_password')}
              error={passwordErrors.current_password?.message}
              disabled={isChangingPassword}
            />
            <Input
              label="New Password"
              type="password"
              placeholder="Enter your new password"
              {...registerPassword('new_password')}
              error={passwordErrors.new_password?.message}
              disabled={isChangingPassword}
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Confirm your new password"
              {...registerPassword('confirm_password')}
              error={passwordErrors.confirm_password?.message}
              disabled={isChangingPassword}
            />
            <Button
              type="submit"
              variant="secondary"
              isLoading={isChangingPassword}
              disabled={isChangingPassword}
            >
              {isChangingPassword ? 'Changing...' : 'Change Password'}
            </Button>
          </form>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card>
        <div className="p-6 border-l-4 border-red-500">
          <h2 className="text-xl font-semibold text-red-900 mb-2">Danger Zone</h2>
          <p className="text-sm text-gray-600 mb-4">
            These actions are irreversible. Please proceed with caution.
          </p>
          <Button variant="danger" className="border-red-500">
            Delete Account
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Profile;
