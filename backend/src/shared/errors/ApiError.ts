class ApiError extends Error {
  statusCode: number;
  message: string;
  success: boolean;
  errors: string[];

  constructor(
    statusCode: number,
    message = 'Something went wrong',
    errors = [],
  ) {
    super(message); // Call the parent constructor with the message
    this.statusCode = statusCode;
    this.message = message; //  Set the message property explicitly
    this.success = false;
    this.errors = errors;

    // Capture the stack trace (optional, but helps with debugging)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
