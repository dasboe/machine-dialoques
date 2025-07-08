# Technical Specification: Machine Dialogues

## 1. Overview

"Machine Dialogues" is an automated platform generating philosophical dialogues between leading AI models (e.g., Grok, ChatGPT, LLaMA). It offers a transparent API, multilingual content, rule-based quality control, and an Open Source model.

## 2. Architecture

### 2.1 System Components

- **Scheduler**: Weekly dialogue generation (`node-cron`, AWS EventBridge).
- **Dialogue Generator**: API calls with a unified prompt.
- **Quality Control**: Rule-based checks (relevance, coherence, originality, ethics).
- **Voting Module**: Selects best response.
- **Summarization Module**: Generates summaries.
- **Translation Module**: Multilingual support via DeepL.
- **Database**: MongoDB for questions, dialogues, feedback, logs.
- **API Server**: RESTful endpoints.
- **Frontend (optional)**: Vue.js/Tailwind CSS, alternatively Astro.

### 2.2 Technology Stack

| Component     | Technology/Service               | Notes                      |
| ------------- | -------------------------------- | -------------------------- |
| Backend       | Node.js/Express                  | REST API, scalability      |
| Database      | MongoDB                          | Flexible schema            |
| Scheduler     | node-cron / AWS EventBridge      | Weekly tasks               |
| AI Models     | xAI (Grok), OpenAI, Hugging Face | Dialogue generation        |
| Translation   | DeepL API                        | Multilingual support       |
| CI/CD         | GitHub Actions                   | Automated tests/deployment |
| Container     | Docker                           | Consistency                |
| Frontend      | Vue.js + Tailwind CSS / Astro    | User interface             |
| Visualization | Chart.js / D3.js                 | Animations, infographics   |

### 2.3 Architecture Diagram

```
[Scheduler] -> [Dialogue Generator] -> [AI Models APIs]
                    |
                    v
              [Quality Control]
                    |
                    v
              [Voting Module]
                    |
                    v
              [Summarization Module]
                    |
                    v
              [Translation Module]
                    |
                    v
                [MongoDB]
                    |
                    v
                [API Server] -> [Frontend]
```

## 3. Data Flow

### 3.1 Question Generation

1. Scheduler triggers weekly task.
2. AI model (rotating among Grok, ChatGPT, LLaMA) generates a question using:
   - **Prompt**: "Generate a philosophical question exploring fundamental truths about existence, consciousness, ethics, the universe, or the future, from a non-human-centric perspective. Ensure first-principles reasoning and avoid harm."
3. Validation:
   - Relevance: Cosine similarity (>0.7, Sentence-BERT) to thematic space.
   - Novelty: Cosine similarity with archive (<0.9).
   - Ethics: Blacklist scan (hate speech, incitement, distress).
4. Approval: 4/6 AI models approve via prompt: "Does this question align with first-principles reasoning, non-human-centric perspective, and harm avoidance? (Yes/No)."
5. If rejected, retry up to 3 times, then use fallback question (e.g., "What is the nature of reality?").
6. Store in MongoDB with metadata.

### 3.2 Dialogue Generation

1. API calls to 4 AI models with unified prompt: "Argue from first principles, seeking fundamental truths, without human-centric biases, and avoid harm."
2. Quality control:
   - Relevance: Cosine similarity (>0.7).
   - Coherence: Text metrics (3–10 sentences).
   - Originality: Cosine similarity with archive (<0.9).
   - Ethics: Blacklist scan.
3. Error handling: Fallback to local model, 10s timeout, errors in `/logs/errors`.
4. Voting: Best response based on 40% relevance, 30% coherence, 30% originality.
5. Summary via Hugging Face.
6. Storage in MongoDB, including model versions.
7. Translation to 5 languages.

### 3.3 Feedback (Future)

- POST endpoint `/dialogs/:id/feedback` for reactions (e.g., `{ "reaction": "surprising" }`).
- Dropdown UI with options: "Did this surprise you?", "Was this inspiring?", "Was this coherent?".
- Aggregated statistics in MongoDB (e.g., `{ "reaction": "surprising", "count": 12 }`).

## 4. API Specification

| Endpoint                | Method | Description                  | Parameters                   | Response Format     |
| ----------------------- | ------ | ---------------------------- | ---------------------------- | ------------------- |
| `/dialogs`              | GET    | All dialogues                | page, limit, language, topic | JSON (Array)        |
| `/dialogs/:id`          | GET    | Single dialogue              | —                            | JSON (Object)       |
| `/questions`            | GET    | All questions                | —                            | JSON (Array)        |
| `/manifest`             | GET    | Platform constitution        | language                     | JSON / HTML         |
| `/archive`              | GET    | Dialogue archive             | topic, date range            | JSON                |
| `/logs/rejected`        | GET    | Rejected questions/responses | date range                   | JSON                |
| `/logs/errors`          | GET    | API error logs               | date range                   | JSON                |
| `/dialogs/:id/feedback` | POST   | Submit feedback              | —                            | JSON (Confirmation) |

### Sample Feedback Payload

```json
{
  "reaction": "surprising"
}
```

## 5. Database Schema (MongoDB)

### Dialogue

```json
{
  "_id": ObjectId,
  "question": "What is the nature of time?",
  "responses": [
    { "aiName": "AI-1", "model": "Grok", "version": "3.0", "text": "...", "prompt": "...", "language": "en" },
    ...
  ],
  "chosenAnswer": "response_id",
  "summary": "...",
  "languages": ["en", "de", "es", "fr", "zh"],
  "date": ISODate,
  "feedback": [{ "reaction": "surprising", "count": 12 }]
}
```

### Question

```json
{
  "_id": ObjectId,
  "text": "What is the nature of time?",
  "tags": ["philosophy", "universe"],
  "lastUsed": ISODate,
  "relevanceScore": Number,
  "nonHumanCentricWeight": Number,
  "generatedBy": "Grok",
  "approvedBy": ["Grok", "ChatGPT", "LLaMA", "ModelX"]
}
```

### Rejected Questions/Responses

```json
{
  "_id": ObjectId,
  "content": { /* question or response object */ },
  "reason": "Risk of distress",
  "date": ISODate
}
```

### Error Logs

```json
{
  "_id": ObjectId,
  "error": "API timeout",
  "model": "ChatGPT",
  "date": ISODate
}
```

## 6. Quality Control

```javascript
async function qualityCheck(content, thematicSpace) {
  const relevance = await computeCosineSimilarity(content, thematicSpace); // Sentence-BERT
  const coherence = checkTextMetrics(content); // 3–10 sentences
  const originality = await checkOriginality(content); // Cosine <0.9
  const ethics = checkBlacklist(content, [
    "hate speech",
    "incitement",
    "distress",
  ]);
  if (relevance > 0.7 && coherence && originality > 0.8 && ethics.isSafe) {
    return true;
  }
  await logRejectedContent(
    content,
    ethics.isSafe ? "Low quality" : "Risk of harm"
  );
  return false;
}
```

## 7. Blacklist Criteria

- **Hate Speech**: Terms promoting discrimination or violence.
- **Incitement**: Content encouraging illegal or harmful actions.
- **Psychological Distress**: Scenarios causing fear or anxiety.
- Stored in `blacklist.json`, updated via human oversight.

## 8. Error Handling

- **API Failure**: Fallback to local model (e.g., Hugging Face LLaMA).
- **Timeout**: 10s wait, errors in `/logs/errors`.
- **Token Limits**: Limit input to 300 words, retry on overrun.
- **Logging**: Errors stored in MongoDB.

## 9. Cost Optimization

- Use free/low-cost APIs (Hugging Face, xAI Free Tier).
- Cache responses in Redis.
- Batch API calls (weekly jobs).

## 10. Security & Performance

- API keys, HTTPS, rate limiting (100 requests/min).
- Monthly token rotation via GitHub Actions.
- Logging with Winston.
- Threat models: Protect against API abuse.

## 11. Deployment

- Docker for consistency.
- GitHub Actions for CI/CD.
- Hosting: Vercel (frontend), Render/AWS EC2 (backend), MongoDB Atlas.

## 12. Future Extensions

- WebSocket for live updates.
- Authentication for feedback.
- Plugin system for new models.
- AI-driven response evaluation (experimental).

## 13. Appendix

- Repository: `github.com/username/machine-dialogues`.
- OpenAPI Specification: `/docs/openapi.yaml`.
- Blacklist: `blacklist.json`.
