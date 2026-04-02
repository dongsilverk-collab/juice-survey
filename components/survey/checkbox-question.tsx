"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { QuestionOption } from "@/config/survey-config";

interface CheckboxQuestionProps {
  value: string[] | undefined;
  onChange: (value: string[]) => void;
  options: QuestionOption[];
}

export function CheckboxQuestion({
  value = [],
  onChange,
  options,
}: CheckboxQuestionProps) {
  const handleToggle = (optionValue: string, checked: boolean) => {
    if (checked) {
      onChange([...value, optionValue]);
    } else {
      onChange(value.filter((v) => v !== optionValue));
    }
  };

  return (
    <div className="space-y-2">
      {options.map((option) => (
        <div
          key={option.value}
          className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-accent transition-colors cursor-pointer"
          onClick={() => handleToggle(option.value, !value.includes(option.value))}
        >
          <Checkbox
            id={option.value}
            checked={value.includes(option.value)}
            onCheckedChange={(checked) =>
              handleToggle(option.value, checked === true)
            }
          />
          <Label htmlFor={option.value} className="flex-1 cursor-pointer">
            {option.label}
          </Label>
        </div>
      ))}
    </div>
  );
}
