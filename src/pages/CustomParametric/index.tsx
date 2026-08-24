import { Check, Network } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  MODEL_CATEGORIES,
  type ModelCategoryKey,
} from './modelCategories';
import ParametricDomainsPanel from './ParametricDomainsPanel';
import RiskDomainsPanel from './RiskDomainsPanel';

const TAB_TO_KEY: Record<string, ModelCategoryKey> = {
  risk: 'risk',
  aging: 'age',
  scoring: 'health',
  biomarkers: 'parametric',
};

const CustomParametric = () => {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const selected: ModelCategoryKey = TAB_TO_KEY[tab || 'risk'] || 'risk';

  return (
    <div
      className="px-3 md:px-4 2xl:px-6 pt-4 pb-8 overflow-auto h-fit"
      style={{
        minHeight:
          window.innerWidth < 720 ? window.innerHeight - 87 + 'px' : '',
      }}
    >
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-[28px] font-bold tracking-tight text-gray-900">
            Intelligence Model
          </h1>
          <p className="text-sm text-Text-Quadruple">
            AI-powered clinical models and health intelligence · 4 categories
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MODEL_CATEGORIES.map((cat) => {
            const isSelected = selected === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => navigate(`/custom-parametric/${cat.tab}`)}
                aria-pressed={isSelected}
                aria-label={cat.name}
                className={`group relative overflow-hidden rounded-xl transition-all duration-200 ${
                  isSelected
                    ? 'ring-2 ring-Primary-DeepTeal shadow-lg shadow-Primary-DeepTeal/15'
                    : 'border border-gray-200/80 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                  <img
                    src={cat.imageSrc}
                    alt={cat.name}
                    className={`absolute inset-0 h-full w-full object-cover transition-all duration-300 ${
                      isSelected
                        ? 'brightness-100'
                        : 'brightness-[0.92] group-hover:brightness-100'
                    }`}
                  />
                  <div
                    className={`absolute inset-0 transition-all duration-200 ${
                      isSelected
                        ? 'bg-gradient-to-t from-Primary-DeepTeal/70 via-Primary-DeepTeal/15 to-transparent'
                        : 'bg-gradient-to-t from-black/60 via-black/10 to-transparent group-hover:from-black/70'
                    }`}
                  />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-left">
                    <p className="text-[15px] font-bold text-white">
                      {cat.name}
                    </p>
                    <p className="mt-0.5 text-[11px] text-white/70">
                      {cat.description}
                    </p>
                  </div>
                </div>
                {isSelected ? (
                  <div className="absolute top-3 right-3 flex size-6 items-center justify-center rounded-full bg-Primary-DeepTeal shadow-sm">
                    <Check className="size-3.5 text-white" strokeWidth={3} />
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>

        {selected === 'risk' ? (
          <RiskDomainsPanel />
        ) : selected === 'parametric' ? (
          <ParametricDomainsPanel />
        ) : (
          <div className="min-h-[400px] rounded-xl border border-gray-200/80 bg-white">
            <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
              <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-Gray-25">
                <Network className="size-6 text-Primary-DeepTeal" />
              </div>
              <h3 className="text-sm font-medium text-Text-Primary">
                {selected === 'age' ? 'Age Clocks' : 'Health Scores'}
              </h3>
              <p className="mt-1 max-w-md text-xs text-Text-Quadruple">
                {selected === 'age'
                  ? 'Biological age estimation models will be configured here'
                  : 'Composite health index models will be configured here'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomParametric;
