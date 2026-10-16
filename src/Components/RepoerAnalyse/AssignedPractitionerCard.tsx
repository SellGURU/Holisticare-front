import { useEffect, useState } from 'react';
import Application from '../../api/app';

type Coach = {
  username: string;
  assigned: boolean;
};

type AssignedPractitionerCardProps = {
  memberId: string | number | null;
};

function initials(name: string) {
  const parts = name
    .split(/[\s._@-]+/)
    .filter(Boolean)
    .slice(0, 2);
  return parts.map((part) => part.charAt(0).toUpperCase()).join('') || 'P';
}

function displayName(username: string) {
  const local = username.split('@')[0] || username;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default function AssignedPractitionerCard({
  memberId,
}: AssignedPractitionerCardProps) {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    if (memberId == null) return;
    Application.getCoachList({ member_id: memberId })
      .then((response) => {
        setCoaches(Array.isArray(response.data) ? response.data : []);
        setError('');
      })
      .catch(() => setError('Practitioners could not be loaded.'));
  };

  useEffect(() => {
    load();
  }, [memberId]);

  const assigned = coaches.find((coach) => coach.assigned);

  const selectCoach = (coach: Coach) => {
    const nextAssigned = !coach.assigned;
    setCoaches((current) =>
      current.map((item) => ({
        ...item,
        assigned: item.username === coach.username ? nextAssigned : false,
      })),
    );
    Application.assignCoach({
      member_id: memberId,
      coach_usernames: nextAssigned ? [coach.username] : [],
    })
      .then(() => setOpen(false))
      .catch(() => {
        setError('Assignment could not be saved.');
        load();
      });
  };

  return (
    <section className="relative min-w-0 rounded-2xl border border-[#E6EEF0] bg-white px-5 py-4 shadow-sm">
      <h2 className="text-sm font-semibold text-Text-Primary">Practitioners</h2>
      {assigned ? (
        <div className="mt-4 flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#D9F3EA] text-xs font-semibold text-[#0F766E]">
            {initials(assigned.username)}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-Text-Primary">
              {displayName(assigned.username)}
            </div>
            <div className="truncate text-xs text-Text-Secondary">
              Practitioner
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-Text-Secondary">
          No practitioner assigned yet.
        </p>
      )}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="mt-4 w-full rounded-xl border border-dashed border-[#D5E3E6] px-3 py-2 text-sm text-Text-Secondary hover:bg-[#F7FBFA]"
      >
        {assigned ? 'Change practitioner' : '+ Add Practitioner'}
      </button>
      {error && <p className="mt-2 text-xs text-Text-Secondary">{error}</p>}
      {open && (
        <div className="absolute inset-x-4 top-full z-20 mt-2 max-h-56 overflow-auto rounded-xl border border-[#E6EEF0] bg-white p-2 shadow-lg">
          {coaches.length === 0 ? (
            <p className="px-2 py-3 text-sm text-Text-Secondary">
              No practitioners are available.
            </p>
          ) : (
            coaches.map((coach) => (
              <button
                key={coach.username}
                type="button"
                onClick={() => selectCoach(coach)}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-[#F4F7F8] ${
                  coach.assigned
                    ? 'bg-[#E7F6F2] font-medium text-[#005F73]'
                    : 'text-Text-Primary'
                }`}
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-[#F3F7F8] text-[10px]">
                  {initials(coach.username)}
                </span>
                <span className="truncate">{displayName(coach.username)}</span>
              </button>
            ))
          )}
        </div>
      )}
    </section>
  );
}
