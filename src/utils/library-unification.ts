export const DoseValidationEnglish = (dose: string) => {
  const englishOnly = dose.replace(/[^a-zA-Z0-9\s/-]/g, '');
  return englishOnly;
};

export const DoseValidationMetric = (dose: string) => {
  const doseRegex = /^(\d+(?:\s*-\s*\d+)?)(\s*[a-zA-Z]+(?:\/[a-zA-Z]+)?)$/;
  return doseRegex.test(dose);
};

export const DoseInfoText = `Dose must include a number or range and a unit or descriptive
                form (e.g., '50 mg', '2 drops', or '1–2 tablets').`;
export const DoseFormatInfoText = `Dose must follow the described format.`;

export const ValueValidation = (value: string) => {
  const valueRegex = /^\d*$/;
  return valueRegex.test(value);
};

export const ValueInfoText = `Provide the numerical value, and if needed, enter the unit
                  manually (e.g., 8 + Hours)`;
export const ValueFormatInfoText = `Value must not exceed 5 digits.`;

export const MacrosInfoText = `Macros Goal must contain just Whole Numbers.`;

export const MacrosFormatInfoText = `must not exceed 5 digits.`;

export const MacrosValidationNumber = (macros: string) => {
  const macrosRegex = /^\d*$/;
  return macrosRegex.test(macros);
};

export const LengthValidation = 5;

export const InstructionInfoText = `After writing each instruction, press the Enter key to save it and be able to add another instruction.`;

export const NotesInfoText = `After writing each note, press the Enter key to save it and be able to add another note.`;

export const AssociatedInterventionInfoTextDiet = `Link to an intervention (e.g., Mediterranean Diet)`;

export const AssociatedInterventionInfoTextActivity = `Link to an intervention (e.g., Functional Training)`;
