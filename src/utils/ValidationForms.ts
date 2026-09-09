/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  // DoseFormatInfoText,
  // DoseValidationMetric,
  LengthValidation,
  MacrosFormatInfoText,
  ValueFormatInfoText,
} from './library-unification';

type ValidationField =
  | 'Instruction'
  | 'Dose'
  | 'Value'
  | 'Macros'
  | 'MacrosSeparately'
  | 'Title'
  | 'Type'
  | 'Category'
  | 'Note'
  | 'Score'
  | 'YouTube Link'
  | 'Parent_Title'
  | 'Based on'
  | 'Recommendation'
  | 'Intervnetion_content'
  | 'KeyBenefits'
  | 'FoodsToEat'
  | 'FoodsToAvoid'
  | 'ExercisesToDo'
  | 'ExercisesToAvoid'
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
      case 'MacrosSeparately':
        return this.validationMacrosSeparately(value);
      case 'Title':
        return this.validationTitle(value);
      case 'Type':
        return this.validateType(value);
      case 'Category':
        return this.validationCategory(value);
      case 'Note':
        return this.validationNote(value);
      case 'Score':
        return this.validateScore(value);
      case 'YouTube Link':
        return this.validateYouTubeLink(value);
      case 'Parent_Title':
        return this.validateParentTitle(value);
      case 'Recommendation':
        return this.validationRecommendation(value);
      case 'Based on':
        return this.validateBasedOn(value);
      case 'Intervnetion_content':
        return this.validateIntervnetionContent(value);
      case 'KeyBenefits':
        return this.validateKeyBenefits(value);
      case 'FoodsToEat':
        return this.validateFoodsToEat(value);
      case 'FoodsToAvoid':
        return this.validateFoodsToAvoid(value);
      case 'ExercisesToDo':
        return this.validateExercisesToDo(value);
      case 'ExercisesToAvoid':
        return this.validateExercisesToAvoid(value);
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
      case 'Type':
        return this.validationTypeText(value);
      case 'Category':
        return this.validationCategoryText(value);
      case 'Note':
        return this.validationNoteText(value);
      case 'Score':
        return this.validationScoreText(value);
      case 'YouTube Link':
        return this.validationYouTubeLinkText(value);
      case 'Parent_Title':
        return this.validationParentTitleText(value);
      case 'Recommendation':
        return this.validationRecommendationText(value);
      case 'Based on':
        return this.validationBasedOnText(value);
      case 'Intervnetion_content':
        return this.validationIntervnetionContentText(value);
      case 'KeyBenefits':
        return this.validationKeyBenefitsText(value);
      case 'FoodsToEat':
        return this.validationFoodsToEatText(value);
      case 'FoodsToAvoid':
        return this.validationFoodsToAvoidText(value);
      case 'ExercisesToDo':
        return this.validationExercisesToDoText(value);
      case 'ExercisesToAvoid':
        return this.validationExercisesToAvoidText(value);
      default:
        return '';
    }
  }

  private static validationInstructions(value: string) {
    if (!value) {
      return true;
    } else if (value.length > 400) {
      return false;
    }
    return true;
  }
  private static validationInstructionsText(value: string) {
    if (!value) {
      return '';
    } else if (value.length > 400) {
      return 'You can enter up to 400 characters.';
    }
    return '';
  }
  private static validationRecommendation(value: string) {
    if (!value || value.trim().length == 0) {
      return true;
    } else if (value.length > 1000) {
      return false;
    }
    return true;
  }
  private static validationRecommendationText(value: string) {
    if (!value || value.trim().length == 0) {
      return '';
    } else if (value.length > 1000) {
      return 'You can enter up to 1000 characters.';
    }
    return '';
  }
  private static validationDose(value: string) {
    if (!value || value.length == 0) {
      return true;
    }
    return true;
  }
  private static validationDoseText(value: string) {
    if (!value || value.length == 0) {
      return '';
    }
    return '';
  }
  private static validationValue(value: string) {
    if (!value || value.length == 0) {
      return true;
    } else if (value.length > LengthValidation) {
      return false;
    }
    return true;
  }
  private static validationValueText(value: string) {
    if (!value || value.length == 0) {
      return '';
    } else if (value.length > LengthValidation) {
      return ValueFormatInfoText;
    }
    return '';
  }
  private static validationMacros(value: any) {
    const carbs = value?.Carbs ?? '';
    const protein = value?.Protein ?? '';
    const fats = value?.Fats ?? '';
    if (carbs.length == 0 && protein.length == 0 && fats.length == 0) {
      return true;
    }
    if (
      carbs.length > LengthValidation ||
      protein.length > LengthValidation ||
      fats.length > LengthValidation
    ) {
      return false;
    }
    return true;
  }
  private static validationMacrosSeparately(value: any) {
    if (!value || value.length == 0) {
      return true;
    } else if (value.length > LengthValidation) {
      return false;
    }
    return true;
  }
  private static validationMacrosText(value: any) {
    const carbs = value?.Carbs ?? '';
    const protein = value?.Protein ?? '';
    const fats = value?.Fats ?? '';
    if (carbs.length == 0 && protein.length == 0 && fats.length == 0) {
      return '';
    } else if (
      carbs.length > LengthValidation ||
      protein.length > LengthValidation ||
      fats.length > LengthValidation
    ) {
      const NameValue =
        carbs.length > LengthValidation
          ? 'Carbs'
          : protein.length > LengthValidation
            ? 'Protein'
            : 'Fats';
      return `${NameValue} ${MacrosFormatInfoText}`;
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
    return '';
  }
  private static validateScore(_value: string) {
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
  private static validateParentTitle(value: string) {
    if (!value || value.trim().length == 0) {
      return false;
    }
    return true;
  }
  private static validationParentTitleText(value: string) {
    if (!value || value.trim().length == 0) {
      return 'This field is required.';
    }
    return '';
  }
  private static validateBasedOn(value: string) {
    if (value.length == 0) {
      return true;
    }
    return true;
  }
  private static validationBasedOnText(value: string) {
    if (value.length == 0) {
      return 'This field is required.';
    }
    return '';
  }
  private static validateIntervnetionContent(value: string) {
    if (value.length == 0) {
      return false;
    }
    return true;
  }
  private static validationIntervnetionContentText(value: string) {
    if (value.length == 0) {
      return 'This field is required.';
    }
    return '';
  }
  private static validateKeyBenefits(value: string) {
    if (value.length == 0) {
      return false;
    }
    return true;
  }
  private static validationKeyBenefitsText(value: string) {
    if (value.length == 0) {
      return 'This field is required.';
    }
    return '';
  }
  private static validateFoodsToEat(value: string) {
    if (value.length == 0) {
      return false;
    }
    return true;
  }
  private static validationFoodsToEatText(value: string) {
    if (value.length == 0) {
      return 'This field is required.';
    }
    return '';
  }
  private static validateFoodsToAvoid(value: string) {
    if (value.length == 0) {
      return false;
    }
    return true;
  }
  private static validationFoodsToAvoidText(value: string) {
    if (value.length == 0) {
      return 'This field is required.';
    }
    return '';
  }
  private static validateExercisesToDo(value: string) {
    if (value.length == 0) {
      return false;
    }
    return true;
  }
  private static validationExercisesToDoText(value: string) {
    if (value.length == 0) {
      return 'This field is required.';
    }
    return '';
  }
  private static validateExercisesToAvoid(value: string) {
    if (value.length == 0) {
      return false;
    }
    return true;
  }
  private static validationExercisesToAvoidText(value: string) {
    if (value.length == 0) {
      return 'This field is required.';
    }
    return '';
  }
  private static validateType(value: string) {
    if (value.length == 0) {
      return false;
    }
    return true;
  }
  private static validationTypeText(value: string) {
    if (value.length == 0) {
      return 'This field is required.';
    }
    return '';
  }
}

export default ValidationForms;
