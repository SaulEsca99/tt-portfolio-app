import type { SignUpDto } from "./sign-up.dto";

export interface SignUpUseCaseResult {
  success: boolean;
  userId?: string;
}

export async function executeSignUp(
  input: SignUpDto
): Promise<SignUpUseCaseResult> {
  // Additional business rules can be added here
  // For now, if DTO validation passed, we're good

  return {
    success: true,
  };
}
