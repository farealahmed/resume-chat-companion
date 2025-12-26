/**
 * This configuration class is responsible for setting up the WebSocket communication endpoint.
 *
 * Why it's needed:
 * - It enables WebSocket functionality in the Spring application.
 * - It maps a specific URL endpoint to a handler that will manage WebSocket connections and messages.
 *
 * What this file is doing:
 * - The `@Configuration` annotation tells Spring that this is a configuration class.
 * - The `@EnableWebSocket` annotation enables WebSocket server capabilities.
 * - It implements the `WebSocketConfigurer` interface to customize the WebSocket setup.
 *
 * How it's working:
 * - The `registerWebSocketHandlers` method is the core of this class.
 * - `registry.addHandler(new ChatWebSocketHandler(ollamaService), "/ws")`: This line registers our `ChatWebSocketHandler` to manage any WebSocket connections made to the `/ws` endpoint (e.g., `ws://localhost:8080/ws`).
 * - `.setAllowedOrigins("http://localhost:5173")`: This allows WebSocket connections from the frontend development server. This is convenient for development but should be restricted to your frontend's specific domain in a production environment for security.
 *
 * What else we can do here:
 * - Add interceptors: We could add a `HandshakeInterceptor` to inspect or modify the handshake request before the WebSocket connection is established. This is useful for authentication or passing user data.
 * - Configure SockJS: For browsers that don't support WebSockets, we could enable SockJS as a fallback to simulate a WebSocket connection using other technologies like long-polling.
 * - More granular endpoint mapping: We could register multiple handlers for different endpoints if the application had different real-time features.
 */
package com.resume_chat_companion.config;

import com.resume_chat_companion.handler.ChatWebSocketHandler;
import com.resume_chat_companion.service.OllamaService;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final OllamaService ollamaService;

    public WebSocketConfig(OllamaService ollamaService) {
        this.ollamaService = ollamaService;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new ChatWebSocketHandler(ollamaService), "/ws")
                .addInterceptors(new HttpHandshakeInterceptor())
                .setAllowedOrigins("http://localhost:5173");
    }
}
