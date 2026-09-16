export interface PasswordRequirement {
  id: string;
  label: string;
  test: (password: string) => boolean;
  weight: number;
  optional?: boolean;
}

export const PASSWORD_REQUIREMENTS: readonly PasswordRequirement[] = [
  {
    id: "length",
    label: "Al menos 8 caracteres",
    test: (password) => password.length >= 8,
    weight: 50,
    optional: false,
  },
  {
    id: "number",
    label: "Al menos un número",
    test: (password) => /\d/.test(password),
    weight: 25,
    optional: true,
  },
  {
    id: "special",
    label: "Al menos un carácter especial (@$!%*?&)",
    test: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
    weight: 25,
    optional: true,
  },
] as const;

export type PasswordStrength = "weak" | "medium" | "strong";

export interface PasswordStrengthResult {
  score: number;
  strength: PasswordStrength;
  requirements: Array<{
    id: string;
    label: string;
    met: boolean;
    optional?: boolean;
  }>;
}

export function calculatePasswordStrength(
  password: string
): PasswordStrengthResult {
  const requirements = PASSWORD_REQUIREMENTS.map((req) => ({
    id: req.id,
    label: req.label,
    met: req.test(password),
    optional: req.optional,
  }));

  const score = PASSWORD_REQUIREMENTS.reduce((acc, req) => {
    return req.test(password) ? acc + req.weight : acc;
  }, 0);

  let strength: PasswordStrength;
  if (score < 50) {
    strength = "weak";
  } else if (score < 100) {
    strength = "medium";
  } else {
    strength = "strong";
  }

  return {
    score,
    strength,
    requirements,
  };
}

export const STRENGTH_CONFIG = {
  weak: {
    label: "Débil",
    colorClass: "bg-red-500",
    colorValue: "rgb(239 68 68)",
    minScore: 0,
  },
  medium: {
    label: "Buena",
    colorClass: "bg-yellow-500",
    colorValue: "rgb(234 179 8)",
    minScore: 50,
  },
  strong: {
    label: "Fuerte",
    colorClass: "bg-green-500",
    colorValue: "rgb(34 197 94)",
    minScore: 100,
  },
} as const;

export function getStrengthColor(strength: PasswordStrength): string {
  return STRENGTH_CONFIG[strength].colorClass;
}

export function getStrengthColorValue(strength: PasswordStrength): string {
  return STRENGTH_CONFIG[strength].colorValue;
}

export function getStrengthLabel(strength: PasswordStrength): string {
  return STRENGTH_CONFIG[strength].label;
}
