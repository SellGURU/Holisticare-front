import BioMarkerRowSuggestions from '../bioMarkerRowSuggestions';
import BioMarkerRowSuggestionsCheckIn from './bioMarkerRowSuggestionsCheckIn';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface ActionCardProps {
  data: any;
  onRemove: () => void;
  setActions: (data: any) => void;
  index: number;
  checkIn?: boolean;
  checkValid: boolean;
  // conflicts?: string[];
}
const ActionCard: React.FC<ActionCardProps> = ({
  data,
  onRemove,
  setActions,
  index,
  checkIn,
  checkValid,
  // conflicts,
}) => {
  return (
    <>
      {!checkIn ? (
        <BioMarkerRowSuggestions
          index={index}
          checkValid={checkValid}
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
          checkValid={checkValid}
          setValues={setActions}
        />
      )}
    </>
  );
};

export default ActionCard;
