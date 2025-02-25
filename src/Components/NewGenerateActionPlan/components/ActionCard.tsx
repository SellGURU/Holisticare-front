import BioMarkerRowSuggestions from '../bioMarkerRowSuggestions';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface ActionCardProps {
  data: any;
  onRemove: () => void;
}
const ActionCard: React.FC<ActionCardProps> = ({ data, onRemove }) => {
  return (
    <>
      <BioMarkerRowSuggestions
        category={data.Category}
        index={0}
        value={data}
        onRemove={onRemove}
      ></BioMarkerRowSuggestions>
    </>
  );
};

export default ActionCard;
