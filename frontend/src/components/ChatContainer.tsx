import { useRef, useEffect } from 'react';
import ChatMessage, { Message } from './ChatMessage';
import { Sparkles } from 'lucide-react';

interface ChatContainerProps {
  messages: Message[];
  isLoading?: boolean;
}

const ChatContainer = ({ messages, isLoading }: ChatContainerProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center glow">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">Ready to Chat</h3>
            <p className="text-muted-foreground mt-1">
              Ask anything about the uploaded resume
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center max-w-md">
            {[
              "What are the key skills?",
              "Summarize the experience",
              "What's the education background?",
            ].map((suggestion) => (
              <span
                key={suggestion}
                className="px-3 py-1.5 rounded-full text-sm bg-muted text-muted-foreground"
              >
                {suggestion}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
      {messages.map((message, index) => (
        <ChatMessage 
          key={message.id} 
          message={message} 
          isLatest={index === messages.length - 1}
        />
      ))}
      
      {isLoading && (
        <div className="flex gap-4 animate-fade-in">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center glow">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="glass rounded-2xl rounded-tl-md px-5 py-4">
            <div className="flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse-subtle" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse-subtle" style={{ animationDelay: '200ms' }} />
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse-subtle" style={{ animationDelay: '400ms' }} />
            </div>
          </div>
        </div>
      )}
      
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatContainer;
