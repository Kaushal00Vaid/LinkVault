class ApiError extends Error {
  statusCode: number;
  errors: string[];
  isOperational: boolean;

  constructor(statusCode: number, message: string, errors: string[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;

    // maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
