import { Link } from 'react-router-dom';
import { ArrowRightLeft, GitBranch, Layers } from 'lucide-react';
import type {
  BusinessFlow,
  BusinessFlowStep,
  FlowTabId,
} from '../../../types/llmAdmin';
import { callLogDeepLink, type FlowTab } from './businessFlowUtils';

interface FlowTabsNavProps {
  tabs: FlowTab[];
  activeTab: FlowTabId;
  onTabChange: (tabId: FlowTabId) => void;
  activeFlow?: BusinessFlow | null;
  allFlows?: BusinessFlow[];
}

const modeIcon = (mode?: string) => {
  if (mode === 'parallel' || mode === 'composite') return Layers;
  if (mode === 'conditional') return ArrowRightLeft;
  return GitBranch;
};

const StepRow = ({
  step,
  flowId,
}: {
  step: BusinessFlowStep;
  flowId: string;
}) => {
  const isLog = (step.kind || 'llm').toLowerCase() === 'log_event';
  return (
    <li className="rounded-xl border border-Gray-50 bg-white px-3 py-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-medium text-Text-Primary">
          {step.step_id}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] ${
            isLog ? 'bg-slate-100 text-slate-600' : 'bg-teal-50 text-teal-700'
          }`}
        >
          {step.kind || 'llm'}
        </span>
        {step.conditional ? (
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] text-amber-700">
            conditional: {step.conditional}
          </span>
        ) : null}
        {step.parallel_fanout ? (
          <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] text-indigo-700">
            fan-out: {step.parallel_fanout}
          </span>
        ) : null}
        {step.async_background ? (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
            async
          </span>
        ) : null}
      </div>
      <div className="mt-1 font-mono text-[10px] text-Text-Secondary">
        {step.key}
      </div>
      {!isLog ? (
        <Link
          to={callLogDeepLink(flowId, step.key)}
          className="mt-1 inline-block text-[10px] text-Primary-DeepTeal hover:underline"
        >
          View logs
        </Link>
      ) : null}
    </li>
  );
};

const FlowTabsNav = ({
  tabs,
  activeTab,
  onTabChange,
  activeFlow,
  allFlows = [],
}: FlowTabsNavProps) => (
  <div className="space-y-3">
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const active = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`rounded-full px-3 py-1.5 text-[11px] transition ${
              active
                ? 'bg-Primary-DeepTeal text-white'
                : 'border border-Gray-50 bg-white text-Text-Primary hover:border-Primary-DeepTeal/40'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>

    {activeFlow ? (
      <div className="rounded-[14px] border border-Gray-50 bg-[#F8FAFB] p-3">
        <div className="flex items-center gap-2 text-[12px] font-medium text-Text-Primary">
          {(() => {
            const Icon = modeIcon(activeFlow.execution_mode);
            return <Icon className="h-4 w-4 text-Primary-DeepTeal" />;
          })()}
          {activeFlow.label || activeFlow.flow_id}
          <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-Text-Secondary">
            {activeFlow.execution_mode}
          </span>
        </div>

        {activeFlow.composite_of?.length ? (
          <div className="mt-3 space-y-4">
            {activeFlow.composite_of.map((childId) => {
              const child = allFlows.find((flow) => flow.flow_id === childId);
              if (!child) return null;
              return (
                <div key={childId}>
                  <div className="mb-2 text-[11px] font-medium text-Text-Primary">
                    {child.label || child.flow_id}
                    <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-[10px] text-Text-Secondary">
                      {child.execution_mode}
                    </span>
                  </div>
                  <ol className="space-y-2">
                    {(child.steps || []).map((step) => (
                      <StepRow
                        key={`${childId}-${step.step_id}`}
                        step={step}
                        flowId={childId}
                      />
                    ))}
                  </ol>
                </div>
              );
            })}
          </div>
        ) : (
          <ol className="mt-3 space-y-2">
            {(activeFlow.steps || []).map((step) => (
              <StepRow
                key={step.step_id}
                step={step}
                flowId={activeFlow.flow_id}
              />
            ))}
          </ol>
        )}
      </div>
    ) : null}
  </div>
);

export default FlowTabsNav;
