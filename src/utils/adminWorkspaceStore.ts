import {
  ClinicNote,
  ClinicReport,
  ClinicTag,
  ClinicWorkspaceRecord,
  FollowUpState,
} from '../types/admin';

const WORKSPACE_STORAGE_KEY = 'adminClinicWorkspaceRecords';
const REPORT_STORAGE_KEY = 'adminGeneratedReports';

const isBrowser = typeof window !== 'undefined';

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const readJson = <T,>(key: string, fallback: T): T => {
  if (!isBrowser) {
    return fallback;
  }

  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeJson = <T,>(key: string, value: T) => {
  if (!isBrowser) {
    return;
  }

  localStorage.setItem(key, JSON.stringify(value));
};

const readWorkspaceRecords = () =>
  readJson<Record<string, ClinicWorkspaceRecord>>(WORKSPACE_STORAGE_KEY, {});

const writeWorkspaceRecords = (records: Record<string, ClinicWorkspaceRecord>) => {
  writeJson(WORKSPACE_STORAGE_KEY, records);
};

export const getClinicWorkspaceRecord = (clinicEmail: string): ClinicWorkspaceRecord => {
  const records = readWorkspaceRecords();
  return (
    records[clinicEmail] || {
      clinicEmail,
      followUpState: 'monitor',
      notes: [],
      tags: [],
      updatedAt: new Date().toISOString(),
    }
  );
};

export const saveClinicWorkspaceRecord = (record: ClinicWorkspaceRecord) => {
  const records = readWorkspaceRecords();
  records[record.clinicEmail] = {
    ...record,
    updatedAt: new Date().toISOString(),
  };
  writeWorkspaceRecords(records);
};

export const setClinicFollowUpState = (
  clinicEmail: string,
  followUpState: FollowUpState,
) => {
  const record = getClinicWorkspaceRecord(clinicEmail);
  saveClinicWorkspaceRecord({
    ...record,
    followUpState,
  });
};

export const addClinicNote = (
  clinicEmail: string,
  note: Omit<ClinicNote, 'id' | 'clinicEmail' | 'createdAt'>,
) => {
  const record = getClinicWorkspaceRecord(clinicEmail);
  const nextNote: ClinicNote = {
    ...note,
    id: createId(),
    clinicEmail,
    createdAt: new Date().toISOString(),
  };

  saveClinicWorkspaceRecord({
    ...record,
    notes: [nextNote, ...record.notes],
  });
};

export const updateClinicNote = (clinicEmail: string, noteId: string, updater: (note: ClinicNote) => ClinicNote) => {
  const record = getClinicWorkspaceRecord(clinicEmail);
  saveClinicWorkspaceRecord({
    ...record,
    notes: record.notes.map((note) => (note.id === noteId ? updater(note) : note)),
  });
};

export const deleteClinicNote = (clinicEmail: string, noteId: string) => {
  const record = getClinicWorkspaceRecord(clinicEmail);
  saveClinicWorkspaceRecord({
    ...record,
    notes: record.notes.filter((note) => note.id !== noteId),
  });
};

export const addClinicTag = (
  clinicEmail: string,
  tag: Omit<ClinicTag, 'id' | 'clinicEmail' | 'createdAt'>,
) => {
  const record = getClinicWorkspaceRecord(clinicEmail);
  const exists = record.tags.some(
    (currentTag) => currentTag.name.toLowerCase() === tag.name.trim().toLowerCase(),
  );

  if (exists) {
    return false;
  }

  const nextTag: ClinicTag = {
    ...tag,
    id: createId(),
    clinicEmail,
    createdAt: new Date().toISOString(),
  };

  saveClinicWorkspaceRecord({
    ...record,
    tags: [nextTag, ...record.tags],
  });

  return true;
};

export const toggleClinicTagStatus = (clinicEmail: string, tagId: string) => {
  const record = getClinicWorkspaceRecord(clinicEmail);
  saveClinicWorkspaceRecord({
    ...record,
    tags: record.tags.map((tag) =>
      tag.id === tagId
        ? { ...tag, status: tag.status === 'active' ? 'resolved' : 'active' }
        : tag,
    ),
  });
};

export const readSavedReports = () => readJson<ClinicReport[]>(REPORT_STORAGE_KEY, []);

export const saveGeneratedReport = (report: Omit<ClinicReport, 'id' | 'createdAt'>) => {
  const reports = readSavedReports();
  const nextReport: ClinicReport = {
    ...report,
    id: createId(),
    createdAt: new Date().toISOString(),
  };
  writeJson(REPORT_STORAGE_KEY, [nextReport, ...reports]);
  return nextReport;
};

export const deleteGeneratedReport = (reportId: string) => {
  const reports = readSavedReports();
  writeJson(
    REPORT_STORAGE_KEY,
    reports.filter((report) => report.id !== reportId),
  );
};
