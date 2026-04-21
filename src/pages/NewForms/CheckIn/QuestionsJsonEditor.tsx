/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useMemo, useState } from 'react';

interface QuestionsJsonEditorProps {
  questions: Array<QuestionaryType>;
  scoring: Array<ScoringRuleType>;
  onChange: (
    questions: Array<QuestionaryType>,
    scoring: Array<ScoringRuleType>,
  ) => void;
  onError: (message: string) => void;
}

const MAX_FORMULA_LENGTH = 512;

// A self-contained, chat-ready prompt. Paste this into any LLM to generate a
// valid Holisticare questionnaire JSON. Keep lines short so it renders well
// when pasted into chat boxes with narrow viewports.
const LLM_PROMPT_GUIDE = `You are helping me author a Holisticare questionnaire in JSON.
Return ONLY a single JSON object with this exact shape — no prose, no markdown fences:

{
  "questions": [ ...question objects... ],
  "scoring":   [ ...optional scoring rules... ]
}

## Question object fields

Required:
- "id"        (string)  Stable machine id, e.g. "q_weight". Used as a variable in scoring formulas. Must be unique.
- "question"  (string)  The text shown to the client.
- "type"      (string)  One of: "Paragraph", "Number", "Scale", "Yes/No", "Emojis", "Star Rating", "File Uploader", "checkbox", "multiple_choice".
- "required"  (boolean) Whether the client must answer.
- "response"  (string)  Leave as "" for templates; filled in later by the client.

Optional:
- "order"              (number)  Display order (1-based).
- "options"            (string[]) Required when type is "checkbox" or "multiple_choice".
- "unit"               (string)  e.g. "kg", "cm", "mg/dL".
- "is_biomarker"       (boolean) If true, the answer itself becomes a biomarker.
- "map_to_biomarker"   (string)  Canonical biomarker name when is_biomarker is true.
- "is_goal" | "is_condition" | "is_medication" | "is_allergy" (boolean).
- "use_in_insight"     (boolean) Include this answer in AI insight prompts.
- "use_function_calculation" (boolean) Legacy Python calculation hook.
- "hide"               (boolean) Hide the question by default.
- "conditions"         (array)   Conditional display rules, see below.

### Conditional display ("conditions")

[
  {
    "priority": 1,
    "logic": "AND",                 // or "OR"
    "rules": [
      { "question_order": 2, "operator": "equals", "value": "Yes" }
    ],
    "actions": [ { "type": "show this question" } ]   // or "hide this question"
  }
]

Allowed operators: equals, not equals, greater than, less than,
greater than or equal, less than or equal, contains, not contains,
starts with, ends with, matches regex, not matches regex,
length equals, length greater, length less, date after, date before, date equals.

## Scoring rules ("scoring", optional)

Each rule derives a new biomarker value from question responses.

Fields per rule:
- "name"              (string, required)  Label for this rule.
- "formula"           (string, required)  Expression using question ids as variables. Max 512 chars.
- "map_to_biomarker"  (string, optional)  Canonical biomarker name to emit.
- "unit"              (string, optional)  e.g. "kg/m^2".
- "round"             (number, optional)  Decimal places for the output.

### Formula syntax (safe whitelist — NO eval)

- Variables: question ids (e.g. q_weight, q_height). Non-numeric or missing responses cause the rule to skip silently.
- Operators: + - * / // % ** and parentheses.
- Comparisons: == != < <= > >= combined with "and" / "or".
- Ternary: value_if_true if condition else value_if_false.
- Functions: sum(...), avg(...), min(...), max(...), round(x, n), abs(x), sqrt(x), if_(cond, a, b).
- NOT allowed: attribute access, subscripts, lambdas, string literals, keyword arguments, imports, any name not in the variables dict.

### Full example

{
  "questions": [
    {
      "id": "q_weight",
      "question": "What is your weight?",
      "type": "Number",
      "required": true,
      "response": "",
      "unit": "kg"
    },
    {
      "id": "q_height",
      "question": "What is your height?",
      "type": "Number",
      "required": true,
      "response": "",
      "unit": "cm"
    },
    {
      "id": "q_gad_1",
      "question": "Feeling nervous, anxious, or on edge",
      "type": "multiple_choice",
      "required": true,
      "response": "",
      "options": ["Not at all", "Several days", "More than half the days", "Nearly every day"]
    }
  ],
  "scoring": [
    {
      "name": "BMI",
      "map_to_biomarker": "Body Mass Index",
      "unit": "kg/m^2",
      "formula": "q_weight / ((q_height / 100) ** 2)",
      "round": 2
    }
  ]
}

## Constraints

- "id" values must be unique, lowercase snake_case, and start with a letter.
- Do not include trailing commas or comments.
- Respond with ONLY the JSON object. No \`\`\` fences, no explanation.

Now produce a questionnaire for the following goal:
<describe what the questionnaire should cover here>`;

type ValidationResult = {
  questions: Array<QuestionaryType>;
  scoring: Array<ScoringRuleType>;
};

const validateShape = (raw: any): ValidationResult => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('Root must be an object with "questions" and optional "scoring".');
  }

  const rawQuestions = raw.questions;
  if (!Array.isArray(rawQuestions)) {
    throw new Error('"questions" must be an array.');
  }

  const seenIds = new Set<string>();
  const questions: Array<QuestionaryType> = rawQuestions.map(
    (item: any, index: number) => {
      if (!item || typeof item !== 'object') {
        throw new Error(`Question #${index + 1} must be an object.`);
      }
      if (typeof item.question !== 'string' || !item.question.trim()) {
        throw new Error(`Question #${index + 1} is missing a "question" string.`);
      }
      if (typeof item.type !== 'string' || !item.type.trim()) {
        throw new Error(`Question #${index + 1} is missing a "type" string.`);
      }
      if (item.id !== undefined) {
        if (typeof item.id !== 'string' || !item.id.trim()) {
          throw new Error(`Question #${index + 1} has an invalid "id".`);
        }
        if (seenIds.has(item.id)) {
          throw new Error(`Question #${index + 1} has a duplicate id "${item.id}".`);
        }
        seenIds.add(item.id);
      }
      return item as QuestionaryType;
    },
  );

  const rawScoring = raw.scoring;
  let scoring: Array<ScoringRuleType> = [];
  if (rawScoring !== undefined && rawScoring !== null) {
    if (!Array.isArray(rawScoring)) {
      throw new Error('"scoring" must be an array when provided.');
    }
    scoring = rawScoring.map((rule: any, index: number) => {
      if (!rule || typeof rule !== 'object') {
        throw new Error(`Scoring rule #${index + 1} must be an object.`);
      }
      if (typeof rule.name !== 'string' || !rule.name.trim()) {
        throw new Error(`Scoring rule #${index + 1} is missing a "name".`);
      }
      if (typeof rule.formula !== 'string' || !rule.formula.trim()) {
        throw new Error(`Scoring rule #${index + 1} is missing a "formula".`);
      }
      if (rule.formula.length > MAX_FORMULA_LENGTH) {
        throw new Error(
          `Scoring rule #${index + 1} formula exceeds ${MAX_FORMULA_LENGTH} characters.`,
        );
      }
      if (
        rule.map_to_biomarker !== undefined &&
        typeof rule.map_to_biomarker !== 'string'
      ) {
        throw new Error(
          `Scoring rule #${index + 1} "map_to_biomarker" must be a string.`,
        );
      }
      if (rule.unit !== undefined && typeof rule.unit !== 'string') {
        throw new Error(`Scoring rule #${index + 1} "unit" must be a string.`);
      }
      if (
        rule.round !== undefined &&
        (typeof rule.round !== 'number' || !Number.isFinite(rule.round))
      ) {
        throw new Error(`Scoring rule #${index + 1} "round" must be a number.`);
      }
      return rule as ScoringRuleType;
    });
  }

  return { questions, scoring };
};

const serialize = (
  questions: Array<QuestionaryType>,
  scoring: Array<ScoringRuleType>,
): string => {
  const payload: { questions: Array<QuestionaryType>; scoring?: Array<ScoringRuleType> } = {
    questions,
  };
  if (scoring && scoring.length > 0) {
    payload.scoring = scoring;
  }
  return JSON.stringify(payload, null, 2);
};

const QuestionsJsonEditor: FC<QuestionsJsonEditorProps> = ({
  questions,
  scoring,
  onChange,
  onError,
}) => {
  const initialText = useMemo(
    () => serialize(questions, scoring),
    // Only recompute when the parent replaces the arrays (not on every
    // character edit — the editor owns the text during interaction).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [text, setText] = useState<string>(initialText);
  const [error, setError] = useState<string>('');
  const [guideOpen, setGuideOpen] = useState<boolean>(false);
  const [guideCopied, setGuideCopied] = useState<boolean>(false);

  const copyGuide = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(LLM_PROMPT_GUIDE);
      } else {
        const ta = document.createElement('textarea');
        ta.value = LLM_PROMPT_GUIDE;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setGuideCopied(true);
      window.setTimeout(() => setGuideCopied(false), 1500);
    } catch {
      setGuideCopied(false);
    }
  };

  // When the parent replaces the data (e.g. user switches questionnaires),
  // re-sync the editor.
  useEffect(() => {
    setText(serialize(questions, scoring));
    setError('');
    onError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions, scoring]);

  const applyText = (next: string) => {
    setText(next);
    try {
      const parsed = JSON.parse(next);
      const validated = validateShape(parsed);
      setError('');
      onError('');
      onChange(validated.questions, validated.scoring);
    } catch (err: any) {
      const message = err?.message || 'Invalid JSON.';
      setError(message);
      onError(message);
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(text);
      const formatted = JSON.stringify(parsed, null, 2);
      setText(formatted);
      try {
        const validated = validateShape(parsed);
        setError('');
        onError('');
        onChange(validated.questions, validated.scoring);
      } catch (err: any) {
        const message = err?.message || 'Invalid JSON.';
        setError(message);
        onError(message);
      }
    } catch (err: any) {
      const message = err?.message || 'Invalid JSON.';
      setError(message);
      onError(message);
    }
  };

  return (
    <div className="w-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] text-Text-Secondary">
          Edit the full <code>questions</code> array (and optional <code>scoring</code>) as JSON.
        </div>
        <button
          type="button"
          onClick={handleFormat}
          className="rounded-full border border-Gray-50 bg-white px-3 py-1 text-[11px] text-Text-Primary hover:border-Primary-DeepTeal"
        >
          Format
        </button>
      </div>

      <textarea
        value={text}
        onChange={(e) => applyText(e.target.value)}
        spellCheck={false}
        className="w-full min-h-[420px] rounded-[16px] border border-Gray-50 bg-[#0F172A] text-[#E2E8F0] p-4 text-[12px] font-mono outline-none resize-y"
      />

      <div className="mt-2 min-h-[16px] text-[11px]">
        {error ? (
          <span className="text-red-500">{error}</span>
        ) : (
          <span className="text-Text-Secondary">JSON is valid.</span>
        )}
      </div>

      <div className="mt-3 rounded-xl bg-[#F8FAFB] border border-Gray-50">
        <div className="flex items-center justify-between p-3">
          <button
            type="button"
            onClick={() => setGuideOpen((v) => !v)}
            className="flex items-center gap-2 text-[12px] font-medium text-Text-Primary"
          >
            <span
              className={`inline-block transition-transform ${
                guideOpen ? 'rotate-90' : ''
              }`}
            >
              ▸
            </span>
            Structure & formulas guide
            <span className="text-[10px] font-normal text-Text-Secondary">
              (copy-paste into any chat to generate JSON)
            </span>
          </button>
          <button
            type="button"
            onClick={copyGuide}
            className={`rounded-full px-3 py-1 text-[11px] border transition-colors ${
              guideCopied
                ? 'bg-Primary-EmeraldGreen text-white border-Primary-EmeraldGreen'
                : 'bg-white text-Text-Primary border-Gray-50 hover:border-Primary-DeepTeal'
            }`}
          >
            {guideCopied ? 'Copied!' : 'Copy prompt'}
          </button>
        </div>

        {guideOpen && (
          <div className="px-3 pb-3">
            <div className="rounded-lg border border-Gray-50 bg-white p-2">
              <textarea
                readOnly
                value={LLM_PROMPT_GUIDE}
                spellCheck={false}
                className="w-full h-[260px] resize-y bg-transparent text-[11px] font-mono text-Text-Primary outline-none"
                onFocus={(e) => e.currentTarget.select()}
              />
            </div>
            <div className="mt-2 text-[10px] text-Text-Secondary">
              Tip: click anywhere in the box to select the whole prompt, or use the
              Copy button. Paste into ChatGPT / Claude / any LLM, describe the
              questionnaire you need, and paste the returned JSON back here.
            </div>
          </div>
        )}

        <div className="px-3 pb-3 text-[11px] text-Text-Secondary">
          <div className="font-medium text-Text-Primary mb-1">Quick reference</div>
          <div>
            Variables are question ids (e.g. <code>q_weight</code>). Operators:
            <code> + - * / ** ( )</code>. Functions:
            <code> sum, avg, min, max, round, abs, sqrt, if_(cond, a, b)</code>.
          </div>
          <div className="mt-1">
            BMI example:
            <code> q_weight / ((q_height / 100) ** 2)</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionsJsonEditor;
