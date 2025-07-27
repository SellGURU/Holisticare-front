import ComponentsHandler from './Printables/ComponentsHandler';
import PrintFooter from './PrintFooter';
import PrintHeader from './PrintHeader';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface PagePrintHandlerProps {
  page: any;
  pageNumber: number;
  usrInfoData: any;
}

const PagePrintHandler: React.FC<PagePrintHandlerProps> = ({
  page,
  pageNumber,
  usrInfoData,
}) => {
  // console.log(page);

  return (
    <>
      <div
        className=""
        style={{
          backgroundColor: '#E9F0F2',
          minHeight: '100vh',
          position: 'relative',
          padding: '24px 24px',
        }}
      >
        <PrintHeader usrInfoData={{ name: usrInfoData?.name }} />
        <div className="mt-4"></div>
        <div style={{ zIndex: 60, position: 'relative' }}>
          {page.renderBoxs.map((el: any) => {
            return (
              <>
                <ComponentsHandler component={el}></ComponentsHandler>
              </>
            );
          })}
        </div>
        <PrintFooter pageNumber={pageNumber}></PrintFooter>
      </div>
    </>
  );
};

export default PagePrintHandler;
