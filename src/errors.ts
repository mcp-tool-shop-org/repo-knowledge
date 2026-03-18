export interface RkError {
  code: string;
  message: string;
  hint?: string;
  cause?: string;
  retryable?: boolean;
}

export class RepoKnowledgeError extends Error {
  code: string;
  hint?: string;
  declare cause?: string;
  retryable: boolean;

  constructor(code: string, message: string, opts?: { hint?: string; cause?: string; retryable?: boolean }) {
    super(message);
    this.name = 'RepoKnowledgeError';
    this.code = code;
    this.hint = opts?.hint;
    this.cause = opts?.cause;
    this.retryable = opts?.retryable ?? false;
  }

  toJSON(): RkError {
    return {
      code: this.code,
      message: this.message,
      hint: this.hint,
      cause: this.cause,
      retryable: this.retryable,
    };
  }
}
