"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface TextQuestionProps {
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
}

export function TextQuestion({
  value,
  onChange,
  placeholder,
  multiline,
}: TextQuestionProps) {
  if (multiline) {
    return (
      <Textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="resize-none"
      />
    );
  }

  return (
    <Input
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}
