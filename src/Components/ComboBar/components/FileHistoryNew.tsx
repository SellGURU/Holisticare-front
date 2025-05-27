/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import AzureBlobService from "../../../services/azureBlobService";
import {
  AZURE_STORAGE_CONNECTION_STRING,
  AZURE_STORAGE_CONTAINER_NAME,
} from '../../../config/azure';
import Application from "../../../api/app";
import { useParams } from "react-router-dom";
import FileBox from "./FileBox";
interface FileUpload {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  azureUrl?: string;
}

const FileHistoryNew = () => {
  const fileInputRef = useRef<any>(null);
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([]);
  const { id } = useParams<{ id: string }>();
  const uploadToAzure = async (file: File): Promise<string> => {
    try {
        AzureBlobService.initialize(
            AZURE_STORAGE_CONNECTION_STRING,
            AZURE_STORAGE_CONTAINER_NAME,
        );        
      const blobUrl = await AzureBlobService.uploadFile(file, (progress: number) => {
        setUploadedFiles(prev => 
          prev.map(f => 
            f.file === file ? { ...f, progress } : f
          )
        );
      });
      return blobUrl;
    } catch {
      throw new Error('Azure upload failed');
    }
  };

  const sendToBackend = async (file: File, azureUrl: string) => {
    try {
        await Application.addLabReport(
            {
            member_id: id,
            report: {
                'file name': file.name,
                blob_url: azureUrl,
            },
            },
            (progressEvent: any) => {
            const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
            );
            setUploadedFiles(prev => 
                prev.map(f => 
                    f.file === file ? { ...f, percentCompleted } : f
                )
            );
            },
        );

        setUploadedFiles(prev => 
            prev.map(f => 
            f.file === file ? { ...f, status: 'completed', azureUrl } : f
            )
        );
        } catch {
        setUploadedFiles(prev => 
            prev.map(f => 
            f.file === file ? { ...f, status: 'error' } : f
            )
        );
        }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files).map(file => ({
        file,
        progress: 0,
        status: 'uploading' as const
      }));
      setUploadedFiles(prev => [...prev, ...newFiles]);
      
      // Process each file
      for (const fileUpload of newFiles) {
        try {
          // Step 1: Upload to Azure
          const azureUrl = await uploadToAzure(fileUpload.file);
          
          // Step 2: Send to backend
          await sendToBackend(fileUpload.file, azureUrl);
        } catch {
          setUploadedFiles(prev => 
            prev.map(f => 
              f.file === fileUpload.file ? { ...f, status: 'error' } : f
            )
          );
        }
      }
    }
    fileInputRef.current.value = '';
  };
  useEffect(() => {
    // setIsLoading(true);
    Application.getFilleList({ member_id: id })
      .then((res) => {
        if (res.data) {
          setUploadedFiles(res.data);
        } else {
          throw new Error('Unexpected data format');
        }
      })
      .catch((err) => {
        console.error(err);
        // setError("Failed to fetch client data");
      })
      .finally(() => {
        // setIsLoading(false);
      });
  }, [id]);
  return (
    <>
      <div className="w-full">
        <div
          onClick={() => {
            fileInputRef.current?.click();
          }}
          className="mb-3 text-[14px] flex cursor-pointer justify-center items-center gap-1 bg-white border-Primary-DeepTeal border rounded-xl border-dashed px-8 h-8 w-full text-Primary-DeepTeal"
        >
          <img className="w-6 h-6" src="/icons/add-blue.svg" alt="" />
          Add File
        </div>
        <input
          type="file"
          ref={fileInputRef}
          accept=".pdf, .xls, .xlsx"
          multiple
          onChange={handleFileChange}
          id="uploadFileBoxes"
          className="w-full absolute invisible h-full left-0 top-0"
        />
        
        {/* File Upload Progress List */}
        <div className="mt-4 space-y-2">
          {uploadedFiles.map((fileUpload, index) => (
            <div key={index}>
                <FileBox el={fileUpload}></FileBox>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default FileHistoryNew;
