/**
 * This class is the core component for handling real-time chat interactions over WebSocket.
 *
 * Why it's needed:
 * - It manages the lifecycle of a WebSocket connection (connection open, message received, connection closed).
 * - It processes incoming messages from the client and orchestrates the response.
 *
 * What this file is doing:
 * - The `@Component` annotation marks this class as a Spring component, making it eligible for dependency injection.
 * - It extends `TextWebSocketHandler`, a convenient base class for handling text-based WebSocket messages.
 * - It has a dependency on `OllamaService`, which it uses to communicate with the AI model.
 *
 * How it's working:
 * - When a client sends a message over the WebSocket, the `handleTextMessage` method is invoked.
 * - `message.getPayload()`: This extracts the text content from the incoming message.
 * - `ollamaService.getCompletion(...)`: The message content (the user's prompt) is passed to the `OllamaService`.
 * - `.flatMap(...)`: This is a reactive operator from Project Reactor. It takes each item emitted by the `Flux` from `getCompletion` (each chunk of the AI's response) and performs an action.
 * - `session.sendMessage(new TextMessage(response))`: For each chunk of the response, a new `TextMessage` is created and sent back to the client over the same WebSocket session.
 * - `.subscribe()`: This is crucial. A reactive stream (`Flux` or `Mono`) is "cold," meaning it won't do anything until someone subscribes to it. Calling `.subscribe()` kicks off the entire process: the call to Ollama, receiving the stream, and sending messages back to the client.
 *
 * What else we can do here:
 * - Handle multiple users: We could manage a map of sessions to users, allowing for concurrent, isolated conversations.
 * - Implement session management: We can store conversation history or other user-specific data in the `WebSocketSession` attributes.
 * - Error handling: We can add more robust error handling within the reactive stream to manage issues like the AI service being unavailable or the client disconnecting unexpectedly.
 * - Message parsing: For more complex interactions, we could expect JSON messages from the client and parse them into specific command objects instead of just raw text.
 */
package com.resume_chat_companion.handler;

import com.resume_chat_companion.service.OllamaService;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Component
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private final OllamaService ollamaService;

    public ChatWebSocketHandler(OllamaService ollamaService) {
        this.ollamaService = ollamaService;
    }

    /**
     * This method is called just after the WebSocket connection has been established.
     * It's our chance to perform setup tasks for the new session.
     */
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        // Retrieve the HttpSession that we stored in the attributes map via the HttpHandshakeInterceptor.
        jakarta.servlet.http.HttpSession httpSession = (jakarta.servlet.http.HttpSession) session.getAttributes().get("httpSession");
        if (httpSession != null) {
            // Try to get the "resume" attribute that was stored by the ResumeController.
            String resume = (String) httpSession.getAttribute("resume");
            if (resume != null) {
                // If the resume exists, copy it into the WebSocketSession's attributes.
                // This makes the resume content directly available for the lifetime of the WebSocket connection.
                session.getAttributes().put("resume", resume);
            }
        }
    }

    /**
     * This method is called whenever a new text message is received from the client.
     */
    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        // Retrieve the resume content that we stored during the handshake.
        String resume = (String) session.getAttributes().get("resume");
        String prompt = message.getPayload();

        if (resume != null && !resume.isEmpty()) {
            prompt = "Based on the following resume:\n\n" + resume + "\n\n---\n\n" + prompt;
        }

        // Send the (potentially modified) prompt to the Ollama service.
        ollamaService.getCompletion(prompt)
                .flatMap(response -> {
                    try {
                        // Stream each part of the response back to the client.
                        session.sendMessage(new TextMessage(response));
                    } catch (Exception e) {
                        return reactor.core.publisher.Mono.error(e);
                    }
                    return reactor.core.publisher.Mono.empty();
                })
                .subscribe();
    }
}
