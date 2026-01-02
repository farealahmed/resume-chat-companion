# Resume Chat Companion

A full-stack web application that enables real-time, conversational AI interactions with uploaded PDF resumes. Ask natural language questions about any resume and get instant, context-aware answers powered by local LLMs.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Java](https://img.shields.io/badge/Java-21-orange.svg)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.1-green.svg)
![React](https://img.shields.io/badge/React-18.3-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)

## Features

- **PDF Resume Upload** - Drag-and-drop or click-to-browse file upload
- **Real-time AI Chat** - WebSocket-based streaming responses for smooth "typing" effect
- **Local LLM Integration** - Private, fast analysis using Ollama with Llama3
- **Context-Aware Responses** - AI maintains resume context throughout the conversation
- **Modern UI** - Built with React, Tailwind CSS, and shadcn/ui components

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER BROWSER                                   │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                     React Frontend (Port 5173)                        │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐   │  │
│  │  │  ResumeUpload   │  │  ChatContainer  │  │     ChatInput       │   │  │
│  │  │  (Drag & Drop)  │  │  (Messages)     │  │  (User Input)       │   │  │
│  │  └────────┬────────┘  └────────┬────────┘  └──────────┬──────────┘   │  │
│  │           │                    │                      │              │  │
│  │           │ HTTP POST          │ WebSocket            │ WebSocket    │  │
│  │           │ /upload            │ Receive              │ Send         │  │
│  └───────────┼────────────────────┼──────────────────────┼──────────────┘  │
└──────────────┼────────────────────┼──────────────────────┼──────────────────┘
               │                    │                      │
               ▼                    ▼                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     Spring Boot Backend (Port 8080)                         │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │   ┌──────────────────┐         ┌──────────────────────────────────┐  │  │
│  │   │ ResumeController │         │    ChatWebSocketHandler          │  │  │
│  │   │   POST /upload   │         │         /ws endpoint             │  │  │
│  │   │                  │         │                                  │  │  │
│  │   │  ┌────────────┐  │         │  ┌────────────┐ ┌─────────────┐  │  │  │
│  │   │  │  PDFBox    │  │         │  │  Receive   │ │   Stream    │  │  │  │
│  │   │  │  Extract   │  │         │  │  Message   │ │   Response  │  │  │  │
│  │   │  │  Text      │  │         │  └─────┬──────┘ └──────▲──────┘  │  │  │
│  │   │  └─────┬──────┘  │         │        │               │         │  │  │
│  │   │        │         │         │        ▼               │         │  │  │
│  │   │        ▼         │         │  ┌─────────────────────┴──────┐  │  │  │
│  │   │  ┌────────────┐  │  Copy   │  │      OllamaService         │  │  │  │
│  │   │  │  Store in  │──┼────────►│  │  (Reactive WebClient)      │  │  │  │
│  │   │  │  Session   │  │ Resume  │  └─────────────┬──────────────┘  │  │  │
│  │   │  └────────────┘  │         │                │                 │  │  │
│  │   └──────────────────┘         └────────────────┼─────────────────┘  │  │
│  │                                                 │                    │  │
│  │          HttpHandshakeInterceptor               │                    │  │
│  │     (Bridges HTTP Session → WebSocket)          │                    │  │
│  └─────────────────────────────────────────────────┼────────────────────┘  │
└────────────────────────────────────────────────────┼────────────────────────┘
                                                     │
                                                     ▼
                              ┌─────────────────────────────────────┐
                              │      Ollama (Port 11434)            │
                              │  ┌───────────────────────────────┐  │
                              │  │        Llama3 Model           │  │
                              │  │   (Local LLM Processing)      │  │
                              │  └───────────────────────────────┘  │
                              └─────────────────────────────────────┘
```

### Data Flow

1. **Resume Upload** - User uploads PDF → Backend extracts text with PDFBox → Stored in HTTP session
2. **WebSocket Handshake** - Frontend connects to `/ws` → Interceptor copies resume from HTTP session to WebSocket session
3. **Chat Message** - User sends question → Backend prepends resume context → Sends to Ollama
4. **Streaming Response** - Ollama generates tokens → Backend streams via WebSocket → Frontend displays in real-time

## Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Java 21 | Runtime |
| Spring Boot 4.0.1 | Application framework |
| Spring WebSocket | Real-time communication |
| Spring WebFlux | Reactive HTTP client |
| Apache PDFBox 3.0.2 | PDF text extraction |
| Gradle | Build tool |

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18.3 | UI framework |
| TypeScript 5.6 | Type-safe JavaScript |
| Vite 5.4 | Build tool & dev server |
| Tailwind CSS 3.4 | Styling |
| shadcn/ui | Component library |
| TanStack Query | Data fetching |

### AI
| Technology | Purpose |
|------------|---------|
| Ollama | Local LLM server |
| Llama3 | Language model |

## Prerequisites

- **Java 21** or later
- **Node.js 18+** and npm
- **Ollama** installed and running
- **Llama3** model downloaded

## Quick Start

### 1. Install Ollama and Llama3

```bash
# Install Ollama (macOS)
brew install ollama

# Start Ollama service
ollama serve

# Pull Llama3 model (in a new terminal)
ollama pull llama3
```

### 2. Start the Backend

```bash
cd backend

# Build and run
./gradlew bootRun
```

The backend will start on `http://localhost:8080`

### 3. Start the Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start on `http://localhost:5173`

### 4. Use the Application

1. Open `http://localhost:5173` in your browser
2. Upload a PDF resume using drag-and-drop or file browser
3. Start asking questions about the resume!

## Project Structure

```
resume-chat-companion/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatContainer.tsx    # Message display
│   │   │   ├── ChatInput.tsx        # User input
│   │   │   ├── ChatMessage.tsx      # Message bubble
│   │   │   ├── Header.tsx           # Navigation
│   │   │   ├── ResumeUpload.tsx     # File upload
│   │   │   └── ui/                  # shadcn components
│   │   ├── pages/
│   │   │   └── Index.tsx            # Main page
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.ts
│
├── backend/
│   ├── src/main/java/com/resume_chat_companion/
│   │   ├── ResumeChatCompanionApplication.java
│   │   ├── controller/
│   │   │   └── ResumeController.java
│   │   ├── service/
│   │   │   └── OllamaService.java
│   │   ├── handler/
│   │   │   └── ChatWebSocketHandler.java
│   │   └── config/
│   │       ├── WebConfig.java
│   │       ├── WebSocketConfig.java
│   │       └── HttpHandshakeInterceptor.java
│   ├── build.gradle.kts
│   └── settings.gradle.kts
│
└── README.md
```

## API Reference

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload` | Upload PDF resume (multipart/form-data) |

### WebSocket

| Endpoint | Description |
|----------|-------------|
| `ws://localhost:8080/ws` | Real-time chat connection |

**WebSocket Messages:**
- **Send:** Plain text (user questions)
- **Receive:** Streaming text tokens, `[DONE]` signal on completion

## Configuration

### Backend (application.properties)
```properties
server.port=8080
```

### Frontend (vite.config.ts)
```typescript
server: {
  port: 5173
}
```

### CORS
The backend is configured to accept requests from `http://localhost:5173` with credentials enabled.

## Development

### Backend Commands

```bash
# Run with hot reload
./gradlew bootRun

# Build JAR
./gradlew build

# Run tests
./gradlew test
```

### Frontend Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Type checking
npm run typecheck

# Linting
npm run lint
```

## Scaling Considerations

For production deployment, consider:

1. **Distributed Sessions** - Replace in-memory sessions with Redis
2. **Dedicated AI Server** - Move Ollama to a powerful GPU server
3. **Load Balancing** - Run multiple backend instances
4. **Container Deployment** - Dockerize frontend and backend

## License

MIT License - see [LICENSE](LICENSE) for details.
