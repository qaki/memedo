import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { useUIStore } from '../../stores/ui.store';
import { UserMenu } from './UserMenu';

export const Header = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { isSidebarOpen, toggleSidebar } = useUIStore();

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-soft backdrop-blur-sm bg-white/95">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Mobile Menu Button */}
          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
                aria-label="Toggle menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isSidebarOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            )}

            <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center group">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 bg-gradient-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center shadow-medium group-hover:shadow-glow-blue transition-all duration-200">
                  <span className="text-white font-bold text-xl">M</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  MemeDo
                </span>
              </div>
            </Link>
          </div>

          {/* Right Side - Auth or User Menu */}
          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <UserMenu user={user} />
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/pricing"
                  className="text-gray-700 hover:text-primary-600 font-semibold text-sm transition-colors duration-200"
                >
                  Pricing
                </Link>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 font-semibold text-sm transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-primary-600 to-primary-500 text-white px-5 py-2.5 rounded-lg hover:from-primary-700 hover:to-primary-600 font-semibold text-sm shadow-medium hover:shadow-large transition-all duration-200 transform hover:scale-105"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
