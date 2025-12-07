import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../lib/api';
import { Event } from '../types';
import { EventCard } from '../components/EventCard';
import { BottomNav } from '../components/BottomNav';
import { Settings, Calendar } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'applied' | 'liked'>('applied');
  const [appliedEvents, setAppliedEvents] = useState<Event[]>([]);
  const [likedEvents, setLikedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserEvents = async () => {
    try {
      setLoading(true);
      const [appliedData, likedData] = await Promise.all([
        userAPI.getRegisteredEvents(),
        userAPI.getLikedEvents(),
      ]);
      setAppliedEvents(appliedData.events);
      setLikedEvents(likedData.events);
    } catch (error) {
      console.error('Failed to fetch user events:', error);
    } finally {
      setLoading(false);
    }
  };

  const [lastLocationKey, setLastLocationKey] = useState(location.key);

  useEffect(() => {
    if (user) {
      console.log('ProfilePage mounted or user changed, fetching events');
      fetchUserEvents();
    }
  }, [user]);

  // Refetch when navigating back to profile page
  useEffect(() => {
    // If location key changed and we're on profile page, refetch
    if (location.pathname === '/profile' && location.key !== lastLocationKey) {
      console.log('Navigated back to profile page, refetching');
      if (user) {
        fetchUserEvents();
      }
      setLastLocationKey(location.key);
    }
  }, [location, lastLocationKey, user]);

  // Refetch when switching to liked tab to get fresh data
  useEffect(() => {
    if (activeTab === 'liked' && user) {
      console.log('Switched to liked tab, fetching fresh data');
      fetchUserEvents();
    } else if (activeTab === 'applied' && user) {
      console.log('Switched to applied tab, fetching fresh data');
      fetchUserEvents();
    }
  }, [activeTab, user]);

  const handleEventClick = (eventId: string) => {
    navigate(`/event/${eventId}`);
  };

  const currentEvents = activeTab === 'applied' ? appliedEvents : likedEvents;
  const likedEventIds = likedEvents.map(e => e.id);
  const appliedEventIds = appliedEvents.map(e => e.id);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            <button
              onClick={() => navigate('/settings')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{user?.fullName}</h2>
              <p className="text-gray-600 text-sm">{user?.email}</p>
              {user?.collegeName && (
                <p className="text-gray-500 text-sm">{user.collegeName}</p>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('applied')}
              className={`flex-1 py-3 font-medium transition-colors relative ${
                activeTab === 'applied'
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Applied ({appliedEvents.length})
              {activeTab === 'applied' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('liked')}
              className={`flex-1 py-3 font-medium transition-colors relative ${
                activeTab === 'liked'
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Liked ({likedEvents.length})
              {activeTab === 'liked' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading events...</p>
          </div>
        ) : currentEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No {activeTab === 'applied' ? 'applications' : 'liked events'} yet
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'applied'
                ? 'Start exploring events and register for ones you like!'
                : 'Save events you\'re interested in by tapping the heart icon'}
            </p>
            <button
              onClick={() => navigate('/search')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Events
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isLiked={likedEventIds.includes(event.id)}
                isRegistered={appliedEventIds.includes(event.id)}
                onClick={() => handleEventClick(event.id)}
                onLikeToggle={fetchUserEvents}
              />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};
