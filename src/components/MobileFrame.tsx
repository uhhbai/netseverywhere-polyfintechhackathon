import { ReactNode } from 'react';

interface MobileFrameProps {
  children: ReactNode;
}

const MobileFrame = ({ children }: MobileFrameProps) => {
  return (
    <div className="min-h-screen bg-surface-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-surface rounded-3xl shadow-2xl overflow-hidden border border-card-border">
        {/* App Content */}
        <div className="bg-background min-h-[700px] max-h-[700px] overflow-y-auto pb-28">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MobileFrame; // Fixed export