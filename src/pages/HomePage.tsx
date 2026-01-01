import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { eventAPI, adminAPI } from '../lib/api';
import { Event, EventCategory } from '../types';
import { EventCard } from '../components/EventCard';
import ProgramCard from '../components/ProgramCard';
import { BottomNav } from '../components/BottomNav';
import { BannerSlider } from '../components/BannerSlider';
import { SearchBar } from '../components/SearchBar';
import { DesktopNav } from '../components/DesktopNav';
import { ChevronRight, Calendar } from 'lucide-react';

interface EventsByCategory {
  [key: string]: {
    category: EventCategory;
    events: Event[];
  };
}

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [eventsByCategory, setEventsByCategory] = useState<EventsByCategory>({});
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [hostProfiles, setHostProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [likedEventIds, setLikedEventIds] = useState<string[]>([]);
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch featured events first
        const featuredData = await adminAPI.getFeaturedEvents();
        setFeaturedEvents(featuredData.events || []);

        // Fetch programs to show below banner
        try {
          const progRes = await eventAPI.getPrograms();
          setPrograms(progRes.programs || []);
        } catch (err) {
          console.error('Failed to fetch programs', err);
        }

        // If user has no interests, prompt them to set interests
        if (!user.interests || user.interests.length === 0) {
          setLoading(false);
          return;
        }

        const categoryIds = user.interests.map(i => i.category.id);
        const data = await eventAPI.getEventsByCategories(categoryIds);
        setEventsByCategory(data.eventsByCategory);

        // Fetch user interactions
        const allEventIds = Object.values(data.eventsByCategory)
          .flatMap((cat: any) => cat.events.map((e: any) => e.id));

        if (allEventIds.length > 0) {
          const interactions = await eventAPI.checkInteractions(allEventIds);
          setLikedEventIds(interactions.likedEventIds);
          setRegisteredEventIds(interactions.registeredEventIds);
        }
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [user]);

  // Fetch host profiles for displayed programs so ProgramCard can prefer host images
  useEffect(() => {
    const ids = Array.from(new Set(programs.map(p => p.userId || p.host?.id).filter(Boolean)));
    if (ids.length === 0) return;

    let cancelled = false;
    (async () => {
      const map: Record<string, any> = {};
      await Promise.all(ids.map(async (id) => {
        try {
          const u = await import('../lib/firestore').then(m => m.getUser(id));
          if (u) map[id] = u;
        } catch (err) {
          // ignore
        }
      }));
      if (!cancelled) setHostProfiles(map);
    })();

    return () => { cancelled = true; };
  }, [programs]);

  const handleEventClick = (eventId: string) => {
    navigate(`/event/${eventId}`);
  };

  const handleSeeMore = (categoryId: string) => {
    navigate(`/search?category=${categoryId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-10">
        <DesktopNav />

        {/* Mobile Header */}
        <div className="bg-white text-gray-900 border-b border-gray-200 shadow-sm md:hidden">
          <div className="max-w-6xl mx-auto px-3 py-3 sm:py-4 flex items-center">
            <h1 className="text-xl sm:text-2xl font-bold">EVENT HALL</h1>
          </div>
        </div>

        <div className="px-3 py-3 sm:py-4 md:hidden">
          <div className="max-w-6xl mx-auto">
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearch={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                } else {
                  navigate('/search');
                }
              }}
              showFilterButton={false}
            />
          </div>
        </div>
        {/* Featured Events Banner */}
        <BannerSlider events={featuredEvents} onEventClick={handleEventClick} />





        {programs && programs.length > 0 && (
          <div className="space-y-8 p-4 ">
            <div>
              {/* Program Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900"># Programs</h2>
                <button
                  onClick={() => navigate('/programs')}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                >
                  See more
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>

              {/* Horizontal Scroll of Program Cards */}
              <div className="flex ml-4 overflow-x-auto gap-5 pb-4 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory scroll-smooth w-full">
                {programs.slice(0, 8).map((p) => (
                  <ProgramCard
                    key={p.programName || p.id}
                    program={p}
                    hostProfile={hostProfiles[p.userId || p.host?.id]}
                  />
                ))}
              </div>
            </div>
          </div>
        )}






        <div className="w-full p-4">
          {!user?.interests || user.interests.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Set Your Interests</h3>
              <p className="text-gray-600 mb-6">
                Please select your interests to see personalized events.
              </p>
              <button
                onClick={() => navigate('/profile')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Profile
              </button>
            </div>
          ) : Object.keys(eventsByCategory).length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No events found</h3>
              <p className="text-gray-600 mb-6">
                There are no upcoming events matching your interests right now.
              </p>
              <button
                onClick={() => navigate('/search')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse All Events
              </button>
            </div>
          ) : (
            <div className="space-y-8 ">
              {Object.entries(eventsByCategory).map(([categoryId, { category, events }]) => (
                <div key={categoryId}>
                  {/* Category Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      # {category.name}
                    </h2>
                    <button
                      onClick={() => handleSeeMore(categoryId)}
                      className="flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      See more
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>

                  {/* Horizontal Scroll of Event Cards */}
                  <div className="flex overflow-x-auto gap-5 pb-4 ml-1 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory scroll-smooth w-full">
                    {events.slice(0, 6).map((event) => (
                      <div key={event.id} className="flex-shrink-0 w-[320px] snap-start">
                        <EventCard
                          event={event}
                          isLiked={likedEventIds.includes(event.id)}
                          isRegistered={registeredEventIds.includes(event.id)}
                          onClick={() => handleEventClick(event.id)}
                          onLikeToggle={() => {
                            setLikedEventIds(prev =>
                              prev.includes(event.id)
                                ? prev.filter(id => id !== event.id)
                                : [...prev, event.id]
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

        <BottomNav />

        <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      </div >

    </>
  );
};
