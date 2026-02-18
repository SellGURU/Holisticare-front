/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Application from '../../api/app';

import PublicReport from '../../api/publicReport';

import { getTokenFromLocalStorage } from '../../store/token';
import { showSuccess } from '../../Components/GlobalToast';
import HtmlPreviewer from '../../Components/HtmlPreviewer';

const HtmlViewer = () => {
  const { id } = useParams<{ id: string }>();
  const [html, setHtml] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isPublicView, setIsPublicView] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleGetHtmlReport = (reportId: string) => {
    if (!reportId) return;
    setLoading(true);
    setError(null);

    const token = getTokenFromLocalStorage();
    // When there's no token, skip auth request to avoid 401 → global interceptor reload loop
    if (!token || !token.trim()) {
      PublicReport.getReportHtml(reportId)
        .then((res) => {
          setHtml(res.data ?? '');
          setIsPublicView(true);
        })
        .catch(() => setError('This report is not available.'))
        .finally(() => setLoading(false));
      return;
    }

    // Logged in: try auth endpoint first, then fallback to public (whitelist)
    Application.getHtmlReport(reportId)
      .then((res) => {
        setHtml(res.data ?? '');
        setIsPublicView(false);
        setLoading(false);
      })
      .catch(() => {
        PublicReport.getReportHtml(reportId)

          .then((res) => {
            setHtml(res.data ?? '');
            setIsPublicView(true);
          })
          .catch(() => setError('This report is not available.'))
          .finally(() => setLoading(false));
      });
  };

  useEffect(() => {
    handleGetHtmlReport(id?.toString() || '');
  }, [id]);

  const handleUpdateHtmlReport = async (html: string) => {
    if (isPublicView) return; // read-only for public links
    setLoading(true);
    try {
      await Application.updateHtmlReport({ member_id: id, html_report: html });
      setHtml(html);
      showSuccess('Your changes have been saved successfully.');
      setTimeout(() => {
        navigate(-1);
      }, 4000);
    } catch (err) {
      console.error('Error updating HTML report:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">loading ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center max-w-md px-4">
          <p className="text-gray-700 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <HtmlPreviewer
      html={html}
      editable={!isPublicView}
      onSave={handleUpdateHtmlReport}
    />
  );
};

export default HtmlViewer;
