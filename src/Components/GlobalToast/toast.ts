import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const showError = (message: string) =>
  toast.error(message, {
    className:
      'text-red-900 font-medium text-sm border border-red-200 rounded-lg shadow-2xl',
    progressClassName: 'bg-red-500',
  });

export const showSuccess = (message: string) =>
  toast.success(message, {
    className:
      'text-green-900 font-medium text-sm border border-green-200 rounded-lg shadow-2xl',
    progressClassName: 'bg-green-500',
  });
