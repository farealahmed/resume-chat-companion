/**
 * The main page of the Resume Chat Companion application.
 * This component orchestrates the entire user experience, including:
 * - Displaying the initial resume upload view.
 * - Handling the file upload process and communicating with the backend.
 * - Establishing and managing a WebSocket connection for real-time chat.
 * - Rendering the chat interface once a resume is uploaded.
 * - Processing user messages and displaying streaming AI responses.
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import Header from '@/components/Header';
import ResumeUpload from '@/components/ResumeUpload';
import ChatContainer from '@/components/ChatContainer';
import ChatInput from '@/components/ChatInput';
import { Message } from '@/components/ChatMessage';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  // State to hold the uploaded resume file object.
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  // State to store the history of chat messages.
  const [messages, setMessages] = useState<Message[]>([]);
  // State to track when the AI is generating a response.
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  // Ref to hold the WebSocket instance, persisting it across re-renders.
  const ws = useRef<WebSocket | null>(null);

  /**
   * This effect hook manages the WebSocket connection lifecycle.
   * It runs whenever the `uploadedFile` state changes.
   */
  useEffect(() => {
    // If a file is uploaded, establish a new WebSocket connection.
    if (uploadedFile) {
      ws.current = new WebSocket('ws://localhost:8080/ws');

      // Event handler for when the connection is successfully opened.
      ws.current.onopen = () => {
        toast({
          title: "Connection established",
          description: "You can now start chatting with your resume.",
        });
      };

      /**
       * Event handler for incoming messages from the WebSocket server.
       * This is where the streaming AI responses are processed.
       */
      ws.current.onmessage = (event) => {
        // The backend sends `[DONE]` to signal the end of a stream.
        if (event.data === '[DONE]') {
          setIsLoading(false); // Stop the loading indicator.
          return;
        }

        // Append the incoming text chunk to the last assistant message.
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            const updatedMessages = [...prev];
            updatedMessages[prev.length - 1] = {
              ...lastMessage,
              content: lastMessage.content + event.data
            };
            return updatedMessages;
          } else {
            setIsLoading(false);
            const newAssistantMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: event.data,
              role: 'assistant',
              timestamp: new Date(),
            };
            return [...prev, newAssistantMessage];
          }
        });
      };

      // Event handler for when the connection is closed.
      ws.current.onclose = () => {
        setIsLoading(false);
        toast({
          title: "Connection closed",
          description: "The connection to the chat service has been closed.",
        });
      };

      // Cleanup function to close the WebSocket connection when the component unmounts
      // or when `uploadedFile` changes, preventing memory leaks.
      return () => {
        ws.current?.close();
      };
    }
  }, [uploadedFile, toast]);

  /**
   * Handles the file upload process.
   * This function is passed to the `ResumeUpload` component.
   */
  const handleFileUpload = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Send the file to the backend's `/upload` endpoint.
      const response = await fetch('http://localhost:8080/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('File upload failed');
      }

      // On success, update the state to show the chat interface.
      setUploadedFile(file);
      toast({
        title: "Resume uploaded!",
        description: `${file.name} is ready for analysis.`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Could not upload resume. Please ensure the backend is running and try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  /**
   * Handles the removal of the uploaded file.
   * Resets the application to its initial state.
   */
  const handleRemoveFile = useCallback(() => {
    setUploadedFile(null);
    setMessages([]);
    toast({
      title: "Resume removed",
      description: "Upload a new resume to continue.",
    });
  }, [toast]);

  /**
   * Sends a user's message to the backend via the WebSocket connection.
   */
  const handleSendMessage = useCallback(async (content: string) => {
    // Ensure the WebSocket connection is open before sending a message.
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      toast({
        title: "Connection not available",
        description: "Please upload a resume to start chatting.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    // Create a placeholder for the assistant's response.
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true); // Show the loading indicator.

    // Send the user's message to the backend.
    ws.current.send(content);
  }, [toast]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header hasResume={!!uploadedFile} fileName={uploadedFile?.name} />
      
      <main className="flex-1 flex flex-col max-w-4xl w-full mx-auto">
        {!uploadedFile ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-lg animate-slide-up">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold gradient-text mb-3">
                  Chat with your Resume
                </h2>
                <p className="text-muted-foreground">
                  Upload your resume and ask any questions about it.
                  <br />
                  Get instant, intelligent insights.
                </p>
              </div>
              <ResumeUpload
                onFileUpload={handleFileUpload}
                uploadedFile={uploadedFile}
                onRemoveFile={handleRemoveFile}
              />
            </div>
          </div>
        ) : (
          <>
            <ChatContainer messages={messages} isLoading={isLoading} />
            <div className="p-4 border-t border-border">
              <div className="max-w-3xl mx-auto">
                <ChatInput
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  disabled={!uploadedFile}
                />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

// Simulated responses - replace with actual AI integration
const getSimulatedResponse = (question: string): string => {
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.includes('skill')) {
    return "Based on the resume, the key skills include:\n\n• **Technical Skills**: JavaScript, TypeScript, React, Node.js, Python\n• **Soft Skills**: Leadership, Problem-solving, Communication\n• **Tools**: Git, Docker, AWS, Figma\n\nThe candidate demonstrates a strong full-stack development background with emphasis on modern web technologies.";
  }
  
  if (lowerQuestion.includes('experience') || lowerQuestion.includes('work')) {
    return "The resume shows progressive career growth:\n\n**Senior Developer** at Tech Corp (2021-Present)\n• Led a team of 5 developers on a major product redesign\n• Improved application performance by 40%\n\n**Developer** at StartupXYZ (2019-2021)\n• Built core features for the main product\n• Collaborated with cross-functional teams\n\nTotal experience: 5+ years in software development.";
  }
  
  if (lowerQuestion.includes('education') || lowerQuestion.includes('degree')) {
    return "**Education Background:**\n\n🎓 **Bachelor of Science in Computer Science**\nUniversity of Technology, 2019\nGPA: 3.8/4.0\n\n**Certifications:**\n• AWS Certified Developer\n• Google Cloud Professional\n\nThe candidate has a solid academic foundation complemented by industry-recognized certifications.";
  }
  
  if (lowerQuestion.includes('summary') || lowerQuestion.includes('overview')) {
    return "**Resume Summary:**\n\nThis is a well-qualified candidate with 5+ years of experience in full-stack development. Key highlights:\n\n✨ Strong technical skills in modern web technologies\n✨ Proven leadership experience\n✨ Excellent educational background\n✨ Industry certifications from major cloud providers\n\nThe candidate appears well-suited for senior developer or technical lead positions.";
  }
  
  return "I've analyzed the resume and can help you understand various aspects. Here are some questions you might want to ask:\n\n• What are the key technical skills?\n• Can you summarize the work experience?\n• What's the educational background?\n• What makes this candidate stand out?\n\nFeel free to ask any specific questions about the resume!";
};

export default Index;
