/* eslint-disable @typescript-eslint/no-explicit-any */
const ResolveConditions = (questions: Array<any>) => {
  let resolvedQuestions = [];
  resolvedQuestions = questions.filter((q: any) => {
    if (q.conditions && q.conditions.length > 0) {
      const resolve = mainCondition(q, questions);
      if (resolve) {
        return q;
      } else {
        return null;
      }
    } else {
      return q;
    }
  });
  return resolvedQuestions;
};

const mainCondition = (question: any, allQuestions: Array<any>) => {
  let isVisible = false;
  const conditions = question.conditions.sort(
    (a: any, b: any) => a.priority - b.priority,
  );
  const resolveRuleAction = (rule: any) => {
    const checkQuestion = allQuestions.filter(
      (q: any) => q.order === rule.question_order,
    )[0];
    if (rule.operator === 'equals') {
      return checkQuestion.response.toLowerCase() === rule.value.toLowerCase();
    }
    if (rule.operator === 'not_equals') {
      return checkQuestion.response.toLowerCase() !== rule.value.toLowerCase();
    }

    if (rule.operator === 'greater_than') {
      return Number(checkQuestion.response) > Number(rule.value);
    }
    if (rule.operator === 'less_than') {
      return Number(checkQuestion.response) < Number(rule.value);
    }
    if (rule.operator === 'greater_than_or_equal') {
      return Number(checkQuestion.response) >= Number(rule.value);
    }
    if (rule.operator === 'less_than_or_equal') {
      return Number(checkQuestion.response) <= Number(rule.value);
    } 
    if (rule.operator === 'between') {
      return (
        Number(checkQuestion.response) >= Number(rule.value[0]) &&
        Number(checkQuestion.response) <= Number(rule.value[1])
      );
    }
    if (rule.operator === 'not_between') {
      return (
        Number(checkQuestion.response) < Number(rule.value[0]) ||
        Number(checkQuestion.response) > Number(rule.value[1])
      );
    }
    // TEXT OPERATORS
    if (rule.operator === 'contains') {
      return checkQuestion.response
        .toLowerCase()
        .includes(rule.value.toLowerCase());
    }
    if (rule.operator === 'not_contains') {
      return !checkQuestion.response
        .toLowerCase()
        .includes(rule.value.toLowerCase());
    }
    if (rule.operator === 'starts_with') {
      return checkQuestion.response
        .toLowerCase()
        .startsWith(rule.value.toLowerCase());
    }
    if (rule.operator === 'ends_with') {
      return checkQuestion.response
        .toLowerCase()
        .endsWith(rule.value.toLowerCase());
    }
    if (rule.operator === 'matches_regex') {
      return new RegExp(rule.value).test(checkQuestion.response);
    }
    if (rule.operator === 'not_matches_regex') {
      return !new RegExp(rule.value).test(checkQuestion.response);
    }
    // EXISTENCE OPERATORS
    if (rule.operator === 'is_empty') {
      return checkQuestion.response === '';
    }
    if (rule.operator === 'not_empty') {
      return checkQuestion.response !== '';
    }
    if (rule.operator === 'is_null') {
      return checkQuestion.response === null;
    }
    if (rule.operator === 'not_null') {
      return checkQuestion.response !== null;
    }
    // ARRAY OPERATORS
    if (rule.operator === 'in_array') {
      return rule.value.includes(checkQuestion.response);
    }
    if (rule.operator === 'not_in_array') {
      return !rule.value.includes(checkQuestion.response);
    }
    if (rule.operator === 'all_in_array') {
      return rule.value.every((item: any) =>
        checkQuestion.response.includes(item),
      );
    }
    if (rule.operator === 'any_in_array') {
      return rule.value.some((item: any) =>
        checkQuestion.response.includes(item),
      );
    }
    // LENGTH OPERATORS
    if (rule.operator === 'length_equals') {
      const responseLength = Array.isArray(checkQuestion.response)
        ? checkQuestion.response.length
        : String(checkQuestion.response || '').length;
      return responseLength === Number(rule.value);
    }
    if (rule.operator === 'length_greater') {
      const responseLength = Array.isArray(checkQuestion.response)
        ? checkQuestion.response.length
        : String(checkQuestion.response || '').length;
      return responseLength > Number(rule.value);
    }
    if (rule.operator === 'length_less') {
      const responseLength = Array.isArray(checkQuestion.response)
        ? checkQuestion.response.length
        : String(checkQuestion.response || '').length;
      return responseLength < Number(rule.value);
    }
    if (rule.operator === 'length_between') {
      const responseLength = Array.isArray(checkQuestion.response)
        ? checkQuestion.response.length
        : String(checkQuestion.response || '').length;
      return responseLength >= Number(rule.value[0]) && responseLength <= Number(rule.value[1]);
    }
    // DATE OPERATORS (format: 2024-01-15)
    if (rule.operator === 'date_after') {
      const responseDate = new Date(checkQuestion.response);
      const compareDate = new Date(rule.value);
      return responseDate > compareDate;
    }
    if (rule.operator === 'date_before') {
      const responseDate = new Date(checkQuestion.response);
      const compareDate = new Date(rule.value);
      return responseDate < compareDate;
    }
    if (rule.operator === 'date_between') {
      const responseDate = new Date(checkQuestion.response);
      const startDate = new Date(rule.value[0]);
      const endDate = new Date(rule.value[1]);
      return responseDate >= startDate && responseDate <= endDate;
    }
    if (rule.operator === 'date_equals') {
      const responseDate = new Date(checkQuestion.response);
      const compareDate = new Date(rule.value);
      return responseDate.getTime() === compareDate.getTime();
    }
    // FILE OPERATORS
    if (rule.operator === 'file_uploaded') {
      console.log(checkQuestion.response);
      return (checkQuestion.response?.frontal?.length > 0 || checkQuestion.response?.back?.length > 0 || checkQuestion.response?.side?.length > 0 )
    }
    if (rule.operator === 'file_not_uploaded') {
      return (!(checkQuestion.response?.frontal?.length > 0 || checkQuestion.response?.back?.length > 0 || checkQuestion.response?.side?.length > 0 ));
    }
    if (rule.operator === 'file_size_greater') {
      // rule.value format: 524288 (bytes)
      const fileSize =
        checkQuestion.response?.size || checkQuestion.response?.fileSize || 0;
      return fileSize > rule.value;
    }
    if (rule.operator === 'file_size_less') {
      // rule.value format: 524288 (bytes)
      const fileSize =
        checkQuestion.response?.size || checkQuestion.response?.fileSize || 0;
      return fileSize < rule.value;
    }
  };
  conditions.forEach((condition: any) => {
    if (condition.logic === 'AND') {
      const maped = condition.rules.map((rule: any) => {
        return resolveRuleAction(rule);
      });
      if (maped.every((result: any) => result === true)) {
        if (condition.actions[0].type === 'show') {
          isVisible = true;
        }
      } else {
        if (condition.actions[0].type === 'hide') {
          isVisible = true;
        }
      }
    }
    if (condition.logic === 'OR') {
      const maped = condition.rules.map((rule: any) => {
        return resolveRuleAction(rule);
      });
      if (maped.some((result: any) => result === true)) {
        if (condition.actions[0].type === 'show') {
          isVisible = true;
        }
      }
    }
  });

  console.log(conditions);
  return isVisible;
};
export default ResolveConditions;
