import { Home, Search, User, Plus, Shield } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isAdminGroup = ['EVENT_ADMIN', 'ADMIN'].includes(user?.role || '');
  const isAdmin = user?.role === 'ADMIN';
  const isHost = user?.role === 'HOST';

  const adminItems = [] as any[];
  if (isAdminGroup) {
    adminItems.push({ icon: Shield, label: 'Dashboard', path: '/host/dashboard' });
  }
  if (isHost || (isAdminGroup && !isAdmin)) {
    adminItems.push({ icon: Plus, label: 'My Events', path: '/host/events' });
  }

  const navItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: Search, label: 'Search', path: '/search' },
    ...adminItems,
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 shadow-sm z-50 md:hidden">
      <div className="max-w-lg mx-auto flex justify-around items-center h-16 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
