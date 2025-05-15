import AzureBlobService from '../services/azureBlobService';

// Azure Blob Storage configuration
const AZURE_STORAGE_CONNECTION_STRING = import.meta.env
  .VITE_AZURE_STORAGE_CONNECTION_STRING;
const AZURE_STORAGE_CONTAINER_NAME =
  import.meta.env.VITE_AZURE_STORAGE_CONTAINER_NAME || 'ocrtest';
// const AZURE_KEY = "some-real-key"; // ← This kind of thing
// Function to initialize Azure Blob Service
export const initializeAzureBlobService = () => {
  console.log('Initializing Azure Blob Service...');
  console.log('Container Name:', AZURE_STORAGE_CONTAINER_NAME);

  try {
    if (!AZURE_STORAGE_CONNECTION_STRING || !AZURE_STORAGE_CONTAINER_NAME) {
      throw new Error('Azure Storage configuration is missing');
    }

    AzureBlobService.initialize(
      AZURE_STORAGE_CONNECTION_STRING,
      AZURE_STORAGE_CONTAINER_NAME,
    );
    console.log('Azure Blob Service initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize Azure Blob Service:', error);
    return false;
  }
};

export { AZURE_STORAGE_CONNECTION_STRING, AZURE_STORAGE_CONTAINER_NAME };
