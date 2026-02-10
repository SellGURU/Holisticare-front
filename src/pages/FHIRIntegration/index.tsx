import React, { useState, useEffect } from 'react';
import FHIRApi, { FHIRServer, FHIRServerConfig } from '../../api/fhir';
import { toast } from 'react-toastify';
import ServerCard from './components/ServerCard';
import AddServerModal from './components/AddServerModal';
import FHIRBrowser from './components/FHIRBrowser';
import { ButtonSecondary } from '../../Components/Button/ButtosSecondary';

const FHIRIntegration: React.FC = () => {
  const [servers, setServers] = useState<FHIRServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedServer, setSelectedServer] = useState<FHIRServer | null>(null);
  const [showBrowser, setShowBrowser] = useState(false);

  useEffect(() => {
    loadServers();
  }, []);

  const loadServers = () => {
    setLoading(true);
    FHIRApi.getServers()
      .then((response) => {
        if (response.data.success) {
          setServers(response.data.servers || []);
        }
      })
      .catch((error) => {
        console.error('Failed to load FHIR servers:', error);
        toast.error('Failed to load FHIR servers');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleAddServer = (config: FHIRServerConfig) => {
    FHIRApi.addServer(config)
      .then((response) => {
        if (response.data.success) {
          toast.success('FHIR server added successfully');
          setShowAddModal(false);
          loadServers();
        } else {
          toast.error(response.data.message || 'Failed to add server');
        }
      })
      .catch((error) => {
        console.error('Failed to add FHIR server:', error);
        toast.error(error.response?.data?.detail || 'Failed to add server');
      });
  };

  const handleTestServer = (serverId: number) => {
    toast.info('Testing connection...');
    FHIRApi.testServer(serverId)
      .then((response) => {
        if (response.data.success) {
          toast.success(
            `Connected! FHIR Version: ${response.data.fhir_version}`,
          );
        } else {
          toast.error(`Connection failed: ${response.data.error}`);
        }
      })
      .catch((error) => {
        console.error('Failed to test FHIR server:', error);
        toast.error(error.response?.data?.detail || 'Connection test failed');
      });
  };

  const handleDeleteServer = (serverId: number) => {
    if (!confirm('Are you sure you want to remove this FHIR server?')) {
      return;
    }

    FHIRApi.deleteServer(serverId)
      .then((response) => {
        if (response.data.success) {
          toast.success('FHIR server removed');
          loadServers();
        } else {
          toast.error(response.data.message || 'Failed to remove server');
        }
      })
      .catch((error) => {
        console.error('Failed to delete FHIR server:', error);
        toast.error(error.response?.data?.detail || 'Failed to remove server');
      });
  };

  const handleBrowseServer = (server: FHIRServer) => {
    setSelectedServer(server);
    setShowBrowser(true);
  };

  if (showBrowser && selectedServer) {
    return (
      <FHIRBrowser
        server={selectedServer}
        onBack={() => {
          setShowBrowser(false);
          setSelectedServer(null);
        }}
      />
    );
  }

  return (
    <div className="p-6 mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-Text-Primary font-medium text-base">
            FHIR Integration
          </h1>
          <p className="text-Text-Secondary text-xs mt-1">
            Connect to FHIR servers to import patient data, lab results, and
            conditions
          </p>
        </div>
        <ButtonSecondary onClick={() => setShowAddModal(true)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Add FHIR Server
        </ButtonSecondary>
      </div>

      {/* Info Banner */}
      <div className="bg-backgroundColor-Secondary border rounded-2xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-Text-Primary flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="font-medium text-Text-Primary text-base">
              About FHIR Integration
            </h3>
            <p className="text-Text-Secondary text-xs mt-1">
              FHIR (Fast Healthcare Interoperability Resources) is a standard
              for exchanging healthcare information electronically. Connect to
              FHIR servers like the{' '}
              <a
                href="https://hapi.fhir.org/baseR4"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                HAPI FHIR Test Server
              </a>{' '}
              to import patient data, observations (lab results), and
              conditions.
            </p>
          </div>
        </div>
      </div>

      {/* Server List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : servers.length === 0 ? (
        <div className="text-center py-12 bg-backgroundColor-Secondary border rounded-2xl border-dashed border-gray-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-Text-Secondary mx-auto mb-4"
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
          <h3 className="text-base font-medium text-Text-Primary">
            No FHIR servers configured
          </h3>
        </div>
      ) : (
        <div className="gap-4 flex items-center flex-wrap">
          {servers.map((server) => (
            <ServerCard
              key={server.id}
              server={server}
              onTest={() => handleTestServer(server.id)}
              onDelete={() => handleDeleteServer(server.id)}
              onBrowse={() => handleBrowseServer(server)}
            />
          ))}
        </div>
      )}

      {/* Add Server Modal */}
      <AddServerModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddServer}
      />
    </div>
  );
};

export default FHIRIntegration;
