/* eslint-disable @typescript-eslint/no-explicit-any */
// import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';

class AzureBlobService {
  private static isInitialized: boolean = false;
  //   private static connectionString: string = '';
  private static containerName: string = '';
  private static accountName: string = '';
  private static sasToken: string =
    'sv=2024-11-04&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2025-06-10T21:45:38Z&st=2025-06-05T13:45:38Z&spr=https,http&sig=lYBzLYYb4%2Fm4MacF9old7dAY5np4WrgN7ljob0Z%2FfFs%3D';
  //   private static accountKey: string = '';

  static initialize(connectionString: string, containerName: string) {
    try {
      console.log('Starting Azure Blob Service initialization...');

      if (!connectionString || !containerName) {
        throw new Error('Connection string and container name are required');
      }

      // Parse connection string
      const parts = connectionString.split(';');
      const accountNameMatch = parts
        .find((p) => p.startsWith('AccountName='))
        ?.split('=')[1];
      const accountKeyMatch = parts
        .find((p) => p.startsWith('AccountKey='))
        ?.split('=')[1];

      if (!accountNameMatch || !accountKeyMatch) {
        throw new Error('Invalid connection string format');
      }

      this.accountName = accountNameMatch;
      //   this.accountKey = accountKeyMatch;
      this.containerName = containerName;
      //   this.connectionString = connectionString;
      this.isInitialized = true;

      console.log('Azure Blob Service initialized successfully');
    } catch (error) {
      console.error('Error initializing Azure Blob Service:', error);
      this.isInitialized = false;
      throw error;
    }
  }

  private static getAuthorizationHeader(
    method: string,
    resourceType: string,
    date: string,
    contentLength: number = 0,
    contentType: string = '',
  ): string {
    const stringToSign = [
      method,
      '', // Content-Encoding
      '', // Content-Language
      contentLength.toString(), // Content-Length
      '', // Content-MD5
      contentType, // Content-Type
      '', // Date
      '', // If-Modified-Since
      '', // If-Match
      '', // If-None-Match
      '', // If-Unmodified-Since
      '', // Range
      `/${this.accountName}/${this.containerName}`, // CanonicalizedResource
      resourceType, // ResourceType
      date, // x-ms-date
      '2018-03-28', // x-ms-version
    ].join('\n');

    const signature = btoa(stringToSign);
    return `SharedKey ${this.accountName}:${signature}`;
  }

  static async uploadFile(
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Azure Blob Service not initialized.');
    }

    try {
      const blobName = `${Date.now()}-${file.name}`;
      const uploadUrl = `https://${this.accountName}.blob.core.windows.net/${this.containerName}/${blobName}?${this.sasToken}`;

      const xhr = new XMLHttpRequest();

      if (onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        };
      }

      const uploadPromise = new Promise<string>((resolve, reject) => {
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('x-ms-blob-type', 'BlockBlob');
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.withCredentials = false;
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(uploadUrl.split('?')[0]); // return clean URL
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(file);
      });

      return await uploadPromise;
    } catch (err) {
      console.error('Upload failed:', err);
      throw err;
    }
  }

  static async deleteFile(blobName: string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error(
        'Azure Blob Service not initialized. Please check your configuration.',
      );
    }

    try {
      console.log('Starting file deletion from Azure Blob Storage...');
      const date = new Date().toUTCString();
      const url = `https://${this.accountName}.blob.core.windows.net/${this.containerName}/${blobName}`;
      const authHeader = this.getAuthorizationHeader('DELETE', 'blob', date);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: authHeader,
          'x-ms-date': date,
          'x-ms-version': '2018-03-28',
        },
      });

      if (!response.ok) {
        throw new Error(`Delete failed with status ${response.status}`);
      }

      console.log('File deleted successfully');
    } catch (error) {
      console.error('Error deleting file from Azure Blob Storage:', error);
      throw error;
    }
  }
}

export default AzureBlobService;
