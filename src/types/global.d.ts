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
  type ApiQuestion = {
    id?: string;
    text?: string;
    question?: string;
    type?: string;
    options?: string[] | null;
    required?: boolean;
    [key: string]: unknown;
  };
  type AllowedContainer = {
    key: string;
    env_var: string;
    configured: boolean;
  };

  type AppConfig = {
    google_client_id: string;
    azure_storage_account_url: string;
    allowed_containers: AllowedContainer[];
    sas_ttl_seconds_default: number;
    sas_ttl_seconds_max: number;
  };
}
