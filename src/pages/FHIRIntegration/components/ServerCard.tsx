import React from 'react';
import { FHIRServer } from '../../../api/fhir';
import { ButtonSecondary } from '../../../Components/Button/ButtosSecondary';
import { ButtonPrimary } from '../../../Components/Button/ButtonPrimary';

interface ServerCardProps {
  server: FHIRServer;
  onTest: () => void;
  onDelete: () => void;
  onBrowse: () => void;
}

const ServerCard: React.FC<ServerCardProps> = ({
  server,
  onTest,
  onDelete,
  onBrowse,
}) => {
  const getAuthTypeLabel = (authType: string) => {
    const labels: Record<string, string> = {
      none: 'No Auth',
      basic: 'Basic Auth',
      bearer: 'Bearer Token',
      api_key: 'API Key',
      oauth2: 'OAuth2',
    };
    return labels[authType] || authType;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow md:w-[400px] w-full">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-base text-Text-Primary">
                {server.name}
              </h3>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  server.is_active
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {server.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          <button
            onClick={onDelete}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            title="Remove server"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* URL */}
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1">Server URL</p>
          <p className="text-sm text-gray-700 truncate" title={server.base_url}>
            {server.base_url}
          </p>
        </div>

        {/* Auth Type */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-1">Authentication</p>
          <p className="text-sm text-gray-700">
            {getAuthTypeLabel(server.auth_type)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <ButtonSecondary onClick={onTest} ClassName="w-[48%] !rounded-3xl">
            Test Connection
          </ButtonSecondary>
          <ButtonPrimary onClick={onBrowse} ClassName="w-[48%] !rounded-2xl">
            Browse Data
          </ButtonPrimary>
        </div>
      </div>
    </div>
  );
};

export default ServerCard;
