import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
import type { BusinessFlow, BusinessFlowStep } from '../../../types/llmAdmin';
import {
  actionPlanPipelineNote,
  callLogDeepLink,
  holisticStageCaption,
  orderedFlowSteps,
  orderedHolisticStageSteps,
  pipelineModalTitle,
  resolveCompositeStages,
} from './businessFlowUtils';

export type PipelineModalTarget =
  | { kind: 'composite'; flow: BusinessFlow }
  | { kind: 'atomic'; flow: BusinessFlow };

interface PipelineFlowModalProps {
  open: boolean;
  target: PipelineModalTarget | null;
  allFlows: BusinessFlow[];
  onClose: () => void;
}

const StepChip = ({
  step,
  flowId,
  dimmed,
}: {
  step: BusinessFlowStep;
  flowId: string;
  dimmed?: boolean;
}) => {
  const isLog = (step.kind || 'llm').toLowerCase() === 'log_event';
  return (
    <div
      className={`min-w-[140px] max-w-[200px] rounded-xl border px-3 py-2 ${
        dimmed
          ? 'border-Gray-50 bg-slate-50 opacity-70'
          : 'border-Gray-50 bg-white'
      }`}
    >
      <div className="text-[11px] font-medium text-Text-Primary">
        {step.step_id}
      </div>
      <div className="mt-0.5 font-mono text-[10px] text-Text-Secondary break-all">
        {step.key}
      </div>
      <div className="mt-1 flex flex-wrap gap-1">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] ${
            isLog ? 'bg-slate-100 text-slate-600' : 'bg-teal-50 text-teal-700'
          }`}
        >
          {step.kind || 'llm'}
        </span>
        {step.order != null ? (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
            order {step.order}
          </span>
        ) : null}
      </div>
      {!isLog ? (
        <Link
          to={callLogDeepLink(flowId, step.key)}
          className="mt-1 inline-block text-[10px] text-Primary-DeepTeal hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          View logs
        </Link>
      ) : null}
    </div>
  );
};

const PipelineFlowModal = ({
  open,
  target,
  allFlows,
  onClose,
}: PipelineFlowModalProps) => {
  const [expandedStage, setExpandedStage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setExpandedStage(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, target, onClose]);

  const isHolisticComposite =
    target?.kind === 'composite' && target.flow.flow_id === 'holistic_plan';

  const compositeStages = useMemo(() => {
    if (!target || target.kind !== 'composite') return [];
    return resolveCompositeStages(target.flow, allFlows);
  }, [target, allFlows]);

  const atomicSteps = useMemo(() => {
    if (!target || target.kind !== 'atomic') return [];
    return orderedFlowSteps(target.flow);
  }, [target]);

  const actionPlanNote = useMemo(() => {
    if (!target || target.kind !== 'atomic') return null;
    return actionPlanPipelineNote(target.flow);
  }, [target]);

  if (!open || !target) return null;

  const title = pipelineModalTitle(target.kind, target.flow);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-Gray-50 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-Text-Primary">
              {title}
            </h2>
            {target.kind === 'composite' ? (
              <p className="mt-1 text-[11px] text-Text-Secondary">
                {isHolisticComposite
                  ? 'Three separately triggered stages — not one linear run. Expand a stage to see its keys.'
                  : 'Composite pipeline — stages are atomic flows shown read-only.'}
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-Text-Secondary">
                Steps run in order for this flow (
                {target.flow.execution_mode || 'sequential'}).
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-Text-Secondary hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-5">
          {target.kind === 'composite' ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {compositeStages.map(({ childId, child }, index) => {
                  const label = isHolisticComposite
                    ? holisticStageCaption(childId, child)
                    : child?.label || childId;
                  const expanded = expandedStage === childId;
                  return (
                    <div key={childId} className="flex items-center gap-2">
                      {index > 0 ? (
                        <span className="text-Text-Secondary" aria-hidden>
                          →
                        </span>
                      ) : null}
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedStage(expanded ? null : childId)
                        }
                        className={`flex max-w-[280px] items-center gap-1.5 rounded-xl border px-3 py-2 text-left text-[12px] font-medium transition ${
                          expanded
                            ? 'border-Primary-DeepTeal bg-teal-50 text-Primary-DeepTeal'
                            : 'border-Gray-50 bg-[#F8FAFB] text-Text-Primary hover:border-Primary-DeepTeal/40'
                        }`}
                      >
                        {expanded ? (
                          <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                        )}
                        <span>{label}</span>
                      </button>
                    </div>
                  );
                })}
              </div>

              {compositeStages.map(({ childId, child }) => {
                if (expandedStage !== childId || !child) return null;
                const steps = isHolisticComposite
                  ? orderedHolisticStageSteps(childId, child)
                  : orderedFlowSteps(child);
                return (
                  <div
                    key={`expand-${childId}`}
                    className="rounded-[14px] border border-Gray-50 bg-[#F8FAFB] p-3"
                  >
                    <div className="mb-2 text-[11px] font-medium text-Text-Primary">
                      {isHolisticComposite
                        ? holisticStageCaption(childId, child)
                        : child.label || child.flow_id}{' '}
                      — keys
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {steps.map((step) => (
                        <StepChip
                          key={`${childId}-${step.step_id}`}
                          step={step}
                          flowId={childId}
                          dimmed={
                            (step.kind || 'llm').toLowerCase() === 'log_event'
                          }
                        />
                      ))}
                      {!steps.length ? (
                        <p className="text-[11px] text-Text-Secondary">
                          No catalog LLM keys for this stage.
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })}

              {isHolisticComposite ? (
                <div className="rounded-[12px] border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] text-slate-700">
                  Stages are label-level composite_of only. Compile runs via
                  run_pipeline_v2; Scoring via Rescore / lab-import;
                  Intervention via practitioner Finish.
                </div>
              ) : (
                <div className="inline-block rounded-full bg-slate-100 px-3 py-1.5 text-[11px] text-slate-700">
                  Composite of:{' '}
                  {compositeStages
                    .map(({ child, childId }) => child?.label || childId)
                    .join(', ') || '—'}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {atomicSteps.map((step, index) => {
                  const isLog =
                    (step.kind || 'llm').toLowerCase() === 'log_event';
                  return (
                    <div key={step.step_id} className="flex items-center gap-2">
                      {index > 0 ? (
                        <span className="text-Text-Secondary" aria-hidden>
                          →
                        </span>
                      ) : null}
                      <StepChip
                        step={step}
                        flowId={target.flow.flow_id}
                        dimmed={isLog}
                      />
                    </div>
                  );
                })}
                {!atomicSteps.length ? (
                  <p className="text-[12px] text-Text-Secondary">
                    No steps defined for this flow.
                  </p>
                ) : null}
              </div>
              {actionPlanNote ? (
                <div className="rounded-[12px] border border-amber-100 bg-amber-50/80 px-3 py-2 text-[11px] text-amber-900">
                  {actionPlanNote}
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-Gray-50 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-Primary-DeepTeal px-4 py-2 text-[12px] font-medium text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PipelineFlowModal;
