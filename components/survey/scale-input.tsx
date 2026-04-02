"use client";

import { cn } from "@/lib/utils";

interface ScaleInputProps {
  value: number | undefined;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
}

export function ScaleInput({
  value,
  onChange,
  min = 1,
  max = 5,
  minLabel,
  maxLabel,
}: ScaleInputProps) {
  const points = Array.from({ length: max - min + 1 }, (_, i) => i + min);

  return (
    <div className="space-y-2">
      <div className="flex justify-between gap-1">
        {points.map((point) => (
          <button
            key={point}
            type="button"
            onClick={() => onChange(point)}
            className={cn(
              "flex-1 rounded-lg border-2 py-2.5 text-sm font-medium transition-all min-w-[40px]",
              value === point
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:border-primary/50 hover:bg-accent"
            )}
          >
            {point}
          </button>
        ))}
      </div>
      {(minLabel || maxLabel) && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  );
}
