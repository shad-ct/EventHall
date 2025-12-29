import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventAPI } from '../lib/api';
import HostAvatar from '../components/HostAvatar';
import { DesktopNav } from '../components/DesktopNav';
import { BottomNav } from '../components/BottomNav';

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

  if (loading) return <div className="p-6">Loading programs...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <DesktopNav />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Programs</h1>
        <div className="space-y-3">
          {programs.map((p) => (
            <Link to={`/programs/${encodeURIComponent(p.programName)}`} key={p.programName} className="block bg-white p-4 rounded shadow hover:shadow-md">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="text-lg font-semibold">{p.programName}</div>
                  <div className="text-sm text-gray-600 h-16 overflow-hidden">{p.description}</div>
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <HostAvatar
                    name={p.host?.fullName || p.host?.full_name}
                    imageUrl={p.host?.logoUrl || p.host?.photoUrl || p.host?.photo_url}
                    size={32}
                  />
                  <span>Host: {p.host?.fullName || p.host?.full_name}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default ProgramsPage;
