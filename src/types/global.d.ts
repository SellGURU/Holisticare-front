/* eslint-disable @typescript-eslint/no-explicit-any */
export {}; // Ensures this file is treated as a module

declare global {
  type PackageTypes = 'Free' | 'Pro' | 'Plus';
  interface Window {
    flutter_inappwebview?: {
      callHandler: (handlerName: string, ...args: any[]) => void;
    };
  }
  type checkinType = {
    order?: number;
    question: string;
    type: string;
    required: boolean;
    response: string;
    options?: Array<string>;
  };

  type CheckinFormType = {
    title: string;
    questions: Array<checkinType>;
  };

  type CheckinEditFormType = {
    title: string;
    unique_id: string;
    questions: Array<checkinType>;
  };

  type CheckInDataRowType = {
    title: string;
    questions: number;
    created_on: string;
    created_by: string;
  };
  type FileUpload = {
    file: File;
    file_id: string;
    progress: number;
    status: 'uploading' | 'completed' | 'error';
    azureUrl?: string;
    uploadedSize?: number;
    errorMessage?: string;
    warning?: boolean;
    showReport?: boolean;
  };
}
