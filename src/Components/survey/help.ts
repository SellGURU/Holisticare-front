const getQuestionText = (question: ApiQuestion): string | null => {
  if (question.hide == true) return null;
  if (typeof question.text === 'string' && question.text) return question.text;
  if (typeof question.question === 'string' && question.question)
    return question.question;
  if (typeof question.title === 'string' && question.title)
    return question.title;
  return 'Question';
};

export { getQuestionText };
