/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import CoverPage from './Print/CoverPage';
import TableOfContent from './Print/TableOfContent';
import { subscribe } from '../../utils/event';
import PagePrintHandler from './Print/PagePrintHandler';
import resolveJson from './Print/Printables/ResolveJson';
interface PrintReportV2Props {
  usrInfoData: any;
  ClientSummaryBoxs: any;
  resolveCategories: () => Array<any>;
  referenceData: any;
  resolveBioMarkers: () => Array<any>;
  ResolveConceringData: () => Array<any>;
}

const PrintReportV2: React.FC<PrintReportV2Props> = ({
  usrInfoData,
  ClientSummaryBoxs,
  resolveCategories,
  referenceData,
  resolveBioMarkers,
  ResolveConceringData,
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
  let pageNumber = 0;
  const resolvePageNumber = () => {
    pageNumber++;
    return pageNumber;
  };
  const isActiveSection = (section: string) => {
    return printOptins.filter((el) => el.name === section)[0].checked;
  };
  subscribe('downloadCalled', (data: any) => {
    setPrintOptions(data.detail);
  });
  const transformConceringData = () => {
    const originalData = ResolveConceringData();
    return originalData.flatMap((item) =>
      item.biomarkers.map((biomarker: any) => ({
        name: biomarker.name,
        Result: biomarker.Result,
        Units: biomarker.Units,
        'Lab Ref Range': biomarker['Lab Ref Range'],
        Baseline: biomarker.Baseline,
        'Optimal Range': biomarker['Optimal Range'],
        Changes: biomarker.Changes,
        subcategory: item.subcategory,
      })),
    );
  };
  // const pageJson = [
  //   {
  //     renderBoxs: [
  //       {
  //         type: 'Header',
  //         height: 16,
  //         content: {
  //           value: 'Client Summary',
  //           moreInfo: 'Total of 117 Biomarkers in 8 Categories',
  //         },
  //       },
  //       {
  //         type: 'UserInfo',
  //         height: 16,
  //         content: { ...usrInfoData },
  //       },
  //       {
  //         type: 'information',
  //         height: 16,
  //         content: ClientSummaryBoxs?.client_summary,
  //       },
  //       {
  //         type: 'legend',
  //         height: 16,
  //         content: null,
  //       },
  //     ],
  //   },
  // ];

  const [pageJson, setPageJson] = useState<Array<any>>([]);
  useEffect(() => {
    setPageJson(
      resolveJson({
        usrInfoData,
        ClientSummaryBoxs,
        resolveCategories,
        referenceData,
        resolveBioMarkers,
        transformConceringData,
      }),
    );
  }, []);
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
            <PagePrintHandler pageNumber={resolvePageNumber()} page={page} />
          </>
        );
      })}
    </div>
  );
};

export default PrintReportV2;
