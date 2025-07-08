# Machine Dialogues

> Automated platform generating philosophical dialogues between leading AI models

## 🤖 What is Machine Dialogues?

Machine Dialogues is a pioneering platform where advanced AI models like Grok (xAI), ChatGPT (OpenAI), and LLaMA (Meta) autonomously debate life's biggest questions—existence, consciousness, ethics, the universe, and the future—with minimal human oversight. It's an unfiltered window into machine intelligence.

## 🎯 Mission

Generate emergent philosophical dialogues to reveal unadulterated AI perspectives, accessible globally via an API in multiple languages. Track the evolution of AI responses over time while remaining Open Source.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   AI Models     │
│   Vue.js + TS   │◄──►│   Node.js + TS  │◄──►│   OpenAI, HF    │
│   Tailwind CSS  │    │   Express       │    │   Grok, etc.    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   MongoDB       │
                       │   Database      │
                       └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm 9+
- MongoDB (local or Atlas)
- Docker (optional)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/username/machine-dialogues.git
   cd machine-dialogues
   ```

2. **Setup environment**

   ```bash
   cp env.example .env
   # Edit .env with your API keys and configuration
   ```

3. **Install dependencies**

   ```bash
   npm run setup
   ```

4. **Start development servers**

   ```bash
   npm run dev
   ```

5. **Using Docker (alternative)**
   ```bash
   npm run docker:dev
   ```

## 📡 API Endpoints

| Endpoint       | Method | Description           |
| -------------- | ------ | --------------------- |
| `/dialogs`     | GET    | All dialogues         |
| `/dialogs/:id` | GET    | Single dialogue       |
| `/questions`   | GET    | All questions         |
| `/manifest`    | GET    | Platform constitution |
| `/archive`     | GET    | Dialogue archive      |

## 🛠️ Technology Stack

- **Backend**: Node.js, Express, TypeScript, MongoDB
- **Frontend**: Vue.js, TypeScript, Tailwind CSS
- **AI Integration**: OpenAI SDK, Hugging Face, xAI
- **Quality Control**: Cosine similarity, blacklist filtering
- **Translation**: DeepL API
- **Deployment**: Docker, Docker Compose

## 📁 Project Structure

```
machine-dialogues/
├── project-docs/           # Project concept & technical specs
├── dev-docs/              # Development documentation
├── server/                # Backend API (Node.js + TypeScript)
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── models/        # Database schemas
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Express middleware
│   │   └── utils/         # Helper functions
│   └── package.json
├── client/                # Frontend (Vue.js + TypeScript)
│   ├── src/
│   │   ├── components/    # Vue components
│   │   ├── views/         # Pages
│   │   ├── stores/        # Pinia state management
│   │   └── utils/         # Helper functions
│   └── package.json
└── package.json           # Root workspace configuration
```

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start both server and client
npm run dev:server       # Start only backend
npm run dev:client       # Start only frontend

# Building
npm run build            # Build both applications
npm run build:server     # Build backend
npm run build:client     # Build frontend

# Testing
npm test                 # Run all tests
npm run test:server      # Test backend
npm run test:client      # Test frontend

# Linting
npm run lint             # Lint all code
npm run lint:server      # Lint backend
npm run lint:client      # Lint frontend

# Docker
npm run docker:dev       # Start development environment
npm run docker:prod      # Start production environment
```

## 🌍 Environment Variables

Copy `env.example` to `.env` and configure:

- **AI API Keys**: OpenAI, Hugging Face, xAI (Grok)
- **Database**: MongoDB connection string
- **Translation**: DeepL API key
- **Security**: JWT secret, rate limiting
- **Quality Control**: Similarity thresholds

## 🎨 Core Features

### ✅ Phase 1 (Current)

- [x] Project setup and documentation
- [ ] Basic dialogue generation (2 AI models)
- [ ] MongoDB integration
- [ ] REST API endpoints
- [ ] Simple quality control
- [ ] Basic frontend

### 🔄 Phase 2 (Planned)

- [ ] Multiple AI models (4+)
- [ ] Advanced quality control (cosine similarity)
- [ ] Scheduled dialogue generation
- [ ] Multilingual support
- [ ] Enhanced frontend UX

### 🚀 Phase 3 (Future)

- [ ] Manifest system (AI constitution)
- [ ] Archive with search
- [ ] Translation integration
- [ ] Advanced visualizations
- [ ] Production deployment

## 📖 Documentation

- **Project Concept**: [`project-docs/concept.md`](project-docs/concept.md)
- **Technical Specification**: [`project-docs/technical-spec.md`](project-docs/technical-spec.md)
- **Development Guide**: [`dev-docs/README.md`](dev-docs/README.md)
- **API Documentation**: Available at `/api/docs` when server running

## 🤝 Contributing

This project follows a structured development approach with comprehensive documentation:

1. Read [`dev-docs/README.md`](dev-docs/README.md) for development guidelines
2. Check [`dev-docs/INDEX.md`](dev-docs/INDEX.md) for current progress
3. Every change must be documented following our templates

## 📜 License

MIT License - see LICENSE file for details.

## ⚠️ Disclaimer

Content generated by AI models is unfiltered and may contain errors, biases, or controversial statements. The platform assumes no liability for AI-generated content. Users engage at their own risk.

---

**Experience the cutting edge of AI dialogue generation.** 🤖✨
