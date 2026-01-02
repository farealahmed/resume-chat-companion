# Resume Chat Companion - Backend

This document provides an overview of the backend for the Resume Chat Companion application. It details the architecture, workflow, and how to run the project.

## Technologies Used

- **Java 17**
- **Spring Boot 3**
- **Spring Web**: For creating RESTful endpoints.
- **Spring WebSocket**: For real-time, bidirectional communication with the frontend.
- **Spring WebFlux (`WebClient`)**: For making non-blocking, streaming HTTP requests to the AI model.
- **Gradle**: For dependency management and building the project.

## Getting Started

1.  **Prerequisites**: Make sure you have Java 17 (or later) and a local instance of [Ollama](https://ollama.ai/) running with the `llama3` model pulled (`ollama pull llama3`).
2.  **Run the application**: Navigate to the `backend` directory and run the application using the Gradle wrapper:
    ```bash
    ./gradlew bootRun
    ```
3.  **Build the application**:
    ```bash
    ./gradlew build
    ```
4.  The backend server will start on `http://localhost:8080`.

## Application Workflow

The backend is designed to handle two primary user interactions: uploading a resume and chatting about it. The workflow is designed to be seamless, using the HTTP session to link the uploaded file to the subsequent chat conversation.

### 1. Resume Upload Flow

This is the entry point for providing context to the AI.

1.  **Request from UI**: The user selects a resume file in the frontend, which sends a `POST` request of type `multipart/form-data` to the `/upload` endpoint.
2.  **Controller Handling**: The `ResumeController` receives the request. The `handleFileUpload` method is invoked, and Spring injects the `MultipartFile` (the resume) and the user's `HttpSession`.
3.  **Session Storage**: The controller reads the content of the file, converts it to a `String`, and stores this string in the user's `HttpSession` under the attribute key `"resume"`.
4.  **Response to UI**: The controller returns an `HTTP 200 OK` response to the UI, confirming that the upload was successful.

### 2. WebSocket Chat Flow

This flow begins immediately after the UI establishes a WebSocket connection and is used for all subsequent chat messages.

1.  **Connection from UI**: The frontend initiates a WebSocket connection to the `/ws` endpoint (e.g., `ws://localhost:8080/ws`).
2.  **Handshake Interception**: The `HttpHandshakeInterceptor` intercepts this connection request *before* it is fully established. It accesses the user's `HttpSession` (the same session from the file upload) and copies it into the attributes of the new `WebSocketSession`.
3.  **Session Initialization**: The `ChatWebSocketHandler`'s `afterConnectionEstablished` method is called. It retrieves the `HttpSession` from the `WebSocketSession` attributes, extracts the resume `String` that was stored earlier, and saves it directly into the `WebSocketSession`'s attributes. This makes the resume available for the entire duration of the chat.
4.  **User Sends a Message**: The user types a question in the chat interface, and the frontend sends it as a text message over the WebSocket.
5.  **Message Handling**: The `ChatWebSocketHandler`'s `handleTextMessage` method receives the message (the user's prompt).
6.  **Contextual Prompting**: The handler retrieves the resume `String` from the `WebSocketSession` attributes. It then constructs a new, more detailed prompt by prepending the resume content to the user's original question.
7.  **AI Service Request**: This combined prompt is passed to the `OllamaService`.
8.  **Streaming to AI**: The `OllamaService` uses `WebClient` to make a streaming `POST` request to the local Ollama instance (`http://localhost:11434/api/generate`) with the contextual prompt.
9.  **Streaming Response to UI**: As the `llama3` model generates the response token by token, the `OllamaService` streams these tokens back to the `ChatWebSocketHandler` as a `Flux<String>`. The handler, in turn, immediately sends each token as a separate `TextMessage` over the WebSocket back to the UI. This results in the word-by-word typing effect that the user sees.

## Endpoints

- **REST Endpoint**: `POST /upload`
  - **Purpose**: Upload a resume file.
  - **Request**: `multipart/form-data` with a file part named `file`.
- **WebSocket Endpoint**: `ws://localhost:8080/ws`
  - **Purpose**: Real-time chat communication.
  - **Messages**: Expects and sends plain text messages.
