import { z } from 'zod';

/**
 * API error codes
 */
export const apiErrorCodeSchema = z.enum([
  'VALIDATION_ERROR',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'RATE_LIMIT_EXCEEDED',
  'QUOTA_EXCEEDED',
  'INVALID_TOKEN',
  'EXPIRED_TOKEN',
  'INVALID_CREDENTIALS',
  'TOTP_REQUIRED',
  'INVALID_TOTP',
  'API_ERROR',
  'INTERNAL_SERVER_ERROR',
  'SERVICE_UNAVAILABLE',
]);

/**
 * API error schema
 */
export const apiErrorSchema = z.object({
  code: apiErrorCodeSchema,
  message: z.string(),
  details: z.record(z.any()).optional(),
  field: z.string().optional(), // For validation errors
});

/**
 * Success response wrapper
 */
export const apiSuccessResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    timestamp: z.string().datetime().optional(),
  });

/**
 * Error response wrapper
 */
export const apiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: apiErrorSchema,
  timestamp: z.string().datetime().optional(),
});

/**
 * Paginated response metadata
 */
export const paginationMetaSchema = z.object({
  total: z.number().min(0),
  page: z.number().min(1),
  perPage: z.number().min(1).max(100),
  totalPages: z.number().min(0),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
});

/**
 * Paginated response wrapper
 */
export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    success: z.literal(true),
    data: z.array(itemSchema),
    meta: paginationMetaSchema,
    timestamp: z.string().datetime().optional(),
  });

/**
 * Pagination query params schema
 */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  perPage: z.coerce.number().min(1).max(100).default(20),
});

/**
 * Cursor-based pagination query params schema (for future use)
 */
export const cursorPaginationQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
});

// Export inferred types
export type ApiErrorCode = z.infer<typeof apiErrorCodeSchema>;
export type ApiError = z.infer<typeof apiErrorSchema>;
export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>;
export type PaginationMeta = z.infer<typeof paginationMetaSchema>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type CursorPaginationQuery = z.infer<typeof cursorPaginationQuerySchema>;

// Helper type for success responses (use with apiSuccessResponseSchema)
export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  timestamp?: string;
};

// Helper type for paginated responses
export type PaginatedResponse<T> = {
  success: true;
  data: T[];
  meta: PaginationMeta;
  timestamp?: string;
};
