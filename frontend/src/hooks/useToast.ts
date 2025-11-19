import { useUIStore } from '../stores/ui.store';
import type { ToastType } from '../types';

export const useToast = () => {
  const addToast = useUIStore((state) => state.addToast);

  const toast = {
    success: (message: string, duration?: number) => {
      addToast({ type: 'success' as ToastType, message, duration });
    },
    error: (message: string, duration?: number) => {
      addToast({ type: 'error' as ToastType, message, duration });
    },
    warning: (message: string, duration?: number) => {
      addToast({ type: 'warning' as ToastType, message, duration });
    },
    info: (message: string, duration?: number) => {
      addToast({ type: 'info' as ToastType, message, duration });
    },
  };

  return toast;
};
