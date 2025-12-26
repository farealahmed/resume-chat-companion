import { useState, useCallback } from 'react';
import Header from '@/components/Header';
import ResumeUpload from '@/components/ResumeUpload';
import ChatContainer from '@/components/ChatContainer';
import ChatInput from '@/components/ChatInput';
import { Message } from '@/components/ChatMessage';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = useCallback((file: File) => {
    setUploadedFile(file);
    toast({
      title: "Resume uploaded!",
      description: `${file.name} is ready for analysis.`,
    });
  }, [toast]);

  const handleRemoveFile = useCallback(() => {
    setUploadedFile(null);
    setMessages([]);
    toast({
      title: "Resume removed",
      description: "Upload a new resume to continue.",
    });
  }, [toast]);

  const handleSendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: getSimulatedResponse(content),
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  }, []);

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
