import { describe, expect, it } from 'vitest';
import {
  lastRowDeleteEventDetail,
  parseLabDeleteResponse,
  resolveLabFileDeleteId,
} from './labFileDelete';

describe('lab file delete', () => {
  it('sends the actual file id when the last biomarker row is removed', () => {
    expect(lastRowDeleteEventDetail('lab-42')).toEqual({ file_id: 'lab-42' });
    expect(resolveLabFileDeleteId(undefined)).toBeNull();
    expect(resolveLabFileDeleteId('')).toBeNull();
  });

  it('keeps overlay state when the file id is missing', () => {
    expect(resolveLabFileDeleteId(null)).toBeNull();
  });

  it('reads operation outcomes from a delete success payload', () => {
    expect(
      parseLabDeleteResponse({
        file_id: 'lab-42',
        operation_id: 9,
        outcomes: { biomarkers: { state: 'ready', data_revision: 'b1' } },
      }),
    ).toEqual({
      file_id: 'lab-42',
      operation_id: 9,
      outcomes: { biomarkers: { state: 'ready', data_revision: 'b1' } },
    });
    expect(parseLabDeleteResponse('deleted')).toEqual({});
  });
});
