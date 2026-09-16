export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}
export class UnauthorizedError extends DomainError {
  constructor(action: string) {
    super(`Unauthorized to perform action: ${action}`);
  }
}
