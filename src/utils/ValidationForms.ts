import {
  DoseFormatInfoText,
  DoseValidationMetric,
  LengthValidation,
  ValueFormatInfoText,
} from './library-unification';

type ValidationField =
  | 'Instruction'
  | 'Dose'
  | 'Value'
  | 'Macros'
  | 'Title'
  | 'Category'
  | 'Note'
  | '';
class ValidationForms {
  public static IsvalidField(name: ValidationField, value: string) {
    switch (name) {
      case 'Instruction':
        return this.validationInstructions(value);
      case 'Dose':
        return this.validationDose(value);
      case 'Value':
        return this.validationValue(value);
      case 'Macros':
        return this.validationMacros(value);
      case 'Title':
        return this.validationTitle(value);
      case 'Category':
        return this.validationCategory(value);
      case 'Note':
        return this.validationNote(value);
      default:
        return false;
    }
  }
  public static ValidationText(name: ValidationField, value: string) {
    switch (name) {
      case 'Instruction':
        return this.validationInstructionsText(value);
      case 'Dose':
        return this.validationDoseText(value);
      case 'Value':
        return this.validationValueText(value);
      case 'Macros':
        return this.validationMacrosText(value);
      case 'Title':
        return this.validationTitleText(value);
      case 'Category':
        return this.validationCategoryText(value);
      case 'Note':
        return this.validationNoteText(value);
      default:
        return '';
    }
  }

  private static validationInstructions(value: string) {
    if (value.length == 0) {
      return false;
    } else if (value.length > 400) {
      return false;
    }
    return true;
  }
  private static validationInstructionsText(value: string) {
    if (value.length == 0) {
      return 'This field is required.';
    } else if (value.length > 400) {
      return 'You can enter up to 400 characters.';
    }
    return '';
  }
  private static validationDose(value: string) {
    if (value.length == 0) {
      return false;
    } else if (value.length > 0) {
      const doseRegex = DoseValidationMetric(value);
      if (doseRegex) {
        return true;
      }
      return false;
    }
    return true;
  }
  private static validationDoseText(value: string) {
    if (value.length == 0) {
      return 'This field is required.';
    } else if (value.length > 0) {
      const doseRegex = DoseValidationMetric(value);
      if (!doseRegex) {
        return DoseFormatInfoText;
      }
      return '';
    }
    return '';
  }
  private static validationValue(value: string) {
    if (value.length == 0) {
      return false;
    } else if (value.length > LengthValidation) {
      return false;
    }
    return true;
  }
  private static validationValueText(value: string) {
    if (value.length == 0) {
      return 'This field is required.';
    } else if (value.length > LengthValidation) {
      return ValueFormatInfoText;
    }
    return '';
  }
  private static validationMacros(value: string) {
    if (value.length == 0) {
      return false;
    } else if (value.length > LengthValidation) {
      return false;
    }
    return true;
  }
  private static validationMacrosText(value: string) {
    if (value.length == 0) {
      return 'These fields are required.';
    }
    return '';
  }
  private static validationTitle(value: string) {
    if (value.length == 0) {
      return false;
    }
    return true;
  }
  private static validationTitleText(value: string) {
    if (value.length == 0) {
      return 'This field is required.';
    }
    return '';
  }
  private static validationCategory(value: string) {
    if (value.length == 0) {
      return false;
    }
    return true;
  }
  private static validationCategoryText(value: string) {
    if (value.length == 0) {
      return 'This field is required.';
    }
    return '';
  }
  private static validationNote(value: string) {
    if (value.length > 400) {
      return false;
    }
    return true;
  }
  private static validationNoteText(value: string) {
    if (value.length > 400) {
      return 'You can enter up to 400 characters.';
    }
    return '';
  }
}

export default ValidationForms;
