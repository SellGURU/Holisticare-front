/* eslint-disable @typescript-eslint/no-explicit-any */
import { lazy, memo, Suspense, useMemo, useState } from 'react';
import BiomarkersApi from '../../api/Biomarkers';
import { MainModal } from '../../Components';
import SpinnerLoader from '../../Components/SpinnerLoader';
import SvgIcon from '../../utils/svgIcon';
import resolveAnalyseIcon from '../../Components/RepoerAnalyse/resolveAnalyseIcon';
import {
  BiomarkerIdentityMeta,
  buildBiomarkerIdentityMeta,
  normalizeBiomarkersList,
  replaceBiomarkerByIdentity,
} from './biomarkerIdentity';

const EditModal = lazy(() => import('./EditModal'));

interface BiomarkerRowProps {
  rowIndex: number;
  biomarkerIndex: number;
  data: any;
  biomarkers: any[];
  changeBiomarkersValue: (values: any) => void;
  searchTerm?: string;
  benchmarkAreaOptions?: string[];
  benchmarkAreaOptionsByType?: Record<string, string[]>;
  biomarkerTypeOptions?: string[];
  formatBiomarkerTypeLabel: (value: string) => string;
  unitMappings?: any[];
  biomarkerMappings?: any[];
  onUnitMappingsLocalChange?: (entries: any[]) => void;
  onBiomarkerMappingsLocalChange?: (entries: any[]) => void;
  onOpenChart: (data: any) => void;
  onOpenMappings: (data: any) => void;
}

const normalize = (value: any) =>
  String(value || '')
    .trim()
    .toLowerCase();

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const highlightText = (text: string, term: string) => {
  const source = String(text || '');
  const tokens = String(term || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(escapeRegExp);

  if (tokens.length === 0) return source;

  const regex = new RegExp(`(${tokens.join('|')})`, 'gi');
  const parts = source.split(regex);

  return parts.map((part, index) =>
    regex.test(part) ? (
      <mark key={`${part}-${index}`} className="rounded bg-yellow-100 px-0.5">
        {part}
      </mark>
    ) : (
      part
    ),
  );
};

const BiomarkerRow = ({
  rowIndex,
  biomarkerIndex,
  data,
  biomarkers,
  changeBiomarkersValue,
  searchTerm = '',
  benchmarkAreaOptions = [],
  benchmarkAreaOptionsByType = {},
  biomarkerTypeOptions = [],
  formatBiomarkerTypeLabel,
  unitMappings = [],
  biomarkerMappings = [],
  onUnitMappingsLocalChange,
  onBiomarkerMappingsLocalChange,
  onOpenChart,
  onOpenMappings,
}: BiomarkerRowProps) => {
  const [activeEdit, setActiveEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState('');

  const biomarkerName = data?.Biomarker || '';
  const relevantUnitMappings = useMemo(
    () =>
      unitMappings.filter(
        (mapping) => normalize(mapping?.biomarker) === normalize(biomarkerName),
      ),
    [unitMappings, biomarkerName],
  );

  const relevantBiomarkerMapping = useMemo(
    () =>
      biomarkerMappings.find(
        (mapping) =>
          normalize(mapping?.standard_name) === normalize(biomarkerName),
      ),
    [biomarkerMappings, biomarkerName],
  );

  const mappingCount =
    relevantUnitMappings.length +
    (relevantBiomarkerMapping?.variations?.length || 0);

  const closeModalEdit = () => {
    setActiveEdit(false);
    setErrorDetails('');
  };

  const identityMeta = useMemo(
    () => buildBiomarkerIdentityMeta(data, biomarkerIndex),
    [data, biomarkerIndex],
  );

  const onsave = (values: any, meta: BiomarkerIdentityMeta) => {
    setLoading(true);
    BiomarkersApi.saveBiomarkersList({
      updated_biomarker: values,
      original_biomarker_name: meta.originalBiomarkerName,
      original_biomarker_index: meta.originalBiomarkerIndex,
      original_biomarker_uid: meta.biomarkerUid,
      original_biomarker_type: meta.originalBiomarkerType,
      original_unit: meta.originalUnit,
      original_benchmark_area: meta.originalBenchmarkArea,
    })
      .then((response) => {
        const payload = response?.data || {};
        const savedBiomarker = payload.updated_biomarker || values;
        closeModalEdit();
        changeBiomarkersValue(
          payload.chart_bounds
            ? normalizeBiomarkersList(payload.chart_bounds)
            : replaceBiomarkerByIdentity(biomarkers, meta, savedBiomarker),
        );
        if (payload.unit_mapping?.biomarker_specific) {
          onUnitMappingsLocalChange?.(payload.unit_mapping.biomarker_specific);
        }
        if (payload.biomarker_mapping?.mappings) {
          onBiomarkerMappingsLocalChange?.(payload.biomarker_mapping.mappings);
        }
      })
      .catch((error) => {
        setErrorDetails(
          error?.response?.data?.detail ||
            error?.detail ||
            error?.message ||
            'Unable to save biomarker changes.',
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <div className="grid min-w-[1000px] grid-cols-[48px_minmax(300px,1.5fr)_minmax(220px,1fr)_110px_90px_92px_128px] items-center gap-3 border-b border-Gray-50 px-3 py-2 text-[11px] transition-colors hover:bg-[#F8FAFA]">
        <div className="text-Text-Secondary">{rowIndex + 1}</div>

        <div className="min-w-0">
          <div className="truncate font-semibold text-Text-Primary">
            {highlightText(biomarkerName, searchTerm)}
          </div>
          {data?.Definition ? (
            <div className="mt-0.5 truncate text-[10px] leading-4 text-Text-Secondary">
              {data.Definition}
            </div>
          ) : null}
        </div>

        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-Gray-50 bg-white">
            <img
              src={resolveAnalyseIcon(data?.['Benchmark areas'] || '')}
              alt=""
              className="h-4 w-4"
            />
          </span>
          <span className="truncate text-Text-Secondary">
            {data?.['Benchmark areas'] || '-'}
          </span>
        </div>

        <div>
          <span className="inline-flex rounded-full bg-[#F4F7F7] px-2 py-1 text-[10px] font-medium text-Text-Secondary">
            {formatBiomarkerTypeLabel(data?.biomarker_type || 'blood')}
          </span>
        </div>

        <div className="truncate font-mono text-[10px] text-Text-Secondary">
          {data?.unit || '-'}
        </div>

        <div>
          <button
            type="button"
            onClick={() => onOpenMappings(data)}
            className="inline-flex items-center gap-1 rounded-full border border-Gray-50 bg-white px-2 py-1 text-[10px] text-Text-Secondary hover:border-Primary-DeepTeal hover:text-Primary-DeepTeal"
          >
            Mappings
            <span className="rounded-full bg-[#F4F7F7] px-1.5 text-[9px]">
              {mappingCount}
            </span>
          </button>
        </div>

        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => onOpenChart(data)}
            className="rounded-full border border-Gray-50 bg-white px-2.5 py-1 text-[10px] font-medium text-Primary-DeepTeal hover:border-Primary-DeepTeal"
          >
            Chart
          </button>
          <button
            type="button"
            onClick={() => setActiveEdit(true)}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-Gray-50 bg-white hover:border-Primary-DeepTeal"
            title="Edit biomarker"
          >
            <SvgIcon color="#005F73" src="./icons/edit-green.svg" />
          </button>
        </div>
      </div>

      <MainModal isOpen={activeEdit} onClose={closeModalEdit}>
        <Suspense
          fallback={
            <div className="flex min-h-[200px] w-[90vw] max-w-[620px] items-center justify-center rounded-[16px] bg-white md:w-[620px]">
              <SpinnerLoader color="#005F73" />
            </div>
          }
        >
          <EditModal
            onCancel={closeModalEdit}
            onSave={(values: any) => onsave(values, identityMeta)}
            data={data}
            benchmarkAreaOptions={benchmarkAreaOptions}
            benchmarkAreaOptionsByType={benchmarkAreaOptionsByType}
            biomarkerTypeOptions={biomarkerTypeOptions}
            loading={loading}
            errorDetails={errorDetails}
            setErrorDetails={setErrorDetails}
          />
        </Suspense>
      </MainModal>
    </>
  );
};

export default memo(BiomarkerRow);
