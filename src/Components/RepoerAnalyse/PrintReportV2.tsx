/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import CoverPage from './Print/CoverPage';
import TableOfContent from './Print/TableOfContent';
import { subscribe } from '../../utils/event';
import PagePrintHandler from './Print/PagePrintHandler';

interface PrintReportV2Props {
  usrInfoData: any;
  ClientSummaryBoxs: any;
}

const PrintReportV2: React.FC<PrintReportV2Props> = ({
  usrInfoData,
  ClientSummaryBoxs,
}) => {
  const [printOptins, setPrintOptions] = useState([
    {
      name: 'Client Summary',
      checked: true,
    },
    {
      name: 'Needs Focus Biomarker',
      checked: true,
    },
    {
      name: 'Detailed Analysis',
      checked: true,
    },
    {
      name: 'Holistic Plan',
      checked: true,
    },
    {
      name: 'Action Plan',
      checked: true,
    },
  ]);
  const isActiveSection = (section: string) => {
    return printOptins.filter((el) => el.name === section)[0].checked;
  };
  subscribe('downloadCalled', (data: any) => {
    setPrintOptions(data.detail);
  });
  const pageJson = [
    {
      renderBoxs: [
        {
          type: 'Header',
          height: 16,
          content: {
            value: 'Client Summary',
            moreInfo: 'Total of 117 Biomarkers in 8 Categories',
          },
        },
        {
          type: 'UserInfo',
          height: 16,
          content: { ...usrInfoData },
        },
        {
          type: 'information',
          height: 16,
          content: ClientSummaryBoxs?.client_summary,
        },
        {
          type: 'legend',
          height: 16,
          content: null,
        },
      ],
    },
  ];
  return (
    <div style={{ backgroundColor: '#E9F0F2' }}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media print {
            
            .print-header{
              display: none;
            }
            
            /* Hide header/footer on first page */
            body > div > div:first-of-type .print-header,
            body > div > div:nth-of-type(2) .print-header {
              display: none !important;
            }
            
            /* Show header/footer on all other pages */
            body > div > div:not(:first-of-type):not(:nth-of-type(2)) .print-header {
              display: block !important;
              position: fixed;
              width: 100%;
            }
            
            .print-header {
              top: 0;
              left:0;
            }
            .print-headerImage {
              top: 0;
              right:0;
              display: block !important;
              position: absolute;
              width: 100%;              
            }            
            .print-footer {
              bottom: 0;
              left:0;
              position:'absolute !important'
            }
            
            /* Add padding to content to accommodate header/footer */
            body > div > div:not(:first-of-type):not(:nth-of-type(2)) {
              padding-top: 60px !important;
              padding-bottom: 40px !important;
            }
            
            /* Ensure links are clickable in PDF */
            a {
              color: #005F73 !important;
              text-decoration: none !important;
              cursor: pointer !important;
            }
            
            /* Ensure section IDs are properly targeted */
            [id] {
              scroll-margin-top: 20px;
            }
          }
        `,
        }}
      />
      <CoverPage />
      <TableOfContent isActiveSection={isActiveSection} />
      {pageJson.map((page: any) => {
        return (
          <>
            <PagePrintHandler page={page} />
          </>
        );
      })}
    </div>
  );
};

export default PrintReportV2;
