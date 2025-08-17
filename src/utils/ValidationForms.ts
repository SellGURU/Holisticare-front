/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DoseFormatInfoText,
  DoseValidationMetric,
  LengthValidation,
  MacrosFormatInfoText,
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
  | 'Score'
  | 'YouTube Link'
  | '';
class ValidationForms {
  private static isValidYouTubeUrl = (url: string) => {
    const youtubeRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|shorts\/|embed\/|v\/)?([a-zA-Z0-9_-]{11})(?:[?&].*)?$/;
    return youtubeRegex.test(url);
  };
  public static IsvalidField(name: ValidationField, value: any) {
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
      case 'Score':
        return this.validateScore(value);
      case 'YouTube Link':
        return this.validateYouTubeLink(value);
      default:
        return false;
    }
  }
  public static ValidationText(name: ValidationField, value: any) {
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
      case 'Score':
        return this.validationScoreText(value);
      case 'YouTube Link':
        return this.validationYouTubeLinkText(value);
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
  private static validationMacros(value: any) {
    if (
      value.Carbs.length == 0 ||
      value.Protein.length == 0 ||
      value.Fats.length == 0
    ) {
      return false;
    } else if (
      value.Carbs.length > LengthValidation ||
      value.Protein.length > LengthValidation ||
      value.Fats.length > LengthValidation
    ) {
      return false;
    }
    return true;
  }
  private static validationMacrosText(value: any) {
    if (
      value.Carbs.length == 0 ||
      value.Protein.length == 0 ||
      value.Fats.length == 0
    ) {
      return 'These fields are required.';
    } else if (
      value.Carbs.length > LengthValidation ||
      value.Protein.length > LengthValidation ||
      value.Fats.length > LengthValidation
    ) {
      return MacrosFormatInfoText;
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
  private static validationScoreText(value: string) {
    if (value.length == 0 || Number(value) == 0) {
      return 'This field is required.';
    }
    return '';
  }
  private static validateScore(value: string) {
    if (value.length == 0 || Number(value) == 0) {
      return false;
    }
    return true;
  }
  private static validationYouTubeLinkText(value: string) {
    if (value.length == 0) {
      return 'At least one of these fields is required.';
    } else if (!this.isValidYouTubeUrl(value)) {
      return 'Please enter a valid YouTube link.';
    }
    return '';
  }
  private static validateYouTubeLink(value: string) {
    if (value.length == 0) {
      return false;
    } else if (!this.isValidYouTubeUrl(value)) {
      return false;
    }
    return true;
  }
}

export default ValidationForms;
