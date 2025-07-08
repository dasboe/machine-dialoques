# API Design Decisions

## Context

The Machine Dialogues platform needed a REST API to expose database functionality and enable future AI integration and frontend development. Key decisions were needed around API structure, response format, error handling, and endpoint organization.

## Options Considered

### 1. API Architecture Pattern

**Option A: Monolithic Controller**
- Pros: Simple, all endpoints in one place
- Cons: Poor maintainability, violates separation of concerns

**Option B: Feature-based Controllers** 
- Pros: Clear separation, maintainable, follows MVC patterns
- Cons: More files to manage

**Option C: Resource-based Controllers**
- Pros: RESTful, clear resource boundaries
- Cons: May not fit all business logic patterns

### 2. Response Format Standardization

**Option A: Direct Data Response**
```json
{
  "id": 1,
  "name": "Example"
}
```
- Pros: Simple, minimal overhead
- Cons: No metadata, inconsistent error handling

**Option B: Envelope Pattern**
```json
{
  "success": true,
  "data": {...},
  "timestamp": "...",
  "message": "..."
}
```
- Pros: Consistent structure, metadata support, clear success/error indication
- Cons: Slightly more verbose

**Option C: GraphQL-style Response**
- Pros: Flexible, self-documenting
- Cons: Overkill for REST API, complexity overhead

### 3. Error Handling Strategy

**Option A: HTTP Status Codes Only**
- Pros: Standard HTTP semantics
- Cons: Limited error information

**Option B: Structured Error Objects**
- Pros: Detailed error information, consistent format
- Cons: More complex to implement

**Option C: Error Codes + Messages**
- Pros: Both machine and human readable
- Cons: Requires error code management

### 4. Pagination Approach

**Option A: Offset/Limit**
- Pros: Simple, widely understood
- Cons: Performance issues with large datasets

**Option B: Cursor-based**
- Pros: Better performance, consistent results
- Cons: More complex, harder to implement "jump to page"

**Option C: Page/Size**
- Pros: User-friendly, good for UIs
- Cons: Can have consistency issues with concurrent updates

## Decision

### Architecture: Option B - Feature-based Controllers
- **Chosen**: Feature-based controllers (`DialogueController`, `QuestionController`)
- **Reasoning**: Provides clear separation of concerns, follows MVC patterns, and scales well as features are added

### Response Format: Option B - Envelope Pattern  
- **Chosen**: Standardized envelope with success/error indication
- **Reasoning**: Provides consistent client experience, supports metadata, and enables clear error handling

### Error Handling: Option B - Structured Error Objects
- **Chosen**: Consistent error response format with HTTP status codes
- **Reasoning**: Provides detailed error information while maintaining HTTP semantics

### Pagination: Option C - Page/Size with Metadata
- **Chosen**: Page/limit parameters with comprehensive pagination metadata
- **Reasoning**: User-friendly for frontend development, includes helpful navigation metadata (hasNext/hasPrev)

## Additional Design Decisions

### Base Controller Pattern
- **Decision**: Create abstract `BaseController` class with common functionality
- **Reasoning**: Promotes code reuse, ensures consistent error handling, and provides utility methods

### Async Error Handling
- **Decision**: Use async wrapper pattern to catch unhandled promise rejections
- **Reasoning**: Prevents server crashes from unhandled async errors

### Request Logging
- **Decision**: Log all API requests with metadata (IP, user agent, query params)
- **Reasoning**: Essential for debugging, monitoring, and security analysis

### Query Parameter Parsing
- **Decision**: Provide utility methods for common parameter types (arrays, dates, pagination)
- **Reasoning**: Ensures consistent parsing behavior across all endpoints

## Consequences

### Positive
- **Consistency**: All endpoints follow the same patterns and response formats
- **Maintainability**: Clear separation of concerns makes the codebase easy to extend
- **Developer Experience**: Predictable API behavior and comprehensive error messages
- **Monitoring**: Built-in logging and health check capabilities
- **Type Safety**: Full TypeScript integration with proper type definitions

### Negative
- **Verbosity**: Response envelope adds some overhead to responses
- **Complexity**: More files and abstractions compared to simpler approaches
- **Learning Curve**: New developers need to understand the controller inheritance pattern

### Mitigation Strategies
- Comprehensive documentation of patterns and conventions
- Clear examples in the codebase for common scenarios
- Utility methods in base controller reduce boilerplate

## Date

2025-07-08

## Status

- [x] Accepted
- [ ] Proposed  
- [ ] Superseded by [link]

## Implementation Notes

### Response Format Example
```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}
```

### Error Handling Example  
```typescript
protected sendError(res: Response, message: string, statusCode: number = 500): Response {
  const response: ApiResponse = {
    success: false,
    error: message,
    timestamp: new Date()
  };
  return res.status(statusCode).json(response);
}
```

### Pagination Example
```typescript
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

This design provides a solid foundation for API development while maintaining flexibility for future enhancements.