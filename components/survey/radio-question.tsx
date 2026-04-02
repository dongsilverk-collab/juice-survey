"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { QuestionOption } from "@/config/survey-config";

interface RadioQuestionProps {
  value: string | undefined;
  onChange: (value: string) => void;
  options: QuestionOption[];
}

export function RadioQuestion({
  value,
  onChange,
  options,
}: RadioQuestionProps) {
  return (
    <RadioGroup value={value ?? ""} onValueChange={onChange} className="space-y-2">
      {options.map((option) => (
        <div
          key={option.value}
          className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-accent transition-colors cursor-pointer"
          onClick={() => onChange(option.value)}
        >
          <RadioGroupItem value={option.value} id={option.value} />
          <Label htmlFor={option.value} className="flex-1 cursor-pointer">
            {option.label}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}
