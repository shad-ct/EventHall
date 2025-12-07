import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../lib/api';
import { Event } from '../types';
import { EventCard } from '../components/EventCard';
import { BottomNav } from '../components/BottomNav';
import { ArrowLeft, Plus, Calendar } from 'lucide-react';

export const AdminEventsPage: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      const data = await userAPI.getMyEvents();
      setEvents(data.events);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      DRAFT: 'bg-gray-100 text-gray-700',
      PENDING_APPROVAL: 'bg-yellow-100 text-yellow-700',
      PUBLISHED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700',
      ARCHIVED: 'bg-gray-100 text-gray-500',
    };

    return (
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${styles[status as keyof typeof styles]}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(e => e.status === filter);

  const statusCounts = {
    all: events.length,
    DRAFT: events.filter(e => e.status === 'DRAFT').length,
    PENDING_APPROVAL: events.filter(e => e.status === 'PENDING_APPROVAL').length,
    PUBLISHED: events.filter(e => e.status === 'PUBLISHED').length,
    REJECTED: events.filter(e => e.status === 'REJECTED').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg mr-3"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold">My Events</h1>
            </div>
            <button
              onClick={() => navigate('/admin/events/create')}
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Event
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { key: 'all', label: 'All' },
              { key: 'PENDING_APPROVAL', label: 'Pending' },
              { key: 'PUBLISHED', label: 'Published' },
              { key: 'DRAFT', label: 'Draft' },
              { key: 'REJECTED', label: 'Rejected' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  filter === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label} ({statusCounts[tab.key as keyof typeof statusCounts]})
              </button>
            ))}
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
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {filter === 'all' ? 'No events yet' : `No ${filter.toLowerCase().replace('_', ' ')} events`}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? 'Start by creating your first event!'
                : 'Create events to see them here'}
            </p>
            <button
              onClick={() => navigate('/admin/events/create')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Event
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map((event) => (
              <div key={event.id} className="relative">
                <div className="absolute top-2 left-2 z-10">
                  {getStatusBadge(event.status)}
                </div>
                <EventCard
                  event={event}
                  onClick={() => navigate(`/admin/events/edit/${event.id}`)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};
