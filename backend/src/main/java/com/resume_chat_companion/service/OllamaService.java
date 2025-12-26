/**
 * This service class is responsible for all communication with the local Ollama AI model.
 *
 * Why it's needed:
 * - It encapsulates the logic for interacting with the Ollama API, keeping the AI-related code separate from the WebSocket handling.
 * - It provides a clean, reusable interface for other parts of the application to get completions from the AI.
 *
 * What this file is doing:
 * - The `@Service` annotation marks this as a Spring service, making it a singleton bean managed by the Spring container.
 * - It uses `WebClient` from `spring-webflux` to make non-blocking, reactive HTTP requests to the Ollama API.
 * - It defines private `record` types (`OllamaRequest`, `OllamaResponse`) for concisely representing the JSON data sent to and received from the Ollama API.
 *
 * How it's working:
 * - The constructor uses `WebClient.Builder` (injected by Spring) to create and configure a `WebClient` instance with the base URL of the Ollama API.
 * - The `getCompletion` method takes a `prompt` string as input.
 * - It creates an `OllamaRequest` object, specifying the model ("llama3"), the prompt, and that we want a non-streaming response (`stream: false`).
 * - `webClient.post().uri("/api/generate")...`: It builds an HTTP POST request to the `/api/generate` endpoint.
 * - `.bodyValue(request)`: It sets the `OllamaRequest` object as the JSON body of the request.
 * - `.retrieve()`: It executes the request.
 * - `.bodyToFlux(OllamaResponse.class)`: This is the key part for streaming. It tells `WebClient` to decode the response body as a stream of `OllamaResponse` objects. Ollama sends a JSON object for each token, and this converts that stream of JSON objects into a reactive `Flux`.
 * - `.map(OllamaResponse::response)`: It transforms the `Flux<OllamaResponse>` into a `Flux<String>` by extracting the `response` string from each object.
 *
 * What else we can do here:
 * - Dynamic model selection: We could modify `getCompletion` to accept a model name as a parameter, allowing the client to choose which AI model to use.
 * - Context management: We could enhance the `OllamaRequest` to include a `context` field to maintain conversational history with the AI.
 * - Advanced error handling: We could add `.onErrorResume(...)` to the `WebClient` chain to handle API errors gracefully, perhaps by returning a fallback message.
 * - Configuration properties: The Ollama base URL could be externalized into `application.properties` so it can be easily changed without modifying the code.
 */
package com.resume_chat_companion.service;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

@Service
public class OllamaService {

    private final WebClient webClient;

    public OllamaService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("http://localhost:11434").build();
    }

    public Flux<String> getCompletion(String prompt) {
        OllamaRequest request = new OllamaRequest("llama3", prompt, true);

        return this.webClient.post()
                .uri("/api/generate")
                .bodyValue(request)
                .retrieve()
                .bodyToFlux(OllamaResponse.class)
                .map(OllamaResponse::response);
    }

    private record OllamaRequest(String model, String prompt, boolean stream) {}
    private record OllamaResponse(String response) {}
}