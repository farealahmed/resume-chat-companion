import { User, Sparkles } from 'lucide-react';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
  isLatest?: boolean;
}

const ChatMessage = ({ message, isLatest }: ChatMessageProps) => {
  const isUser = message.role === 'user';

  return (
    <div 
      className={`
        flex gap-4 animate-fade-in
        ${isUser ? 'flex-row-reverse' : 'flex-row'}
      `}
      style={{ animationDelay: isLatest ? '0ms' : '0ms' }}
    >
      {/* Avatar */}
      <div className={`
        flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
        ${isUser 
          ? 'bg-primary/20' 
          : 'bg-gradient-to-br from-primary/30 to-accent/20 glow'
        }
      `}>
        {isUser ? (
          <User className="w-5 h-5 text-primary" />
        ) : (
          <Sparkles className="w-5 h-5 text-primary" />
        )}
      </div>

      {/* Message bubble */}
      <div className={`
        max-w-[75%] rounded-2xl px-5 py-3.5
        ${isUser 
          ? 'bg-user-message rounded-tr-md' 
          : 'glass rounded-tl-md'
        }
      `}>
        <p className="text-foreground leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;
