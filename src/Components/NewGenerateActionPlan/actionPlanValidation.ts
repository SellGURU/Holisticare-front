/* eslint-disable @typescript-eslint/no-explicit-any */

export type TaskValidationError = {
  taskKey: string;
  taskIndex: number;
  taskTitle: string;
  field: string;
  message: string;
  fixHint: string;
};

const FIELD_USER_COPY: Record<string, { message: string; fixHint: string }> = {
  Frequency_Type: {
    message: 'Schedule is required',
    fixHint:
      'Open the task, click Edit, and choose Daily, Weekly, or Monthly',
  },
  Frequency_Dates: {
    message: 'Pick which days this task runs',
    fixHint: 'In Edit, select the days or dates for this schedule',
  },
  Dose: {
    message: 'Dosage is required',
    fixHint: 'Open Edit and enter supplement dosage',
  },
  Value: {
    message: 'Duration/value is required',
    fixHint: 'Open Edit and enter the activity or lifestyle value',
  },
  Unit: {
    message: 'Unit is required',
    fixHint: 'Open Edit and enter the unit for this value',
  },
  'Total Macros': {
    message: 'Diet macros are required',
    fixHint: 'Open Edit and complete macro targets',
  },
};

export const buildTaskIdentity = (task: any): string =>
  task?.task_directory_id ||
  `${task?.Task_Type || ''}|${task?.Category || ''}|${task?.Check_in_id || ''}|${task?.Title || ''}`;

const VALID_SCHEDULE_TYPES = new Set(['daily', 'weekly', 'monthly']);

export const normalizeScheduleType = (frequencyType: unknown): string | null => {
  const normalized = String(frequencyType ?? '').trim().toLowerCase();
  return VALID_SCHEDULE_TYPES.has(normalized) ? normalized : null;
};

export const isScheduleMissing = (frequencyType: unknown): boolean =>
  normalizeScheduleType(frequencyType) === null;

const fieldUserCopy = (field: string, fallbackMessage?: string) => {
  const copy = FIELD_USER_COPY[field];
  if (copy) return copy;
  return {
    message: fallbackMessage || `${field} is required`,
    fixHint: 'Open Edit and complete the missing details',
  };
};

const isEmptyValue = (value: unknown): boolean =>
  value === null ||
  value === undefined ||
  (typeof value === 'string' && value.trim() === '') ||
  (Array.isArray(value) && value.length === 0) ||
  (typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).length === 0);

const pushError = (
  errors: TaskValidationError[],
  task: any,
  taskIndex: number,
  field: string,
  message?: string,
  fixHint?: string,
) => {
  const copy = fieldUserCopy(field, message);
  errors.push({
    taskKey: buildTaskIdentity(task),
    taskIndex,
    taskTitle: task?.Title || 'Untitled task',
    field,
    message: message || copy.message,
    fixHint: fixHint || copy.fixHint,
  });
};

const getRequiredFieldsForTask = (task: any): string[] => {
  const fields = ['Task_Type', 'Title', 'Frequency_Type'];

  if (task?.Task_Type === 'Action' || (!task?.Task_Type && task?.Category)) {
    fields.push(
      'Instruction',
      'Category',
      'Client Notes',
      'Practitioner Comments',
      'System Score',
    );
    if (task?.Category === 'Activity') {
      fields.push('Sections');
    } else if (task?.Category === 'Lifestyle') {
      fields.push('Value', 'Unit');
    } else if (task?.Category === 'Supplement') {
      fields.push('Dose');
    } else if (task?.Category === 'Diet') {
      fields.push('Total Macros');
    }
  } else if (task?.Task_Type === 'Checkin') {
    fields.push('Questions_Count', 'Check_in_id');
  }

  if (
    task?.Frequency_Type &&
    String(task.Frequency_Type).toLowerCase() !== 'daily'
  ) {
    fields.push('Frequency_Dates');
  }

  return fields;
};

const skipEmptyCheckFields = new Set([
  'Practitioner Comments',
  'Instruction',
  'Client Notes',
  'Sections',
]);

export const validateActionPlanTasks = (
  tasks: any[] = [],
): TaskValidationError[] => {
  const errors: TaskValidationError[] = [];

  tasks.forEach((task, taskIndex) => {
    const requiredFields = getRequiredFieldsForTask(task);

    requiredFields.forEach((field) => {
      if (!(field in task)) {
        pushError(errors, task, taskIndex, field);
        return;
      }

      if (skipEmptyCheckFields.has(field)) {
        return;
      }

      const value = task[field];

      if (field === 'Unit') {
        if (isEmptyValue(value)) {
          pushError(errors, task, taskIndex, field);
        } else if (!/^[A-Za-z ]+$/.test(String(value))) {
          pushError(
            errors,
            task,
            taskIndex,
            field,
            'Unit must contain only letters (A–Z).',
            'Open Edit and use letters only for the unit',
          );
        }
        return;
      }

      if (field === 'Value' && value !== null && value !== undefined && value !== '') {
        const numeric = Number(value);
        if (!Number.isInteger(numeric) || numeric < 0) {
          pushError(
            errors,
            task,
            taskIndex,
            field,
            'Value must be a valid number greater than or equal to zero.',
            'Open Edit and enter a valid number',
          );
        }
        return;
      }

      if (field === 'Frequency_Type') {
        if (isScheduleMissing(value)) {
          pushError(errors, task, taskIndex, field);
        }
        return;
      }

      if (isEmptyValue(value)) {
        pushError(errors, task, taskIndex, field);
      }
    });
  });

  return errors;
};

const normalizeBackendTaskError = (
  raw: any,
  tasks: any[],
): TaskValidationError | null => {
  if (!raw || typeof raw !== 'object') return null;

  const taskIndex =
    typeof raw.task_index === 'number' ? raw.task_index : undefined;
  const task =
    taskIndex !== undefined && tasks[taskIndex] ? tasks[taskIndex] : {};
  const field = String(raw.field || '');
  const copy = fieldUserCopy(field, raw.message);

  return {
    taskKey: buildTaskIdentity(task),
    taskIndex: taskIndex ?? -1,
    taskTitle: raw.task_title || task?.Title || 'Untitled task',
    field,
    message: raw.message || copy.message,
    fixHint: raw.fix_hint || copy.fixHint,
  };
};

const parseLegacyFieldFromDetail = (detail: string): string | null => {
  const match = detail.match(/^(.+?) is required\.?$/i);
  return match ? match[1].trim() : null;
};

export const mapBackendTaskErrors = (
  detail: unknown,
  tasks: any[] = [],
): TaskValidationError[] => {
  if (!detail) return [];

  if (typeof detail === 'string') {
    const field = parseLegacyFieldFromDetail(detail);
    if (field) {
      const copy = fieldUserCopy(field);
      return [
        {
          taskKey: '',
          taskIndex: -1,
          taskTitle: '',
          field,
          message: copy.message,
          fixHint: copy.fixHint,
        },
      ];
    }
    return [
      {
        taskKey: '',
        taskIndex: -1,
        taskTitle: '',
        field: '',
        message: detail,
        fixHint: 'Review your action plan items and try again.',
      },
    ];
  }

  if (typeof detail === 'object') {
    const payload = detail as {
      task_errors?: any[];
      message?: string;
    };
    if (Array.isArray(payload.task_errors)) {
      return payload.task_errors
        .map((item) => normalizeBackendTaskError(item, tasks))
        .filter((item): item is TaskValidationError => Boolean(item));
    }
  }

  return [];
};

export const groupErrorsByTaskKey = (
  errors: TaskValidationError[],
): Record<string, TaskValidationError[]> => {
  return errors.reduce<Record<string, TaskValidationError[]>>((acc, error) => {
    const key = error.taskKey || `index:${error.taskIndex}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(error);
    return acc;
  }, {});
};

export const buildValidationSummary = (errors: TaskValidationError[]): string => {
  if (errors.length === 0) return '';

  const uniqueTitles = Array.from(
    new Set(errors.map((e) => e.taskTitle).filter(Boolean)),
  );

  if (uniqueTitles.length === 1) {
    const first = errors[0];
    return `${uniqueTitles[0]}: ${first.message.toLowerCase()} (${first.fixHint})`;
  }

  const count = uniqueTitles.length || errors.length;
  return `${count} item${count === 1 ? '' : 's'} need attention before saving. Scroll to highlighted cards and click Edit to fix them.`;
};

export const scrollToFirstTaskError = (errors: TaskValidationError[]) => {
  const first = errors.find((e) => e.taskKey);
  if (!first?.taskKey) return;

  requestAnimationFrame(() => {
    const el = document.querySelector(
      `[data-task-key="${CSS.escape(first.taskKey)}"]`,
    );
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
};
