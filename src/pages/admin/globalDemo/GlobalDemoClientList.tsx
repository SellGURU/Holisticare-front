import type { GlobalDemoClientItem } from '../../../types/admin';
import AdminActionButton from '../AdminActionButton';
import {
  globalDemoStatusClass,
  globalDemoStatusLabel,
  jobIsActive,
  progressSummary,
} from './globalDemoUtils';

interface GlobalDemoClientListProps {
  clients: GlobalDemoClientItem[];
  removingId: string | null;
  retryingId: string | null;
  onRemove: (client: GlobalDemoClientItem) => void;
  onRetry: (client: GlobalDemoClientItem) => void;
}

const GlobalDemoClientList = ({
  clients,
  removingId,
  retryingId,
  onRemove,
  onRetry,
}: GlobalDemoClientListProps) => {
  if (!clients.length) {
    return (
      <div className="rounded-2xl bg-[#F8FAFB] p-3 text-[12px] text-Text-Secondary">
        No global demo clients yet. Select an existing client to create a
        sanitized snapshot and copy it to every clinic.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-[12px]">
        <thead>
          <tr className="text-Text-Secondary">
            <th className="px-2 py-2 font-medium">Client</th>
            <th className="px-2 py-2 font-medium">Source clinic</th>
            <th className="px-2 py-2 font-medium">Status</th>
            <th className="px-2 py-2 font-medium">Progress</th>
            <th className="px-2 py-2 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => {
            const busy =
              removingId === client.source_patient_id ||
              retryingId === client.source_patient_id ||
              jobIsActive(client.job);
            return (
              <tr key={client.global_demo_id} className="border-t border-Gray-50">
                <td className="px-2 py-3">
                  <div className="font-medium text-Text-Primary">
                    {client.display_name}
                  </div>
                  <div className="mt-1 text-[11px] text-Text-Secondary">
                    Patient {client.source_patient_id_masked} · member{' '}
                    {client.source_member_id_masked}
                  </div>
                  <span className="mt-2 inline-flex rounded-full bg-purple-50 px-2 py-0.5 text-[10px] text-purple-700">
                    Global Demo
                  </span>
                </td>
                <td className="px-2 py-3 text-Text-Secondary">
                  {client.source_clinic_name || `Clinic ${client.source_clinic_id}`}
                </td>
                <td className="px-2 py-3">
                  <span
                    className={`rounded-full px-2 py-1 ${globalDemoStatusClass(client.status)}`}
                  >
                    {globalDemoStatusLabel(client.status)}
                  </span>
                </td>
                <td className="px-2 py-3 text-Text-Secondary">
                  <div>{progressSummary(client)}</div>
                  {client.last_error && (
                    <div className="mt-1 text-red-600">{client.last_error}</div>
                  )}
                  {client.failed_clinics?.length ? (
                    <div className="mt-1">
                      Failed clinics:{' '}
                      {client.failed_clinics
                        .map((item) => item.clinic_id)
                        .join(', ')}
                    </div>
                  ) : null}
                </td>
                <td className="px-2 py-3">
                  <div className="flex min-w-[168px] flex-col gap-1.5">
                    {client.status === 'failed' && (
                      <AdminActionButton
                        disabled={busy}
                        label={
                          retryingId === client.source_patient_id
                            ? 'Retrying…'
                            : 'Retry failed'
                        }
                        onClick={() => onRetry(client)}
                      />
                    )}
                    <AdminActionButton
                      variant="warning"
                      disabled={busy || client.status === 'removing'}
                      label={
                        removingId === client.source_patient_id
                          ? 'Archiving…'
                          : 'Remove'
                      }
                      onClick={() => onRemove(client)}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default GlobalDemoClientList;
