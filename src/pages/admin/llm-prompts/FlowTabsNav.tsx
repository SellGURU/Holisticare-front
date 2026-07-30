import { Waypoints } from 'lucide-react';
import type { BusinessFlow, FlowTabId } from '../../../types/llmAdmin';
import {
  isCompositeFlow,
  showsPipelineButton,
  type FlowTab,
  type FlowTabGroup,
} from './businessFlowUtils';

interface FlowTabsNavProps {
  tabs: FlowTab[];
  activeTab: FlowTabId;
  onTabChange: (tabId: FlowTabId) => void;
  activeFlow?: BusinessFlow | null;
  onViewPipeline?: (flow: BusinessFlow) => void;
}

const GROUP_LABELS: Record<FlowTabGroup, string> = {
  pipelines: 'Pipelines',
  conflict_detection: 'Conflict Detection',
  conversations: 'Conversations',
  other: 'Other',
};

const GROUP_ORDER: Array<FlowTabGroup | undefined> = [
  undefined,
  'pipelines',
  'conflict_detection',
  'conversations',
  'other',
];

const TabPill = ({
  tab,
  active,
  onTabChange,
}: {
  tab: FlowTab;
  active: boolean;
  onTabChange: (tabId: FlowTabId) => void;
}) => (
  <button
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

const FlowTabsNav = ({
  tabs,
  activeTab,
  onTabChange,
  activeFlow,
  onViewPipeline,
}: FlowTabsNavProps) => {
  const ungrouped = tabs.filter((t) => !t.group);
  const groupedSections = GROUP_ORDER.filter(
    (g): g is FlowTabGroup => g !== undefined,
  )
    .map((group) => ({
      group,
      tabs: tabs.filter((t) => t.group === group),
    }))
    .filter((section) => section.tabs.length > 0);

  const showPipeline =
    Boolean(activeFlow) &&
    Boolean(onViewPipeline) &&
    activeFlow != null &&
    showsPipelineButton(activeFlow);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {ungrouped.length ? (
          <div className="flex flex-wrap gap-2">
            {ungrouped.map((tab) => (
              <TabPill
                key={tab.id}
                tab={tab}
                active={tab.id === activeTab}
                onTabChange={onTabChange}
              />
            ))}
          </div>
        ) : null}
        {groupedSections.map(({ group, tabs: sectionTabs }) => (
          <div key={group}>
            <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-Text-Secondary">
              {GROUP_LABELS[group]}
            </div>
            <div className="flex flex-wrap gap-2">
              {sectionTabs.map((tab) => (
                <TabPill
                  key={tab.id}
                  tab={tab}
                  active={tab.id === activeTab}
                  onTabChange={onTabChange}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {showPipeline && activeFlow && onViewPipeline ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-Text-Secondary">
            {activeFlow.label || activeFlow.flow_id}
          </span>
          <button
            type="button"
            title={
              isCompositeFlow(activeFlow)
                ? 'View Holistic Plan stages (separately triggered)'
                : 'Steps run in order — click to view pipeline'
            }
            aria-label="View pipeline flow"
            onClick={() => onViewPipeline(activeFlow)}
            className="inline-flex items-center gap-1 rounded-full border border-Gray-50 bg-white px-2.5 py-1 text-[10px] text-Text-Secondary hover:border-Primary-DeepTeal/40 hover:text-Primary-DeepTeal"
          >
            <Waypoints className="h-3.5 w-3.5" />
            View pipeline
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default FlowTabsNav;
