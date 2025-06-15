interface DetailedAnalyseDescriptionProps {
  description: string;
}
const DetailedAnalyseDescription: React.FC<DetailedAnalyseDescriptionProps> = ({
  description,
}) => {
  return (
    <>
      <div className="text-sm bg-white pb-3 px-4 " style={{ color: '#383838' }}>
        Description
      </div>
      <div className="text-sm bg-white pb-3 px-4" style={{ color: '#888888' }}>
        {description}
      </div>
    </>
  );
};

export default DetailedAnalyseDescription;
