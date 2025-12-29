import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventAPI } from '../lib/api';
import HostAvatar from '../components/HostAvatar';
import { DesktopNav } from '../components/DesktopNav';
import { BottomNav } from '../components/BottomNav';
import { ChevronRight } from 'lucide-react';

export const ProgramsPage: React.FC = () => {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await eventAPI.getPrograms();
        setPrograms(res.programs || []);
      } catch (err) {
        console.error('Failed to fetch programs', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-400">Loading programs...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
      <DesktopNav />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 md:pt-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Explore Programs</h1>
            <p className="text-gray-500 mt-1">Discover events happening around you</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((p) => (
            <Link 
              to={`/programs/${encodeURIComponent(p.programName)}`} 
              key={p.programName} 
              className="group block bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full"
            >
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between">
                  <h2 className="text-xl font-bold text-gray-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {p.programName}
                  </h2>
                </div>
                
                <p className="text-gray-600 mt-3 text-sm line-clamp-3 leading-relaxed">
                  {p.description || "No description available."}
                </p>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <HostAvatar
                    name={p.host?.fullName || p.host?.full_name}
                    imageUrl={p.host?.logoUrl || p.host?.photoUrl || p.host?.photo_url}
                    size={32}
                  />
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Host</span>
                    <span className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
                      {p.host?.fullName || p.host?.full_name || 'Unknown'}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
              </div>
            </Link>
          ))}
        </div>

        {programs.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            No programs found at the moment.
          </div>
        )}
      </div>
      
      <BottomNav />
    </div>
  );
};

export default ProgramsPage;