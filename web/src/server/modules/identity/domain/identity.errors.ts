import { DomainError } from "@/server/shared/errors";

export class UserUnderageError extends DomainError {
  constructor() {
    super("User must be at least 18 years old to register");
  }
}

export class InvalidPhoneNumberError extends DomainError {
  constructor() {
    super("Phone number must be exactly 10 digits");
  }
}

export class InvalidEmailError extends DomainError {
  constructor(email: string) {
    super(`Invalid email format: ${email}`);
  }
}

export class UserAlreadyExistsError extends DomainError {
  constructor(email: string) {
    super(`User with email ${email} already exists`);
  }
}
