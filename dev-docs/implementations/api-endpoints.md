# API Endpoints Implementation

## Overview

Complete REST API implementation for the Machine Dialogues platform, providing endpoints for dialogue and question management, AI model voting, user feedback, and system monitoring. Built with Express.js and TypeScript following MVC architecture patterns.

## Architecture

The API layer sits between the frontend/external clients and the database service layer:

```
Frontend/Client → API Endpoints → Controllers → Database Service → MongoDB
```

### Component Structure
- **Routes**: Define URL patterns and HTTP methods
- **Controllers**: Handle request/response logic and validation  
- **Base Controller**: Provides common functionality (error handling, pagination, logging)
- **Database Service**: Existing service layer for data operations
- **Middleware**: Request logging, error handling, CORS

## Key Files

### Controllers
- `src/controllers/base.controller.ts` - Abstract base class with utilities
  - Async error handling wrapper
  - Standardized success/error responses
  - Pagination parameter parsing
  - Request logging helpers
  
- `src/controllers/dialogue.controller.ts` - Dialogue management
  - CRUD operations for dialogues
  - Filtering by language, status, tags, dates
  - User feedback functionality
  - Statistics and analytics
  
- `src/controllers/question.controller.ts` - Question management
  - Question CRUD with approval workflow
  - AI model voting (approve/reject)
  - Usage tracking
  - Random question selection

### Routes
- `src/routes/index.ts` - Main API router
  - Health check endpoint
  - API information endpoint
  - Route mounting for sub-modules
  
- `src/routes/dialogue.routes.ts` - Dialogue route definitions
- `src/routes/question.routes.ts` - Question route definitions

### Server Integration
- `src/index.ts` - Express server setup with API routes

## Dependencies

### External Libraries
- `express` - HTTP server framework
- `cors` - Cross-origin resource sharing
- `helmet` - Security headers
- `winston` - Logging (via existing logger utility)

### Internal Components
- Database Service - All data operations
- Logger utility - Request and error logging
- Type definitions - API response types and interfaces

## Configuration

### Environment Variables
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- Database configuration (handled by existing database service)

### Server Configuration
```typescript
// Middleware stack
app.use(helmet());           // Security headers
app.use(cors());            // CORS support
app.use(express.json());    // JSON body parsing
app.use(requestLogging);    // Custom request logging
app.use('/api', apiRoutes); // API routes mounting
```

## API/Interface

### Response Format

All API responses follow a consistent structure:

```typescript
// Success Response
{
  "success": true,
  "data": T,
  "timestamp": "2025-07-08T21:32:40.005Z",
  "message"?: string
}

// Error Response  
{
  "success": false,
  "error": "Error message",
  "timestamp": "2025-07-08T21:32:40.005Z"
}

// Paginated Response
{
  "success": true,
  "data": {
    "data": T[],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "timestamp": "2025-07-08T21:32:40.005Z"
}
```

### Endpoint Categories

#### Dialogue Endpoints
Base path: `/api/dialogues`

| Method | Path | Description | Query Parameters |
|--------|------|-------------|------------------|
| GET | `/` | List dialogues | page, limit, language, status, tags, dateFrom, dateTo, sort |
| GET | `/:id` | Get single dialogue | - |
| GET | `/recent` | Recent dialogues | days, page, limit |
| GET | `/featured` | High-quality dialogues | page, limit |
| GET | `/stats` | Dialogue statistics | days |
| POST | `/:id/feedback` | Add user feedback | Body: `{reaction: string}` |

#### Question Endpoints  
Base path: `/api/questions`

| Method | Path | Description | Query Parameters |
|--------|------|-------------|------------------|
| GET | `/` | List questions | page, limit, language, status, tags, generatedBy, sort |
| GET | `/:id` | Get single question | - |
| GET | `/approved` | Approved questions only | page, limit |
| GET | `/random` | Random approved question | count |
| GET | `/unused` | Least-used questions | page, limit, days |
| GET | `/stats` | Question statistics | days |
| POST | `/:id/approve` | AI model approval | Body: `{model: string}` |
| POST | `/:id/reject` | AI model rejection | Body: `{model: string}` |
| POST | `/:id/use` | Mark as used | - |

#### System Endpoints
Base path: `/api`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | System health check |
| GET | `/` | API information |

### Error Codes

| HTTP Status | Meaning | Example |
|-------------|---------|---------|
| 200 | Success | Request completed successfully |
| 400 | Bad Request | Invalid parameters or validation error |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Database or system error |

## Testing Strategy

### Manual Testing
- All endpoints tested with curl commands
- Pagination and filtering verified
- Error cases validated (invalid IDs, missing resources)
- Query parameter parsing confirmed
- Response format consistency checked

### Test Coverage
- ✅ Endpoint availability
- ✅ Parameter validation
- ✅ Error handling
- ✅ Response format
- ✅ Pagination logic
- ✅ Query filtering

### Future Testing
- Unit tests for controllers
- Integration tests for full API workflows
- Load testing for performance validation
- API documentation testing with Swagger

## Deployment Notes

### Production Considerations
- Enable production logging levels
- Configure CORS for specific domains
- Set up rate limiting
- Enable API key authentication
- Configure error monitoring

### Health Monitoring
- `/api/health` endpoint provides database status
- Request logging captures all API usage
- Error handling includes database error logging

## Maintenance

### Known Limitations
1. `getUnusedQuestions` method not implemented in database service (workaround in place)
2. Random questions endpoint returns only one question (can be extended)
3. No authentication/authorization implemented yet
4. No rate limiting configured

### Monitoring Points
- Response times for database queries
- Error rates by endpoint
- Database connection health
- Request volume and patterns

### Update Procedures
1. Controllers can be extended with new methods
2. Routes easily added to existing router modules
3. Base controller provides consistent patterns for new endpoints
4. Database service integration points clearly defined

### Future Enhancements
- OpenAPI/Swagger documentation generation
- Request/response validation middleware
- Caching layer for frequently accessed data
- WebSocket support for real-time updates
- Bulk operations for efficient data management