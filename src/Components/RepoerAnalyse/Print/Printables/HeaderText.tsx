/* eslint-disable @typescript-eslint/no-explicit-any */
interface HeaderTextProps {
  component: any;
}
const HeaderText: React.FC<HeaderTextProps> = ({ component }) => {
  return (
    <div
      className="flex relative justify-between items-center"
      style={{ zIndex: 60, position: 'relative' }}
    >
      <div className="text-lg" style={{ color: '#383838', fontWeight: '600' }}>
        {component.value}
      </div>
      <div className="" style={{ color: '#888888', fontSize: '14px' }}>
        {component.moreInfo}
        {/* Total of {ClientSummaryBoxs.total_subcategory} Biomarkers in{' '}
            {ClientSummaryBoxs.total_category} Categories */}
      </div>
    </div>
  );
};

export default HeaderText;
