## Project Documentation: Resume Chat Companion
### 1. Project Overview & Goal
- The Elevator Pitch: "Resume Chat Companion" is a web application that allows a user to upload a PDF resume and have a real-time, conversational chat with an AI that has been given the resume as its only context.
- The Problem It Solves: It solves the inefficiency of manually scanning resumes for specific information. Instead of keyword searching, a user (like a recruiter or hiring manager) can ask natural language questions ("What are the candidate's top 3 skills?" or "Summarize their experience at their last job") and get immediate, context-aware answers.
- Core Value Proposition: It provides a private, fast, and interactive way to analyze a resume using the power of modern Large Language Models (LLMs) running locally.
### 2. Core Technologies
- Backend:
  
  - Language: Java 21
  - Framework: Spring Boot 4.0.1
  - Key Modules:
    - Spring Web: For the initial HTTP file upload endpoint.
    - Spring WebSocket: For real-time, bidirectional communication for the chat.
    - Spring WebFlux: For making reactive, non-blocking calls to the Ollama AI service.
  - PDF Parsing: Apache PDFBox
  - Build Tool: Gradle
- Frontend:
  
  - Language: TypeScript
  - Framework: React
  - UI: TailwindCSS with custom components.
  - Key Libraries: react , lucide-react (for icons).
- AI:
  
  - Platform: Ollama (for serving local LLMs)
  - Model: Llama3
### 3. Architecture & End-to-End Workflow
This is the most important part to explain. Here is the step-by-step flow of data and user interaction.

Step 1: The User Uploads a Resume (Frontend -> Backend)

1. The user selects a PDF file in the React frontend.
2. The frontend creates a FormData object containing the file.
3. A fetch request is made to the backend's POST /upload endpoint.
   - Crucial Detail: This request includes credentials: 'include' , which tells the browser to send the session cookie. This is the first link in our state-management chain.
Step 2: The Backend Processes the Resume (Backend)

1. The ResumeController receives the HTTP request.
2. It uses the Apache PDFBox library to extract all the raw text from the PDF.
3. It gets the current HttpSession from the request.
4. The Key Action: It stores the extracted resume text as a string in the user's session: httpSession.setAttribute("resume", resumeText); . This attaches the resume data to that specific user's session cookie.
Step 3: The Chat Connection is Established (Frontend -> Backend)

1. After the upload is successful, the React frontend automatically opens a WebSocket connection to the backend's /ws endpoint.
2. When this connection request arrives at the backend, our custom HttpHandshakeInterceptor runs.
3. The interceptor inspects the incoming handshake request, finds the associated HttpSession (using the cookie that the browser automatically sends), and copies the resume text from the HttpSession into the new WebSocketSession 's attributes.
4. Now, the WebSocket connection is "stateful" and permanently associated with the uploaded resume for its entire lifecycle.
Step 4: The User Sends a Message (Real-time Chat)

1. The user types a question in the React chat input and hits send.
2. The frontend sends the question as a simple text message over the WebSocket.
3. The backend's ChatWebSocketHandler receives the message. It retrieves the resume text from the WebSocketSession attributes.
4. It constructs a new, more detailed prompt, prepending the resume text to the user's question (e.g., "Based on this resume... [resume text] ...now answer this question: [user's question]").
5. This combined prompt is sent to the OllamaService .
Step 5: The AI Responds (Backend -> Frontend)

1. The OllamaService makes a streaming HTTP request to the local Ollama (Llama3) model.
2. The AI begins generating a response, sending back text in small chunks (word by word).
3. The ChatWebSocketHandler receives these chunks and immediately sends each one back to the frontend over the WebSocket.
4. The React frontend receives these chunks and appends them to the current assistant message, creating the smooth, real-time "typing" effect.
### 4. Key Technical Challenges & Solutions
This is where you show you're a real problem-solver.

- Challenge: "How do you maintain state between a stateless HTTP upload and a stateful WebSocket chat? The AI needs to remember the resume."
  
  - Solution: "I solved this by creating a bridge between the two protocols. When the user uploaded the file via HTTP, I stored the extracted text in their server-side session. Then, I implemented a Spring HandshakeInterceptor for the WebSocket connection. This interceptor runs before the WebSocket is fully established, and its job is to copy the resume data from the user's HTTP session into the new WebSocket session's attributes. This made the resume context available for the entire duration of the chat without having to send it with every single message."
- Challenge: "The initial UI felt clunky. When the AI was responding, the message would either appear all at once, or a placeholder would flash on the screen with a timestamp before any text arrived."
  
  - Solution: "This was a frontend logic issue. My final solution was to refine the state management in React. When the user sends a message, I only add their message to the chat and set an isLoading flag to true , which shows a loading animation. The placeholder for the AI's response isn't created yet. Only when the first piece of text arrives from the WebSocket do I turn off the loading animation and create the new assistant message bubble. This created a clean, professional-looking transition from 'loading' to 'responding'."
- Challenge: "Getting the backend and frontend to talk to each other initially failed due to security and configuration issues."
  
  - Solution: "This is a classic setup challenge in modern web apps. I encountered two main issues:
    1. CORS Errors: The browser blocked requests from my frontend (on port 5173) to my backend (on port 8080). I configured a global CORS policy in a WebConfig file on the backend to explicitly allow requests from my frontend's origin.
    2. Session Cookies: For the session to be shared, I had to enable credentials in my CORS policy ( .allowCredentials(true) ) on the backend AND specify credentials: 'include' in the frontend fetch call. This two-sided configuration is required for secure, cross-origin state management."
### 5. Potential Interview Questions
- "Why did you choose this specific tech stack?"
  - "I chose Spring Boot because it's robust and its WebSocket and WebFlux modules are perfect for building reactive, real-time applications. For the frontend, React with TypeScript is my go-to for building dynamic and type-safe user interfaces."
- "What was the most difficult part of this project?"
  - "Definitely bridging the HTTP and WebSocket protocols to maintain the resume context. Implementing the HttpHandshakeInterceptor was a great learning experience in how Spring handles WebSocket sessions and how to make them stateful."
- "How would you scale this application?"
  - "Right now, it's designed for a single user on a local machine. To scale it, I would: 1) Move the Ollama service to a dedicated, more powerful server. 2) Instead of using in-memory HTTP sessions, I'd use a distributed session store like Redis. This would allow me to run multiple backend instances behind a load balancer without users losing their session data."
- "What would you do differently if you started over?"
  - "I would probably spend more time upfront designing the frontend state management logic. I iterated a few times to get the loading and streaming to feel just right, and a clearer initial plan would have saved some time. But that iteration was also a valuable learning process."


  Spring Web:
  Think of Spring Web as the foundation for building any kind of web application in Java using the Spring framework. It's the module that handles everything related to web requests and responses.

At its core, Spring Web is built on the Model-View-Controller (MVC) design pattern. Let's break that down with a simple analogy: imagine a restaurant.

- Model: This is the data . It's the raw ingredients for a dish, or in our app, it's the resumeText string or a User object. It's just the information, with no presentation.
- View: This is the presentation of the data. It's the final, plated dish that the customer sees. In a traditional web app, this would be an HTML page. In a modern REST API (like most of your backend), the "view" is simply the JSON data sent back to the frontend.
- Controller: This is the chef . The customer (the user's browser) gives an order (an HTTP request) to the waiter. The chef ( @Controller ) takes that order, gets the necessary ingredients ( Model ), prepares the dish, and hands it back to be served ( View ).
### How It Works in Your Project
In your "Resume Chat Companion," you use Spring Web for one very specific, but very important, job: handling the initial file upload.

Here's the code from your ResumeController :

```
@RestController // This tells Spring Web 
this class is a Controller for a REST API
public class ResumeController {

    @PostMapping("/upload") // This tells 
    Spring Web to route POST requests for 
    "/upload" here
    public ResponseEntity<?> 
    handleFileUpload(@RequestParam
    ("file") MultipartFile file, 
    HttpSession session) {
        // ... your logic to process the 
        file ...
    }
}
```
1. @RestController : This is the key annotation. It tells Spring, "This class is a Controller, and its methods will return data (like JSON) directly as the response body, not an HTML page."
2. @PostMapping("/upload") : This is the mapping. Spring Web sees an incoming POST request to http://localhost:8080/upload and knows to execute this specific method. It's like the menu item the user ordered.
3. The DispatcherServlet : Behind the scenes, Spring Web has a central component called the DispatcherServlet . You can think of it as the restaurant's head waiter or front desk. It's the very first thing to receive all incoming web requests. It looks at the request's URL (e.g., /upload ) and method (e.g., POST ) and dispatches it to the correct @Controller and method. You never have to write this part; the framework handles it for you.
### Spring Web vs. Spring WebFlux (A Crucial Distinction)
In your project, you actually use two different web modules from Spring, and it's important to know the difference:

- Spring Web (or Spring MVC):
  
  - Blocking & Synchronous.
  - It's built on the traditional Java Servlet API. It uses a "one thread per request" model. When a request comes in, a thread is assigned to handle it from start to finish.
  - In your app: You used this for the /upload endpoint. It's simple, reliable, and perfect for a straightforward task like receiving a file.
- Spring WebFlux:
  
  - Non-Blocking & Asynchronous (Reactive).
  - It's the modern, alternative web framework in Spring. It's designed for high-concurrency applications that need to handle many requests with a small number of threads.
  - In your app: You used this for two things:
    1. The WebClient that calls the Ollama AI service. This is a reactive client that can handle streaming data without blocking a thread.
    2. The WebSocket handling ( ChatWebSocketHandler ). WebSockets are inherently asynchronous and event-driven, which fits perfectly with the WebFlux model.
In summary: Spring Web is the traditional, foundational module in Spring for building web applications, especially REST APIs. It uses the MVC pattern with a central DispatcherServlet to route requests to your controllers. You used it to create the simple, blocking endpoint for uploading the resume.