export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message?: string;
  errors?: string[] | Record<string, any>
}