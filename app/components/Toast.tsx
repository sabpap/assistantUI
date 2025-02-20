import { useEffect } from 'react';

export type ToastState = {
  message: string;
  type: 'success' | 'error';
  show: boolean;
};

type ToastProps = {
  message: string;
  onClose: () => void;
  duration?: number;
  variant?: 'success' | 'error';
};

export function Toast({ message, onClose, duration = 3000, variant = 'success' }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg animate-fade-in-up ${
      variant === 'error' ? 'bg-red-100 text-red-900' : 'bg-gray-800 text-white'
    }`}>
      {message}
    </div>
  );
}