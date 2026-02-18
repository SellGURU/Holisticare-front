/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Edit2, Eye, Copy, Trash2 } from 'lucide-react';

interface RiskDomainCardProps {
  domain: any;
  onEdit: () => void;
  onPreview: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const OUTPUT_TYPE_LABEL: Record<string, string> = {
  NUMERIC: 'Numeric (0–100)',
  BOOLEAN: 'Boolean',
  CATEGORICAL: 'Categorical',
};

export default function RiskDomainCard({
  domain,
  onEdit,
  onPreview,
  onDuplicate,
  onDelete,
}: RiskDomainCardProps) {
  const [showActions, setShowActions] = useState(false);
  const icon = domain.icon || '🫀';
  const name = domain.display_name || domain.name || 'Unnamed';
  const category = domain.category || '';
  const outputType = domain.output_type || 'NUMERIC';
  const biomarkerCount = domain.biomarker_count ?? 0;
  const isEnabled = domain.is_enabled !== false;

  return (
    <div
      className="border border-Gray-50 rounded-2xl bg-backgroundColor-Card shadow-100 p-4 hover:shadow-200 transition-all relative group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 min-w-0">
          <span className="text-xl shrink-0" role="img" aria-hidden>
            {icon}
          </span>
          <div className="min-w-0">
            <h3 className="font-medium text-Text-Primary truncate">{name}</h3>
            {category && (
              <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded bg-Gray-50 text-Text-Quadruple">
                {category}
              </span>
            )}
            {domain.description && (
              <p className="text-xs text-Text-Quadruple mt-1 line-clamp-2">
                {domain.description}
              </p>
            )}
          </div>
        </div>
        <span
          className={`shrink-0 text-xs px-2 py-0.5 rounded ${
            isEnabled
              ? 'bg-[#DEF7EC] text-Primary-DeepTeal'
              : 'bg-Gray-50 text-Text-Quadruple'
          }`}
        >
          {isEnabled ? 'Enabled' : 'Disabled'}
        </span>
      </div>

      <div className="mt-3 text-xs text-Text-Quadruple">
        {OUTPUT_TYPE_LABEL[outputType] || outputType} · {biomarkerCount}{' '}
        biomarker{biomarkerCount !== 1 ? 's' : ''} used
      </div>

      {showActions && (
        <div className="absolute top-2 right-2 flex gap-1 bg-backgroundColor-Card rounded-xl border border-Gray-50 p-1 shadow-100">
          <button
            type="button"
            onClick={onEdit}
            className="p-1.5 rounded hover:bg-Gray-50 text-Gray-60 hover:text-Text-Primary"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onPreview}
            className="p-1.5 rounded hover:bg-Gray-50 text-Gray-60 hover:text-Text-Primary"
            title="Preview"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            className="p-1.5 rounded hover:bg-Gray-50 text-Gray-60 hover:text-Text-Primary"
            title="Duplicate"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 rounded hover:bg-red-50 text-red-600 hover:text-red-700"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
