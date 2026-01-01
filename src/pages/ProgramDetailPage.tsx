import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventAPI } from '../lib/api';
import { Event, EventCategory } from '../types';
import { EventCard } from '../components/EventCard';
import HostAvatar from '../components/HostAvatar';
import { DesktopNav } from '../components/DesktopNav';
import { BottomNav } from '../components/BottomNav';
import { useAuth } from '../contexts/AuthContext';
import { getUser } from '../lib/firestore';
import { Calendar, MapPin, Phone, ArrowLeft } from 'lucide-react';
import { getHostImage } from '../lib/image';

export const ProgramDetailPage: React.FC = () => {
  const { programName } = useParams<{ programName: string }>();
  const [program, setProgram] = useState<any | null>(null);
  const [hostProfile, setHostProfile] = useState<any | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsByCategory, setEventsByCategory] = useState<Record<string, { category: EventCategory; events: Event[] }>>({});
  const [likedEventIds, setLikedEventIds] = useState<string[]>([]);
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([]);
  const [canGoBack, setCanGoBack] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const programLogShown = useRef(false);

  useEffect(() => {
    if (!programName) return;
    const mounted = { current: true };
    const abortable = () => {
      mounted.current = false;
    };

    const fetchAll = async () => {
      setLoading(true);
      try {
        // Fetch program and program events in parallel to reduce round-trips
        const [pRes, evRes] = await Promise.all([
          eventAPI.getProgram(decodeURIComponent(programName)),
          eventAPI.getProgramEvents(decodeURIComponent(programName)),
        ]);

        if (!mounted.current) return;

        const programObj = pRes?.program || null;
        setProgram(programObj);
        if (programObj && !programLogShown.current) {
          console.warn('ProgramDetail fetched program:', programObj);
          programLogShown.current = true;
        }
        setEvents(evRes?.events || []);

        // Fetch host profile only when we have a host id and it's different
        const hostId = programObj?.userId || programObj?.host?.id;
        if (hostId && hostProfile?.id !== hostId) {
          try {
            const up = await getUser(hostId);
            if (mounted.current) setHostProfile(up || null);
          } catch (err) {
            // swallow host profile errors but don't crash the page
          }
        }
      } catch (err) {
        // fail silently - keep existing behavior
      } finally {
        if (mounted.current) setLoading(false);
      }
    };

    fetchAll();
    return abortable;
  }, [programName]);

  // Decide whether to show a back button based on browser history length
  useEffect(() => {
    try {
      setCanGoBack(typeof window !== 'undefined' && !!window.history && window.history.length > 2);
    } catch (err) {
      setCanGoBack(false);
    }
  }, []);

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
          // pass user id explicitly when available
          const interactions = await eventAPI.checkInteractions(allIds, (user as any)?.id || undefined);
          setLikedEventIds(interactions.likedEventIds || []);
          setRegisteredEventIds(interactions.registeredEventIds || []);
        } catch (err) {
          // ignore interaction errors
        }
      })();
    }
  }, [events, user]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-pulse text-gray-400">Loading program details...</div>
    </div>
  );

  if (!program) return <div className="p-6 text-center text-gray-500">Program not found</div>;

  const sortedCategories = Object.values(eventsByCategory).sort((a, b) => a.category.name.localeCompare(b.category.name));

  // Helper to read multiple possible keys (handles snake_case vs camelCase)
  const read = (obj: any, ...keys: string[]) => {
    if (!obj) return undefined;
    for (const k of keys) {
      if (k.includes('.')) {
        const parts = k.split('.');
        let cur = obj;
        for (const p of parts) {
          if (cur == null) break;
          cur = cur[p];
        }
        if (cur != null) return cur;
      } else {
        if (obj[k] != null) return obj[k];
      }
    }
    return undefined;
  };

  // Extract variables for cleaner JSX (support DB snake_case fields)
  const programObj: any = program || {};
  const host = hostProfile || programObj.host || {};

  const hostLocation = read(host, 'location', 'locationName', 'loc', 'location_name') || read(programObj, 'location', 'loc', 'location_name') || '';
  const hostDistrict = read(host, 'district', 'district_name') || programObj.district || '';
  const dateFrom = read(host, 'dateFrom', 'date_from', 'startDate', 'start_date') || programObj.dateFrom || programObj.date_from || '';
  const dateTo = read(host, 'dateTo', 'date_to', 'endDate', 'end_date') || programObj.dateTo || programObj.date_to || '';
  const contact = read(host, 'hostMob', 'host_mobile', 'host_mobile', 'contactPhone', 'phone', 'mobile', 'mobileNumber', 'contact_phone') || programObj.contactPhone || programObj.contact_phone || programObj.host_mobile || '';
  const hostName = read(host, 'fullName', 'full_name') || read(programObj, 'host.fullName', 'host.full_name') || 'Unknown Host';
  const hostImage = getHostImage(hostProfile || programObj) || '';
  if (!hostImage && !programLogShown.current) {
    console.warn('ProgramDetail: missing image fields, sample program:', programObj);
    programLogShown.current = true;
  }


  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-10">
      <DesktopNav />
      
      {/* Hero Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm pt-6 pb-8 md:pt-10 md:pb-12">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          {canGoBack && (
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </button>
          )}
          
          <div className="flex flex-col md:flex-row md:items-start md:gap-8 items-center text-center md:text-left">
            {/* Host Logo / Image */}
            <div className="mb-4 md:mb-0 flex-shrink-0">
               <HostAvatar
                name={hostName}
                imageUrl={hostImage}
                size={80} // Increased size for hero
                className="ring-4 ring-gray-50"
              />
            </div>

            {/* Program Details */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 items-center md:items-start">
                <div>
                  <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">{program.programName}</h1>
                  <p className="text-sm font-medium text-blue-600 mt-1">Hosted by {hostName}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-y-2 gap-x-6 text-sm text-gray-600 justify-center md:justify-start">
                {(hostLocation || hostDistrict) && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>
                      {hostLocation}{hostLocation && hostDistrict ? ', ' : ''}{hostDistrict}
                    </span>
                  </div>
                )}
                {(dateFrom || dateTo) && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{dateFrom || '?'} <span className="mx-1">to</span> {dateTo || '?'}</span>
                  </div>
                )}
                {contact && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{contact}</span>
                  </div>
                )}
              </div>

              {program.description && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100 text-gray-700 leading-relaxed text-sm md:text-base text-left">
                  {program.description}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 mt-8">
        {sortedCategories.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900">No events found</h3>
            <p className="text-gray-500">This program hasn't listed any events yet.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {sortedCategories.map(({ category, events }) => (
              <div key={category.id} className="relative">
                <div className="flex items-center gap-3 mb-5 pl-1">
                   <div className="h-6 w-1 bg-blue-500 rounded-full"></div>
                   <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                </div>

                <div className="relative group">
                  {/* Scroll Container */}
                  <div className="flex overflow-x-auto gap-5 pb-6 -mx-4 px-4 md:px-1 scrollbar-hide snap-x snap-mandatory scroll-smooth">
                    {events.slice(0, 6).map((event) => (
                      <div key={event.id} className="flex-shrink-0 w-[300px] md:w-[320px] snap-start transition-transform duration-300 hover:-translate-y-1">
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
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
      <BottomNav />
    </div>
  );
};

export default ProgramDetailPage;