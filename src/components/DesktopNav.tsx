import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const DesktopNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isAdminGroup = ['EVENT_ADMIN', 'ADMIN'].includes(user?.role || '');
  const isAdmin = user?.role === 'ADMIN';
  // @ts-expect-error: "HOST" is a possible role but not in the current type definition
  const isHost = user?.role === 'HOST';
  const [query, setQuery] = useState('');

  const adminItems = [] as any[];
  if (isAdminGroup) {
    adminItems.push({ label: 'Dashboard', path: '/host/dashboard' });
  }
  if (isHost || (isAdminGroup && !isAdmin)) {
    adminItems.push({ label: 'Host', path: '/host/events' });
  }

  const navItems = [
    { label: 'Home', path: '/home' },
    { label: 'Search', path: '/search' },
    ...adminItems,
    { label: 'Profile', path: '/profile' },
  ];

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <nav className="hidden md:block bg-white text-gray-900 sticky top-0 z-50 ">
      <div className="w-full px-6 py-4">
        <div className="flex items-center gap-8 rounded-full border border-gray-300 px-6 py-3  bg-white">
          <button
            onClick={() => navigate('/home')}
            className="text-lg font-semibold tracking-wide uppercase text-gray-900 hover:text-gray-700 transition-colors"
            style={{ fontFamily: '"Rock Salt", "Shadows Into Light", cursive' }}
          >
            EVENT HALL
          </button>

          <div className="flex items-center gap-5">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`text-base font-medium transition-colors ${
                  isActive(item.path) ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="ml-auto w-80">
            <div className="flex items-center gap-2 rounded-full border border-gray-300 px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-gray-400">
              <Search className="w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="search event.."
                className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
              />
            </div>
          </form>
        </div>
      </div>
    </nav>
  );
};
