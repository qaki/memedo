import { RouterProvider } from 'react-router-dom';
import { useEffect } from 'react';
import { router } from './router';
import { useAuthStore } from './stores/auth.store';
import { useAnalysisStore } from './stores/analysis.store';

function App() {
  const fetchProfile = useAuthStore((state) => state.fetchProfile);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const fetchSupportedChains = useAnalysisStore((state) => state.fetchSupportedChains);

  // On app load, try to restore auth session and load supported chains
  useEffect(() => {
    const initializeApp = async () => {
      // Only try to fetch profile if we have persisted auth state
      // This prevents unnecessary API calls on fresh page loads
      if (isAuthenticated) {
        console.log('[App] Restoring auth session...');
        try {
          await fetchProfile();
          console.log('[App] Auth session restored');
        } catch (error) {
          console.log('[App] No active session or session expired');
          // fetchProfile will handle clearing auth state
        }
      } else {
        console.log('[App] No persisted auth, skipping profile fetch');
      }

      // Load supported chains (public endpoint)
      try {
        await fetchSupportedChains();
      } catch (error) {
        console.error('Failed to load supported chains:', error);
      }
    };

    initializeApp();
  }, []); // Only run once on mount, dependencies are stable

  return <RouterProvider router={router} />;
}

export default App;
