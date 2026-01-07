import { toast } from 'react-toastify';
import { ToastContent } from './customToast';

export const showError = (title: string, description?: string) =>
  toast(
    ({ closeToast }) => (
      <ToastContent
        type="error"
        title={title}
        description={description}
        closeToast={closeToast}
      />
    ),
    { closeButton: false },
  );

export const showSuccess = (title: string, description?: string) =>
  toast(
    ({ closeToast }) => (
      <ToastContent
        type="success"
        title={title}
        description={description}
        closeToast={closeToast}
      />
    ),
    { closeButton: false },
  );

export const showWarning = (title: string, description?: string) =>
  toast(
    ({ closeToast }) => (
      <ToastContent
        type="warning"
        title={title}
        description={description}
        closeToast={closeToast}
      />
    ),
    { closeButton: false },
  );

export const showInfo = (title: string, description?: string) =>
  toast(
    ({ closeToast }) => (
      <ToastContent
        type="info"
        title={title}
        description={description}
        closeToast={closeToast}
      />
    ),
    { closeButton: false },
  );
