import { FileText, Sparkles } from 'lucide-react';

interface HeaderProps {
  hasResume: boolean;
  fileName?: string;
}

const Header = ({ hasResume, fileName }: HeaderProps) => {
  return (
    <header className="glass border-b border-border px-6 py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">ResumeChat</h1>
            <p className="text-xs text-muted-foreground">AI-powered resume analysis</p>
          </div>
        </div>
        
        {hasResume && fileName && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground truncate max-w-[150px]">
              {fileName}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
