/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import HtmlPreviewer from '../../Components/HtmlPreviewer';
import { useParams } from 'react-router-dom';
import Application from '../../api/app';
// import htmlMoch from './moch';
// import htmlMoch from './moch';

const HtmlViewer = () => {
  const { id } = useParams<{ id: string }>();
  const [html, setHtml] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    Application.getHtmlReport(id?.toString() || '')
      .then((res) => {
        try {
          const blobUrl = res.data;
          setHtml(blobUrl);
        } catch (error: any) {
          console.error('Error downloading file:', error);
        }
      })
      .catch((err) => {
        console.error('Error loading HTML report:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">loading ...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <HtmlPreviewer html={html} editable={true}></HtmlPreviewer>
    </>
  );
};

export default HtmlViewer;
