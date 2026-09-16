import { Check } from "lucide-react";

import { cn } from "@/client/lib/utils";

import {
  calculatePasswordStrength,
  getStrengthColorValue,
  getStrengthLabel,
} from "../lib/password-strength.utils";

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

export function PasswordStrengthIndicator({
  password = "",
  className,
}: PasswordStrengthIndicatorProps) {
  const { score, strength, requirements } = calculatePasswordStrength(password);
  const strengthColor = getStrengthColorValue(strength);

  return (
    <div className={cn("space-y-3 pt-2", className)}>
      <div className="flex items-center gap-2">
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{
              width: `${Math.max(5, score)}%`,
              backgroundColor: strengthColor,
            }}
            role="progressbar"
            aria-valuenow={score}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Fortaleza de contraseña"
          />
        </div>
        <span
          className="w-16 text-right text-xs font-medium text-muted-foreground"
          aria-live="polite"
        >
          {getStrengthLabel(strength)}
        </span>
      </div>

      <ul className="space-y-1.5" aria-label="Requisitos de contraseña">
        {requirements.map((req) => (
          <li
            key={req.id}
            className={cn(
              "flex items-center gap-2 text-xs transition-colors duration-300",
              req.met ? "text-primary" : "text-muted-foreground"
            )}
          >
            {req.met ? (
              <Check className="size-3.5 text-green-500" aria-hidden="true" />
            ) : (
              <div
                className="size-3.5 rounded-full border border-current opacity-50"
                aria-hidden="true"
              />
            )}
            <span>
              {req.label}
              {req.optional && (
                <span className="ml-1 text-[10px] opacity-70">(Opcional)</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
