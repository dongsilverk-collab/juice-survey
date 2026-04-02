"use client";

import type { SurveyQuestion } from "@/config/survey-config";
import { RatingInput } from "./rating-input";
import { ScaleInput } from "./scale-input";
import { RadioQuestion } from "./radio-question";
import { CheckboxQuestion } from "./checkbox-question";
import { TextQuestion } from "./text-question";

interface QuestionRendererProps {
  question: SurveyQuestion;
  value: string | number | string[] | undefined;
  onChange: (value: string | number | string[]) => void;
  error?: string;
}

export function QuestionRenderer({
  question,
  value,
  onChange,
  error,
}: QuestionRendererProps) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-base font-medium">
          {question.question}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </h3>
        {question.description && (
          <p className="text-sm text-muted-foreground mt-1">
            {question.description}
          </p>
        )}
      </div>

      {question.type === "rating" && (
        <RatingInput
          value={value as number | undefined}
          onChange={onChange}
          min={question.min}
          max={question.max}
        />
      )}

      {question.type === "scale" && (
        <ScaleInput
          value={value as number | undefined}
          onChange={onChange}
          min={question.min}
          max={question.max}
          minLabel={question.minLabel}
          maxLabel={question.maxLabel}
        />
      )}

      {question.type === "radio" && question.options && (
        <RadioQuestion
          value={value as string | undefined}
          onChange={onChange}
          options={question.options}
        />
      )}

      {question.type === "checkbox" && question.options && (
        <CheckboxQuestion
          value={value as string[] | undefined}
          onChange={onChange}
          options={question.options}
        />
      )}

      {question.type === "text" && (
        <TextQuestion
          value={value as string | undefined}
          onChange={onChange}
          placeholder={question.placeholder}
        />
      )}

      {question.type === "textarea" && (
        <TextQuestion
          value={value as string | undefined}
          onChange={onChange}
          placeholder={question.placeholder}
          multiline
        />
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
