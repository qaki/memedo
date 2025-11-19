import { RouterProvider } from 'react-router-dom';
import { useEffect } from 'react';
import { router } from './router';
import { useAuthStore } from './stores/auth.store';
import { useAnalysisStore } from './stores/analysis.store';

function App() {
  const fetchProfile = useAuthStore((state) => state.fetchProfile);
  const fetchSupportedChains = useAnalysisStore((state) => state.fetchSupportedChains);

  // On app load, try to restore auth session and load supported chains
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Try to restore user session (if cookies exist)
        await fetchProfile();
      } catch (error) {
        // User not logged in, that's okay
        console.log('No active session');
      }

      // Load supported chains (public endpoint)
      try {
        await fetchSupportedChains();
      } catch (error) {
        console.error('Failed to load supported chains:', error);
      }
    };

    initializeApp();
  }, [fetchProfile, fetchSupportedChains]);

  return <RouterProvider router={router} />;
}

export default App;
