import { ReactNode } from 'react';

interface MobileFrameProps {
  children: ReactNode;
}

const MobileFrame = ({ children }: MobileFrameProps) => {
  return (
    <div className="min-h-screen bg-surface-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-surface rounded-3xl shadow-2xl overflow-hidden border border-card-border">
        {/* Status Bar */}
        <div className="bg-surface px-6 pt-3 pb-1">
          <div className="flex justify-between items-center text-xs font-medium text-foreground">
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <div className="flex gap-1">
                <div className="w-1 h-3 bg-foreground rounded-full"></div>
                <div className="w-1 h-3 bg-foreground rounded-full"></div>
                <div className="w-1 h-3 bg-foreground rounded-full"></div>
                <div className="w-1 h-3 bg-muted rounded-full"></div>
              </div>
              <div className="ml-1 w-6 h-3 border border-foreground rounded-sm">
                <div className="w-4 h-full bg-foreground rounded-sm"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* App Content */}
        <div className="bg-background min-h-[700px] max-h-[700px] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MobileFrame; // Fixed export