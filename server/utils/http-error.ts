export enum HttpStatus {
  OK = 200,
  NO_FOUND = 404,
  PARAM_ERROR = 400,
  INTERNAL_ERROR = 500,
}

export class HttpError extends Error {
  constructor(
    public code: HttpStatus,
    message: string,
  ) {
    super(message);
  }
}
