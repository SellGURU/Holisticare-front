export interface LlmAdminCapabilities {
  prompt_fingerprinting: boolean;
  business_flow_tabs: boolean;
  full_io_trace: boolean;
  prompt_history: boolean;
}

export interface PromptRow {
  id: number;
  key: string;
  display_name: string;
  description: string;
  category: string;
  owner_service: string;
  is_active: boolean;
  system_prompt: string;
  developer_prompt: string | null;
  user_prompt_template: string | null;
  model_tier: 'nano' | 'mini' | 'full' | string;
  model_override: string | null;
  temperature: number | null;
  top_p: number | null;
  max_tokens: number | null;
  reasoning_effort: string | null;
  response_format: 'text' | 'json' | string;
  tools_json: unknown | null;
  extra_settings_json: unknown | null;
  updated_by: string | null;
  updated_at: string | null;
  has_db_override?: boolean;
  effective_source?: 'db' | 'runtime' | 'catalog' | string;
  runtime_system_prompt?: string;
  runtime_source_file?: string | null;
  runtime_resolution?:
    | 'helper'
    | 'delegate'
    | 'prompt_key_anchor'
    | 'function_name'
    | 'fc_agent'
    | 'unresolved'
    | string
    | null;
  prompt_extraction_source?:
    | 'fc_agent'
    | 'legacy_helper_fallback'
    | string
    | null;
  prompt_is_dynamic_or_partial?: boolean;
  key_kind?:
    | 'llm_prompt'
    | 'non_llm_template'
    | 'settings_only_intentional'
    | 'orphan_legacy'
    | string;
  orphan_successor_key?: string | null;
}

export interface BusinessFlowStep {
  step_id: string;
  key: string;
  kind?: string;
  order?: number;
  conditional?: string;
  parallel_fanout?: string;
  async_background?: boolean;
  blocking?: boolean;
  trigger?: string;
  inputs?: string[];
  prompt?: {
    display_name?: string;
    category?: string;
    owner_service?: string;
    is_active?: boolean;
    has_db_override?: boolean;
    effective_source?: string;
  };
}

export interface BusinessFlow {
  flow_id: string;
  label: string;
  execution_mode: string;
  steps?: BusinessFlowStep[];
  composite_of?: string[];
  orchestrator?: Record<string, string>;
}

export interface BusinessFlowsResponse {
  catalog_count: number;
  flow_count: number;
  flows: BusinessFlow[];
  unmapped_keys: Array<{
    key: string;
    display_name?: string;
    category?: string;
  }>;
  observability_keys: Array<{ key: string; kind: string; source?: string }>;
  validation: { errors: string[]; warnings: string[] };
}

export interface PromptHistoryEntry {
  id: number;
  snapshot_json: Record<string, unknown>;
  prompt_hash: string | null;
  updated_by: string | null;
  updated_at: string | null;
}

export interface LlmCallEntry {
  timestamp: string | null;
  function_name: string | null;
  clinic_id: string | number | null;
  patient_id: string | number | null;
  request_payload: string | null;
  response_payload: string | null;
  status: string | null;
  error_message: string | null;
  duration_ms: number | null;
  model: string | null;
  prompt_key?: string | null;
  category?: string | null;
  source?: string | null;
  log_source?: string | null;
  prompt_hash?: string | null;
  text_source?: string | null;
  settings_source?: string | null;
  flow_ids?: string[] | null;
  primary_flow_id?: string | null;
  flow_step_id?: string | null;
  flow_step_order?: number | null;
  input_payload_redacted?: unknown;
  output_payload_redacted?: unknown;
  input_truncated?: boolean;
  output_truncated?: boolean;
}

export interface PromptSnapshot {
  prompt_hash: string;
  prompt_key?: string | null;
  snapshot?: {
    instruction_messages?: Array<{ role: string; content: string }>;
    tools?: unknown[];
  };
  first_seen_at?: string;
}

export type FlowTabId = 'all' | 'technical' | 'other' | string;
