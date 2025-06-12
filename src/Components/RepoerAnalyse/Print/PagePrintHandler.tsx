import ComponentsHandler from "./Printables/ComponentsHandler";
import PrintHeader from "./PrintHeader";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface PagePrintHandlerProps {
  page: any;
}

const PagePrintHandler: React.FC<PagePrintHandlerProps> = ({page}) => {
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
        <PrintHeader usrInfoData={{name:'test'}} />
        <div className="mt-4"></div>
        <div style={{zIndex:60,position:'relative'}}>
          {page.renderBoxs.map((el:any) => {
            return (
              <>
                <ComponentsHandler component={el}></ComponentsHandler>
              </>
            )
          })}
        </div>
      </div>    
    </>
  );
};

export default PagePrintHandler;
