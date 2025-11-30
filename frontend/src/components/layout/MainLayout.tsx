import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { ToastContainer } from '../ui/Toast';
import { useAuthStore } from '../../stores/auth.store';

export const MainLayout = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  // Debug logging
  console.log('[MainLayout] Auth Status:', { isAuthenticated, hasUser: !!user });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Header />

      <div className="flex flex-1">
        {/* Only show sidebar when authenticated AND user exists */}
        {isAuthenticated && user && <Sidebar />}

        <main className="flex-1 overflow-y-auto flex flex-col">
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 animate-fade-in">
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};
