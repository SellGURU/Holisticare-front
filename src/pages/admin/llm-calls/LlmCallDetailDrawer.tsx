import { Copy, Hash, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import AdminApi from '../../../api/admin';
import type { LlmCallEntry, PromptSnapshot } from '../../../types/llmAdmin';
import {
  hasRedactedPayload,
  isPipelineEntry,
  preferredInputPayload,
  preferredOutputPayload,
  prettyPrintPayload,
} from './callLogUtils';

interface LlmCallDetailDrawerProps {
  entry: LlmCallEntry;
  onClose: () => void;
  friendlyFunctionLabel: (
    functionName: string | null | undefined,
    promptKey?: string | null,
  ) => string;
  formatDate: (iso: string | null) => string;
  formatDuration: (ms: number | null | undefined) => string;
}

const LlmCallDetailDrawer = ({
  entry,
  onClose,
  friendlyFunctionLabel,
  formatDate,
  formatDuration,
}: LlmCallDetailDrawerProps) => {
  const [tab, setTab] = useState<'input' | 'output'>('input');
  const [snapshot, setSnapshot] = useState<PromptSnapshot | null>(null);

  useEffect(() => {
    if (!entry.prompt_hash) {
      setSnapshot(null);
      return;
    }
    AdminApi.getLlmPromptSnapshot(entry.prompt_hash)
      .then((res) => setSnapshot(res.data))
      .catch(() => setSnapshot(null));
  }, [entry.prompt_hash]);

  const copyPayload = async () => {
    const payload =
      tab === 'input'
        ? preferredInputPayload(entry)
        : preferredOutputPayload(entry);
    await navigator.clipboard.writeText(prettyPrintPayload(payload));
  };

  const inputPayload = preferredInputPayload(entry);
  const outputPayload = preferredOutputPayload(entry);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <div className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-Gray-50 px-4 py-3">
          <div>
            <h3 className="text-[14px] font-semibold text-Text-Primary">
              {friendlyFunctionLabel(entry.function_name, entry.prompt_key)}
            </h3>
            <p className="text-[11px] text-Text-Secondary">
              {formatDate(entry.timestamp)} ·{' '}
              {formatDuration(entry.duration_ms)}
              {entry.model ? ` · ${entry.model}` : ''}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {entry.primary_flow_id ? (
                <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] text-teal-700">
                  flow: {entry.primary_flow_id}
                  {entry.flow_step_id ? ` / ${entry.flow_step_id}` : ''}
                </span>
              ) : (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                  flow: not recorded
                </span>
              )}
              {entry.prompt_hash ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] text-indigo-700">
                  <Hash className="h-3 w-3" />
                  {entry.prompt_hash}
                </span>
              ) : (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                  hash: not recorded
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-Text-Secondary hover:bg-[#F8FAFB]"
          >
            <X size={16} />
          </button>
        </div>

        {snapshot?.snapshot?.instruction_messages?.length ? (
          <div className="border-b border-Gray-50 px-4 py-3">
            <div className="text-[11px] font-medium text-Text-Primary">
              Instruction snapshot
            </div>
            <pre className="mt-2 max-h-28 overflow-auto rounded-xl bg-[#F8FAFB] p-2 text-[10px]">
              {prettyPrintPayload(snapshot.snapshot.instruction_messages)}
            </pre>
          </div>
        ) : null}

        {hasRedactedPayload(entry) ? (
          <div className="border-b border-amber-100 bg-amber-50 px-4 py-2 text-[10px] text-amber-800">
            Payload redacted (PII-safe). Raw request/response fields are hidden
            when redacted copies exist.
          </div>
        ) : null}

        {(entry.input_truncated || entry.output_truncated) && (
          <div className="border-b border-amber-100 bg-amber-50 px-4 py-2 text-[10px] text-amber-800">
            Payload truncated at 50KB
            {entry.input_truncated ? ' (input)' : ''}
            {entry.output_truncated ? ' (output)' : ''}.
          </div>
        )}

        {isPipelineEntry(entry) ? (
          <div className="flex-1 overflow-auto p-4">
            <pre className="max-h-full overflow-auto rounded-xl bg-[#F8FAFB] p-3 text-[11px]">
              {prettyPrintPayload(entry.request_payload)}
            </pre>
          </div>
        ) : (
          <>
            <div className="flex gap-2 border-b border-Gray-50 px-4 py-2">
              <button
                type="button"
                onClick={() => setTab('input')}
                className={`rounded-full px-3 py-1 text-[11px] ${
                  tab === 'input'
                    ? 'bg-Primary-DeepTeal text-white'
                    : 'bg-[#F8FAFB] text-Text-Primary'
                }`}
              >
                Input
              </button>
              <button
                type="button"
                onClick={() => setTab('output')}
                className={`rounded-full px-3 py-1 text-[11px] ${
                  tab === 'output'
                    ? 'bg-Primary-DeepTeal text-white'
                    : 'bg-[#F8FAFB] text-Text-Primary'
                }`}
              >
                Output
              </button>
              <button
                type="button"
                onClick={() => copyPayload().catch(() => {})}
                className="ml-auto inline-flex items-center gap-1 rounded-full border border-Gray-50 px-2 py-1 text-[10px]"
              >
                <Copy className="h-3 w-3" />
                Copy
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <pre className="max-h-full overflow-auto rounded-xl bg-[#F8FAFB] p-3 text-[11px]">
                {prettyPrintPayload(
                  tab === 'input' ? inputPayload : outputPayload,
                )}
              </pre>
              {(entry.status || '').toLowerCase() === 'failed' &&
              entry.error_message ? (
                <div className="mt-3 rounded-xl border border-red-100 bg-red-50 p-3 text-[11px] text-red-700">
                  {entry.error_message}
                </div>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LlmCallDetailDrawer;
