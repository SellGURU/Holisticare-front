import { FC, ReactNode } from 'react';
import { FaSort } from 'react-icons/fa';
import {
  isLibrarySortColumn,
  isLibrarySortDesc,
  toggleLibrarySort,
} from '../../../utils/libraryTableSort';

interface SortableThProps {
  label: ReactNode;
  column: string | null;
  sortId: string;
  onChangeSort: (sortId: string) => void;
  className?: string;
  innerClassName?: string;
}

const SortableTh: FC<SortableThProps> = ({
  label,
  column,
  sortId,
  onChangeSort,
  className = '',
  innerClassName = '',
}) => {
  const active = column ? isLibrarySortColumn(sortId, column) : false;
  const desc = isLibrarySortDesc(sortId);

  const thClass =
    className ||
    'px-3 pt-4 pb-3.5 text-xs font-medium w-[100px] md:w-[unset]';

  return (
    <th
      className={`${thClass} ${column ? 'cursor-pointer' : ''}`}
      onClick={() => {
        if (!column) return;
        onChangeSort(toggleLibrarySort(sortId, column));
      }}
    >
      <div className={`flex items-center ${innerClassName}`}>
        <div className="flex items-center justify-center text-nowrap gap-1">
          {label}
          {column && !active && <FaSort className="cursor-pointer" />}
          {column && active && !desc && ' 🔼'}
          {column && active && desc && ' 🔽'}
        </div>
      </div>
    </th>
  );
};

export default SortableTh;
