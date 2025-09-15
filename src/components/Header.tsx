import { User } from '@/types';
import { UserProfile } from './UserProfile';

interface HeaderProps {
  user?: User;
  title?: string;
  showProfile?: boolean;
}

export const Header = ({ user, title, showProfile = true }: HeaderProps) => {
  return (
    <header className="glass-card-strong border-b border-glass-border-strong px-6 py-5 sticky top-0 z-50 backdrop-blur-xl">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
              <span className="text-white font-black text-sm">AI</span>
            </div>
            <span className="text-2xl font-black gradient-text">PDF Studio</span>
          </div>
          {title && (
            <>
              <div className="w-px h-8 bg-glass-border-strong"></div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                <h1 className="text-xl font-semibold text-foreground truncate max-w-md">{title}</h1>
              </div>
            </>
          )}
        </div>
        
        {showProfile && user && <UserProfile user={user} />}
      </div>
    </header>
  );
};