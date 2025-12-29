import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { eventAPI } from '../lib/api';
import { Event, EventCategory } from '../types';
import { EventCard } from '../components/EventCard';
import HostAvatar from '../components/HostAvatar';
import { DesktopNav } from '../components/DesktopNav';
import { BottomNav } from '../components/BottomNav';
import { useAuth } from '../contexts/AuthContext';
import { getUser } from '../lib/firestore';
import { ChevronRight } from 'lucide-react';

export const ProgramDetailPage: React.FC = () => {
  const { programName } = useParams<{ programName: string }>();
  const [program, setProgram] = useState<any | null>(null);
  const [hostProfile, setHostProfile] = useState<any | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsByCategory, setEventsByCategory] = useState<Record<string, { category: EventCategory; events: Event[] }>>({});
  const [likedEventIds, setLikedEventIds] = useState<string[]>([]);
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!programName) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const p = await eventAPI.getProgram(decodeURIComponent(programName));
        setProgram(p.program || null);
        // fetch host's full profile (may contain location/date/contact/logo)
        const hostId = p.program?.userId || p.program?.host?.id;
        if (hostId) {
          try {
            const up = await getUser(hostId);
            setHostProfile(up || null);
            console.log('Fetched host profile:', up);
          } catch (err) {
            console.error('Failed to fetch host profile', err);
          }
        }
        // Debug: log program payload so we can see where host fields live
        console.log('Program API response:', p);
        console.log('Resolved program object:', p.program);
        console.log('Program.host:', p.program?.host);
        const ev = await eventAPI.getProgramEvents(decodeURIComponent(programName));
        setEvents(ev.events || []);
      } catch (err) {
        console.error('Failed to load program', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [programName]);

  // Group events by primary category and fetch interactions
  useEffect(() => {
    const map: Record<string, { category: EventCategory; events: Event[] }> = {};
    for (const e of events) {
      const cat = e.primaryCategory || { id: 'uncategorized', name: 'Event', slug: 'event' } as EventCategory;
      if (!map[cat.id]) map[cat.id] = { category: cat, events: [] };
      map[cat.id].events.push(e);
    }

    setEventsByCategory(map);

    const allIds = events.map((e) => e.id);
    if (allIds.length > 0 && user) {
      (async () => {
        try {
          const interactions = await eventAPI.checkInteractions(allIds);
          setLikedEventIds(interactions.likedEventIds || []);
          setRegisteredEventIds(interactions.registeredEventIds || []);
        } catch (err) {
          console.error('Failed to fetch interactions', err);
        }
      })();
    }
  }, [events, user]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!program) return <div className="p-6">Program not found</div>;

  // Sort categories by name
  const sortedCategories = Object.values(eventsByCategory).sort((a, b) => a.category.name.localeCompare(b.category.name));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <DesktopNav />
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">{program.programName}</h1>

        <div className="flex items-center gap-3 mb-4">
          <HostAvatar
            name={program.host?.fullName || program.host?.full_name}
            imageUrl={
              hostProfile?.logoUrl || hostProfile?.programLogo || program.host?.logoUrl || program.host?.programLogo || program.logoUrl || program.programLogo || hostProfile?.photoUrl || program.host?.photoUrl || program.host?.photo_url
            }
            size={48}
          />
          <div>

          <BottomNav />
            <div className="text-sm text-gray-600">Hosted by</div>
            <div className="text-sm font-medium text-gray-800">{program.host?.fullName || program.host?.full_name}</div>
            {
              (() => {
                const host = hostProfile || program.host || {};
                const hostLocation = host.location || host.locationName || host.loc || program.location || program.loc || '';
                const hostDistrict = host.district || program.district || '';
                const dateFrom = host.dateFrom || host.startDate || program.dateFrom || program.startDate || ''; 
                const dateTo = host.dateTo || host.endDate || program.dateTo || program.endDate || '';
                const contact = host.hostMob || host.contactPhone || host.phone || host.mobile || host.mobileNumber || host.contact_phone || program.contactPhone || program.contact_phone || '';

                return (
                  <>
                    {(hostLocation || hostDistrict) && (
                      <div className="text-sm text-gray-600 mt-1">
                        {hostLocation && <span className="mr-3">{hostLocation}</span>}
                        {hostDistrict && <span className="mr-3">{hostDistrict}</span>}
                      </div>
                    )}

                    {(dateFrom || dateTo) && (
                      <div className="text-sm text-gray-600 mt-1">
                        <strong>Dates:</strong>{' '}
                        {dateFrom || '-'} to {dateTo || '-'}
                      </div>
                    )}

                    {contact && (
                      <div className="text-sm text-gray-600 mt-1">
                        <strong>Contact:</strong> {contact}
                      </div>
                    )}
                  </>
                );
              })()
            }
          </div>
        </div>

        <p className="text-gray-700 mb-4">{program.description}</p>

        {sortedCategories.length === 0 ? (
          <div className="text-center py-12">No events found for this program.</div>
        ) : (
          <div className="space-y-8 ">
            {sortedCategories.map(({ category, events }) => (
              <div key={category.id}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900"># {category.name}</h3>
                  {/* <button
                    onClick={() => navigate(`/search?category=${encodeURIComponent(category.id)}`)}
                    className="flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    See more
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button> */}
                </div>

                <div className="flex overflow-x-auto gap-5 pb-4 ml-1 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory scroll-smooth w-full">
                  {events.slice(0, 6).map((event) => (
                    <div key={event.id} className="flex-shrink-0 w-[320px] snap-start">
                      <EventCard
                        event={event}
                        isLiked={likedEventIds.includes(event.id)}
                        isRegistered={registeredEventIds.includes(event.id)}
                        onClick={() => navigate(`/${encodeURIComponent(program.programName)}/${encodeURIComponent(event.id)}`)}
                        onLikeToggle={() => {
                          setLikedEventIds(prev =>
                            prev.includes(event.id) ? prev.filter(id => id !== event.id) : [...prev, event.id]
                          );
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      <style>{`\n        .scrollbar-hide::-webkit-scrollbar { display: none; }\n        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }\n      `}</style>
    </div>
  );
};

export default ProgramDetailPage;
