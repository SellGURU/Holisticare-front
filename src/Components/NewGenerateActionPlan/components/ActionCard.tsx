import BioMarkerRowSuggestions from '../bioMarkerRowSuggestions';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface ActionCardProps {
  data: any;
}
const ActionCard: React.FC<ActionCardProps> = ({ data }) => {
  return (
    <>
      <BioMarkerRowSuggestions
        category={data.Category}
        index={0}
        value={data}
      ></BioMarkerRowSuggestions>
    </>
  );
};

export default ActionCard;
