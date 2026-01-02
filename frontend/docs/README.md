# Resume Chat Companion - Frontend

This directory contains the frontend code for the Resume Chat Companion, a web application built with React, TypeScript, and Tailwind CSS. It provides a user-friendly interface for uploading a resume and having a real-time, AI-powered conversation about its contents.

## Core Technologies

- **React**: A JavaScript library for building user interfaces.
- **TypeScript**: A typed superset of JavaScript that enhances code quality and maintainability.
- **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
- **Vite**: A modern frontend build tool that provides a fast development experience.

## Project Structure

The frontend code is organized into the following key directories:

- `src/components`: Contains reusable React components that make up the UI, such as the header, chat messages, and input fields.
- `src/pages`: Contains the main page components of the application. `Index.tsx` is the primary entry point for the user interface.
- `src/hooks`: Contains custom React hooks, such as `useToast` for displaying notifications.
- `public`: Contains static assets like images and fonts.

## How It Works: The Data Flow

The application's logic is primarily managed within `src/pages/Index.tsx`. Here’s a step-by-step breakdown of the data flow:

1.  **Initial State**: The application starts by displaying the `ResumeUpload` component, prompting the user to upload a file.

2.  **File Upload**:
    - When the user selects a file, the `handleFileUpload` function is triggered.
    - It creates a `FormData` object and sends the file to the backend's `http://localhost:8080/upload` endpoint via a `POST` request.
    - The backend processes the resume and stores its content in the user's HTTP session.

3.  **WebSocket Connection**:
    - Upon a successful file upload, the `uploadedFile` state is updated.
    - A `useEffect` hook, which listens for changes to `uploadedFile`, establishes a WebSocket connection to the backend at `ws://localhost:8080/ws`.
    - The backend's `HttpHandshakeInterceptor` intercepts this connection request and transfers the resume content from the HTTP session to the WebSocket session, making it available for the duration of the chat.

4.  **Real-time Chat**:
    - With the WebSocket connection open, the user can send messages using the `ChatInput` component.
    - The `handleSendMessage` function sends the user's message to the backend over the WebSocket.
    - The backend receives the message, prepends the resume content to it, and sends the combined text to the Ollama AI for analysis.

5.  **Streaming AI Responses**:
    - The backend streams the AI's response back to the frontend word by word.
    - The `ws.onmessage` event handler on the frontend listens for these incoming messages.
    - Each message chunk is appended to the last message in the `messages` state, creating the real-time typing effect.
    - When the AI is finished, the backend sends a special `[DONE]` message. The frontend listens for this signal to stop the loading indicator.

6.  **Connection Teardown**:
    - If the user removes the resume or navigates away, the `useEffect` hook's cleanup function is called.
    - This function closes the WebSocket connection, and the application resets to its initial state.

## Getting Started

To run the frontend application, follow these steps:

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run the Development Server**:
    ```bash
    npm run dev
    ```

3.  **Build for Production**:
    ```bash
    npm run build
    ```

This will start the Vite development server, and you can access the application at `http://localhost:5173`.

**Note**: For the application to be fully functional, the backend server must also be running.
