import BioMarkerRowSuggestions from '../bioMarkerRowSuggestions';
import BioMarkerRowSuggestionsCheckIn from './bioMarkerRowSuggestionsCheckIn';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface ActionCardProps {
  data: any;
  onRemove: () => void;
  setActions: (data: any) => void;
  index: number;
  checkIn?: boolean;
  // conflicts?: string[];
}
const ActionCard: React.FC<ActionCardProps> = ({
  data,
  onRemove,
  setActions,
  index,
  checkIn,
  // conflicts,
}) => {
  return (
    <>
      {!checkIn ? (
        <BioMarkerRowSuggestions
          index={index}
          value={data}
          // isInvalid={conflicts ? conflicts.includes(data.Category) : false}
          onRemove={onRemove}
          setValues={setActions}
        />
      ) : (
        <BioMarkerRowSuggestionsCheckIn
          index={index}
          value={data}
          onRemove={onRemove}
          setValues={setActions}
        />
      )}
    </>
  );
};

export default ActionCard;
