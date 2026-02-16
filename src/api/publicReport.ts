/**
 * Public HTML report - no authentication.
 * Used for /html-previewer/:id when the client is in the whitelist (JSON file).
 */
import axios from 'axios';
import { resolveBaseEndPoint } from './base';

const baseUrl = resolveBaseEndPoint();

export function getPublicReportHtml(shareSlug: string) {
  return axios.get(`${baseUrl}/public/report/${encodeURIComponent(shareSlug)}/html`, {
    responseType: 'text',
    headers: { Accept: 'text/html' },
  });
}
