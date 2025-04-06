import BioMarkerRowSuggestions from '../bioMarkerRowSuggestions';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface ActionCardProps {
  data: any;
  onRemove: () => void;
  setActions: (data: any) => void;
  index: number;
}
const ActionCard: React.FC<ActionCardProps> = ({
  data,
  onRemove,
  setActions,
  index,
}) => {
  return (
    <>
      <BioMarkerRowSuggestions
        index={index}
        value={data}
        onRemove={onRemove}
        setValues={setActions}
      />
    </>
  );
};

export default ActionCard;
