interface TableOfContentProps {
  isActiveSection: (section: string) => boolean;
}
const TableOfContent = ({ isActiveSection }: TableOfContentProps) => {
  let sectionCounter = 0;
  const getNextSectionNumber = () => {
    sectionCounter++;
    return sectionCounter.toString().padStart(2, '0');
  };
  return (
    <div
      id="table-of-contents"
      className=" w-full relative min-h-full"
      style={{
        pageBreakAfter: 'always',
        height: '100vh',
        overflow: 'hidden',
        zIndex: 1000000,
        backgroundColor: '#005F73',
      }}
    >
      <div
        className="ml-14 mt-32 text-white font-medium"
        style={{ fontSize: '40px' }}
      >
        Table of Content
      </div>
      <div
        className="mt-16 pt-16"
        style={{
          backgroundColor: '#005F73',
          height: '100vh',
          width: '90%',
          marginRight: '146px',
          backgroundImage: "url('/images/bg-report-page-two.png')",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'top right',
          backgroundSize: '100%',
        }}
      >
        <div
          className="px-12 py-20"
          style={{
            backgroundColor: '#F7F7F7',
            height: '100vh',
            width: '92%',
            marginRight: '146px',
            backgroundImage: "url('/images/bg-report-page-two.png')",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'top right',
            backgroundSize: '100%',
          }}
        >
          {isActiveSection('Client Summary') && (
            <>
              <div className="flex justify-start gap-4 items-center">
                <img
                  src="/icons/icon-list-report.svg"
                  alt=""
                  style={{ marginRight: '-8px' }}
                />
                <div
                  className="text-xl"
                  style={{ color: '#005F73', fontWeight: '500' }}
                >
                  Section {getNextSectionNumber()}
                </div>
                <a
                  href="#client-summary"
                  className="text-xl cursor-pointer hover:underline"
                  style={{ color: '#383838', fontWeight: '500' }}
                >
                  Client Summary
                </a>
              </div>
            </>
          )}
          {isActiveSection('Needs Focus Biomarker') && (
            <>
              <div className="flex justify-start gap-4 mt-6 items-center">
                <img
                  src="/icons/icon-list-report.svg"
                  alt=""
                  style={{ marginRight: '-8px' }}
                />
                <div
                  className="text-xl"
                  style={{ color: '#005F73', fontWeight: '500' }}
                >
                  Section {getNextSectionNumber()}
                </div>
                <a
                  href="#needs-focus-biomarkers"
                  className="text-xl cursor-pointer hover:underline"
                  style={{ color: '#383838', fontWeight: '500' }}
                >
                  Needs Focus Biomarkers
                </a>
              </div>
            </>
          )}
          {isActiveSection('Concerning Result') && (
            <>
              <div className="flex justify-start gap-4 mt-6 items-center">
                <img
                  src="/icons/icon-list-report.svg"
                  alt=""
                  style={{ marginRight: '-8px' }}
                />
                <div
                  className="text-xl"
                  style={{ color: '#005F73', fontWeight: '500' }}
                >
                  Section {getNextSectionNumber()}
                </div>
                <a
                  href="#concerning-result"
                  className="text-xl cursor-pointer hover:underline"
                  style={{ color: '#383838', fontWeight: '500' }}
                >
                  Concerning Result
                </a>
              </div>
            </>
          )}
          {isActiveSection('Detailed Analysis') && (
            <>
              <div className="flex justify-start gap-4 mt-6 items-center">
                <img
                  src="/icons/icon-list-report.svg"
                  alt=""
                  style={{ marginRight: '-8px' }}
                />
                <div
                  className="text-xl"
                  style={{ color: '#005F73', fontWeight: '500' }}
                >
                  Section {getNextSectionNumber()}
                </div>
                <a
                  href="#detailed-analysis"
                  className="text-xl cursor-pointer hover:underline"
                  style={{ color: '#383838', fontWeight: '500' }}
                >
                  Detailed Analysis
                </a>
              </div>
            </>
          )}
          {isActiveSection('Holistic Plan') && (
            <div className="flex justify-start gap-4 mt-6 items-center">
              <img
                src="/icons/icon-list-report.svg"
                alt=""
                style={{ marginRight: '-8px' }}
              />
              <div
                className="text-xl"
                style={{ color: '#005F73', fontWeight: '500' }}
              >
                Section {getNextSectionNumber()}
              </div>
              <a
                href="#holistic-plan"
                className="text-xl cursor-pointer hover:underline"
                style={{ color: '#383838', fontWeight: '500' }}
              >
                Holistic Plan
              </a>
            </div>
          )}
          {isActiveSection('Action Plan') && (
            <div className="flex justify-start gap-4 mt-6 items-center">
              <img
                src="/icons/icon-list-report.svg"
                alt=""
                style={{ marginRight: '-8px' }}
              />
              <div
                className="text-xl"
                style={{ color: '#005F73', fontWeight: '500' }}
              >
                Section {getNextSectionNumber()}
              </div>
              <a
                href="#action-plan"
                className="text-xl cursor-pointer hover:underline"
                style={{ color: '#383838', fontWeight: '500' }}
              >
                Action Plan
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableOfContent;
