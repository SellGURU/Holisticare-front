import BioMarkerRowSuggestions from '../bioMarkerRowSuggestions';
import BioMarkerRowSuggestionsCheckIn from './bioMarkerRowSuggestionsCheckIn';
import { TaskValidationError } from '../actionPlanValidation';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface ActionCardProps {
  data: any;
  onRemove: () => void;
  setActions: (data: any) => void;
  index: number;
  checkIn?: boolean;
  checkValid: boolean;
  taskKey: string;
  validationErrors?: TaskValidationError[];
  onClearTaskValidation?: (task: any) => void;
  // conflicts?: string[];
}
const ActionCard: React.FC<ActionCardProps> = ({
  data,
  onRemove,
  setActions,
  index,
  checkIn,
  checkValid,
  taskKey,
  validationErrors,
  onClearTaskValidation,
  // conflicts,
}) => {
  return (
    <>
      {!checkIn ? (
        <BioMarkerRowSuggestions
          index={index}
          checkValid={checkValid}
          value={data}
          taskKey={taskKey}
          validationErrors={validationErrors}
          onClearTaskValidation={onClearTaskValidation}
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
          taskKey={taskKey}
          validationErrors={validationErrors}
          onClearTaskValidation={onClearTaskValidation}
          setValues={setActions}
        />
      )}
    </>
  );
};

export default ActionCard;
