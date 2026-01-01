import { useEffect, useState } from 'react';
import { eventAPI } from '../lib/api';
import { getUser } from '../lib/firestore';
import ProgramCard from '../components/ProgramCard';
import { DesktopNav } from '../components/DesktopNav';
import { BottomNav } from '../components/BottomNav';

export const ProgramsPage: React.FC = () => {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hostProfiles, setHostProfiles] = useState<Record<string, any>>({});

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

  // Fetch host profiles for displayed programs so we can prefer host-stored images
  useEffect(() => {
    const ids = Array.from(new Set(programs.map(p => p.userId || p.host?.id).filter(Boolean)));
    if (ids.length === 0) return;

    let cancelled = false;
    (async () => {
      const map: Record<string, any> = {};
      await Promise.all(ids.map(async (id) => {
        try {
          const u = await getUser(id);
          if (u) map[id] = u;
        } catch (err) {
          // ignore
        }
      }));
      if (!cancelled) setHostProfiles(map);
    })();

    return () => { cancelled = true; };
  }, [programs]);

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

        <div className="w-full">
          <div className="flex overflow-x-auto gap-5 pb-4 ml-1 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory scroll-smooth w-full">
            {programs.map((p) => (
              <ProgramCard
                key={p.programName || p.id}
                program={p}
                hostProfile={hostProfiles[p.userId || p.host?.id]}
              />
            ))}
          </div>
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