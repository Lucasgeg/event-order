"use client";

import { useRef } from "react";

interface PinInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  ariaLabel?: string;
}

export function PinInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  autoFocus = false,
  ariaLabel = "Code PIN",
}: PinInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const commit = (nextValue: string) => {
    onChange(nextValue);
    if (nextValue.length === length) {
      onComplete?.(nextValue);
    }
  };

  const handleChange =
    (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const digitsOnly = e.target.value.replace(/\D/g, "");

      if (!digitsOnly) {
        commit(value.slice(0, index) + value.slice(index + 1));
        return;
      }

      // Autorise coller plusieurs chiffres d'un coup depuis n'importe quelle case
      let next = value.slice(0, index);
      for (const char of digitsOnly) {
        if (next.length >= length) break;
        next += char;
      }
      next = (next + value.slice(next.length)).slice(0, length);
      commit(next);

      const focusIndex = Math.min(index + digitsOnly.length, length - 1);
      inputRefs.current[focusIndex]?.focus();
    };

  const handleKeyDown =
    (index: number) => (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !value[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    };

  return (
    <div role="group" aria-label={ariaLabel} className="flex gap-2 justify-center">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={value[index] ?? ""}
          onChange={handleChange(index)}
          onKeyDown={handleKeyDown(index)}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          aria-label={`Chiffre ${index + 1} sur ${length}`}
          className="h-14 w-12 text-center text-xl font-bold text-ink bg-surface border border-line rounded-xl focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/25 disabled:opacity-50"
        />
      ))}
    </div>
  );
}
