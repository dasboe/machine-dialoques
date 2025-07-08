# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Root Level Commands
- `npm run dev` - Start both server and client in development mode
- `npm run build` - Build both server and client for production
- `npm test` - Run all tests (server and client)
- `npm run lint` - Lint all code (server and client)
- `npm run setup` - Install dependencies for root, server, and client

### Server Commands (from /server directory)
- `npm run dev` - Start server in watch mode with tsx
- `npm run build` - TypeScript compilation
- `npm run test` - Run Jest tests
- `npm run test:integration` - Run integration tests only
- `npm run test:db` - Run database tests only
- `npm run test:ci` - Run tests in CI mode with coverage
- `npm run lint` - ESLint TypeScript files
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run type-check` - TypeScript type checking without compilation

### Client Commands (from /client directory)
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production (runs vue-tsc then vite build)
- `npm run test` - Run Vitest tests
- `npm run lint` - ESLint with auto-fix
- `npm run type-check` - Vue TypeScript checking

## Architecture Overview

This is a monorepo with a Node.js/TypeScript backend and Vue.js/TypeScript frontend for an AI dialogue generation platform.

### Backend Structure (/server)
- **Models** (`src/models/`): MongoDB schemas using Mongoose
  - `Dialogue.ts` - Main dialogue documents with AI responses
  - `Question.ts` - Question management with approval workflow
  - `ErrorLog.ts` - Error tracking and logging
  - `RejectedContent.ts` - Content filtering and rejection tracking
- **Services** (`src/services/`): Business logic layer
  - `database.service.ts` - Database operations and health checks
- **Config** (`src/config/`): Configuration management
  - `database.ts` - MongoDB connection with environment-based configs
- **Utils** (`src/utils/`): Utility functions
  - `logger.ts` - Winston-based logging
- **Types** (`src/types/`): TypeScript type definitions

### Frontend Structure (/client)
- Vue 3 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Pinia for state management
- Vitest for testing

### Key Technologies
- **Database**: MongoDB with Mongoose ODM
- **Backend**: Express.js, TypeScript, Winston logging
- **Frontend**: Vue 3, TypeScript, Tailwind CSS
- **Testing**: Jest (backend), Vitest (frontend)
- **AI Integration**: OpenAI, Grok, LLaMA, Claude, HuggingFace models

## Database Models

### Dialogue Model
- Contains philosophical questions and AI responses
- Supports multiple AI models per dialogue
- Quality metrics and feedback tracking
- Multi-language support

### Question Model
- Manages question lifecycle with approval workflow
- AI models can approve/reject questions
- Quality scoring (relevance, originality, non-human-centric weight)
- Auto-approval when criteria met (4+ approvals, 67% ratio, 0.7+ quality)

### Error Logging
- Structured error tracking with severity levels
- Context preservation (endpoint, user, AI model)
- Resolution tracking

## Environment Setup

Copy `env.example` to `.env` and configure:
- MongoDB connection strings (separate test DB)
- AI API keys (OpenAI, Grok, etc.)
- Port configuration

## Testing

- Backend uses Jest with TypeScript
- Tests run sequentially for database operations (`maxWorkers: 1`)
- Separate test database configuration
- Integration tests for database operations
- 30-second timeout for database operations

## Quality Control

The platform implements quality control through:
- Cosine similarity for content comparison
- Blacklist filtering for inappropriate content
- Multi-model approval system for questions
- Quality metrics tracking (relevance, coherence, originality)

## Logging

Winston-based logging with different levels and structured output. Error logs are stored in the database for tracking and resolution.