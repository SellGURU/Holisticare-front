import Application from '../api/app';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface UploadBlodToAzureProps {
  file: any;
  containerKey: 'reports' | 'logo' | 'exercise';
  name?: string;
  onProgress?: (progress: number) => void;
}

const uploadBlobToAzure = (props: UploadBlodToAzureProps): Promise<string> => {
  return Application.requestUploadUrl(
    props.containerKey,
    props.name,
    props.file.type,
  ).then((res) => {
    return Application.azureUploadUrl(
      res.data.upload_url,
      props.file,
      (progressEvent) => {
        if (props.onProgress) {
          const percent = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100,
          );
          props.onProgress(percent);
        }
      },
    ).then(() => res.data.upload_url.split('?')[0]);
  });
};

export { uploadBlobToAzure };
