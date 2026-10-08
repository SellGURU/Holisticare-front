import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Application from '../../api/app';
import PublicReport from '../../api/publicReport';
import { getTokenFromLocalStorage } from '../../store/token';
import { showError, showSuccess } from '../../Components/GlobalToast';
import HtmlPreviewer from '../../Components/HtmlPreviewer';
import { rewriteHolisticPlanResourceLinks } from '../../utils/patientResourceLinks';
import {
  sanitizeWellnessReportDisclaimer,
  wrapHeroTitleWithBrand,
} from '../../utils/reportDisclaimerSanitize';
import {
  downloadPdfBlob,
  pdfBlobFromResponseData,
  readBlobErrorDetail,
  shouldShowHtmlReportDownload,
} from '../../utils/htmlReportDownload';

const prepareReportHtmlForDisplay = (raw: string, publicView: boolean) => {
  const cleaned = wrapHeroTitleWithBrand(sanitizeWellnessReportDisclaimer(raw));
  return publicView ? rewriteHolisticPlanResourceLinks(cleaned) : cleaned;
};

const HtmlViewer = () => {
  const { id } = useParams<{ id: string }>();
  const [html, setHtml] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isPublicView, setIsPublicView] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
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
          const raw = res.data ?? '';
          setHtml(prepareReportHtmlForDisplay(raw, true));
          setIsPublicView(true);
        })
        .catch(() => setError('This report is not available.'))
        .finally(() => setLoading(false));
      return;
    }

    // Logged in: try auth endpoint first, then fallback to public (whitelist)
    Application.getHtmlReport(reportId)
      .then((res) => {
        setHtml(prepareReportHtmlForDisplay(res.data ?? '', false));
        setIsPublicView(false);
        setLoading(false);
      })
      .catch(() => {
        PublicReport.getReportHtml(reportId)
          .then((res) => {
            const raw = res.data ?? '';
            setHtml(prepareReportHtmlForDisplay(raw, true));
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

  const handleDownloadHtmlReport = async () => {
    if (!shouldShowHtmlReportDownload(isPublicView) || !id || downloading) {
      return;
    }
    setDownloading(true);
    try {
      let blob: Blob | null = null;
      try {
        const res = await Application.getHtmlReportPdf(id);
        blob = await pdfBlobFromResponseData(res.data);
      } catch (primaryErr) {
        const fallback = await Application.getPdfReport(id);
        const pdfUrl = fallback?.data?.pdf_url;
        if (!pdfUrl || typeof pdfUrl !== 'string') {
          throw primaryErr;
        }
        const file = await fetch(pdfUrl);
        if (!file.ok) {
          throw primaryErr;
        }
        blob = await pdfBlobFromResponseData(await file.blob());
      }
      downloadPdfBlob(blob);
    } catch (err) {
      console.error('Error downloading HTML report PDF:', err);
      const detail = await readBlobErrorDetail(err);
      showError('Download failed', detail || 'Could not download the report.');
    } finally {
      setDownloading(false);
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
      onDownload={
        shouldShowHtmlReportDownload(isPublicView)
          ? handleDownloadHtmlReport
          : undefined
      }
      downloading={downloading}
    />
  );
};

export default HtmlViewer;
