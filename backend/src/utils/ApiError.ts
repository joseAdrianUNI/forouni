export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace?.(this, this.constructor);
  }

  static badRequest(message = "Solicitud inválida", details?: unknown) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = "No autenticado") {
    return new ApiError(401, message);
  }

  static forbidden(message = "No tienes permisos para esta acción") {
    return new ApiError(403, message);
  }

  static notFound(message = "Recurso no encontrado") {
    return new ApiError(404, message);
  }

  static conflict(message = "El recurso ya existe") {
    return new ApiError(409, message);
  }

  static internal(message = "Error interno del servidor") {
    return new ApiError(500, message);
  }
}
