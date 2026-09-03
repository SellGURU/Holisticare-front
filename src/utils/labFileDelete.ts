export function resolveLabFileDeleteId(
  fileId?: string | number | null,
): string | null {
  const id = String(fileId ?? '').trim();
  return id || null;
}

export function lastRowDeleteEventDetail(
  fileId?: string | number | null,
): { file_id: string | null } {
  return { file_id: resolveLabFileDeleteId(fileId) };
}

export type LabDeleteResponse = {
  file_id?: string | null;
  operation_id?: string | number | null;
  outcomes?: Record<string, { state?: string | null; data_revision?: string | null }>;
};

export function parseLabDeleteResponse(data: unknown): LabDeleteResponse {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return {};
  }
  const payload = data as LabDeleteResponse;
  return {
    file_id: resolveLabFileDeleteId(payload.file_id),
    operation_id: payload.operation_id ?? null,
    outcomes: payload.outcomes || {},
  };
}
