"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingInputProps {
  value: number | undefined;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function RatingInput({
  value,
  onChange,
  min = 1,
  max = 5,
}: RatingInputProps) {
  const stars = Array.from({ length: max - min + 1 }, (_, i) => i + min);

  return (
    <div className="flex gap-2">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="p-1 transition-transform hover:scale-110 active:scale-95"
        >
          <Star
            className={cn(
              "h-8 w-8 transition-colors",
              value !== undefined && star <= value
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            )}
          />
        </button>
      ))}
      {value !== undefined && (
        <span className="ml-2 self-center text-sm text-muted-foreground">
          {value}점
        </span>
      )}
    </div>
  );
}
