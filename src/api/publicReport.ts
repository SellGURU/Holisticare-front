import Api from './api';

class PublicReport extends Api {
  static getReportHtml(shareSlug: string) {
    return this.get(`/public/report/${encodeURIComponent(shareSlug)}/html`, {
      noAuth: true,
      responseType: 'text',
      headers: { Accept: 'text/html' },
    });
  }
}

export default PublicReport;
